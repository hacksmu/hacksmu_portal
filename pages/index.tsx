// pages/index.tsx
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

type Phase = 'introPlaying' | 'introStill' | 'zoomPlaying' | 'finalStill';

const overlaySequences: Record<string, string[]> = {
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

// flip to false later after everything loads fine
const DEBUG_FORCE_FINAL = true;

export default function Home() {
  const router = useRouter();
  const prefix = router.basePath ?? '';

  const [phase, setPhase] = useState<Phase>(DEBUG_FORCE_FINAL ? 'finalStill' : 'introPlaying');
  const introRef = useRef<HTMLVideoElement>(null);
  const zoomRef = useRef<HTMLVideoElement>(null);

  const [showIntroVid, setShowIntroVid] = useState(!DEBUG_FORCE_FINAL);
  const [showZoomVid, setShowZoomVid] = useState(false);
  const [showFinal, setShowFinal] = useState(DEBUG_FORCE_FINAL);

  const [activeOverlayKey, setActiveOverlayKey] = useState<string | null>(null);
  const [overlayIndex, setOverlayIndex] = useState<number>(0);
  const [showOverlay, setShowOverlay] = useState(false);

  // fallbacks so it never blanks
  const [interOk, setInterOk] = useState(true);
  const [finalOk, setFinalOk] = useState(true);
  const [introErr, setIntroErr] = useState<string | null>(null);
  const [zoomErr, setZoomErr] = useState<string | null>(null);

  useEffect(() => {
    if (!DEBUG_FORCE_FINAL) {
      introRef.current?.play().catch(() => {});
    }
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
    if (activeOverlayKey && overlayIndex < overlaySequences[activeOverlayKey].length - 1) {
      setOverlayIndex((p) => p + 1);
    }
  };
  const prevOverlay = () => {
    if (activeOverlayKey && overlayIndex > 0) setOverlayIndex((p) => p - 1);
  };

  const currentOverlayImage =
    activeOverlayKey !== null ? `${prefix}/videos/${overlaySequences[activeOverlayKey][overlayIndex]}` : '';

  return (
    <>
      <Head>
        <title>HackSMU VII</title>
        <meta name="description" content="HackSMU Portal" />
        <link rel="icon" href="/hacksmu_fish.ico" />
      </Head>

      {/* Debug HUD (remove later) */}
      <div
        style={{
          position: 'fixed',
          top: 8,
          left: 8,
          zIndex: 50,
          fontFamily: 'monospace',
          fontSize: 12,
          background: 'rgba(0,0,0,0.6)',
          color: 'white',
          padding: '8px 10px',
          borderRadius: 6,
          border: '1px solid #f00',
        }}
      >
        <div>phase: {phase}</div>
        <div>basePath: {prefix || '/'}</div>
        <div>interOk: {String(interOk)}</div>
        <div>finalOk: {String(finalOk)}</div>
        {introErr && <div>introErr: {introErr}</div>}
        {zoomErr && <div>zoomErr: {zoomErr}</div>}
      </div>

      {/* Use a gradient base so it never looks pure black */}
      <section className="fixed inset-0 overflow-hidden z-0 bg-gradient-to-br from-purple-700 via-blue-700 to-black">
        {/* Intermediate Still */}
        {phase === 'introStill' && (
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              !showIntroVid ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {interOk ? (
              <Image
                src={`${prefix}/videos/inter-screen2.png`}
                alt="Intermediate Screen"
                layout="fill"
                objectFit="cover"
                priority
                onError={() => setInterOk(false)}
              />
            ) : (
              <div className="absolute inset-0" /> // gradient already behind
            )}
          </div>
        )}

        {/* Intro Video */}
        {!DEBUG_FORCE_FINAL && (
          <video
            ref={introRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              showIntroVid ? 'opacity-100' : 'opacity-0'
            }`}
            src={`${prefix}/videos/turnon.mp4`}
            muted
            autoPlay
            playsInline
            loop={false}
            onEnded={handleIntroEnded}
            onError={(e) => {
              setIntroErr('intro video failed');
              setShowIntroVid(false);
              setPhase('finalStill');
            }}
            onLoadedData={() => introRef.current?.play().catch(() => {})}
          />
        )}

        {/* Zoom Video */}
        {!DEBUG_FORCE_FINAL && (
          <video
            ref={zoomRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              showZoomVid ? 'opacity-100' : 'opacity-0'
            }`}
            src={`${prefix}/videos/zoomin.mp4`}
            muted
            playsInline
            loop={false}
            onCanPlay={() => phase === 'zoomPlaying' && zoomRef.current?.play().catch(() => {})}
            onEnded={() => setPhase('finalStill')}
            onError={() => {
              setZoomErr('zoom video failed');
              setPhase('finalStill');
            }}
          />
        )}

        {/* Final Still */}
        {phase === 'finalStill' && (
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              showFinal ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {finalOk ? (
              <Image
                src={`${prefix}/videos/main-screenS.png`}
                alt="Main Screen"
                layout="fill"
                objectFit="contain"
                priority
                onError={() => setFinalOk(false)}
              />
            ) : (
              <div className="absolute inset-0" /> // gradient already behind
            )}

            <div
              className="absolute z-10 flex flex-col items-center text-center text-white"
              style={{ top: '7%', left: '50%', transform: 'translateX(-50%)' }}
            >
              <h1 className="mb-2 text-2xl sm:text-3xl">HackSMU VII</h1>
              <p className="text-md sm:text-xl mb-4">October 25–26th, 2025</p>
              <Link href="/auth" passHref>
                <a className="gradient-button neon-button text-sm sm:text-base">Apply here!</a>
              </Link>
            </div>
          </div>
        )}

        {/* Click Zones */}
        <div onClick={() => setActiveOverlayKey('about')} className="absolute z-20 cursor-pointer" style={{ top: '17%', left: '60%', width: '5%', height: '9%', border: '2px solid red' }} />
        <div onClick={() => setActiveOverlayKey('faq')} className="absolute z-20 cursor-pointer" style={{ top: '22%', left: '26%', width: '5%', height: '9%', border: '2px solid red' }} />
        <div onClick={() => setActiveOverlayKey('resources')} className="absolute z-20 cursor-pointer" style={{ top: '41%', left: '46%', width: '5%', height: '9%', border: '2px solid red' }} />
        <div onClick={() => setActiveOverlayKey('sponsors')} className="absolute z-20 cursor-pointer" style={{ top: '66%', left: '51%', width: '5%', height: '9%', border: '2px solid red' }} />
        <div onClick={() => setActiveOverlayKey('schedule')} className="absolute z-20 cursor-pointer" style={{ top: '81%', left: '62%', width: '5%', height: '9%', border: '2px solid red' }} />
        <div onClick={() => setActiveOverlayKey('dashboard')} className="absolute z-20 cursor-pointer" style={{ top: '76%', left: '34%', width: '5%', height: '9%', border: '2px solid red' }} />

        {/* Overlay */}
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
              onError={clearOverlay}
            />

            {overlaySequences[activeOverlayKey].length > 1 && (
              <>
                {overlayIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevOverlay();
                    }}
                    className="absolute z-40 text-white text-4xl"
                    style={{
                      top: '70%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      border: '2px solid red',
                      background: 'transparent',
                      padding: '20px',
                      cursor: 'pointer',
                    }}
                    aria-label="Previous overlay"
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
                    className="absolute z-40 text-white text-4xl"
                    style={{
                      top: '70%',
                      right: '50%',
                      transform: 'translate(50%, -50%)',
                      border: '2px solid red',
                      background: 'transparent',
                      padding: '20px',
                      cursor: 'pointer',
                    }}
                    aria-label="Next overlay"
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