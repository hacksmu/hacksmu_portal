import { firestore } from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';
import initializeApi from '../../../../lib/admin/init';
import { userIsAuthorized } from '../../../../lib/authorization/check-authorization';

initializeApi();
const db = firestore();

const QUESTIONS_COLLECTION = '/questions';

type AnsweredQuestionDocument = {
  id: string;
  userId: string;
  question: string;
  answer: string;
  status: 'answered';
  submittedAt?: string;
};

async function getAnsweredQuestions(req: NextApiRequest, res: NextApiResponse) {
  const userToken = req.headers['authorization'] as string;
  const isAuthorized = await userIsAuthorized(userToken, ['super_admin', 'admin', 'organizer']);

  if (!isAuthorized) {
    return res.status(403).json({
      msg: 'Request is not authorized to view answered questions.',
    });
  }

  const snapshot = await db.collection(QUESTIONS_COLLECTION).where('status', '==', 'answered').get();
  const questions = (snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  })) as AnsweredQuestionDocument[]).sort((a, b) => {
      const aTime = new Date(a.submittedAt ?? 0).getTime();
      const bTime = new Date(b.submittedAt ?? 0).getTime();
      return bTime - aTime;
    });

  return res.json(questions);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getAnsweredQuestions(req, res);
    default:
      return res.status(405).json({
        msg: 'Method not allowed',
      });
  }
}
