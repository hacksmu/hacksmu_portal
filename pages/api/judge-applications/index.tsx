import { NextApiRequest, NextApiResponse } from 'next';
import { auth, firestore } from 'firebase-admin';
import initializeApi from '../../../lib/admin/init';
import { userIsAuthorized } from '../../../lib/authorization/check-authorization';

initializeApi();

const db = firestore();
const JUDGE_APPLICATIONS_COLLECTION = '/judge-applications';

type JudgeApplicationRequest = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    preferredEmail: string;
  };
  contactEmail: string;
  organization: string;
  roleTitle: string;
  judgingExperience: string;
  expertiseAreas: string[];
  portfolioLinks: string;
  whyJudge: string;
  availability: string[];
  resumeUrl: string;
  status?: 'submitted' | 'reviewing' | 'accepted' | 'rejected';
};

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
  const userToken = req.headers['authorization'] as string;

  if (!userToken) {
    return res.status(401).json({
      msg: 'You must be signed in to apply as a judge.',
    });
  }

  try {
    const payload = await auth().verifyIdToken(userToken);
    const body: JudgeApplicationRequest = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!body?.user?.id || payload.uid !== body.user.id) {
      return res.status(401).json({
        msg: 'Request is not authorized to create this judge application.',
      });
    }

    const existing = await db.collection(JUDGE_APPLICATIONS_COLLECTION).doc(body.user.id).get();
    if (existing.exists) {
      return res.status(400).json({
        msg: 'Judge application already exists for this user.',
      });
    }

    await db.collection(JUDGE_APPLICATIONS_COLLECTION).doc(body.user.id).set({
      ...body,
      status: body.status ?? 'submitted',
      submittedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      msg: 'Judge application submitted successfully.',
    });
  } catch (error) {
    console.error('Error creating judge application', error);
    return res.status(500).json({
      msg: 'Something went wrong while submitting the judge application.',
    });
  }
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
