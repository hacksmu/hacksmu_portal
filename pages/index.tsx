// pages/index.tsx
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type Stage = 'introVideo' | 'introStill' | 'zoomVideo' | 'finalStill';

export default function Home() {
  const [stage, setStage] = useState<Stage>('introVideo');

  // Advance to zoom video only after the intro still, on first interaction
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
        {/* Optional: preload stills to avoid any flicker */}
        <link rel="preload" as="image" href="/videos/intro_still.png" />
        <link rel="preload" as="image" href="/videos/final_still.png" />
      </Head>

      {/* Fullscreen stage area */}
      <section className="fixed inset-0 overflow-hidden z-0 bg-black">
        {/* Video stages */}
        {(stage === 'introVideo' || stage === 'zoomVideo') && (
          <video
            key={stage} // force reload when source changes
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

        {/* Still images (use next/image to satisfy lint rules) */}
        {stage === 'introStill' && (
          <div className="absolute top-0 left-0 w-full h-full">
            <Image
              src="/videos/inter-screen.png"
              alt="Intermediate Screen"
              layout="fill"        // Next.js 12
              objectFit="cover"
              priority
            />
          </div>
        )}

        {stage === 'finalStill' && (
          <div className="absolute top-0 left-0 w-full h-full">
            <Image
              src="/videos/main-screen.png"
              alt="Main Screen"
              layout="fill"
              objectFit="cover"
              priority
            />
          </div>
        )}
      </section>
    </>
  );
}
