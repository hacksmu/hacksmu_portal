import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import DashboardHeader from '../../components/dashboardComponents/DashboardHeader';
import { useAuthContext } from '../../lib/user/AuthContext';
import LoadIcon from '../../components/LoadIcon';

const glassPanel: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(100,160,255,0.08) 100%)',
  backdropFilter: 'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.26)',
  borderRadius: 18,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 6px 28px rgba(0,20,70,0.24)',
};

type JudgeApplication = {
  status?: string;
  submittedAt?: string;
};

export default function JudgeApplyPage() {
  const { isSignedIn, user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [existingApplication, setExistingApplication] = useState<JudgeApplication | null>(null);

  useEffect(() => {
    async function loadApplication() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { default: firebase } = await import('firebase/app');
        const token = await firebase.auth().currentUser?.getIdToken();

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/judge-applications/${user.id}`, {
          method: 'GET',
          headers: { Authorization: token },
        });

        if (response.status === 200) {
          const data = await response.json();
          setExistingApplication(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, [user]);

  if (!isSignedIn) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#c8e8ff',
          fontSize: 20,
          fontFamily: "'Orbitron', sans-serif",
          textShadow: '0 0 16px rgba(0,180,255,0.5)',
        }}
      >
        Please sign in to view judge application updates
      </div>
    );
  }

  if (loading) {
    return <LoadIcon width={160} height={160} />;
  }

  return (
    <div style={{ minHeight: '100vh', padding: '24px 28px 48px', maxWidth: 900, margin: '0 auto' }}>
      <Head>
        <title>HackSMU - Judge Applications Closed</title>
        <meta name="description" content="Judge applications for HackSMU VII are closed" />
      </Head>

      <DashboardHeader />

      <div style={{ ...glassPanel, padding: '24px 28px', marginBottom: 24 }}>
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
          Judge Applications Closed
        </div>
        <div style={{ marginTop: 10, color: 'rgba(200,232,255,0.78)', lineHeight: 1.6, fontSize: 14 }}>
          Thank you for your interest in judging HackSMU VII. We are no longer accepting new judge
          applications.
        </div>
      </div>

      <div style={{ ...glassPanel, padding: '24px 28px' }}>
        {existingApplication ? (
          <>
            <div style={{ color: '#40ff9a', fontWeight: 800, fontSize: 18 }}>Application on file</div>
            <div style={{ marginTop: 12, color: 'rgba(220,240,255,0.88)', lineHeight: 1.7 }}>
              We already have your judge application on file. While applications are now closed, you
              can still view your current status here.
            </div>
            <div style={{ marginTop: 16, color: 'rgba(200,232,255,0.78)', fontSize: 14 }}>
              Status: <strong>{existingApplication.status ?? 'submitted'}</strong>
            </div>
            {existingApplication.submittedAt && (
              <div style={{ marginTop: 6, color: 'rgba(200,232,255,0.68)', fontSize: 13 }}>
                Submitted: {new Date(existingApplication.submittedAt).toLocaleString()}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>No application available</div>
            <div style={{ marginTop: 12, color: 'rgba(220,240,255,0.88)', lineHeight: 1.7 }}>
              If you have questions about judging or late-interest requests, please contact the
              HackSMU team directly.
            </div>
          </>
        )}

        <div style={{ marginTop: 22, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/dashboard">
            <a className="aero-btn" style={{ fontSize: 14, padding: '9px 18px', textDecoration: 'none' }}>
              Back to Dashboard
            </a>
          </Link>
          <Link href="/dashboard/questions">
            <a style={{ color: 'rgba(200,232,255,0.82)', textDecoration: 'none', fontWeight: 700 }}>
              Ask a Question
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
