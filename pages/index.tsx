// pages/index.tsx

import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Phase = 'introPlaying' | 'introStill' | 'zoomPlaying' | 'finalStill';

const overlaySequences: { [key: string]: string[] } = {
  about: ['about1.png', 'about2.png'],
  sponsors: [
    'popup-gold-sponsors.png',
    'popup-silver-sponsors.png',
    'popup-bronze-sponsors.png',
    'sponsors.png',
  ],
  faq: ['faq.png'],
  resources: ['resources.png'],
  schedule: ['schedule.png'],
  dashboard: ['dashboard.png'],
};

export default function Home() {
  const [phase, setPhase] = useState<Phase>('introPlaying');
  const introRef = useRef<HTMLVideoElement>(null);
  const zoomRef = useRef<HTMLVideoElement>(null);

  const [showIntroVid, setShowIntroVid] = useState(true);
  const [showZoomVid, setShowZoomVid] = useState(false);
  const [showFinal, setShowFinal] = useState(false);

  const [activeOverlayKey, setActiveOverlayKey] = useState<string | null>(null);
  const [overlayIndex, setOverlayIndex] = useState<number>(0);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    introRef.current?.play().catch(() => {});
  }, []);

  const handleIntroEnded = () => {
    setPhase('introStill');
    setShowIntroVid(false);
  };

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

  useEffect(() => {
    if (phase === 'finalStill') {
      const t = setTimeout(() => setShowFinal(true), 30);
      return () => clearTimeout(t);
    } else {
      setShowFinal(false);
    }
  }, [phase]);

  useEffect(() => {
    if (activeOverlayKey !== null) {
      setOverlayIndex(0);
      const t = setTimeout(() => setShowOverlay(true), 30);
      return () => clearTimeout(t);
    } else {
      setShowOverlay(false);
    }
  }, [activeOverlayKey]);

  const clearOverlay = () => {
    setShowOverlay(false);
    setTimeout(() => {
      setActiveOverlayKey(null);
      setOverlayIndex(0);
    }, 300);
  };

  const nextOverlay = () => {
    if (
      activeOverlayKey &&
      overlayIndex < overlaySequences[activeOverlayKey].length - 1
    ) {
      setOverlayIndex((prev) => prev + 1);
    }
  };

  const prevOverlay = () => {
    if (activeOverlayKey && overlayIndex > 0) {
      setOverlayIndex((prev) => prev - 1);
    }
  };

  const currentOverlayImage =
    activeOverlayKey !== null
      ? `/videos/${overlaySequences[activeOverlayKey][overlayIndex]}`
      : '';

  return (
    <>
      <Head>
        <title>HackSMU VII</title>
        <meta name="description" content="HackSMU Portal" />
        <link rel="icon" href="/hacksmu_fish.ico" />
      </Head>

      <section className="fixed inset-0 overflow-hidden z-0 bg-black">
        {/* Intermediate Still */}
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

        {/* Intro Video */}
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

        {/* Zoom Video */}
        <video
          ref={zoomRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            showZoomVid ? 'opacity-100' : 'opacity-0'
          }`}
          src="/videos/zoomin.mp4"
          muted
          playsInline
          loop={false}
          onCanPlay={() => phase === 'zoomPlaying' && zoomRef.current?.play().catch(() => {})}
          onEnded={() => setPhase('finalStill')}
        />

        {/* Final Still */}
        {phase === 'finalStill' && (
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-700 ${
              showFinal ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src="/videos/main-screenS.png"
              alt="Main Screen"
              layout="fill"
              objectFit="contain"
              priority
            />
            <div
              className="absolute z-10 flex flex-col items-center text-center text-white fade-in-final"
              style={{ top: '7%', left: '50%', transform: 'translateX(-50%)' }}
            >
              <h1 className="neon-title mb-2 text-2xl sm:text-3xl">HackSMU VII</h1>
              <p className="neon-date text-md sm:text-xl mb-4">October 25–26th, 2025</p>
              <Link href="/auth" passHref>
                <a className="gradient-button neon-button text-sm sm:text-base">Apply here!</a>
              </Link>
            </div>
          </div>
        )}

        {/* Red Bordered Folder Click Zones */}
        <div onClick={() => setActiveOverlayKey('about')} className="absolute z-20 cursor-pointer" style={{ top: '13%', left: '70%', width: '5%', height: '8%', border: '2px solid red' }} />
        <div onClick={() => setActiveOverlayKey('faq')} className="absolute z-20 cursor-pointer" style={{ top: '23%', left: '14%', width: '6%', height: '10%', border: '2px solid red' }} />
        <div onClick={() => setActiveOverlayKey('resources')} className="absolute z-20 cursor-pointer" style={{ top: '35%', left: '45%', width: '6%', height: '10%', border: '2px solid red' }} />
        <div onClick={() => setActiveOverlayKey('sponsors')} className="absolute z-20 cursor-pointer" style={{ top: '58%', left: '57%', width: '6%', height: '10%', border: '2px solid red' }} />
        <div onClick={() => setActiveOverlayKey('schedule')} className="absolute z-20 cursor-pointer" style={{ top: '75%', left: '66%', width: '6%', height: '10%', border: '2px solid red' }} />
        <div onClick={() => setActiveOverlayKey('dashboard')} className="absolute z-20 cursor-pointer" style={{ top: '75%', left: '24%', width: '6%', height: '10%', border: '2px solid red' }} />

        {/* Overlay Image Display */}
        {activeOverlayKey && (
          <div
            className={`absolute inset-0 bg-black z-30 transition-opacity duration-700 ${
              showOverlay ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={currentOverlayImage}
              alt="Overlay"
              layout="fill"
              objectFit="contain"
              priority
              onClick={clearOverlay}
            />

            {/* Navigation Arrows */}
            {overlaySequences[activeOverlayKey].length > 1 && (
              <>
                {overlayIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevOverlay();
                    }}
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 z-40 text-white text-4xl"
                  >
                    ⬅️
                  </button>
                )}
                {overlayIndex < overlaySequences[activeOverlayKey].length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextOverlay();
                    }}
                    className="absolute right-6 top-1/2 transform -translate-y-1/2 z-40 text-white text-4xl"
                  >
                    ➡️
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </section>
    </>
  );
}
