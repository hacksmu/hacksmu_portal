import Head from 'next/head';
import React from 'react';
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

export default function ScanIn() {
  const { user, isSignedIn, hasProfile } = useAuthContext();

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
        <title>HackSMU — My QR Code</title>
        <meta name="description" content="HackSMU Check-In QR Code" />
      </Head>

      <Sidebar />

      <main style={{ flex: 1, padding: '24px 28px 48px', minWidth: 0 }}>
        <DashboardHeader />

        <div style={{ maxWidth: 520, margin: '0 auto' }}>
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
            My QR Code
          </div>

          {hasProfile ? (
            <div style={{ ...glassPanel, padding: '36px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
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
                  Check-In QR Code
                </div>
                <p style={{ color: 'rgba(200,232,255,0.72)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  Show this to a volunteer at check-in.
                </p>
              </div>

              <div style={{
                padding: 16,
                borderRadius: 16,
                background: '#fff',
                boxShadow: '0 4px 24px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.80)',
                border: '1px solid rgba(255,255,255,0.50)',
              }}>
                <QRCode data={`hack:${user.id}`} loading={false} width={200} height={200} />
              </div>

              <p style={{ color: 'rgba(64,255,154,0.80)', fontSize: 12, textAlign: 'center', margin: 0 }}>
                Show this to an organizer at the check-in table
              </p>
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
