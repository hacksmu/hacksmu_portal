import { firestore } from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';
import initializeApi from '../../../../lib/admin/init';
import { userIsAuthorized } from '../../../../lib/authorization/check-authorization';
import { buildAnsweredQuestionEmail, sendEmail } from '../../../../lib/email';

initializeApi();
const db = firestore();

const QUESTION_COLLECTION = '/questions';
const REGISTRATION_COLLECTION = '/registrations';

/**
 *
 * API endpoint to fetch a pending question with given ID
 *
 * @param req HTTP request object
 * @param res HTTP response object
 *
 *
 */
async function getPendingQuestionById(req: NextApiRequest, res: NextApiResponse) {
  const userToken = req.headers['authorization'] as string;
  const isAuthorized = await userIsAuthorized(userToken, ['super_admin', 'admin', 'organizer']);

  if (!isAuthorized) {
    return res.status(403).json({
      msg: 'Request is not authorized to view this question.',
    });
  }

  const snapshot = await db
    .collection(QUESTION_COLLECTION)
    .doc(req.query.questionId as string)
    .get();
  res.json(snapshot.data());
}

/**
 *
 * API endpoint to post an answer to a pending question
 *
 * @param req HTTP request object
 * @param res HTTP response object
 *
 *
 */
async function resolvePendingQuestionById(req: NextApiRequest, res: NextApiResponse) {
  const { headers } = req;
  const userToken = headers['authorization'];

  const isAuthorized = await userIsAuthorized(userToken, ['super_admin', 'admin', 'organizer']);
  if (!isAuthorized) {
    return res.status(403).json({
      msg: 'Request is not authorized to perform admin functionality.',
    });
  }

  const parsedBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const questionSnapshot = await db.collection(QUESTION_COLLECTION).doc(req.query.questionId as string).get();

  if (!questionSnapshot.exists) {
    return res.status(404).json({
      msg: 'Question not found.',
    });
  }

  const existingQuestion = questionSnapshot.data() as {
    userId?: string;
    question?: string;
    answer?: string;
  };

  const newData = {
    ...parsedBody,
    status: 'answered',
  };
  const doc = await db
    .collection(QUESTION_COLLECTION)
    .doc(req.query.questionId as string)
    .set(newData, {
      merge: true,
    });

  const userId = existingQuestion?.userId;
  const answer = parsedBody?.answer ?? '';
  const shouldSendEmail =
    userId &&
    existingQuestion?.question &&
    answer &&
    (existingQuestion.answer ?? '') !== answer;

  if (shouldSendEmail) {
    try {
      const registrationSnapshot = await db.collection(REGISTRATION_COLLECTION).doc(userId).get();
      const recipientEmail = registrationSnapshot.data()?.user?.preferredEmail;

      if (recipientEmail) {
        const email = buildAnsweredQuestionEmail(existingQuestion.question, answer);
        await sendEmail({
          to: recipientEmail,
          subject: email.subject,
          html: email.html,
          text: email.text,
        });
      }
    } catch (error) {
      console.error('Failed to send answered-question email', error);
    }
  }

  res.json(doc);
}

function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  return getPendingQuestionById(req, res);
}

function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  return resolvePendingQuestionById(req, res);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  switch (method) {
    case 'GET': {
      return handleGetRequest(req, res);
    }
    case 'POST': {
      return handlePostRequest(req, res);
    }
    default: {
      return res.status(405).json({
        msg: 'Method not allowed',
      });
    }
  }
}
