import { NextApiRequest, NextApiResponse } from 'next';
import { auth, firestore } from 'firebase-admin';
import initializeApi from '../../../lib/admin/init';
import { userIsAuthorized } from '../../../lib/authorization/check-authorization';

initializeApi();

const db = firestore();
const JUDGE_APPLICATIONS_COLLECTION = '/judge-applications';

async function handleGetJudgeApplication(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { applicationId, token },
    headers,
  } = req;

  const userToken = (token as string) || (headers['authorization'] as string);

  if (!userToken) {
    return res.status(401).json({
      msg: 'Request is not authorized to view this judge application.',
    });
  }

  try {
    const payload = await auth().verifyIdToken(userToken);
    const userId = applicationId as string;
    const isAdmin = await userIsAuthorized(userToken, ['super_admin', 'admin']);

    if (payload.uid !== userId && !isAdmin) {
      return res.status(401).json({
        msg: 'Request is not authorized to view this judge application.',
      });
    }

    const snapshot = await db.collection(JUDGE_APPLICATIONS_COLLECTION).doc(userId).get();
    if (!snapshot.exists) {
      return res.status(404).json({
        msg: 'Judge application not found.',
      });
    }

    return res.status(200).json(snapshot.data());
  } catch (error) {
    console.error('Error fetching judge application', error);
    return res.status(500).json({
      msg: 'Something went wrong while fetching the judge application.',
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetJudgeApplication(req, res);
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
