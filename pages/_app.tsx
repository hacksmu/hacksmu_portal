// pages/_app.tsx
import React, { useEffect, useMemo, useState } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// ---- Global CSS (keeps your backgrounds/styles) ----
import '../styles/globals.css';
import '../styles/tokyo-theme.css';
import '../styles/tailwind.css';
import '../styles/animations.css';
import 'react-notion-x/src/styles.css';
import 'prismjs/themes/prism-tomorrow.css';
import 'katex/dist/katex.min.css';

// SSR-safe pieces
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Client-only chunks (avoid SSR window/SW access)
const AppHeader = dynamic(() => import('../components/AppHeader'), { ssr: false });
const AuthProvider = dynamic(
  () => import('../lib/user/AuthContext').then(m => m.AuthProvider),
  { ssr: false }
);
const LocalizationProvider = dynamic(
  () => import('@mui/x-date-pickers/LocalizationProvider').then(m => m.LocalizationProvider),
  { ssr: false }
);

// Firebase init must be client-only
import { initFirebase } from '../lib/firebase-client';

// Optional FCM (can crash without SW/permissions); load only if enabled
const FCMProviderDyn = dynamic(
  () => import('../lib/service-worker/FCMContext').then(m => m.FCMProvider),
  { ssr: false }
);

// Tiny boundary per section so the whole app never blanks
class SectionBoundary extends React.Component<
  { name: string; children: React.ReactNode },
  { error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: any) { return { error }; }
  componentDidCatch(error: any, info: any) {
    console.error(`[SectionBoundary:${this.props.name}]`, error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 8, margin: 8, border: '2px dashed #ef4444', borderRadius: 8,
          background: '#111', color: '#fff'
        }}>
          <strong>⚠️ {this.props.name} failed</strong> — see console.
        </div>
      );
    }
    return this.props.children as any;
  }
}

export default function PortalApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try { initFirebase(); } catch (e) { console.warn('[initFirebase]', e); }
  }, []);

  // react-dnd only on client (it references window at load time)
  const DnD = useMemo(() => {
    if (!mounted) return null;
    const { DndProvider } = require('react-dnd');
    const { HTML5Backend } = require('react-dnd-html5-backend');
    return { DndProvider, HTML5Backend };
  }, [mounted]);

  // Feature flags from URL so you can toggle culprits without editing code:
  // ?full=1 enables everything; or turn on individually: ?header=1&auth=1&loc=1&fcm=1&dnd=1
  const flags = useMemo(() => {
    if (typeof window === 'undefined') return { full:false, header:false, auth:false, loc:false, fcm:false, dnd:false };
    const sp = new URLSearchParams(window.location.search);
    const full = sp.get('full') === '1';
    return {
      full,
      header: full || sp.get('header') === '1',
      auth:   full || sp.get('auth')   === '1',
      loc:    full || sp.get('loc')    === '1',
      fcm:    full || sp.get('fcm')    === '1',
      dnd:    full || sp.get('dnd')    === '1',
    };
  }, [mounted]);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />
        <title>HackSMU VII</title>
        <meta name="description" content="Your all-in-one guide to this hackathon." />
        {(process.env.ENABLE_PWA || process.env.NODE_ENV !== 'development') && (
          <link rel="manifest" href="/manifest.json?v=3" />
        )}
        <link rel="icon" href="/icons/favicon.v3.ico" />
        <link rel="shortcut icon" href="/icons/favicon.v3.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32V3.png?v=3" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16V3.png?v=3" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-iconV3.png?v=3" />
        <meta name="theme-color" content="#5D5FEF" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono&family=Rampart+One&family=Roboto:wght@400;600;700;900&family=Orbitron:wght@400;700&family=Press+Start+2P&display=swap" />
      </Head>

      <div className="min-h-screen flex flex-col bg-white mt-5">
        {/* Safe default: render the page without heavy providers so it can't blank */}
        {!mounted || (!flags.dnd && !flags.full) ? (
          <>
            {flags.header ? (
              <SectionBoundary name="AppHeader">
                <AppHeader />
              </SectionBoundary>
            ) : null}
            <Component {...pageProps} />
          </>
        ) : (
          // Full tree (opt-in)
          <DnD.DndProvider backend={DnD.HTML5Backend}>
            <SectionBoundary name="LocalizationProvider">
              {flags.loc ? (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <SectionBoundary name="AuthProvider">
                    {flags.auth ? (
                      <AuthProvider>
                        <SectionBoundary name="FCMProvider">
                          {flags.fcm ? (
                            <FCMProviderDyn>
                              {flags.header ? <AppHeader /> : null}
                              <Component {...pageProps} />
                            </FCMProviderDyn>
                          ) : (
                            <>
                              {flags.header ? <AppHeader /> : null}
                              <Component {...pageProps} />
                            </>
                          )}
                        </SectionBoundary>
                      </AuthProvider>
                    ) : (
                      <>
                        {flags.header ? <AppHeader /> : null}
                        <Component {...pageProps} />
                      </>
                    )}
                  </SectionBoundary>
                </LocalizationProvider>
              ) : (
                <>
                  {flags.header ? <AppHeader /> : null}
                  <Component {...pageProps} />
                </>
              )}
            </SectionBoundary>
          </DnD.DndProvider>
        )}
      </div>
    </>
  );
}
