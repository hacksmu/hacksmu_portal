import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import multer from 'multer';

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
  return res.status(410).json({
    msg: 'Judge applications have closed and resume uploads are no longer available.',
  });
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
