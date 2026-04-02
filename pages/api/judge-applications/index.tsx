import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from 'firebase-admin';
import initializeApi from '../../../lib/admin/init';
import { userIsAuthorized } from '../../../lib/authorization/check-authorization';

initializeApi();

const db = firestore();
const JUDGE_APPLICATIONS_COLLECTION = '/judge-applications';

async function handleGetJudgeApplications(req: NextApiRequest, res: NextApiResponse) {
  const userToken = req.headers['authorization'] as string;
  const isAuthorized = await userIsAuthorized(userToken, ['super_admin', 'admin', 'organizer']);

  if (!isAuthorized) {
    return res.status(403).json({
      msg: 'Request is not authorized to perform admin functionality.',
    });
  }

  const snapshot = await db.collection(JUDGE_APPLICATIONS_COLLECTION).get();
  const applications = snapshot.docs.map((doc) => doc.data());
  return res.status(200).json(applications);
}

async function handlePostJudgeApplication(req: NextApiRequest, res: NextApiResponse) {
  return res.status(410).json({
    msg: 'Judge applications have closed and are no longer accepting new submissions.',
  });
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetJudgeApplications(req, res);
    case 'POST':
      return handlePostJudgeApplication(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
