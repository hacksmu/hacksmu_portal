// pages/index.tsx
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [stage, setStage] = useState<'intro' | 'zoom' | 'done'>('intro');

  // On first user interaction, switch from intro -> zoom
  useEffect(() => {
    const goZoom = () => {
      if (stage === 'intro') setStage('zoom');
    };
    window.addEventListener('click', goZoom);
    window.addEventListener('keydown', goZoom);
    return () => {
      window.removeEventListener('click', goZoom);
      window.removeEventListener('keydown', goZoom);
    };
  }, [stage]);

  return (
    <>
      <Head>
        <title>HackSMU VII</title>
        <meta name="description" content="HackSMU Portal" />
        <link rel="icon" href="/favicon2.ico" />
      </Head>

      {/* Fullscreen hero that prevents page scrolling */}
      <section className="fixed inset-0 overflow-hidden z-0">

        {/* One video element that swaps source by stage.
           key={stage} forces the <video> to reload when stage changes. */}
        {stage !== 'done' && (
          <video
            key={stage}
            className="absolute top-0 left-0 w-full h-full object-cover"
            src={stage === 'intro' ? '/videos/turnon.mp4' : '/videos/zoomin.mp4'}
            muted
            autoPlay
            playsInline
            loop={false}
            onEnded={() => {
              // After zoom finishes, stop showing the video.
              if (stage === 'zoom') setStage('done');
            }}
          />
        )}

        {/* Foreground content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center text-white">
          <h1 className="glow-text neon-title">HackSMU VII</h1>
          <p className="neon-date">October 25–26th, 2025</p>
          <Link href="/auth" passHref>
            <a className="gradient-button neon-button">Apply here!</a>
          </Link>
        </div>
      </section>
    </>
  );
}
