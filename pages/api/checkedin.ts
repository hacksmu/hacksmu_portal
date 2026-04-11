import { firestore } from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';
import initializeApi from '../../lib/admin/init';
import { userIsAuthorized } from '../../lib/authorization/check-authorization';

initializeApi();
const db = firestore();

const REGISTRATIONS_COLLECTION = '/registrations';
const SCANTYPES_COLLECTION = '/scan-types';

async function getCheckInEventName(): Promise<string> {
  const snapshot = await db.collection(SCANTYPES_COLLECTION).where('isCheckIn', '==', true).get();
  let name = '';
  snapshot.forEach((doc) => { name = doc.data().name; });
  return name;
}

export interface CheckedInEntry {
  id: string;
  checkInOrder: number;   // 1 = first to check in, 2 = second, etc.
  firstName: string;
  lastName: string;
  email: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const userToken = req.headers['authorization'] as string;
  const isAuthorized = await userIsAuthorized(userToken, ['admin', 'super_admin']);
  if (!isAuthorized) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const checkInEventName = await getCheckInEventName();
  if (!checkInEventName) {
    return res.status(200).json([]);
  }

  const snapshot = await db.collection(REGISTRATIONS_COLLECTION).get();

  const checkedIn: (CheckedInEntry & { checkInTime: number })[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const scans: string[] = data.scans ?? [];
    if (scans.includes(checkInEventName)) {
      checkedIn.push({
        id: doc.id,
        checkInOrder: 0, // assigned below
        checkInTime: data.checkInTime ?? 0,
        firstName: data.user?.firstName ?? '',
        lastName: data.user?.lastName ?? '',
        email: data.user?.preferredEmail ?? '',
      });
    }
  });

  // Sort by checkInTime ascending (earliest = #1)
  checkedIn.sort((a, b) => a.checkInTime - b.checkInTime);

  // Assign check-in order numbers
  checkedIn.forEach((u, idx) => { u.checkInOrder = idx + 1; });

  // Remove the internal checkInTime field before sending
  const result: CheckedInEntry[] = checkedIn.map(({ checkInTime, ...rest }) => rest);

  return res.status(200).json(result);
}
