import { firestore } from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';
import initializeApi from '../../../lib/admin/init';

initializeApi();
const db = firestore();

const FAQS_COLLECTION = '/faqs';
const MLH_FAQ_ENTRY = {
  id: 'mlh-code-of-conduct',
  order: 999,
  question: 'Where can I find the MLH Code of Conduct?',
  answer: [
    {
      type: 'plaintext',
      text: 'Be respectful to other hackers, mentors, sponsors, and organizers. You can read the MLH Code of Conduct here: ',
    },
    {
      type: 'link',
      text: 'MLH Code of Conduct',
      url: 'https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md',
    },
  ],
};

/**
 *
 * Fetch all FAQs from the database
 *
 * @param req request object
 * @param res response object
 *
 *
 */
async function getFaqs(req: NextApiRequest, res: NextApiResponse) {
  const snapshot = await db.collection(FAQS_COLLECTION).get();
  let data = [];
  snapshot.forEach((doc) => {
    data.push(doc.data());
  });
  data.push(MLH_FAQ_ENTRY);
  res.json(data);
}

function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  return getFaqs(req, res);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  switch (method) {
    case 'GET': {
      return handleGetRequest(req, res);
    }
    default: {
      return res.status(404).json({
        msg: 'Route not found',
      });
    }
  }
}
