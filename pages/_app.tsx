/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-sync-scripts */
import Head from 'next/head';
import { AppProps } from 'next/dist/shared/lib/router/router';
import 'firebase/auth';
import AppHeader from '../components/AppHeader';
import { initFirebase } from '../lib/firebase-client';
import { AuthProvider } from '../lib/user/AuthContext';
import '../styles/globals.css';
import '../styles/tailwind.css';
import { FCMProvider } from '../lib/service-worker/FCMContext';

initFirebase();

/**
 * A Wrapper for the HackPortal web app.
 *
 * This is the root of the component heirarchy. When the site is hydrated, this
 * will load into memory and never re-initialize unless the page refreshes.
 */
function PortalApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <FCMProvider>
        <Head>
          <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
            rel="stylesheet"
            integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
            crossOrigin="anonymous"
          ></link>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
          <link
            href="https://fonts.googleapis.com/css2?family=JetBrains+Mono&family=Roboto:wght@400;600;700;900&display=swap"
            rel="stylesheet"
          />
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta
            name="viewport"
            content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
          />
          <title>HackSMU IV</title> {/* !change */}
          <meta name="description" content="Your all-in-one guide to this hackathon." />
          {process.env.ENABLE_PWA ||
            (process.env.NODE_ENV !== 'development' && (
              <link rel="manifest" href="/manifest.json" />
            ))}
          <link href="/icons/favicon-16x16.png" rel="icon" type="image/png" sizes="16x16" />
          <link href="/icons/favicon-32x32.png" rel="icon" type="image/png" sizes="32x32" />
          <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
          <meta name="theme-color" content="#5D5FEF" />
        </Head>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <AppHeader />
          <Component {...pageProps} />
          <script
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p"
            crossOrigin="anonymous"
          ></script>
        </div>
      </FCMProvider>
    </AuthProvider>
  );
}

export default PortalApp;
