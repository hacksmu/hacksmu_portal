import { NextApiRequest, NextApiResponse } from 'next';
import { auth, firestore } from 'firebase-admin';
import initializeApi from '../../../lib/admin/init';
import { userIsAuthorized } from '../../../lib/authorization/check-authorization';

initializeApi();

const db = firestore();

const APPLICATIONS_COLLECTION = '/registrations';
const USERS_COLLECTION = '/users';

function extractHeaderToken(input: string) {
  const result = input;
  return result;
}

/**
 * Handles GET requests to /api/application/<id>.
 *
 * This returns the application the authorized user wants to see.
 *
 * @param req The HTTP request
 * @param res The HTTP response
 */
async function handleGetApplication(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Handle user authorization
  const {
    query: { token, id },
    headers,
  } = req;

  //
  // Check if request header contains token
  // TODO: Figure out how to handle the string | string[] mess.
  const userToken = (token as string) || (headers['authorization'] as string);

  const isAuthorized = await userIsAuthorized(userToken);

  // TODO: Extract from bearer token
  // Probably not safe
  if (!isAuthorized) {
    return res.status(401).send({
      type: 'request-unauthorized',
      message: 'Request is not authorized to perform admin functionality.',
    });
  }
  const userID = id as string;

  try {
    const application = await db.collection(APPLICATIONS_COLLECTION).doc(userID);
    const data = await application.get();
    if (!data.exists) {
      res.status(404).json({
        code: 'not-found',
        message: 'Application ID invalid, or the user is not registered.',
      });
    } else {
      res.status(200).json(data.data());
    }
  } catch (error) {
    console.error('Error when fetching applications', error);
    res.status(500).json({
      code: 'internal-error',
      message: 'Something went wrong when processing this request. Try again later.',
    });
  }
  return;
}

async function handlePatchApplication(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { token, applicationId },
    headers,
  } = req;

  const userToken = (token as string) || (headers['authorization'] as string);

  if (!userToken) {
    return res.status(401).json({
      type: 'request-unauthorized',
      message: 'Request is not authorized to modify this application.',
    });
  }

  try {
    const payload = await auth().verifyIdToken(userToken);
    const userId = applicationId as string;
    const isAdmin = await userIsAuthorized(userToken, ['super_admin', 'admin']);

    if (payload.uid !== userId && !isAdmin) {
      return res.status(401).json({
        type: 'request-unauthorized',
        message: 'Request is not authorized to modify this application.',
      });
    }

    const parsedBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const nextMlhConsent = parsedBody?.mlhConsent;

    if (!Array.isArray(nextMlhConsent) || !nextMlhConsent.every((value) => typeof value === 'string')) {
      return res.status(400).json({
        type: 'invalid',
        message: 'mlhConsent must be an array of strings.',
      });
    }

    await db.collection(APPLICATIONS_COLLECTION).doc(userId).update({ mlhConsent: nextMlhConsent });

    return res.status(200).json({
      msg: 'Application updated',
    });
  } catch (error) {
    console.error('Error when updating application', error);
    return res.status(500).json({
      code: 'internal-error',
      message: 'Something went wrong when processing this request. Try again later.',
    });
  }
}

/**
 * Get application data.
 *
 * Corresponds to /api/applications/[applicationId] route;
 */
export default function handleApplications(req: NextApiRequest, res: NextApiResponse) {
  // Get /applications collection in Cloud Firestore
  // GET: Return this application
  // PATCH: Modify an application
  // DELETE: Delete this applications
  const { method } = req;
  if (method === 'GET') {
    return handleGetApplication(req, res);
  } else if (method === 'PATCH') {
    return handlePatchApplication(req, res);
  } else if (method === 'DELETE') {
    // Maybe check for additional authorization so only organizers can delete individual applications?
  } else {
    res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
