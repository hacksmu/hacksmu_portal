import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type Phase = 'introPlaying' | 'introStill' | 'zoomPlaying' | 'finalStill';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('introPlaying');
  const introRef = useRef<HTMLVideoElement>(null);
  const zoomRef = useRef<HTMLVideoElement>(null);

  const [showIntroVid, setShowIntroVid] = useState(true);
  const [showZoomVid, setShowZoomVid] = useState(false);
  const [showFinal, setShowFinal] = useState(false);

  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  // Play intro video on mount
  useEffect(() => {
    introRef.current?.play().catch(() => {});
  }, []);

  // When intro ends, show intermediate still
  const handleIntroEnded = () => {
    setPhase('introStill');
    setShowIntroVid(false);
  };

  // Click/keydown during introStill triggers zoom video
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

  // When finalStill phase is reached, fade in
  useEffect(() => {
    if (phase === 'finalStill') {
      const t = setTimeout(() => setShowFinal(true), 30);
      return () => clearTimeout(t);
    } else {
      setShowFinal(false);
    }
  }, [phase]);

  // Fade in overlay when activeOverlay is set
  useEffect(() => {
    if (activeOverlay) {
      const t = setTimeout(() => setShowOverlay(true), 30);
      return () => clearTimeout(t);
    } else {
      setShowOverlay(false);
    }
  }, [activeOverlay]);

  const clearOverlay = () => {
    setShowOverlay(false);
    setTimeout(() => setActiveOverlay(null), 300);
  };

  return (
    <>
      <Head>
        <title>HackSMU VII</title>
        <meta name="description" content="HackSMU Portal" />
        <link rel="icon" href="/hacksmu_fish.ico" />
        <link rel="preload" as="image" href="/videos/intro_still.png" />
        <link rel="preload" as="image" href="/videos/final_still.png" />
        <link rel="preload" as="video" href="/videos/zoomin.mp4" type="video/mp4" />
      </Head>

      <section className="fixed inset-0 overflow-hidden z-0 bg-black">
        {/* Intermediate Still */}
        {phase === 'introStill' && (
          <div className={`absolute inset-0 transition-opacity duration-500 ${!showIntroVid ? 'opacity-100' : 'opacity-0'}`}>
            <Image src="/videos/inter-screen2.png" alt="Intermediate Screen" layout="fill" objectFit="cover" priority />
          </div>
        )}

        {/* Intro Video */}
        <video
          ref={introRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${showIntroVid ? 'opacity-100' : 'opacity-0'}`}
          src="/videos/turnon.mp4"
          muted
          autoPlay
          playsInline
          loop={false}
          onEnded={handleIntroEnded}
        />

        {/* Zoom Video */}
        <video
          ref={zoomRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${showZoomVid ? 'opacity-100' : 'opacity-0'}`}
          src="/videos/zoomin.mp4"
          muted
          playsInline
          loop={false}
          onCanPlay={() => phase === 'zoomPlaying' && zoomRef.current?.play().catch(() => {})}
          onEnded={() => setPhase('finalStill')}
        />

        {/* Final Still */}
        {phase === 'finalStill' && (
          <div className={`absolute inset-0 bg-black transition-opacity duration-700 ${showFinal ? 'opacity-100' : 'opacity-0'}`}>
            <Image src="/videos/main-screen2.png" alt="Main Screen" layout="fill" objectFit="contain" priority />
            <div className="absolute z-10 flex flex-col items-center text-center text-white fade-in-final"
              style={{ top: '7%', left: '50%', transform: 'translateX(-50%)' }}>
              <h1 className="neon-title mb-2 text-2xl sm:text-3xl">HackSMU VII</h1>
              <p className="neon-date text-md sm:text-xl mb-4">October 25–26th, 2025</p>
              <Link href="/auth" passHref>
                <a className="gradient-button neon-button text-sm sm:text-base">Apply here!</a>
              </Link>
            </div>
          </div>
        )}

        {/* Folder Click Zones with Red Borders */}
        <div onClick={() => setActiveOverlay('about1.png')} className="absolute z-20 cursor-pointer"
          style={{ top: '13%', left: '70%', width: '5%', height: '8%', border: '2px solid red' }}></div>

        <div onClick={() => setActiveOverlay('faq.png')} className="absolute z-20 cursor-pointer"
          style={{ top: '23%', left: '14%', width: '6%', height: '10%', border: '2px solid red' }}></div>

        <div onClick={() => setActiveOverlay('resources.png')} className="absolute z-20 cursor-pointer"
          style={{ top: '35%', left: '45%', width: '6%', height: '10%', border: '2px solid red' }}></div>

        <div onClick={() => setActiveOverlay('sponsors.png')} className="absolute z-20 cursor-pointer"
          style={{ top: '58%', left: '57%', width: '6%', height: '10%', border: '2px solid red' }}></div>

        <div onClick={() => setActiveOverlay('schedule.png')} className="absolute z-20 cursor-pointer"
          style={{ top: '75%', left: '66%', width: '6%', height: '10%', border: '2px solid red' }}></div>

        <div onClick={() => setActiveOverlay('dashboard.png')} className="absolute z-20 cursor-pointer"
          style={{ top: '75%', left: '24%', width: '6%', height: '10%', border: '2px solid red' }}></div>

        {/* Overlay PNG (when folder is clicked) */}
        {activeOverlay && (
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-700 z-30 ${
              showOverlay ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={clearOverlay}
          >
            <Image
              src={`/videos/${activeOverlay}`}
              alt="Overlay"
              layout="fill"
              objectFit="contain"
              priority
            />
          </div>
        )}
      </section>
    </>
  );
}
