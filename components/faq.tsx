import { GetServerSideProps } from 'next';
import React, { useState, useEffect } from 'react';
import FaqDisclosure from './FaqDisclosure';
import { RequestHelper } from '../lib/request-helper';

/**
 * The FAQ page — Frutiger Aero glass style.
 * Used both as an overlay in the home page and as a standalone page.
 */
export default function FaqPage({ fetchedFaqs }: { fetchedFaqs: AnsweredQuestion[] }) {
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<AnsweredQuestion[]>([]);
  const [disclosuresStatus, setDisclosureStatus] = useState<boolean[]>([]);

  useEffect(() => {
    const sorted = [...fetchedFaqs].sort(
      (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER),
    );
    setFaqs(sorted);
    setDisclosureStatus(sorted.map(() => false));
    setLoading(false);
  }, [fetchedFaqs]);

  const expandAll = () =>
    setDisclosureStatus(Array.from({ length: disclosuresStatus.length }, () => true));
  const collapseAll = () =>
    setDisclosureStatus(Array.from({ length: disclosuresStatus.length }, () => false));

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 0',
        }}
      >
        <div
          style={{
            color: 'rgba(100,220,255,0.90)',
            fontSize: 16,
            fontWeight: 700,
            textShadow: '0 0 12px rgba(0,200,255,0.5)',
          }}
        >
          Loading FAQs…
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 0' }}>
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 18px 16px',
          gap: 10,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 800,
            color: 'rgba(160,230,255,0.95)',
            textShadow: '0 0 12px rgba(0,200,255,0.4)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          FAQ
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="aero-btn"
            style={{ fontSize: 11, padding: '5px 12px' }}
            onClick={expandAll}
          >
            Expand All
          </button>
          <button
            className="aero-btn"
            style={{
              fontSize: 11,
              padding: '5px 12px',
              background:
                'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.35) 0%, rgba(80,80,100,0.40) 50%, rgba(20,20,40,0.70) 100%)',
            }}
            onClick={collapseAll}
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="divider-aero" style={{ marginBottom: 12 }} />

      {/* FAQ items */}
      <div style={{ padding: '0 18px' }}>
        {faqs.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: 'rgba(160,210,255,0.65)',
              padding: '28px 0',
              fontSize: 13,
            }}
          >
            No FAQs available yet. Check back soon!
          </div>
        ) : (
          faqs.map(({ id, question, answer }, idx) => (
            <FaqDisclosure
              key={id ?? idx}
              question={question}
              answer={answer}
              isOpen={disclosuresStatus[idx]}
              toggleDisclosure={() => {
                const curr = [...disclosuresStatus];
                curr[idx] = !curr[idx];
                setDisclosureStatus(curr);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const protocol = context.req.headers.referer?.split('://')[0] || 'http';
  const { data } = await RequestHelper.get<AnsweredQuestion[]>(
    `${protocol}://${context.req.headers.host}/api/questions/faq`,
    {},
  );
  return { props: { fetchedFaqs: data } };
};
