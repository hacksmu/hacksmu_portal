import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabase/admin';

/**
 *
 * API endpoint to get data of members from backend for the "Meet the team" section
 *
 * @param req HTTP request object
 * @param res HTTP response object
 *
 *
 */
async function getMembersData(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabaseAdmin
    .from('members')
    .select('id, name, description, linkedin, github, personal_site, rank, file_name')
    .order('rank', { ascending: true });

  if (error) {
    console.error('Unable to load members from Supabase:', error);
    return res.status(500).json({ error: 'Unable to load members' });
  }

  const members = (data ?? []).map(({ personal_site, file_name, ...member }) => ({
    ...member,
    personalSite: personal_site,
    fileName: file_name,
  }));

  return res.status(200).json(members);
}

function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  return getMembersData(req, res);
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
