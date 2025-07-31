import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stage, setStage] = useState<'intro' | 'zoom' | 'done'>('intro');

  useEffect(() => {
    const handleInteraction = () => {
      if (stage === 'intro') {
        setStage('zoom');
      }
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [stage]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (stage === 'intro') {
      video.src = '/videos/turnon.mp4';
      video.loop = false;
      video.play();
    }
    if (stage === 'zoom') {
      video.src = '/videos/zoomin.mp4';
      video.loop = false;
      video.play();
      video.onended = () => setStage('done');
    }
  }, [stage]);

  return (
    <>
      <Head>
        <title>HackSMU VII</title>
        <meta name="description" content="HackSMU Portal" />
        <link rel="icon" href="/favicon2.ico" />
      </Head>

      <section className="fixed inset-0 overflow-hidden z-0">
        {stage !== 'done' ? (
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-cover"
            muted
            autoPlay
            playsInline
          >
            <source src="/videos/turnon.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src="/images/finalframe.png"
            alt="Final Frame"
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        )}

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
