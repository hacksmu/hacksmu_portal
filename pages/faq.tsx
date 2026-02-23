import Head from 'next/head';
import { GetServerSideProps } from 'next';
import FaqPage from '../components/faq';
import { RequestHelper } from '../lib/request-helper';

const glass: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(100,160,255,0.09) 100%)',
  backdropFilter: 'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.26)',
  borderRadius: 20,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 8px 32px rgba(0,20,60,0.28)',
};

export default function FaqStandalonePage({ fetchedFaqs }: { fetchedFaqs: AnsweredQuestion[] }) {
  return (
    <>
      <Head>
        <title>FAQ — HackSMU VII</title>
        <meta name="description" content="Frequently asked questions about HackSMU VII — ion remember, 2026 · Dallas, TX" />
      </Head>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72, height: 72,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at 38% 30%, rgba(255,255,255,0.50) 0%, rgba(0,160,255,0.45) 40%, rgba(0,60,200,0.70) 100%)',
            border: '2px solid rgba(0,200,255,0.50)',
            boxShadow: '0 0 28px rgba(0,180,255,0.35)',
            fontSize: 32,
            marginBottom: 18,
          }}>
            💬
          </div>
          <h1 style={{
            fontFamily: "'Orbitron', 'Roboto', sans-serif",
            fontSize: 'clamp(24px, 4vw, 40px)',
            fontWeight: 900,
            color: '#fff',
            textShadow: '0 0 24px rgba(0,200,255,0.55)',
            letterSpacing: '0.04em',
            margin: '0 0 12px',
          }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: 'rgba(200,232,255,0.72)', fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Everything you need to know about HackSMU VII.
          </p>
        </div>

        {/* FAQ list */}
        <div style={glass}>
          <FaqPage fetchedFaqs={fetchedFaqs} />
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const protocol = context.req.headers.referer?.split('://')[0] || 'http';
  let data: AnsweredQuestion[] = [];
  try {
    const res = await RequestHelper.get<AnsweredQuestion[]>(
      `${protocol}://${context.req.headers.host}/api/questions/faq`,
      {},
    );
    data = res.data ?? [];
  } catch {
    data = [];
  }
  return { props: { fetchedFaqs: data } };
};
