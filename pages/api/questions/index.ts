import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from 'firebase-admin';
import initializeApi from '../../../lib/admin/init';

initializeApi();
const db = firestore();

const QUESTIONS_COLLECTION = '/questions';
const MIN_QUESTION_LENGTH = 10;
const MAX_QUESTION_LENGTH = 500;
const MIN_WORD_COUNT = 3;
const QUESTION_RATE_LIMIT_MS = 60 * 1000;

export interface QAReqBody {
  userId: string;
  question: string;
}

export interface QADocument extends QAReqBody {
  status: 'pending' | 'answered';
  answer: string;
  id: string;
  submittedAt?: string;
}

// TODO: Add organizer/admin functionality to answer user questions submitted through the Ask a Question feature.

/**
 *
 * Post a question asked by user to the backend
 *
 * @param req request object
 * @param res response object
 *
 *
 */
async function postQuestionToDB(req: NextApiRequest, res: NextApiResponse) {
  const userId = typeof req.body.userId === 'string' ? req.body.userId : '';
  const question = typeof req.body.question === 'string' ? req.body.question.trim() : '';
  const wordCount = question.split(/\s+/).filter(Boolean).length;
  const urlMatches = question.match(/https?:\/\//gi) ?? [];

  if (!userId) {
    return res.status(400).json({
      status: 'failed',
      message: 'You must be signed in to submit a question.',
    });
  }

  if (question.length < MIN_QUESTION_LENGTH) {
    return res.status(400).json({
      status: 'failed',
      message: `Questions must be at least ${MIN_QUESTION_LENGTH} characters long.`,
    });
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    return res.status(400).json({
      status: 'failed',
      message: `Questions must be ${MAX_QUESTION_LENGTH} characters or less.`,
    });
  }

  if (wordCount < MIN_WORD_COUNT) {
    return res.status(400).json({
      status: 'failed',
      message: `Questions must include at least ${MIN_WORD_COUNT} words.`,
    });
  }

  if (urlMatches.length > 1) {
    return res.status(400).json({
      status: 'failed',
      message: 'Please remove extra links and keep your question focused on HackSMU.',
    });
  }

  const previousQuestionSnapshot = await db
    .collection(QUESTIONS_COLLECTION)
    .where('userId', '==', userId)
    .orderBy('submittedAt', 'desc')
    .limit(1)
    .get();

  const latestQuestion = previousQuestionSnapshot.docs[0]?.data() as { submittedAt?: string } | undefined;
  const latestSubmittedAt = latestQuestion?.submittedAt ? new Date(latestQuestion.submittedAt).getTime() : 0;

  if (latestSubmittedAt && Date.now() - latestSubmittedAt < QUESTION_RATE_LIMIT_MS) {
    return res.status(429).json({
      status: 'failed',
      message: 'Please wait about a minute before submitting another question.',
    });
  }

  const questionDoc: Partial<QADocument> = {
    userId,
    question,
    answer: '',
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };

  await db.collection(QUESTIONS_COLLECTION).add(questionDoc);

  res.status(200).json({
    status: 'completed',
  });
}

async function getAllQuestions(req: NextApiRequest, res: NextApiResponse) {
  const snapshot = await db.collection(QUESTIONS_COLLECTION).get();
  let questions = [];
  snapshot.forEach((doc) => {
    questions.push(doc.data());
  });
  res.json(questions);
}

async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  return postQuestionToDB(req, res);
}

function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  return getAllQuestions(req, res);
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
      return res.status(404).json({
        msg: 'Route not found',
      });
    }
  }
}
