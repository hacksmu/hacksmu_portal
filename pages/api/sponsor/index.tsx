import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabase/admin';

/**
 *
 * API endpoint to get data of keynote speakers from backend for the keynote speakers section in home page
 *
 * @param req HTTP request object
 * @param res HTTP response object
 *
 *
 */
async function getSponsors(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabaseAdmin.from('sponsors').select('id, link, reference');

  if (error) {
    console.error('Unable to load sponsors from Supabase:', error);
    return res.status(500).json({ error: 'Unable to load sponsors' });
  }

  return res.status(200).json(data ?? []);
}

function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  return getSponsors(req, res);
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
