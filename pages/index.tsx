import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type Phase = 'introPlaying' | 'introStill' | 'zoomPlaying' | 'finalStill';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('introPlaying');
  const [showIntroVid, setShowIntroVid] = useState(true);
  const [showZoomVid, setShowZoomVid] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [clickedImage, setClickedImage] = useState<string | null>(null); // NEW STATE

  const introRef = useRef<HTMLVideoElement>(null);
  const zoomRef = useRef<HTMLVideoElement>(null);

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
    introRef.current?.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (phase === 'finalStill') {
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
        <link rel="icon" href="/hacksmu_fish.ico" />
        <link rel="preload" as="image" href="/videos/intro_still.png" />
        <link rel="preload" as="image" href="/videos/final_still.png" />
        <link rel="preload" as="video" href="/videos/zoomin.mp4" type="video/mp4" />
      </Head>

      <section className="fixed inset-0 overflow-hidden z-0 bg-black">

        {/* Intermediate PNG */}
        {phase === 'introStill' && (
          <div className={`absolute inset-0 transition-opacity duration-500 ${!showIntroVid ? 'opacity-100' : 'opacity-0'}`}>
            <Image
              src="/videos/inter-screen2.png"
              alt="Intermediate Screen"
              layout="fill"
              objectFit="cover"
              priority
            />
          </div>
        )}

        {/* Intro video */}
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

        {/* Zoom video */}
        <video
          ref={zoomRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${showZoomVid ? 'opacity-100' : 'opacity-0'}`}
          src="/videos/zoomin.mp4"
          muted
          playsInline
          loop={false}
          onCanPlay={() => {
            if (phase === 'zoomPlaying') zoomRef.current?.play().catch(() => {});
          }}
          onEnded={() => setPhase('finalStill')}
        />

        {/* Final screen */}
        {phase === 'finalStill' && (
          <div className={`absolute inset-0 bg-black transition-opacity duration-700 ${showFinal ? 'opacity-100' : 'opacity-0'}`}>
            <Image
              src="/videos/main-screen2.png"
              alt="Main Screen"
              layout="fill"
              objectFit="contain"
              priority
            />

            {/* Folder Hotspots */}
            <>
              {/* FAQ */}
              <div onClick={() => setClickedImage('faq')} className="absolute" style={{ top: '18%', left: '14%', width: '5%', height: '9%', cursor: 'pointer' }} />
              {/* About */}
              <div onClick={() => setClickedImage('about')} className="absolute" style={{ top: '10%', left: '72%', width: '5%', height: '9%', cursor: 'pointer' }} />
              {/* Resources */}
              <div onClick={() => setClickedImage('resources')} className="absolute" style={{ top: '35%', left: '44%', width: '6%', height: '10%', cursor: 'pointer' }} />
              {/* Sponsors */}
              <div onClick={() => setClickedImage('sponsors')} className="absolute" style={{ top: '53%', left: '57%', width: '5.5%', height: '9%', cursor: 'pointer' }} />
              {/* Dashboard */}
              <div onClick={() => setClickedImage('dashboard')} className="absolute" style={{ top: '75%', left: '20%', width: '6%', height: '10%', cursor: 'pointer' }} />
              {/* Schedule */}
              <div onClick={() => setClickedImage('schedule')} className="absolute" style={{ top: '75%', left: '65%', width: '6%', height: '10%', cursor: 'pointer' }} />
            </>

            {/* Fade-in Image Viewer */}
            {clickedImage && (
              <div
                onClick={() => setClickedImage(null)}
                className="absolute inset-0 z-50 bg-black bg-opacity-80 transition-opacity duration-700 flex justify-center items-center"
              >
                <Image
                  src={`/videos/${clickedImage}.png`}
                  alt={clickedImage}
                  width={1000}
                  height={700}
                  className="opacity-100 transition-opacity duration-700"
                />
              </div>
            )}

            {/* Foreground Title and Button */}
            <div className="absolute z-10 flex flex-col items-center text-center text-white fade-in-final" style={{ top: '7%', left: '50%', transform: 'translateX(-50%)' }}>
              <h1 className="neon-title mb-2">HackSMU VII</h1>
              <p className="neon-date text-xl sm:text-2xl mb-4">October 25–26th, 2025</p>
              <Link href="/auth" passHref>
                <a className="gradient-button neon-button text-sm sm:text-base px-4 py-2">Apply here!</a>
              </Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
