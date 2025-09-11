// pages/index.tsx
import Head from 'next/head';
import NextImage from 'next/image'; // ⬅️ alias so we don't shadow window.Image
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';

import FaqPage from '../components/faq';
import { RequestHelper } from '../lib/request-helper';

type Phase = 'introPlaying' | 'introStill' | 'zoomPlaying' | 'finalStill';
type AnyFaq = Record<string, any>;
type HomeProps = {
  answeredQuestion: AnyFaq[];
  fetchedMembers: any[];
  sponsorCard: any[];
};

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

  // HackSMUVII Team overlay (ensure these files exist in /public/videos/)
  team: [
    'popup-techteam.png',     // 0: tech
    'popup-sponsorteam.png',  // 1: sponsor
    'popup-logteam.png',      // 2: logistics
    'popup-marketing.png',    // 3: marketing
  ],
};

// --- simple image preloader (browser-only, safe with Next.js SSR) ---
function preloadImages(urls: string[]): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(); // SSR guard
    if (!urls || urls.length === 0) return resolve();

    let loaded = 0;
    const total = urls.length;
    const done = () => {
      loaded += 1;
      if (loaded >= total) resolve();
    };

    const ImgCtor = (window as any).Image as { new (): HTMLImageElement } | undefined;
    if (!ImgCtor) return resolve(); // super defensive

    urls.forEach((src) => {
      if (typeof src !== 'string' || !src) return done();
      const img = new ImgCtor();
      img.onload = done;
      img.onerror = done;
      img.decoding = 'async';
      img.src = src;
    });
  });
}

// Build one flat list of all overlay images (prefixing with /videos/)
const allOverlayImages = Object.values(overlaySequences)
  .flat()
  .map((f) => `/videos/${f}`);

// ---------- FAQ helpers ----------
function pickArray(json: any): AnyFaq[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.faqs)) return json.faqs;
  if (Array.isArray(json?.answeredQuestion)) return json.answeredQuestion;
  if (Array.isArray(json?.rows)) return json.rows;
  return [];
}

function normalizeFaq(x: AnyFaq, i: number) {
  const question =
    x?.question ?? x?.title ?? x?.q ?? x?.heading ?? x?.name ?? x?.prompt ?? x?.faq ?? x?.Question ?? '';
  const answer =
    x?.answer ?? x?.a ?? x?.response ?? x?.body ?? x?.content ?? x?.description ?? x?.Answer ?? '';
  return {
    id: x?.id ?? x?._id ?? i,
    question: String(question ?? ''),
    answer: String(answer ?? ''),
    ...x,
  };
}

// Explicit types to satisfy FaqPage's AnsweredQuestion[] requirement
type Faq = { id: string | number; question: string; answer: string; order?: number };
type AnsweredQuestion = { id: string | number; question: string; answer: string; order: number };

// helper to satisfy the prop type by providing an `order`
const toAnsweredQuestions = (faqs: Faq[]): AnsweredQuestion[] =>
  (faqs || []).map((f, idx) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
    order: typeof f.order === 'number' ? f.order : idx,
  }));

async function fetchFaqsClient(): Promise<AnyFaq[]> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const endpoints = ['/api/questions/faq', '/api/faqs', '/api/faq', '/api/questions'];

  for (const path of endpoints) {
    try {
      const url = origin ? new URL(path, origin).toString() : path;
      const res = await fetch(url, { headers: { accept: 'application/json' }, credentials: 'same-origin' });
      if (!res.ok) continue;
      const json = await res.json();
      const arr = pickArray(json);
      if (arr.length) return arr;
    } catch (e) {
      console.warn('FAQ endpoint failed:', path, e);
    }
  }
  return [];
}

// --- Arrow layouts ---
// Three single-button positions (match your art): center, more-left, more-right.
// Also supports "pair" (left & right) like your existing overlays.
type ArrowLayout =
  | { kind: 'none' }
  | { kind: 'single'; pos: 'center' | 'left' | 'right' }
  | { kind: 'pair' };

