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
    const isAdmin = await userIsAuthorized(userToken, ['super_admin', 'admin', 'organizer']);

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

async function handlePatchJudgeApplication(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { applicationId, token },
    headers,
  } = req;

  const userToken = (token as string) || (headers['authorization'] as string);
  const isAuthorized = await userIsAuthorized(userToken, ['super_admin', 'admin', 'organizer']);

  if (!isAuthorized) {
    return res.status(403).json({
      msg: 'Request is not authorized to review judge applications.',
    });
  }

  const parsedBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const nextStatus = parsedBody?.status;
  const allowedStatuses = ['submitted', 'reviewing', 'accepted', 'rejected'];

  if (!allowedStatuses.includes(nextStatus)) {
    return res.status(400).json({
      msg: 'Invalid judge application status.',
    });
  }

  try {
    await db.collection(JUDGE_APPLICATIONS_COLLECTION).doc(applicationId as string).set(
      {
        status: nextStatus,
        reviewedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return res.status(200).json({
      msg: 'Judge application updated.',
    });
  } catch (error) {
    console.error('Error updating judge application', error);
    return res.status(500).json({
      msg: 'Something went wrong while updating the judge application.',
    });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetJudgeApplication(req, res);
    case 'PATCH':
      return handlePatchJudgeApplication(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PATCH']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
