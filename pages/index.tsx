// pages/index.tsx
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Stage = 'introVideo' | 'introStill' | 'zoomVideo' | 'finalStill';

export default function Home() {
  const [stage, setStage] = useState<Stage>('introVideo');

  // Only advance to zoom video when user interacts during the intro still
  useEffect(() => {
    const handleInteract = () => {
      if (stage === 'introStill') setStage('zoomVideo');
    };
    window.addEventListener('click', handleInteract);
    window.addEventListener('keydown', handleInteract);
    return () => {
      window.removeEventListener('click', handleInteract);
      window.removeEventListener('keydown', handleInteract);
    };
  }, [stage]);

  return (
    <>
      <Head>
        <title>HackSMU VII</title>
        <meta name="description" content="HackSMU Portal" />
        <link rel="icon" href="/favicon2.ico" />
        {/* (Optional) Preload stills to avoid any flicker */}
        <link rel="preload" as="image" href="/videos/intro_still.png" />
        <link rel="preload" as="image" href="/videos/final_still.png" />
      </Head>

      {/* Fullscreen canvas; bg-black helps hide any brief swap */}
      <section className="fixed inset-0 overflow-hidden z-0 bg-black">
        {/* Video stages */}
        {(stage === 'introVideo' || stage === 'zoomVideo') && (
          <video
            key={stage} // force reload on stage change
            className="absolute top-0 left-0 w-full h-full object-cover"
            src={stage === 'introVideo' ? '/videos/turnon.mp4' : '/videos/zoomin.mp4'}
            muted
            autoPlay
            playsInline
            loop={false}
            onEnded={() => {
              if (stage === 'introVideo') setStage('introStill');
              else if (stage === 'zoomVideo') setStage('finalStill');
            }}
          />
        )}

        {/* Still image stages */}
        {stage === 'introStill' && (
          <img
            src="/videos/inter-screen.png"
            alt="Intermediate Screen"
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        )}
        {stage === 'finalStill' && (
          <img
            src="/videos/main-screen.png"
            alt="Main Screen"
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        )}
      </section>
    </>
  );
}
