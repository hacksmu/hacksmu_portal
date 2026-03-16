import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import AnsweredQuestion from '../../components/dashboardComponents/AnsweredQuestion';
import ErrorList from '../../components/ErrorList';
import PendingQuestion from '../../components/dashboardComponents/PendingQuestion';
import { RequestHelper } from '../../lib/request-helper';
import { useAuthContext } from '../../lib/user/AuthContext';
import { QADocument, QAReqBody } from '../api/questions';
import DashboardHeader from '../../components/dashboardComponents/DashboardHeader';

const glassPanel: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(100,160,255,0.08) 100%)',
  backdropFilter: 'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.26)',
  borderRadius: 18,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 6px 28px rgba(0,20,70,0.24)',
};

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Orbitron', 'Roboto', sans-serif",
      fontSize: 16,
      fontWeight: 800,
      color: '#e0f0ff',
      letterSpacing: '0.05em',
      marginBottom: 14,
      paddingBottom: 8,
      borderBottom: '1px solid rgba(255,255,255,0.14)',
      textShadow: '0 0 10px rgba(0,180,255,0.40)',
    }}>
      {children}
    </div>
  );
}

export default function QuestionsPage() {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
  const [pendingQuestions, setPendingQuestions] = useState<QADocument[]>([]);
  const [answeredQuestionDisclosureStatus, setAnsweredDisclosureStatus] = useState<boolean[]>([]);
  const { user, isSignedIn } = useAuthContext();

  const getMyAnsweredQuestions = async (): Promise<AnsweredQuestion[]> => {
    if (!user) return [];
    const { data } = await RequestHelper.get<AnsweredQuestion[]>(
      `/api/questions/${user.id}/answered`, {},
    );
    return data;
  };

  const getMyPendingQuestions = async () => {
    if (!user) return [];
    const { data } = await RequestHelper.get<QADocument[]>(
      `/api/questions/${user.id}/pending`, {},
    );
    return data;
  };

  const addError = (errMsg: string) => setErrors((prev) => [...prev, errMsg]);

  const submitQuestion = async () => {
    if (!user) { addError('You must log in to ask a question'); return; }
    if (!currentQuestion.trim()) return;
    setSubmitStatus('sending');
    try {
      await RequestHelper.post<QAReqBody, {}>('/api/questions/', {
        headers: { 'Content-Type': 'application/json' },
      }, { userId: user.id, question: currentQuestion });
      setCurrentQuestion('');
      setSubmitStatus('sent');
      // Refresh pending questions
      const pending = await getMyPendingQuestions();
      setPendingQuestions(pending);
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      addError('Failed to send question. Please try again.');
      setSubmitStatus('idle');
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([getMyAnsweredQuestions(), getMyPendingQuestions()]).then(
      ([answered, pending]) => {
        setAnsweredQuestions(answered ?? []);
        setPendingQuestions(pending ?? []);
        setAnsweredDisclosureStatus(new Array((answered ?? []).length).fill(true));
        setLoading(false);
      },
    );
  }, [user]);

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(200,232,255,0.70)', fontSize: 16,
        fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.08em',
      }}>
        Loading…
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#c8e8ff', fontSize: 20,
        fontFamily: "'Orbitron', sans-serif", textShadow: '0 0 16px rgba(0,180,255,0.5)',
        textAlign: 'center', padding: 24,
      }}>
        Please sign in to ask organizers questions
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Head>
        <title>HackSMU — Ask a Question</title>
        <meta name="description" content="Ask HackSMU organizers a question" />
      </Head>

      <ErrorList
        errors={errors}
        onClose={(idx: number) => {
          const next = [...errors];
          next.splice(idx, 1);
          setErrors(next);
        }}
      />

      <div style={{ padding: '24px 28px 48px', maxWidth: 760, width: '100%', margin: '0 auto' }}>
        <DashboardHeader />

        {/* Page title */}
        <div style={{
          fontFamily: "'Orbitron', 'Roboto', sans-serif",
          fontSize: 24,
          fontWeight: 900,
          color: '#fff',
          textShadow: '0 0 18px rgba(0,200,255,0.55)',
          letterSpacing: '0.04em',
          marginBottom: 24,
        }}>
          Ask the Organizers
        </div>

        {/* Question input */}
        <div style={{ ...glassPanel, padding: '24px 24px 20px', marginBottom: 24 }}>
          <SectionHeader>Submit a Question</SectionHeader>
          <textarea
            rows={4}
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            placeholder="Type your question here…"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.20)',
              color: '#e8f4ff',
              fontSize: 14,
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,180,255,0.55)'; }}
            onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.20)'; }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            {submitStatus === 'sent' ? (
              <span style={{ color: '#40ff9a', fontSize: 13, fontWeight: 600 }}>
                ✓ Question submitted successfully
              </span>
            ) : <span />}
            <button
              onClick={submitQuestion}
              disabled={submitStatus === 'sending' || !currentQuestion.trim()}
              style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '9px 28px',
                borderRadius: 20,
                background: submitStatus === 'sending' || !currentQuestion.trim()
                  ? 'rgba(100,150,255,0.18)'
                  : 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.48) 0%, rgba(0,150,255,0.45) 40%, rgba(0,60,200,0.68) 100%)',
                border: '1px solid rgba(255,255,255,0.45)',
                color: '#fff',
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: '0.05em',
                cursor: submitStatus === 'sending' || !currentQuestion.trim() ? 'not-allowed' : 'pointer',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), 0 3px 14px rgba(0,80,200,0.35)',
                opacity: submitStatus === 'sending' || !currentQuestion.trim() ? 0.55 : 1,
                transition: 'all 0.22s',
              }}
            >
              <span style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.22) 0%, transparent 100%)',
                borderRadius: '20px 20px 0 0', pointerEvents: 'none',
              }} />
              {submitStatus === 'sending' ? 'Sending…' : 'Submit Question'}
            </button>
          </div>
        </div>

        {/* Pending questions */}
        <div style={{ ...glassPanel, padding: '24px', marginBottom: 20 }}>
          <SectionHeader>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffa040', boxShadow: '0 0 8px #ffa040', display: 'inline-block' }} />
              Pending Questions ({pendingQuestions.length})
            </span>
          </SectionHeader>
          {pendingQuestions.length === 0 ? (
            <p style={{ color: 'rgba(200,232,255,0.42)', fontSize: 13, margin: 0 }}>
              No pending questions
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingQuestions.map(({ question, submittedAt }, idx) => (
                <PendingQuestion key={idx} question={question} submittedAt={submittedAt} />
              ))}
            </div>
          )}
        </div>

        {/* Answered questions */}
        <div style={{ ...glassPanel, padding: '24px' }}>
          <SectionHeader>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#40ff9a', boxShadow: '0 0 8px #40ff9a', display: 'inline-block' }} />
              Answered Questions ({answeredQuestions.length})
            </span>
          </SectionHeader>
          {answeredQuestions.length === 0 ? (
            <p style={{ color: 'rgba(200,232,255,0.42)', fontSize: 13, margin: 0 }}>
              No answered questions yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {answeredQuestions.map(({ question, answer }, idx) => (
                <AnsweredQuestion
                  key={idx}
                  question={question}
                  answer={answer}
                  colorCode=""
                  iconColorCode=""
                  isOpen={answeredQuestionDisclosureStatus[idx]}
                  toggleDisclosure={() => {
                    const next = [...answeredQuestionDisclosureStatus];
                    next[idx] = !next[idx];
                    setAnsweredDisclosureStatus(next);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
