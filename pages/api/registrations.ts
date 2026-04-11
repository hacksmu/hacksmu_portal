import { firestore } from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';
import initializeApi from '../../lib/admin/init';
import { userIsAuthorized } from '../../lib/authorization/check-authorization';

initializeApi();
const db = firestore();

const REGISTRATIONS_COLLECTION = '/registrations';

export interface RegistrantEntry {
  id: string;
  registrationNumber: number;
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

  // Order by Firestore document creation time — this is server-assigned and cannot be tampered with
  const snapshot = await db
    .collection(REGISTRATIONS_COLLECTION)
    .orderBy(firestore.FieldPath.documentId())
    .get();

  // Sort by createTime to get true registration order
  const docs = snapshot.docs.slice().sort((a, b) => {
    return a.createTime.toMillis() - b.createTime.toMillis();
  });

  const registrants: RegistrantEntry[] = docs.map((doc, idx) => {
    const data = doc.data();
    return {
      id: doc.id,
      registrationNumber: idx + 1,
      firstName: data.user?.firstName ?? '',
      lastName: data.user?.lastName ?? '',
      email: data.user?.preferredEmail ?? '',
    };
  });

  return res.status(200).json(registrants);
}
