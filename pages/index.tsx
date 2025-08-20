import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type Phase = 'introPlaying' | 'introStill' | 'zoomPlaying' | 'finalStill';

const overlaySequence: Record<string, string[]> = {
  about: ['about1.png', 'about2.png'],
  sponsors: ['popup-gold-sponsors.png', 'popup-silver-sponsors.png', 'popup-bronze-sponsors.png', 'popup-sponsors.png'],
};

export default function Home() {
  const [phase, setPhase] = useState<Phase>('introPlaying');
  const [activeOverlayKey, setActiveOverlayKey] = useState<string | null>(null);
  const [overlayIndex, setOverlayIndex] = useState<number>(0);
  const [showOverlay, setShowOverlay] = useState(false);

  const introRef = useRef<HTMLVideoElement>(null);
  const zoomRef = useRef<HTMLVideoElement>(null);
  const [showIntroVid, setShowIntroVid] = useState(true);
  const [showZoomVid, setShowZoomVid] = useState(false);
  const [showFinal, setShowFinal] = useState(false);

  const currentOverlayImage = activeOverlayKey && overlaySequence[activeOverlayKey]
    ? overlaySequence[activeOverlayKey][overlayIndex]
    : activeOverlayKey;

  // Intro animation
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
    if (currentOverlayImage) {
      const t = setTimeout(() => setShowOverlay(true), 30);
      return () => clearTimeout(t);
    } else {
      setShowOverlay(false);
    }
  }, [currentOverlayImage]);

  const openOverlaySequence = (key: string) => {
    setActiveOverlayKey(key);
    setOverlayIndex(0);
  };

  const closeOverlay = () => {
    setShowOverlay(false);
    setTimeout(() => {
      setActiveOverlayKey(null);
      setOverlayIndex(0);
    }, 300);
  };

  const nextImage = () => {
    if (!activeOverlayKey) return;
    const list = overlaySequence[activeOverlayKey];
    if (list && overlayIndex < list.length - 1) {
      setOverlayIndex((i) => i + 1);
    }
  };

  const prevImage = () => {
    if (!activeOverlayKey) return;
    if (overlayIndex > 0) {
      setOverlayIndex((i) => i - 1);
    }
  };

  return (
    <>
      <Head>
        <title>HackSMU VII</title>
        <link rel="icon" href="/hacksmu_fish.ico" />
      </Head>

      <section className="fixed inset-0 overflow-hidden z-0 bg-black">
        {/* Intro video */}
        <video
          ref={introRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${showIntroVid ? 'opacity-100' : 'opacity-0'}`}
          src="/videos/turnon.mp4"
          muted autoPlay playsInline loop={false}
          onEnded={handleIntroEnded}
        />

        {/* Intermediate Still */}
        {phase === 'introStill' && (
          <Image src="/videos/inter-screen2.png" layout="fill" objectFit="cover" alt="intermediate" priority />
        )}

        {/* Zoom video */}
        <video
          ref={zoomRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${showZoomVid ? 'opacity-100' : 'opacity-0'}`}
          src="/videos/zoomin.mp4"
          muted playsInline loop={false}
          onCanPlay={() => phase === 'zoomPlaying' && zoomRef.current?.play()}
          onEnded={() => setPhase('finalStill')}
        />

        {/* Final still screen */}
        {phase === 'finalStill' && (
          <div className={`absolute inset-0 bg-black transition-opacity duration-700 ${showFinal ? 'opacity-100' : 'opacity-0'}`}>
            <Image src="/videos/main-screenS.png" layout="fill" objectFit="contain" alt="Main" priority />
            <div className="absolute z-10 flex flex-col items-center text-center text-white fade-in-final" style={{ top: '7%', left: '50%', transform: 'translateX(-50%)' }}>
              <h1 className="neon-title mb-2 text-2xl sm:text-3xl">HackSMU VII</h1>
              <p className="neon-date text-md sm:text-xl mb-4">October 25–26th, 2025</p>
              <Link href="/auth"><a className="gradient-button neon-button text-sm sm:text-base">Apply here!</a></Link>
            </div>
          </div>
        )}

        {/* Red-outlined invisible click zones */}
        <div onClick={() => openOverlaySequence('about')} style={{ top: '13%', left: '70%', width: '5%', height: '8%' }} className="absolute z-20 border-2 border-red-500 cursor-pointer"></div>
        <div onClick={() => openOverlaySequence('faq.png')} style={{ top: '23%', left: '14%', width: '6%', height: '10%' }} className="absolute z-20 border-2 border-red-500 cursor-pointer"></div>
        <div onClick={() => openOverlaySequence('resources.png')} style={{ top: '35%', left: '45%', width: '6%', height: '10%' }} className="absolute z-20 border-2 border-red-500 cursor-pointer"></div>
        <div onClick={() => openOverlaySequence('sponsors')} style={{ top: '58%', left: '57%', width: '6%', height: '10%' }} className="absolute z-20 border-2 border-red-500 cursor-pointer"></div>
        <div onClick={() => openOverlaySequence('schedule.png')} style={{ top: '75%', left: '66%', width: '6%', height: '10%' }} className="absolute z-20 border-2 border-red-500 cursor-pointer"></div>
        <div onClick={() => openOverlaySequence('dashboard.png')} style={{ top: '75%', left: '24%', width: '6%', height: '10%' }} className="absolute z-20 border-2 border-red-500 cursor-pointer"></div>

        {/* Overlay image when active */}
        {currentOverlayImage && (
          <div className={`absolute inset-0 bg-black transition-opacity duration-700 z-30 ${showOverlay ? 'opacity-100' : 'opacity-0'}`}>
            <Image src={`/videos/${currentOverlayImage}`} alt="Overlay" layout="fill" objectFit="contain" priority />
            {/* Nav buttons if sequence */}
            {overlaySequence[activeOverlayKey ?? ''] && (
              <>
                {overlayIndex > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 text-white text-4xl">←</button>
                )}
                {overlayIndex < overlaySequence[activeOverlayKey ?? '']?.length - 1 && (
                  <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 text-white text-4xl">→</button>
                )}
              </>
            )}
            <div className="absolute inset-0 z-20" onClick={closeOverlay}></div>
          </div>
        )}
      </section>
    </>
  );
}
