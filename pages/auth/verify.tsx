import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';

type VerificationState = 'loading' | 'success' | 'already-used' | 'error';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [state, setState] = React.useState<VerificationState>('loading');
  const [message, setMessage] = React.useState('Verifying your email...');
  const hasProcessedCodeRef = React.useRef(false);

  React.useEffect(() => {
    if (!router.isReady) return;

    const mode = typeof router.query.mode === 'string' ? router.query.mode : '';
    const oobCode = typeof router.query.oobCode === 'string' ? router.query.oobCode : '';

    if (hasProcessedCodeRef.current) return;

    if (mode !== 'verifyEmail' || !oobCode) {
      setState('error');
      setMessage('This verification link is invalid. Please request a new verification email.');
      return;
    }

    hasProcessedCodeRef.current = true;

    firebase
      .auth()
      .applyActionCode(oobCode)
      .then(async () => {
        await firebase.auth().currentUser?.reload().catch(() => undefined);
        setState('success');
        setMessage('Your email has been verified. You can sign in now.');
      })
      .catch(async (error) => {
        await firebase.auth().currentUser?.reload().catch(() => undefined);

        if (firebase.auth().currentUser?.emailVerified) {
          setState('already-used');
          setMessage('Your email is already verified. You can sign in now.');
          return;
        }

        if (error?.code === 'auth/invalid-action-code') {
          setState('already-used');
          setMessage(
            'This verification link has already been used or is no longer valid. If you still cannot sign in, request a new verification email.',
          );
          return;
        }

        setState('error');
        setMessage('We could not verify your email from this link. Please request a new verification email.');
      });
  }, [router.isReady, router.query.mode, router.query.oobCode]);

  const accentColor =
    state === 'success' || state === 'already-used' ? '#40ff9a' : state === 'error' ? '#ff9a9a' : '#80d8ff';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Head>
        <title>HackSMU — Verify Email</title>
        <meta name="description" content="Verify your HackSMU account email" />
      </Head>

      <div
        style={{
          width: '100%',
          maxWidth: 560,
          padding: '28px 30px',
          borderRadius: 18,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(100,160,255,0.08) 100%)',
          backdropFilter: 'blur(18px) saturate(180%)',
          WebkitBackdropFilter: 'blur(18px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.26)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 6px 28px rgba(0,20,70,0.24)',
          color: '#e8f4ff',
        }}
      >
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
          Verify Email
        </div>

        <div
          style={{
            marginTop: 18,
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: 18,
            background: `${accentColor}22`,
            border: `1px solid ${accentColor}66`,
            color: accentColor,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {state === 'loading' ? 'processing' : state.replace('-', ' ')}
        </div>

        <p style={{ marginTop: 18, lineHeight: 1.7, color: 'rgba(220,240,255,0.86)' }}>{message}</p>

        <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/auth">
            <a
              className="aero-btn"
              style={{ fontSize: 14, padding: '10px 18px', textDecoration: 'none' }}
            >
              Go to Sign In
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
