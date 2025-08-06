import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type Phase = 'introPlaying' | 'introStill' | 'zoomPlaying' | 'finalStill';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('introPlaying');

  // video refs
  const introRef = useRef<HTMLVideoElement>(null);
  const zoomRef  = useRef<HTMLVideoElement>(null);

  // visual fades
  const [showIntroVid, setShowIntroVid] = useState(true);
  const [showZoomVid, setShowZoomVid]   = useState(false);
  const [showFinal, setShowFinal]       = useState(false); // controls final image fade-in

  // intro video finished -> reveal intro still (no black frame)
  const handleIntroEnded = () => {
    setPhase('introStill');
    setShowIntroVid(false); // fade out intro video; intro still underneath remains
  };

  // user interaction during intro still -> start zoom video and cross-fade
  useEffect(() => {
    const beginZoom = () => {
      if (phase === 'introStill') {
        setPhase('zoomPlaying');
        setShowZoomVid(true);
        zoomRef.current?.play().catch(() => {});
      }
    };
    window.addEventListener('click', beginZoom);
    window.addEventListener('keydown', beginZoom);
    return () => {
      window.removeEventListener('click', beginZoom);
      window.removeEventListener('keydown', beginZoom);
    };
  }, [phase]);

  // autoplay intro on mount
  useEffect(() => {
    introRef.current?.play().catch(() => {});
  }, []);

  // when we enter finalStill, fade the final image in
  useEffect(() => {
    if (phase === 'finalStill') {
      // slight delay optional; remove setTimeout if you want instant start
      const t = setTimeout(() => setShowFinal(true), 30);
      return () => clearTimeout(t);
    } else {
      setShowFinal(false);
    }
  }, [phase]);

  return (
    <>
      <Head>
        <title>HackSMU VII</title>
        <meta name="description" content="HackSMU Portal" />
        <link rel="icon" href="/favicon2.ico" />
        {/* Preload to minimize flashes */}
        <link rel="preload" as="image" href="/videos/intro_still.png" />
        <link rel="preload" as="image" href="/videos/final_still.png" />
        <link rel="preload" as="video" href="/videos/zoomin.mp4" type="video/mp4" />
      </Head>

      <section className="fixed inset-0 overflow-hidden z-0 bg-black">
        {/* Intermediate PNG: fades in after intro video ends */}
        {phase === 'introStill' && (
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              !showIntroVid ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src="/videos/inter-screen2.png"
              alt="Intermediate Screen"
              layout="fill"
              objectFit="cover"
              priority
            />
          </div>
        )}

        {/* Intro video, fades out when ended */}
        <video
          ref={introRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            showIntroVid ? 'opacity-100' : 'opacity-0'
          }`}
          src="/videos/turnon.mp4"
          muted
          autoPlay
          playsInline
          loop={false}
          onEnded={handleIntroEnded}
        />

        {/* Zoom video, fades in when starting */}
        <video
          ref={zoomRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            showZoomVid ? 'opacity-100' : 'opacity-0'
          }`}
          src="/videos/zoomin.mp4"
          muted
          playsInline
          loop={false}
          onCanPlay={() => {
            if (phase === 'zoomPlaying') zoomRef.current?.play().catch(() => {});
          }}
          onEnded={() => setPhase('finalStill')}
        />

        {/* Final still — fades IN smoothly */}
        {phase === 'finalStill' && (
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-700 ${
              showFinal ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Final background image */}
            <Image
              src="/videos/main-screen2.png"
              alt="Main Screen"
              layout="fill"
              objectFit="contain"
              priority
            />
        
            {/* Foreground content — fades in with the image */}
            <div className="absolute z-10 flex flex-col items-center text-center text-white" style={{ top: '13%', left: '50%', transform: 'translateX(-50%)' }}>
              <h1 className="glow-text text-5xl sm:text-6xl font-bold mb-2 text-neon-pink">HackSMU VII</h1>
              <p className="neon-date text-xl sm:text-2xl mb-4">October 25–26th, 2025</p>
              <Link href="/auth" passHref>
                <a className="gradient-button neon-button">Apply here!</a>
              </Link>
            </div>
          </div>
        )}


        {/* Foreground content 
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center text-white">
          <h1 className="glow-text neon-title">HackSMU VII</h1>
          <p className="neon-date">October 25–26th, 2025</p>
          <Link href="/auth" passHref>
            <a className="gradient-button neon-button">Apply here!</a>
          </Link>
        </div>
        */}
      </section>
    </>
  );
}
