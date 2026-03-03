import { NextApiRequest, NextApiResponse } from 'next';
import { auth, firestore } from 'firebase-admin';
import admin from 'firebase-admin';
import initializeApi from '../../../lib/admin/init';

initializeApi();

const db = firestore();

const REGISTRATION_COLLECTION = '/registrations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { userId } = req.query;
  const userToken = req.headers['authorization'] as string;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ msg: 'Missing userId' });
  }

  if (!userToken) {
    return res.status(401).json({ msg: 'Unauthorized' });
  }

  try {
    const payload = await auth().verifyIdToken(userToken);
    if (payload.uid !== userId) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
  } catch {
    return res.status(401).json({ msg: 'Unauthorized' });
  }

  const snapshot = await db.collection(REGISTRATION_COLLECTION).doc(userId).get();
  if (!snapshot.exists) {
    return res.status(404).json({ msg: 'User not found' });
  }

  let filePath: string = snapshot.data()?.resume;
  if (!filePath) {
    return res.status(404).json({ msg: 'No resume on file' });
  }

  // Normalize: old records stored a full public URL; extract just the object path
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const urlPrefix = `https://storage.googleapis.com/${bucketName}/`;
  if (filePath.startsWith(urlPrefix)) {
    filePath = decodeURIComponent(filePath.slice(urlPrefix.length));
  }

  const bucket = admin.storage().bucket(bucketName);
  await bucket.file(filePath).delete();

  await db
    .collection(REGISTRATION_COLLECTION)
    .doc(userId)
    .update({ resume: admin.firestore.FieldValue.delete() });

  res.status(200).json({ msg: 'Resume deleted' });
}
