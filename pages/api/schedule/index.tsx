import { firestore } from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';
import initializeApi from '../../../lib/admin/init';
import { userIsAuthorized } from '../../../lib/authorization/check-authorization';

initializeApi();
const db = firestore();

const SCHEDULE_EVENTS = '/schedule-events';

/**
 *
 * API endpoint to get data of keynote speakers from backend for the keynote speakers section in home page
 *
 * @param req HTTP request object
 * @param res HTTP response object
 *
 *
 */
async function getScheduleEvents(req: NextApiRequest, res: NextApiResponse) {
  try {
    const snapshot = await db.collection(SCHEDULE_EVENTS).get();
    let data = [];
    snapshot.forEach((doc) => {
      const currentEvent = doc.data();
      data.push({
        ...currentEvent,
        startTimestamp: currentEvent.startDate,
        endTimestamp: currentEvent.endDate,
        startDate: currentEvent.startDate.toDate(),
        endDate: currentEvent.endDate.toDate(),
      });
    });
    res.json(data);
  } catch (error) {
    console.error('Error fetching schedule events:', error);
    res.status(500).json({
      error: 'Failed to fetch schedule events',
      message: error.message || 'An unexpected error occurred'
    });
  }
}

async function updateEventDatabase(req: NextApiRequest, res: NextApiResponse) {
  const { startTimestamp, endTimestamp, ...eventData } = JSON.parse(req.body);

  const userToken = req.headers['authorization'] as string;
  const isAuthorized = await userIsAuthorized(userToken, ['super_admin']);
  if (!isAuthorized) {
    return res.status(403).json({
      statusCode: 403,
      msg: 'Request is not authorized to perform admin functionality',
    });
  }
  const event = await db.collection(SCHEDULE_EVENTS).where('Event', '==', eventData.Event).get();
  if (event.empty) {
    await db.collection(SCHEDULE_EVENTS).add({
      ...eventData,
      startDate: new Date(eventData.startDate),
      endDate: new Date(eventData.endDate),
    });
    return res.status(201).json({
      msg: 'Event created',
    });
  }
  event.forEach(async (doc) => {
    await db
      .collection(SCHEDULE_EVENTS)
      .doc(doc.id)
      .update({
        ...eventData,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
      });
  });

  return res.status(200).json({
    msg: 'Event updated',
  });
}

async function deleteEvent(req: NextApiRequest, res: NextApiResponse) {
  const userToken = req.headers['authorization'] as string;
  const isAuthorized = await userIsAuthorized(userToken, ['super_admin']);

  if (!isAuthorized) {
    return res.status(403).json({
      statusCode: 403,
      msg: 'Request is not authorized to perform admin functionality',
    });
  }

  const eventData = JSON.parse(req.body);
  const eventDoc = await db.collection(SCHEDULE_EVENTS).where('Event', '==', eventData.Event).get();
  eventDoc.forEach(async (doc) => {
    await db.collection(SCHEDULE_EVENTS).doc(doc.id).delete();
  });
  return res.json({
    msg: 'Event deleted',
  });
}

function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  return getScheduleEvents(req, res);
}

function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  return updateEventDatabase(req, res);
}

function handleDeleteRequest(req: NextApiRequest, res: NextApiResponse) {
  return deleteEvent(req, res);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;
    switch (method) {
      case 'GET': {
        return await handleGetRequest(req, res);
      }
      case 'POST': {
        return await handlePostRequest(req, res);
      }
      case 'DELETE': {
        return await handleDeleteRequest(req, res);
      }
      default: {
        return res.status(405).json({
          error: 'Method not allowed',
          message: `Method ${method} is not supported for this endpoint`
        });
      }
    }
  } catch (error) {
    console.error('Error in schedule API handler:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing the request'
    });
  }
}
