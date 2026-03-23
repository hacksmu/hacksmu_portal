import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import multer from 'multer';
import admin from 'firebase-admin';
import initializeApi from '../../../lib/admin/init';

initializeApi();

interface NCNextApiRequest extends NextApiRequest {
  file: Express.Multer.File;
}

const handler = nc<NCNextApiRequest, NextApiResponse>({
  onError: (err, req, res, next) => {
    console.error(err);
    res.status(500).json({
      msg: 'Server error',
    });
  },
  onNoMatch: (req, res, next) => {
    res.status(404).json({
      msg: 'Route not found',
    });
  },
});

handler.use(multer().single('resume'));
handler.post(async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: 'No file provided' });

  const { fileName, userId } = req.body;
  if (!fileName || !userId) {
    return res.status(400).json({ msg: 'Missing upload metadata' });
  }

  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const bucket = admin.storage().bucket(bucketName);
  const filePath = `judge-applications/${userId}/${fileName}`;
  const fileRef = bucket.file(filePath);

  await fileRef.save(req.file.buffer);
  await fileRef.makePublic();

  const resumeUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
  return res.status(200).json({ resumeUrl });
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
