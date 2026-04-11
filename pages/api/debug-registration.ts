import { firestore } from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';
import initializeApi from '../../lib/admin/init';
import { userIsAuthorized } from '../../lib/authorization/check-authorization';

initializeApi();
const db = firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userToken = req.headers['authorization'];
  try {
    const ok = await userIsAuthorized(userToken, ['super_admin']);
    if (!ok) return res.status(403).json({ msg: 'Unauthorized' });
  } catch {
    return res.status(403).json({ msg: 'Bad token' });
  }

  const snap = await db.collection('/registrations').limit(3).get();
  const docs = snap.docs.map(d => d.data());
  return res.json(docs);
}
