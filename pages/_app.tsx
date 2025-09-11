import Head from 'next/head';
import { AppProps } from 'next/dist/shared/lib/router/router';
import 'firebase/auth';
import AppHeader from '../components/AppHeader';
import { initFirebase } from '../lib/firebase-client';
import { AuthProvider } from '../lib/user/AuthContext';
import '../styles/globals.css';
import '../styles/tokyo-theme.css';
import '../styles/tailwind.css';
import '../styles/animations.css';
import { FCMProvider } from '../lib/service-worker/FCMContext';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend'

// core styles shared by all of react-notion-x (required)
import 'react-notion-x/src/styles.css';
// used for code syntax highlighting
import 'prismjs/themes/prism-tomorrow.css';
// used for rendering equations
import 'katex/dist/katex.min.css';

initFirebase();

/**
 * A Wrapper for the HackPortal web app.
 *
 * This is the root of the component heirarchy. When the site is hydrated, this
 * will load into memory and never re-initialize unless the page refreshes.
 */
function PortalApp({ Component, pageProps }: AppProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <FCMProvider>
            <Head>
              <meta charSet="utf-8" />
              <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
              <meta
                name="viewport"
                content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
              />

              {/* Update the title while you're here */}
              <title>HackSMU VII</title>

              <meta name="description" content="Your all-in-one guide to this hackathon." />

              {/* PWA manifest (keep this if you actually have /manifest.json) */}
              {(process.env.ENABLE_PWA || process.env.NODE_ENV !== 'development') && (
                <link rel="manifest" href="/manifest.json?v=3" />
              )}

              {/* --- Favicons (make sure these files exist in /public or /public/icons) --- */}
              {/* Root ICO for maximum compatibility */}
              <link rel="icon" href="/icons/favicon.v3.ico" />
              <link rel="shortcut icon" href="/icons/favicon.v3.ico" />

              {/* PNG sizes */}
              <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32V3.png?v=3" />
              <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16V3.png?v=3" />

              {/* iOS home screen */}
              <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-iconV3.png?v=3" />

              {/* (Optional) Safari pinned tab (add this file if you have it) */}
              {/* <link rel="mask-icon" href="/icons/safari-pinned-tab.svg?v=3" color="#5D5FEF" /> */}

              <meta name="theme-color" content="#5D5FEF" />

              {/* Fonts */}
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
              <link
                href="https://fonts.googleapis.com/css2?family=JetBrains+Mono&family=Rampart+One&family=Roboto:wght@400;600;700;900&family=Orbitron:wght@400;700&family=Press+Start+2P&display=swap"
                rel="stylesheet"
              />
            </Head>

            {/* Apply the font variable here so it’s available everywhere */}
            <div className={`min-h-screen flex flex-col bg-white mt-5`}>
              <AppHeader />
              <Component {...pageProps} />
            </div>
          </FCMProvider>
        </AuthProvider>
      </LocalizationProvider>
    </DndProvider>
  );
}

export default PortalApp;
