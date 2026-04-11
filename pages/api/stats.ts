import { firestore } from 'firebase-admin';
import { NextApiRequest, NextApiResponse } from 'next';
import { fieldNames, statRecordTypes } from '../../hackportal.config';
import initializeApi from '../../lib/admin/init';
import { userIsAuthorized } from '../../lib/authorization/check-authorization';
import { arrayFields, singleFields } from '../../lib/stats/field';

initializeApi();
const db = firestore();

const USERS_COLLECTION = '/registrations';
const SCANTYPES_COLLECTION = '/scan-types';

async function getCheckInEventName() {
  const snapshot = await db.collection(SCANTYPES_COLLECTION).where('isCheckIn', '==', true).get();
  let checkInEventName = '';
  snapshot.forEach((doc) => {
    checkInEventName = doc.data().name;
  });
  return checkInEventName;
}

async function getStatsData() {
  const checkInEventName = await getCheckInEventName();
  // const swagData: Record<string, number> = {};
  const statRecords: any = {};
  for (const field in fieldNames) {
    statRecords[field] = {};
  }

  const generalStats: GeneralStats & statRecordTypes = {
    superAdminCount: 0,
    checkedInCount: 0,
    hackerCount: 0,
    adminCount: 0,
    scans: {},
    timestamp: {},
    ...statRecords,
  };

  const snapshot = await db.collection(USERS_COLLECTION).get();
  snapshot.forEach((doc) => {
    const userData = doc.data();
    const date = doc.createTime.toDate();
    const stringDate = `${date.getMonth() + 1}-${date.getDate()}`;

    if (!generalStats.timestamp.hasOwnProperty(stringDate)) {
      generalStats.timestamp[stringDate] = 0;
    }
    generalStats.timestamp[stringDate]++;

    for (let arrayField of arrayFields) {
      if (!userData[arrayField]) continue;
      userData[arrayField].forEach((data: string) => {
        if (arrayField === 'scans' && data === checkInEventName) generalStats.checkedInCount++;
        else {
          if (!generalStats[arrayField].hasOwnProperty(data)) generalStats[arrayField][data] = 0;
          generalStats[arrayField][data]++;
        }
      });
    }

    for (let singleField of singleFields) {
      const fieldValue =
        singleField === 'school'
          ? userData.school ?? userData.university
          : userData[singleField];

      if (!fieldValue || fieldValue === '') continue;
      if (!generalStats[singleField].hasOwnProperty(fieldValue)) {
        generalStats[singleField][fieldValue] = 0;
      }
      generalStats[singleField][fieldValue]++;
    }

    const userPermission = userData.user?.permissions?.[0];

    switch (userPermission) {
      case 'super_admin': {
        generalStats.superAdminCount++;
        break;
      }
      case 'admin': {
        generalStats.adminCount++;
        break;
      }
      case 'hacker': {
        generalStats.hackerCount++;
        break;
      }
    }
  });

  return generalStats;
}

async function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  const { headers } = req;
  const userToken = headers['authorization'];

  let isAuthorized = false;
  try {
    isAuthorized = await userIsAuthorized(userToken, ['super_admin']);
  } catch (e) {
    return res.status(403).json({ msg: 'Invalid or expired auth token.' });
  }

  if (!isAuthorized) {
    return res.status(403).json({
      msg: 'Request is not authorized to perform super admin functionality',
    });
  }

  try {
    const statsData = await getStatsData();
    return res.json(statsData);
  } catch (e) {
    console.error('Error fetching stats data:', e);
    return res.status(500).json({ msg: 'Failed to fetch stats data.', error: String(e) });
  }
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
