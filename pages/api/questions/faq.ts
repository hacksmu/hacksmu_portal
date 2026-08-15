import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/supabase/admin';

/**
 *
 * Fetch all FAQs from the database
 *
 * @param req request object
 * @param res response object
 *
 *
 */
async function getFaqs(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabaseAdmin
    .from('faqs')
    .select('id, question, answer, order')
    .order('order', { ascending: true });

  if (error) {
    console.error('Unable to load FAQs from Supabase:', error);
    return res.status(500).json({ error: 'Unable to load FAQs' });
  }

  return res.status(200).json(data ?? []);
}

function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  return getFaqs(req, res);
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