// Hitbox positions (tweak % to match your sprite art precisely)
const ARROW_HITBOX = {
  // vertical placement & size (shared)
  top: '77%',
  height: '10%',
  // widths
  singleW: '14%',
  pairW: '11%',
  // horizontal placement presets
  centerLeft: '50%',     // for single-center (translate -50%)
  pairLeftLeft: '44%',   // left button of a pair
  pairRightRight: '43%', // right button of a pair
  // extra presets for single-left/single-right variants
  singleLeftLeft: '46.5%',   // nudged left of center
  singleRightRight: '46.5%', // nudged right of center (using "right")
};

// Utility to render an arrow button at a specific slot
function ArrowButton(props: {
  side: 'left' | 'right' | 'center';
  width: string;
  onClick: () => void;
}) {
  const base = {
    position: 'absolute' as const,
    zIndex: 40,
    top: ARROW_HITBOX.top,
    height: ARROW_HITBOX.height,
    background: 'transparent',
  };
  let style: React.CSSProperties = {};
  if (props.side === 'center') {
    style = {
      ...base,
      left: ARROW_HITBOX.centerLeft,
      width: props.width,
      transform: 'translate(-50%, -50%)',
    };
  } else if (props.side === 'left') {
    style = {
      ...base,
      left: ARROW_HITBOX.pairLeftLeft,
      width: props.width,
      transform: 'translate(-50%, -50%)',
    };
  } else {
    style = {
      ...base,
      right: ARROW_HITBOX.pairRightRight,
      width: props.width,
      transform: 'translate(50%, -50%)',
    };
  }
  return (
    <button
      onClick={(e) => { e.stopPropagation(); props.onClick(); }}
      className="absolute z-40"
      style={style}
      aria-label="Navigate"
    />
  );
}

// Single-button variants with left/right shifts for matching your three art types
function SingleCenterButton({ onClick }: { onClick: () => void }) {
  return <ArrowButton side="center" width={ARROW_HITBOX.singleW} onClick={onClick} />;
}
function SingleMoreLeftButton({ onClick }: { onClick: () => void }) {
  const style: React.CSSProperties = {
    position: 'absolute',
    zIndex: 40,
    top: ARROW_HITBOX.top,
    left: ARROW_HITBOX.singleLeftLeft,
    width: ARROW_HITBOX.singleW,
    height: ARROW_HITBOX.height,
    transform: 'translate(-50%, -50%)',
    background: 'transparent',
  };
  return <button onClick={(e) => { e.stopPropagation(); onClick(); }} style={style} aria-label="Next" />;
}
function SingleMoreRightButton({ onClick }: { onClick: () => void }) {
  const style: React.CSSProperties = {
    position: 'absolute',
    zIndex: 40,
    top: ARROW_HITBOX.top,
    right: ARROW_HITBOX.singleRightRight,
    width: ARROW_HITBOX.singleW,
    height: ARROW_HITBOX.height,
    transform: 'translate(50%, -50%)',
    background: 'transparent',
  };
  return <button onClick={(e) => { e.stopPropagation(); onClick(); }} style={style} aria-label="Next" />;
}

// Decide per-frame arrow layout for any overlay (easily extensible)
function getArrowLayoutFor(
  key: string | null,
  index: number
): ArrowLayout {
  if (!key) return { kind: 'none' };

  // TEAM overlay:
  // tech (0): single (right) → sponsor
  // sponsor (1): pair
  // logistics (2): pair
  // marketing (3): none
  if (key === 'team') {
    if (index === 0) return { kind: 'single', pos: 'right' };
    if (index === 1) return { kind: 'pair' };
    if (index === 2) return { kind: 'pair' };
    return { kind: 'none' };
  }

  // Sponsors/about first frames: single center advance
  if (key === 'sponsors' && index === 0) return { kind: 'single', pos: 'center' };
  if (key === 'about' && index === 0) return { kind: 'single', pos: 'center' };

  // Default: pair (left/right)
  return { kind: 'pair' };
}

