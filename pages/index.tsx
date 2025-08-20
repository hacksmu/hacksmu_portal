import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type Phase = 'introPlaying' | 'introStill' | 'zoomPlaying' | 'finalStill';
type OverlayGroup = 'about' | 'sponsors' | 'faq' | null;

export default function Home() {
  const [phase, setPhase] = useState<Phase>('introPlaying');
  const introRef = useRef<HTMLVideoElement>(null);
  const zoomRef = useRef<HTMLVideoElement>(null);

  const [showIntroVid, setShowIntroVid] = useState(true);
  const [showZoomVid, setShowZoomVid] = useState(false);
  const [showFinal, setShowFinal] = useState(false);

  const [overlayGroup, setOverlayGroup] = useState<OverlayGroup>(null);
  const [overlayIndex, setOverlayIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);

  // === VIDEO TRANSITIONS ===
  useEffect(() => { introRef.current?.play().catch(() => {}); }, []);
  const handleIntroEnded = () => { setPhase('introStill'); setShowIntroVid(false); };

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
    if (overlayGroup !== null) {
      const t = setTimeout(() => setShowOverlay(true), 30);
      return () => clearTimeout(t);
    } else {
      setShowOverlay(false);
    }
  }, [overlayGroup]);

  // === IMAGE GROUPS ===
  const imageSequences: Record<string, string[]> = {
    about: ['about1.png', 'about2.png'],
    sponsors: ['popup-gold-sponsors.png', 'popup-silver-sponsors.png', 'popup-bronze-sponsors.png', 'popup-sponsors.png'],
    faq: ['faq.png'],
  };

  const clearOverlay = () => {
    setShowOverlay(false);
    setTimeout(() => {
      setOverlayGroup(null);
      setOverlayIndex(0);
    }, 300);
  };

  const nextImage = () => {
    if (!overlayGroup) return;
    const images = imageSequences[overlayGroup];
    if (overlayIndex < images.length - 1) {
      setOverlayIndex(overlayIndex + 1);
    }
  };

  const prevImage = () => {
    if (!overlayGroup) return;
    if (overlayIndex > 0) {
      setOverlayIndex(overlayIndex - 1);
    }
  };

  return (
    <>
      <Head>
        <title>HackSMU VII</title>
        <meta name="description" content="HackSMU Portal" />
        <link rel="icon" href="/hacksmu_fish.ico" />
      </Head>

      <section className="fixed inset-0 overflow-hidden z-0 bg-black">
        {/* Intermediate Image */}
        {phase === 'introStill' && (
          <div className={`absolute inset-0 transition-opacity duration-500 ${!showIntroVid ? 'opacity-100' : 'opacity-0'}`}>
            <Image src="/videos/inter-screen2.png" alt="Intermediate" layout="fill" objectFit="cover" priority />
          </div>
        )}

        {/* Intro Video */}
        <video
          ref={introRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${showIntroVid ? 'opacity-100' : 'opacity-0'}`}
          src="/videos/turnon.mp4"
          muted autoPlay playsInline loop={false}
          onEnded={handleIntroEnded}
        />

        {/* Zoom Video */}
        <video
          ref={zoomRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${showZoomVid ? 'opacity-100' : 'opacity-0'}`}
          src="/videos/zoomin.mp4"
          muted playsInline loop={false}
          onCanPlay={() => phase === 'zoomPlaying' && zoomRef.current?.play().catch(() => {})}
          onEnded={() => setPhase('finalStill')}
        />

        {/* Final Still */}
        {phase === 'finalStill' && (
          <div className={`absolute inset-0 bg-black transition-opacity duration-700 ${showFinal ? 'opacity-100' : 'opacity-0'}`}>
            <Image src="/videos/main-screenS.png" alt="Main Screen" layout="fill" objectFit="contain" priority />
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

        {/* FOLDER HOTSPOTS */}
        <div onClick={() => { setOverlayGroup('about'); setOverlayIndex(0); }} className="absolute z-20 cursor-pointer"
          style={{ top: '13%', left: '70%', width: '5%', height: '8%', border: '2px solid red' }}></div>

        <div onClick={() => { setOverlayGroup('faq'); setOverlayIndex(0); }} className="absolute z-20 cursor-pointer"
          style={{ top: '23%', left: '14%', width: '6%', height: '10%', border: '2px solid red' }}></div>

        <div onClick={() => { setOverlayGroup('sponsors'); setOverlayIndex(0); }} className="absolute z-20 cursor-pointer"
          style={{ top: '58%', left: '57%', width: '6%', height: '10%', border: '2px solid red' }}></div>

        {/* OVERLAY PNGs */}
        {overlayGroup && (
          <div className={`absolute inset-0 bg-black transition-opacity duration-700 z-30 ${showOverlay ? 'opacity-100' : 'opacity-0'}`}>
            <Image
              src={`/videos/${imageSequences[overlayGroup][overlayIndex]}`}
              alt="Overlay"
              layout="fill"
              objectFit="contain"
              priority
              onClick={clearOverlay}
            />

            {/* Arrows */}
            {overlayIndex > 0 && (
              <div onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 text-white text-3xl cursor-pointer z-40">◀</div>
            )}
            {overlayIndex < imageSequences[overlayGroup].length - 1 && (
              <div onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 text-white text-3xl cursor-pointer z-40">▶</div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
