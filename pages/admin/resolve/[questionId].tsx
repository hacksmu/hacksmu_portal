import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { isAuthorized } from '..';
import AdminHeader from '../../../components/adminComponents/AdminHeader';
import ErrorList from '../../../components/ErrorList';
import PendingQuestion from '../../../components/dashboardComponents/PendingQuestion';
import { RequestHelper } from '../../../lib/request-helper';
import { useAuthContext } from '../../../lib/user/AuthContext';
import { QADocument } from '../../api/questions';

const glassPanel: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(100,160,255,0.08) 100%)',
  backdropFilter: 'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.26)',
  borderRadius: 18,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 6px 28px rgba(0,20,70,0.24)',
};

function PageState({ message }: { message: string }) {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#c8e8ff',
        fontSize: 22,
        fontFamily: "'Orbitron', sans-serif",
        textShadow: '0 0 16px rgba(0,180,255,0.5)',
      }}
    >
      {message}
    </div>
  );
}

/**
 * Resolve question page.
 *
 * This page allows admins and organizers to resolve a specific question asked by contestant
 *
 * Route: /admin/resolve/[questionId]
 */
export default function ResolveQuestionPage() {
  const router = useRouter();
  const { questionId } = router.query;
  const [answer, setAnswer] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<QADocument | null>(null);
  const { user } = useAuthContext();

  const addError = (errMsg: string) => {
    setErrors((prev) => [...prev, errMsg]);
  };

  const submitAnswer = async () => {
    if (!question) return;
    try {
      await RequestHelper.post<QADocument, void>(
        `/api/questions/pending/${questionId}`,
        {
          headers: {
            Authorization: user.token,
          },
        },
        {
          ...question,
          answer,
        },
      );
      setAnswer('');
      router.push('/admin');
    } catch (error) {
      addError('Failed to submit answer. Please try again later');
      console.log(error);
    }
  };

  useEffect(() => {
    async function loadQuestion() {
      if (!user?.token || !questionId) return;

      try {
        const { data } = await RequestHelper.get<QADocument>(`/api/questions/pending/${questionId}`, {
          headers: {
            Authorization: user.token,
          },
        });
        setQuestion(data);
      } catch (error) {
        addError('Failed to load this question.');
      } finally {
        setLoading(false);
      }
    }

    loadQuestion();
  }, [questionId, user]);

  if (!user || !isAuthorized(user)) return <PageState message="Unauthorized" />;

  if (loading) {
    return <PageState message="Loading..." />;
  }

  if (!question) {
    return <PageState message="Question not found" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Head>
        <title>HackPortal - Resolve Question</title>
        <meta name="description" content="Answer a pending HackPortal question" />
      </Head>
      <AdminHeader />
      <div style={{ padding: '24px 28px 48px', maxWidth: 1040, width: '100%', margin: '0 auto' }}>
        <div
          style={{
            ...glassPanel,
            padding: '20px 24px',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Orbitron', 'Roboto', sans-serif",
                fontSize: 24,
                fontWeight: 900,
                color: '#fff',
                textShadow: '0 0 18px rgba(0,200,255,0.6)',
                letterSpacing: '0.04em',
              }}
            >
              Resolve Question
            </div>
            <div style={{ marginTop: 8, color: 'rgba(200,232,255,0.78)', fontSize: 14 }}>
              Review the pending question, draft a response, and send it back to the user.
            </div>
          </div>
          <div
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 18,
              background: 'rgba(255,160,64,0.16)',
              border: '1px solid rgba(255,160,64,0.36)',
              color: '#ffbf73',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            pending review
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <ErrorList
            errors={errors}
            onClose={(idx: number) => {
              const newErrorList = [...errors];
              newErrorList.splice(idx, 1);
              setErrors(newErrorList);
            }}
          />
        </div>

        <div style={{ ...glassPanel, padding: '24px 28px', marginBottom: 24 }}>
          <div
            style={{
              fontFamily: "'Orbitron', 'Roboto', sans-serif",
              fontSize: 17,
              fontWeight: 800,
              color: '#e0f0ff',
              letterSpacing: '0.05em',
              marginBottom: 14,
              paddingBottom: 8,
              borderBottom: '1px solid rgba(255,255,255,0.14)',
              textShadow: '0 0 10px rgba(0,180,255,0.40)',
            }}
          >
            Submitted Question
          </div>
          <PendingQuestion question={question.question} />
        </div>

        <div style={{ ...glassPanel, padding: '24px 28px' }}>
          <div
            style={{
              fontFamily: "'Orbitron', 'Roboto', sans-serif",
              fontSize: 17,
              fontWeight: 800,
              color: '#e0f0ff',
              letterSpacing: '0.05em',
              marginBottom: 14,
              paddingBottom: 8,
              borderBottom: '1px solid rgba(255,255,255,0.14)',
              textShadow: '0 0 10px rgba(0,180,255,0.40)',
            }}
          >
            Answer
          </div>
          <textarea
            className="w-full"
            rows={7}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: '#e8f4ff',
              lineHeight: 1.6,
            }}
            placeholder="Type your answer here"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button
              type="button"
              className="aero-btn"
              style={{ fontSize: 14, padding: '10px 18px' }}
              onClick={() => {
                submitAnswer();
              }}
            >
              Submit Answer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