export default function Home(props: HomeProps) {
  const router = useRouter();

  // video / phase
  const [phase, setPhase] = useState<Phase>('introPlaying');
  const introRef = useRef<HTMLVideoElement>(null);
  const zoomRef = useRef<HTMLVideoElement>(null);
  const [showIntroVid, setShowIntroVid] = useState(true);
  const [showZoomVid, setShowZoomVid] = useState(false);
  const [showFinal, setShowFinal] = useState(false);

  // overlay state
  const [activeOverlayKey, setActiveOverlayKey] = useState<string | null>(null);
  const [overlayIndex, setOverlayIndex] = useState<number>(0);
  const [showOverlay, setShowOverlay] = useState(false);

  // FAQ state (prefer client fetch; SSR is warm start)
  const [faqsRaw, setFaqsRaw] = useState<AnyFaq[]>(props.answeredQuestion ?? []);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqError, setFaqError] = useState<string | null>(null);

  const faqs = useMemo(() => (faqsRaw || []).map(normalizeFaq).filter(f => f.question || f.answer), [faqsRaw]);

  // intro handling
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

  // Preload all overlay images when we hit the final desktop screen
  useEffect(() => {
    if (phase === 'finalStill') {
      preloadImages(allOverlayImages);
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

  // ESC to close
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && clearOverlay();
    if (activeOverlayKey) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [activeOverlayKey]);

  // CLIENT fetch FAQs when FAQ overlay opens
  useEffect(() => {
    const isFaq = activeOverlayKey === 'faq';
    if (!isFaq) return;
    if (faqs.length > 0) return;

    let cancelled = false;
    (async () => {
      setFaqError(null);
      setFaqLoading(true);
      try {
        const timeout = new Promise<AnyFaq[]>((resolve) => setTimeout(() => resolve([]), 10000));
        const data = await Promise.race([fetchFaqsClient(), timeout]);
        if (!cancelled) {
          if (data.length === 0) setFaqError('Could not load FAQs from the API.');
          setFaqsRaw(data);
        }
      } catch (e: any) {
        if (!cancelled) setFaqError(e?.message || 'FAQ request failed.');
      } finally {
        if (!cancelled) setFaqLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (activeOverlayKey && overlayIndex > 0) {
      setOverlayIndex((p) => p - 1);
    }
  };

  const currentOverlayImage =
    activeOverlayKey !== null ? `/videos/${overlaySequences[activeOverlayKey][overlayIndex]}` : '';

  const isSponsors = activeOverlayKey === 'sponsors';
  const isAbout = activeOverlayKey === 'about';
  const isFaq = activeOverlayKey === 'faq';

  const sponsorsFile = isSponsors ? overlaySequences.sponsors[overlayIndex] : null;
  const aboutFile = isAbout ? overlaySequences.about[overlayIndex] : null;

  const hideAllArrows =
    (isSponsors && sponsorsFile === 'sponsors.png') || (isAbout && aboutFile === 'about2.png');

  // Legacy single-center rule (still respected)
  const useSingleCenterAdvance =
    (isSponsors && sponsorsFile === 'popup-gold-sponsors.png') ||
    (isAbout && aboutFile === 'about1.png');

  const handleFolder = (key: string) => {
    if (phase !== 'finalStill') return;
    if (key === 'dashboard') return router.push('/dashboard');
    if (key === 'schedule') return router.push('/dashboard#schedule');
    setActiveOverlayKey(key);
  };

  return (
    <>
      <Head>
        <title>HackSMU VII</title>
        <meta name="description" content="HackSMU Portal" />
        <link rel="icon" href="/hacksmu_fish.ico" />

        {/* Optional preload hints for hottest overlays (keep short) */}
        <link rel="preload" as="image" href="/videos/popup-techteam.png" />
        <link rel="preload" as="image" href="/videos/popup-sponsorteam.png" />
        <link rel="preload" as="image" href="/videos/popup-logteam.png" />
        <link rel="preload" as="image" href="/videos/popup-marketing.png" />
      </Head>

      <section className="fixed inset-0 overflow-hidden z-0 bg-black">
        {phase === 'introStill' && (
          <div className={`absolute inset-0 transition-opacity duration-500 ${!showIntroVid ? 'opacity-100' : 'opacity-0'}`}>
            <NextImage src="/videos/inter-screen2.png" alt="Intermediate Screen" layout="fill" objectFit="cover" priority />
          </div>
        )}

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

        {phase === 'finalStill' && (
          <div className={`absolute inset-0 bg-black transition-opacity duration-700 ${showFinal ? 'opacity-100' : 'opacity-0'}`}>
            <NextImage src="/videos/main-screenVII.png" alt="Main Screen" layout="fill" objectFit="contain" priority />
            <div className="absolute z-10 flex flex-col items-center text-center text-white" style={{ top: '7%', left: '50%', transform: 'translateX(-50%)' }}>
              <h1 className="pixel-neon-title mb-2 text-2xxl sm:text-6xl">HackSMU VII</h1>
              <p className="neon-date text-md sm:text-2xl mb-4">October 25–26th, 2025</p>
              <Link href="/auth" passHref>
                <a className="gradient-button neon-button text-sm sm:text-base">Apply here!</a>
              </Link>
            </div>

            {/* Click zones */}
            <div onClick={() => handleFolder('about')} className="absolute z-20 cursor-pointer" style={{ top: '17%', left: '60%', width: '5%', height: '9%' }} />
            <div onClick={() => handleFolder('faq')} className="absolute z-20 cursor-pointer" style={{ top: '22%', left: '26%', width: '5%', height: '9%' }} />
            <div onClick={() => handleFolder('resources')} className="absolute z-20 cursor-pointer" style={{ top: '41%', left: '46%', width: '5%', height: '9%' }} />
            <div onClick={() => handleFolder('sponsors')} className="absolute z-20 cursor-pointer" style={{ top: '66%', left: '50%', width: '5%', height: '9%' }} />
            <div onClick={() => handleFolder('schedule')} className="absolute z-20 cursor-pointer" style={{ top: '81%', left: '61%', width: '5%', height: '9%' }} />
            <div onClick={() => handleFolder('dashboard')} className="absolute z-20 cursor-pointer" style={{ top: '76%', left: '34%', width: '5%', height: '9%' }} />
            <div onClick={() => handleFolder('team')} className="absolute z-20 cursor-pointer" style={{ top: '52%', left: '29.5%', width: '5%', height: '9%' }} />
          </div>
        )}

        {activeOverlayKey && (
          <div
            className={`absolute inset-0 bg-black z-30 transition-opacity duration-700 ${showOverlay ? 'opacity-100' : 'opacity-0'}`}
            onClick={clearOverlay}
          >
            <NextImage
              src={currentOverlayImage}
              alt="Overlay"
              layout="fill"
              objectFit="contain"
              priority={!!activeOverlayKey}
            />

            {/* FAQ overlay content */}
            {isFaq && (
              <>
                <div className="absolute inset-0 z-40 flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <div className="w-[92%] md:w-[75%] lg:w-[65%] max-w-4xl mt-[12vh] mb-[8vh] overflow-y-auto" style={{ maxHeight: '72vh', padding: '0.5rem' }}>
                    {faqLoading && faqs.length === 0 && <div className="text-center text-white text-xl py-6">Loading FAQs…</div>}

                    {!faqLoading && faqError && faqs.length === 0 && (
                      <div className="text-center text-white text-base md:text-lg space-y-3 py-6">
                        <p>Couldn’t load FAQs from the API.</p>
                        <button
                          onClick={async () => {
                            setFaqError(null);
                            setFaqLoading(true);
                            const data = await fetchFaqsClient();
                            setFaqsRaw(data);
                            setFaqLoading(false);
                            if (data.length === 0) setFaqError('Still couldn’t reach the FAQ endpoint.');
                          }}
                          className="px-4 py-2 rounded-md bg-white/20 hover:bg-white/30 transition"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {(faqs.length > 0 || (!faqLoading && !faqError)) && (
                      <FaqPage fetchedFaqs={faqs} answeredQuestion={toAnsweredQuestions(faqs as Faq[])} />
                    )}
                  </div>
                </div>

                {/* invisible close hotspot */}
                <button
                  onClick={clearOverlay}
                  className="absolute z-50"
                  aria-label="Close FAQ"
                  style={{ top: '6%', right: '8%', width: '3rem', height: '3rem', background: 'transparent' }}
                />
              </>
            )}

            {/* arrows for multi-page overlays (not used for FAQ) */}
            {!isFaq && overlaySequences[activeOverlayKey].length > 1 && !hideAllArrows && (
              <>
                {/* Keep legacy center-advance behavior for sponsors/about if desired */}
                {useSingleCenterAdvance ? (
                  <SingleCenterButton onClick={nextOverlay} />
                ) : (
                  (() => {
                    const layout = getArrowLayoutFor(activeOverlayKey, overlayIndex);
                    if (layout.kind === 'none') return null;

                    if (layout.kind === 'single') {
                      if (layout.pos === 'center') return <SingleCenterButton onClick={nextOverlay} />;
                      if (layout.pos === 'left') return <SingleMoreLeftButton onClick={nextOverlay} />;
                      if (layout.pos === 'right') return <SingleMoreRightButton onClick={nextOverlay} />;
                      return null;
                    }

                    // pair
                    return (
                      <>
                        {overlayIndex > 0 && (
                          <ArrowButton side="left" width={ARROW_HITBOX.pairW} onClick={prevOverlay} />
                        )}
                        {overlayIndex < overlaySequences[activeOverlayKey].length - 1 && (
                          <ArrowButton side="right" width={ARROW_HITBOX.pairW} onClick={nextOverlay} />
                        )}
                      </>
                    );
                  })()
                )}
              </>
            )}
          </div>
        )}
      </section>
    </>
  );
}

// SSR warm start (client fetch is primary)
export const getServerSideProps: GetServerSideProps<HomeProps> = async (context) => {
  const protoHeader =
    (context.req.headers['x-forwarded-proto'] as string) ||
    (context.req.headers['x-forwarded-protocol'] as string) ||
    'http';
  const hostHeader =
    (context.req.headers['x-forwarded-host'] as string) ||
    context.req.headers.host ||
    'localhost:3000';
  const proto = protoHeader.split(',')[0];
  const host = hostHeader.split(',')[0];
  const base = `${proto}://${host}`;

  try {
    let answeredQuestion: AnyFaq[] = [];
    try {
      const r1 = await RequestHelper.get<any>(`${base}/api/questions/faq`, {});
      answeredQuestion = pickArray(r1?.data ?? r1);
    } catch {}
    if (!answeredQuestion?.length) {
      try {
        const r2 = await RequestHelper.get<any>(`${base}/api/faqs`, {});
        answeredQuestion = pickArray(r2?.data ?? r2);
      } catch {}
    }

    const { data: memberData } = await RequestHelper.get<any[]>(`${base}/api/members`, {}).catch(() => ({ data: [] }));
    const { data: sponsorData } = await RequestHelper.get<any[]>(`${base}/api/sponsor`, {}).catch(() => ({ data: [] }));

    return {
      props: {
        answeredQuestion: Array.isArray(answeredQuestion) ? answeredQuestion : [],
        fetchedMembers: Array.isArray(memberData) ? memberData : [],
        sponsorCard: Array.isArray(sponsorData) ? sponsorData : [],
      },
    };
  } catch (error) {
    console.error('SSR fetch error:', error);
    return { props: { answeredQuestion: [], fetchedMembers: [], sponsorCard: [] } };
  }
};
