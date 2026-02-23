import Head from 'next/head';
import React, { useState } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { useAuthContext } from '../../lib/user/AuthContext';
import QRCode from '../../components/QRCode';
import Sidebar from './Components/Sidebar';

const glassPanel: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(120,180,255,0.10) 100%)',
  backdropFilter: 'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.30)',
  borderRadius: 20,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 32px rgba(0,30,80,0.28)',
};

export default function Scan() {
  const { user, isSignedIn, hasProfile } = useAuthContext();
  const [qrData, setQRData] = useState('');
  const [qrLoading, setQRLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  const fetchQR = () => {
    if (!isSignedIn) return;
    setQRLoading(true);
    setGenerated(false);
    const query = new URL(`http://localhost:3000/api/applications/${user.id}`);
    query.searchParams.append('id', user.id);
    fetch(query.toString().replaceAll('http://localhost:3000', ''), {
      mode: 'cors',
      headers: { Authorization: user.token },
      method: 'GET',
    })
      .then(async (result) => {
        if (result.status !== 200) {
          setQRLoading(false);
          return setError('QR fetch failed. Please contact an event organizer.');
        }
        const data = await result.json();
        setQRData(`hack:${data.id}`);
        setQRLoading(false);
        setGenerated(true);
        setError('');
      })
      .catch((err) => {
        console.log(err);
        setQRLoading(false);
        setError('Network error. Please try again.');
      });
  };

  if (!isSignedIn) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#c8e8ff',
        fontSize: 20,
        fontFamily: "'Orbitron', sans-serif",
        textShadow: '0 0 16px rgba(0,180,255,0.5)',
        textAlign: 'center',
        padding: 24,
      }}>
        Please sign in and register to access your QR code
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Head>
        <title>HackSMU — Scan-In</title>
        <meta name="description" content="HackSMU Scan-In" />
      </Head>

      <Sidebar />

      <main style={{ flex: 1, padding: '24px 28px 48px', minWidth: 0 }}>
        <DashboardHeader />

        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          {/* Page title */}
          <div style={{
            fontFamily: "'Orbitron', 'Roboto', sans-serif",
            fontSize: 26,
            fontWeight: 900,
            color: '#fff',
            textShadow: '0 0 18px rgba(0,200,255,0.55)',
            letterSpacing: '0.04em',
            marginBottom: 24,
            textAlign: 'center',
          }}>
            Scan-In
          </div>

          {hasProfile ? (
            <div style={{ ...glassPanel, padding: '36px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              {/* Icon */}
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 38% 35%, rgba(255,255,255,0.45) 0%, rgba(0,180,255,0.50) 50%, rgba(0,80,200,0.60) 100%)',
                border: '2px solid rgba(0,200,255,0.55)',
                boxShadow: '0 0 24px rgba(0,180,255,0.40)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
              }}>
                🎫
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 17,
                  fontWeight: 800,
                  color: '#e0f0ff',
                  marginBottom: 8,
                }}>
                  Hacker Tag
                </div>
                <p style={{ color: 'rgba(200,232,255,0.72)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  Generate your QR code and show it to an organizer to get scanned in for events.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 10,
                  background: 'rgba(255,60,60,0.15)',
                  border: '1px solid rgba(255,80,80,0.40)',
                  color: '#ff9999',
                  fontSize: 13,
                  textAlign: 'center',
                }}>
                  {error}
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={fetchQR}
                disabled={qrLoading}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  padding: '11px 36px',
                  borderRadius: 24,
                  background: qrLoading
                    ? 'rgba(100,160,255,0.20)'
                    : 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.50) 0%, rgba(0,160,255,0.45) 40%, rgba(0,60,200,0.70) 100%)',
                  border: '1px solid rgba(255,255,255,0.50)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 14,
                  letterSpacing: '0.06em',
                  cursor: qrLoading ? 'not-allowed' : 'pointer',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.50), 0 4px 18px rgba(0,80,200,0.40)',
                  transition: 'all 0.22s',
                  opacity: qrLoading ? 0.6 : 1,
                }}
                onMouseEnter={e => {
                  if (!qrLoading) (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                }}
              >
                {/* Gloss */}
                <span style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, transparent 100%)',
                  borderRadius: '24px 24px 0 0',
                  pointerEvents: 'none',
                }} />
                {qrLoading ? 'Generating…' : generated ? 'Regenerate QR' : 'Generate QR Code'}
              </button>

              {/* QR code */}
              {(qrData || qrLoading) && (
                <div style={{
                  padding: 16,
                  borderRadius: 16,
                  background: '#fff',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.80)',
                  border: '1px solid rgba(255,255,255,0.50)',
                }}>
                  <QRCode data={qrData} loading={qrLoading} width={200} height={200} />
                </div>
              )}

              {generated && !qrLoading && (
                <p style={{ color: 'rgba(64,255,154,0.80)', fontSize: 12, textAlign: 'center', margin: 0 }}>
                  QR code ready — show this to an organizer
                </p>
              )}
            </div>
          ) : (
            <div style={{ ...glassPanel, padding: '40px 32px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
              <div style={{ color: '#e0f0ff', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                Registration Required
              </div>
              <p style={{ color: 'rgba(200,232,255,0.65)', fontSize: 14, margin: 0 }}>
                Please complete your registration to receive a QR code for event check-ins.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
