// pages/index.tsx — HackSMU VII · Frutiger Aero Edition
import Head from 'next/head';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { RequestHelper } from '../lib/request-helper';
import { useAuthContext } from '../lib/user/AuthContext';

// ─── Types ───────────────────────────────────────────────────
type AnyFaq = Record<string, any>;
type AnsweredQuestion = { id: string | number; question: string; answer: string; order: number };

type HomeProps = {
  answeredQuestion: AnyFaq[];
  fetchedMembers: any[];
};

// ─── FAQ helpers ─────────────────────────────────────────────
function pickArray(json: any): AnyFaq[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.faqs)) return json.faqs;
  if (Array.isArray(json?.answeredQuestion)) return json.answeredQuestion;
  if (Array.isArray(json?.rows)) return json.rows;
  return [];
}
function normalizeFaq(x: AnyFaq, i: number): AnsweredQuestion {
  const question =
    x?.question ?? x?.title ?? x?.q ?? x?.heading ?? x?.name ?? x?.prompt ?? x?.faq ?? x?.Question ?? '';
  const answer =
    x?.answer ?? x?.a ?? x?.response ?? x?.body ?? x?.content ?? x?.description ?? x?.Answer ?? '';
  return {
    id: x?.id ?? x?._id ?? i,
    question: String(question ?? ''),
    answer: String(answer ?? ''),
    order: typeof x?.order === 'number' ? x.order : i,
  };
}
async function fetchFaqsClient(): Promise<AnyFaq[]> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  try {
    const res = await fetch(new URL('/api/questions/faq', origin).toString(), {
      headers: { accept: 'application/json' },
      credentials: 'same-origin',
    });
    if (!res.ok) return [];
    return pickArray(await res.json());
  } catch { return []; }
}

// ─── Countdown ───────────────────────────────────────────────
const EVENT_DATE = new Date('2026-04-11T09:00:00');
function getCountdown() {
  const diff = EVENT_DATE.getTime() - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

// ─── Bubble config ───────────────────────────────────────────
const BUBBLES = [
  { size: 38, left: '8%',  delay: '0s',   dur: '13s' },
  { size: 22, left: '18%', delay: '3.5s', dur: '16s' },
  { size: 55, left: '30%', delay: '7s',   dur: '20s' },
  { size: 18, left: '45%', delay: '1.2s', dur: '14s' },
  { size: 44, left: '58%', delay: '8.5s', dur: '18s' },
  { size: 28, left: '70%', delay: '4s',   dur: '15s' },
  { size: 52, left: '82%', delay: '2.3s', dur: '22s' },
  { size: 32, left: '91%', delay: '9s',   dur: '17s' },
  { size: 16, left: '96%', delay: '5.5s', dur: '12s' },
];

// ─── Desktop icon definitions ────────────────────────────────
type IconDef = {
  key: string;
  label: string;
  emoji: string;
  grad: string; // radial-gradient CSS value for orb fill
  accentColor: string;
};
const DESKTOP_ICONS: IconDef[] = [
  {
    key: 'about',
    label: 'About',
    emoji: '🏔️',
    grad: 'radial-gradient(ellipse at 38% 28%, rgba(255,255,255,0.85) 0%, rgba(180,220,255,0.6) 22%, rgba(30,120,255,0.75) 55%, rgba(8,50,180,0.95) 100%)',
    accentColor: '#60b8ff',
  },
  {
    key: 'faq',
    label: 'FAQ',
    emoji: '💬',
    grad: 'radial-gradient(ellipse at 38% 28%, rgba(255,255,255,0.85) 0%, rgba(210,180,255,0.6) 22%, rgba(130,60,255,0.75) 55%, rgba(60,20,180,0.95) 100%)',
    accentColor: '#b080ff',
  },
  {
    key: 'resources',
    label: 'Resources',
    emoji: '🔗',
    grad: 'radial-gradient(ellipse at 38% 28%, rgba(255,255,255,0.85) 0%, rgba(160,240,255,0.6) 22%, rgba(0,180,255,0.75) 55%, rgba(0,80,180,0.95) 100%)',
    accentColor: '#40d8ff',
  },
  {
    key: 'sponsors',
    label: 'Sponsors',
    emoji: '⭐',
    grad: 'radial-gradient(ellipse at 38% 28%, rgba(255,255,255,0.85) 0%, rgba(255,240,160,0.6) 22%, rgba(255,180,20,0.75) 55%, rgba(160,80,0,0.95) 100%)',
    accentColor: '#ffd040',
  },
  {
    key: 'schedule',
    label: 'Schedule',
    emoji: '📅',
    grad: 'radial-gradient(ellipse at 38% 28%, rgba(255,255,255,0.85) 0%, rgba(160,255,220,0.6) 22%, rgba(30,200,140,0.75) 55%, rgba(10,90,60,0.95) 100%)',
    accentColor: '#40ffb8',
  },
  {
    key: 'team',
    label: 'Our Team',
    emoji: '👥',
    grad: 'radial-gradient(ellipse at 38% 28%, rgba(255,255,255,0.85) 0%, rgba(255,200,180,0.6) 22%, rgba(255,80,50,0.75) 55%, rgba(150,30,10,0.95) 100%)',
    accentColor: '#ff8060',
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    emoji: '🖥️',
    grad: 'radial-gradient(ellipse at 38% 28%, rgba(255,255,255,0.85) 0%, rgba(160,250,255,0.6) 22%, rgba(0,220,255,0.75) 55%, rgba(0,100,150,0.95) 100%)',
    accentColor: '#00e8ff',
  },
];

// ─── Modal title labels ───────────────────────────────────────
const SECTION_TITLES: Record<string, string> = {
  about: '✦ About HackSMU VII',
  faq: '✦ Frequently Asked Questions',
  resources: '✦ Hacker Resources',
  sponsors: '✦ Our Sponsors',
  schedule: '✦ Schedule',
  team: '✦ Meet the Team',
  dashboard: '✦ Hacker Dashboard',
};

const TEAM_MEMBERS = [
  { name: 'Alex Geer', image: '/team/alex.png', title: 'Hackathon Team Lead & Co-President of the CS Club' },
  { name: 'Hamna Tameez', image: '/team/hamna.jpg', title: 'Logistics Team & Co-President of the CS Club' },
  { name: 'Noah Brada', image: '/team/noah.jpeg', title: 'Technical Team & Vice President of the CS Club' },
  { name: 'Mollie Hamman', image: '/team/mollie.jpeg', title: 'Marketing Team' },
  { name: 'Grant Palmer', image: '/team/grant.jpeg', title: 'Marketing Team' },
  { name: 'Rin Lu', image: '/team/rin.jpeg', title: 'Technical Team' },
  { name: 'Ayoola Olaosebikan', image: '/team/ayoola.PNG', title: 'Logistics & Technical Team' },
];

// ─── Schedule data ────────────────────────────────────────────
const SCHEDULE_ITEMS = [
  { time: 'Sat 9AM',  name: 'Check-in & Breakfast',       loc: 'Fondren Science Lobby',  color: '#40ffb8', current: false },
  { time: 'Sat 10AM', name: 'Opening Ceremony',            loc: 'Fondren Science Atrium', color: '#60b8ff', current: false },
  { time: 'Sat 11AM', name: 'Hacking Begins 🚀',            loc: 'Fondren Science',        color: '#b080ff', current: false },
  { time: 'Sat 1PM',  name: 'Lunch',                        loc: 'Main Hall',              color: '#40ffb8', current: false },
  { time: 'Sat 2PM',  name: 'Workshop: Intro to AI/ML',    loc: 'Room 160',               color: '#ffd040', current: false },
  { time: 'Sat 4PM',  name: 'Sponsor Tech Talk',            loc: 'Auditorium',             color: '#ffd040', current: false },
  { time: 'Sat 7PM',  name: 'Dinner',                       loc: 'Main Hall',              color: '#40ffb8', current: false },
  { time: 'Sat 9PM',  name: 'Workshop: Web Dev Crash Course', loc: 'Room 160',            color: '#ffd040', current: false },
  { time: 'Sat 11PM', name: 'Midnight Snack 🍕',             loc: 'Lobby',                 color: '#ff8060', current: false },
  { time: 'Sun 6AM',  name: 'Breakfast',                    loc: 'Main Hall',              color: '#40ffb8', current: false },
  { time: 'Sun 9AM',  name: 'Hacking Ends — Submissions',   loc: 'Devpost',                color: '#ff8060', current: false },
  { time: 'Sun 10AM', name: 'Project Judging Begins',       loc: 'All Floors',             color: '#b080ff', current: false },
  { time: 'Sun 12PM', name: 'Awards Ceremony 🏆',            loc: 'Fondren Science Atrium', color: '#ffd040', current: false },
];

// ─── Resources data ───────────────────────────────────────────
const RESOURCES = [
  {
    label: 'Devpost',
    href: '',
    emoji: '🚀',
    desc: 'Coming Soon',
    grad: 'radial-gradient(ellipse at 38% 28%, rgba(255,255,255,0.8) 0%, rgba(255,210,140,0.55) 30%, rgba(240,120,20,0.7) 65%, rgba(140,50,0,0.92) 100%)',
  },
  {
    label: 'Discord',
    href: 'https://discord.gg/Z9YPH4eaen',
    emoji: '💬',
    desc: 'Join the community',
    grad: 'radial-gradient(ellipse at 38% 28%, rgba(255,255,255,0.8) 0%, rgba(210,185,255,0.55) 30%, rgba(110,70,220,0.7) 65%, rgba(50,20,130,0.92) 100%)',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/sahat/hackathon-starter.git',
    emoji: '🐙',
    desc: 'Explore code for your project',
    grad: 'radial-gradient(ellipse at 38% 28%, rgba(255,255,255,0.8) 0%, rgba(180,180,180,0.55) 30%, rgba(60,60,60,0.7) 65%, rgba(10,10,10,0.92) 100%)',
  },
  {
    label: 'Hacker Guide',
    href: '',
    emoji: '📖',
    desc: 'Coming soon',
    grad: 'radial-gradient(ellipse at 38% 28%, rgba(255,255,255,0.95) 0%, rgba(230,230,230,0.6) 35%, rgba(90,90,90,0.7) 65%, rgba(20,20,20,0.92) 100%)',
  },
  {
    label: 'Slides',
    href: 'https://docs.google.com/document/d/12UcFl9-JtPEkP_6LzSnpGxEyWOoll53z__3tsKc6a18/edit?usp=sharing',
    emoji: '📊',
    desc: 'Pitch deck templates',
    grad: 'radial-gradient(ellipse at 38% 28%, rgba(255,255,255,0.8) 0%, rgba(160,220,255,0.55) 30%, rgba(30,130,255,0.7) 65%, rgba(5,50,160,0.92) 100%)',
  },
];

// ─── About content ────────────────────────────────────────────
const ABOUT_STATS = [
  { number: '24',   label: 'Hours of Hacking' },
  { number: '200+', label: 'Hackers Expected' },
  { number: 'Massive', label: 'Prize Pool' },
  { number: '50+',  label: 'Projects Built' },
];

// ─── Main Component ───────────────────────────────────────────
export default function Home({ answeredQuestion }: HomeProps) {
  const router = useRouter();
  const { isSignedIn } = useAuthContext();
  const registerHref = isSignedIn ? '/register' : '/auth';

  // ── FAQ state ──
  const [faqsRaw, setFaqsRaw] = useState<AnyFaq[]>(answeredQuestion ?? []);
  const [faqLoading, setFaqLoading] = useState(false);
  const faqs = useMemo(
    () => (faqsRaw || []).map(normalizeFaq).filter(f => f.question || f.answer),
    [faqsRaw]
  );

  // ── Active section modal ──
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // ── FAQ open state ──
  const [faqOpen, setFaqOpen] = useState<boolean[]>([]);

  // ── Countdown ──
  const [countdown, setCountdown] = useState(getCountdown());
  const [clockStr, setClockStr] = useState('');

  // ── Carousel state ──
  const [carouselIndex, setCarouselIndex] = useState(0);
  const hackathonPhotos = [
    // Add your hackathon photos here
    '/hacksmuPhotos/36140D_71.jpg',
    '/hacksmuPhotos/36140D_99.jpg',
    '/hacksmuPhotos/36140D_150.jpg',
    '/hacksmuPhotos/36140D_180.jpg',
    '/hacksmuPhotos/36140D_352.jpg',
    '/hacksmuPhotos/36140D_406.jpg'
  ];

  const handleCarouselPrev = useCallback(() => {
    setCarouselIndex((prev) => (prev - 1 + hackathonPhotos.length) % hackathonPhotos.length);
  }, [hackathonPhotos.length]);

  const handleCarouselNext = useCallback(() => {
    setCarouselIndex((prev) => (prev + 1) % hackathonPhotos.length);
  }, [hackathonPhotos.length]);

  // ── Clock ──
  useEffect(() => {
    const tick = () => {
      setCountdown(getCountdown());
      const now = new Date();
      setClockStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Open/close modal ──
  const openSection = useCallback((key: string) => {
    if (key === 'dashboard') { router.push('/dashboard'); return; }
    setActiveSection(key);
    setShowModal(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setShowModal(true)));
  }, [router]);

  const closeSection = useCallback(() => {
    setShowModal(false);
    setTimeout(() => { setActiveSection(null); }, 320);
  }, []);

  // ── ESC key ──
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSection(); };
    if (activeSection) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [activeSection, closeSection]);

  // ── Fetch FAQs when FAQ modal opens ──
  useEffect(() => {
    if (activeSection !== 'faq') return;
    if (faqs.length > 0) {
      setFaqOpen(faqs.map(() => false));
      return;
    }
    let cancelled = false;
    (async () => {
      setFaqLoading(true);
      const data = await fetchFaqsClient();
      if (!cancelled) { setFaqsRaw(data); setFaqLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [activeSection]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync faqOpen length with faqs length
  useEffect(() => {
    setFaqOpen(prev => {
      if (prev.length === faqs.length) return prev;
      return faqs.map((_, i) => prev[i] ?? false);
    });
  }, [faqs]);

  // ─────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>HackSMU VII — Frutiger Aero</title>
        <meta name="description" content="HackSMU VII — April 11-12, 2026 · Dallas, TX" />
        <link rel="icon" href="/hacksmu_fish.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* ── FULL-SCREEN AERO DESKTOP ── */}
      <div className="aero-desktop">

        {/* ── Background stack ── */}
        <div className="aero-bg" />
        {/* Top-left reserved panel (sponsor logos) */}
        <div className="top-left-panel">
          <div style={{ padding: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 0 }}>
            <div className="powered-by-title" style={{ fontSize: 18, color: 'rgba(200,235,255,0.85)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: -150, marginTop: 120 }}>Powered by</div>
            <div className="powered-by-logos" style={{ display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'center' }}>
              <img className="powered-by-logo-smu" src="/sponsors/SMULyleLogo.png" alt="SMU Lyle School of Engineering" style={{ height: 450, objectFit: 'contain' }} />
              <img className="powered-by-logo-imasons" src="/sponsors/iMasonsLogo.png" alt="iMason's" style={{ height: 450, objectFit: 'contain', marginTop: -350 }} />
            </div>
          </div>
        </div>
        {/* Second panel underneath the first (reserved) — countdown will render here */}
        <div className="top-left-panel-2">
          {countdown ? (
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div className="countdown-title" style={{ fontSize: 18, color: 'rgba(200,235,255,0.92)', fontWeight: 800, letterSpacing: '0.06em' }}>Countdown to HackSMU</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                {[
                  { v: countdown.d, u: 'd' },
                  { v: countdown.h, u: 'h' },
                  { v: countdown.m, u: 'm' },
                  { v: countdown.s, u: 's' },
                ].map(({ v, u }) => (
                  <div key={u} style={{ textAlign: 'center' }}>
                    <div className="countdown-value" style={{
                      fontFamily: "'Orbitron', monospace",
                      fontSize: 44,
                      fontWeight: 900,
                      color: '#fff',
                      textShadow: '0 0 10px rgba(0,200,255,0.85)',
                      background: 'rgba(0,80,160,0.60)',
                      border: '1px solid rgba(255,255,255,0.32)',
                      borderRadius: 6,
                      padding: '6px 10px',
                      minWidth: 48,
                      display: 'block',
                    }}>
                      {String(v).padStart(2, '0')}
                    </div>
                    <div className="countdown-unit" style={{ fontSize: 15, color: 'rgba(160,230,255,0.85)', fontWeight: 700, marginTop: 6, letterSpacing: '0.04em' }}>{u}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ fontSize: 16, color: 'rgba(200,255,200,0.95)', fontWeight: 800 }}>HACKING LIVE 🚀</div>
            </div>
          )}
        </div>
        {/* Carousel panel */}
        <div className="top-left-panel-3">
          {hackathonPhotos.length > 0 ? (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div className="gallery-title" style={{ fontSize: 13, color: 'rgba(200,235,255,0.85)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 3 }}>HackSMU VI Photo Gallery</div>
              <div style={{ position: 'relative', width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <img 
                  className="gallery-photo"
                  src={hackathonPhotos[carouselIndex]} 
                  alt={`Hackathon photo ${carouselIndex + 1}`}
                  style={{ maxWidth: '97%', maxHeight: '92%', borderRadius: 8, objectFit: 'cover' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button 
                  onClick={handleCarouselPrev}
                  style={{
                    background: 'rgba(0,120,200,0.7)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#fff',
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                    cursor: hackathonPhotos.length > 0 ? 'pointer' : 'default',
                    fontSize: 18,
                    fontWeight: 700,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,150,230,0.9)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,120,200,0.7)'}
                >
                  ◀
                </button>
                <div style={{ fontSize: 12, color: 'rgba(160,230,255,0.85)', fontWeight: 600, minWidth: 40, textAlign: 'center' }}>
                  {hackathonPhotos.length > 0 ? `${carouselIndex + 1}/${hackathonPhotos.length}` : '0/0'}
                </div>
                <button 
                  onClick={handleCarouselNext}
                  style={{
                    background: 'rgba(0,120,200,0.7)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#fff',
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                    cursor: hackathonPhotos.length > 0 ? 'pointer' : 'default',
                    fontSize: 18,
                    fontWeight: 700,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,150,230,0.9)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,120,200,0.7)'}
                >
                  ▶
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ fontSize: 13, color: 'rgba(160,180,200,0.7)', fontWeight: 600, textAlign: 'center' }}>Add hackathon photos to display</div>
            </div>
          )}
        </div>
        <div className="aurora-wave aurora-wave-1" />
        <div className="aurora-wave aurora-wave-2" />
        <div className="aurora-wave aurora-wave-3" />

        {/* Lens flares */}
        <div className="lens-flare lens-flare-tl" />
        <div className="lens-flare lens-flare-tr" />
        <div className="lens-flare lens-flare-br" />
        <div className="lens-flare lens-flare-bl" />

        {/* Soap bubbles */}
        {BUBBLES.map((b, i) => (
          <div
            key={i}
            className="bubble"
            style={{
              width: b.size,
              height: b.size,
              left: b.left,
              bottom: '-80px',
              animationDelay: b.delay,
              animationDuration: `${b.dur}, ${parseFloat(b.dur) * 0.7}s`,
            }}
          />
        ))}



        {/* ── DESKTOP CONTENT ── */}
        <div
          className="aero-main-stage"
          style={{
            position: 'absolute',
            inset: 0,
            bottom: 52,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
          }}
        >
          {/* ── ORBITAL SYSTEM ── */}
          {(() => {
            const ORB_SIZE = 720;
            // Use separate horizontal and vertical radii to form an ellipse
            const ORBIT_RX = 528; // horizontal radius (x-axis)
            const ORBIT_RY = 440; // vertical radius (y-axis) — smaller so top/bottom sit closer
            const ICON_SIZE = 180; // scaled icon size for layout
            const CONTAINER = ORB_SIZE + Math.max(ORBIT_RX, ORBIT_RY) * 2 + ICON_SIZE + 160; // adjusted padding
            const cx = CONTAINER / 2;
            const cy = CONTAINER / 2;
            const n = DESKTOP_ICONS.length; // 7

            return (
              <div className="orbital-rig desktop-orbital-rig" style={{ position: 'relative', width: CONTAINER, height: CONTAINER, flexShrink: 0, marginLeft: 620 }}>

                {/* Orbit ring */}
                {/* <div style={{
                  position: 'absolute',
                  left: cx - ORBIT_R - ICON_SIZE / 2,
                  top:  cy - ORBIT_R - ICON_SIZE / 2,
                  width:  (ORBIT_R + ICON_SIZE / 2) * 2,
                  height: (ORBIT_R + ICON_SIZE / 2) * 2,
                  borderRadius: '50%',
                  border: '1px dashed rgba(96,200,255,0.20)',
                  pointerEvents: 'none',
                }} /> */}

                {/* Central orb */}
                <div style={{
                  position: 'absolute',
                  left: cx - ORB_SIZE / 2,
                  top:  cy - ORB_SIZE / 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 20,
                }}>
                    <div
                    className="aero-orb"
                    style={{ width: ORB_SIZE, height: ORB_SIZE, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <div style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: 72,
                      fontWeight: 900,
                      color: '#fff',
                      textShadow: '0 0 16px rgba(0,200,255,0.85), 0 1px 6px rgba(0,0,0,0.85)',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      zIndex: 1,
                      textAlign: 'center',
                      lineHeight: 1.15,
                      paddingTop: 48,
                    }}>
                      HackSMU VII
                    </div>
                    <div style={{
                      fontSize: 52,
                      fontWeight: 700,
                      color: 'rgba(0, 0, 241, 0.6)',
                      textShadow: '0 0 10px rgba(198, 238, 244, 0.55)',
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                      zIndex: 1,
                    }}>
                      April 11-12, 2026
                    </div>

                    {/* Countdown moved to the top-left reserved panel */}

                    {/* Register CTA — inside the orb, below countdown */}
                    <Link href={registerHref} passHref>
                      <a
                        className="aero-btn"
                        style={{
                          fontSize: 44,
                          letterSpacing: '0.08em',
                          whiteSpace: 'nowrap',
                          marginTop: 15,
                          background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.75) 0%, rgba(160,255,180,0.40) 30%, rgba(20,190,100,0.80) 60%, rgba(6,120,60,0.98) 100%)',
                          border: '1px solid rgba(255,255,255,0.56)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65), 0 6px 22px rgba(0,160,100,0.28)',
                          color: '#fff',
                          padding: '14px 45px'
                        }}
                      >
                        Apply Now →
                      </a>
                    </Link>
                  </div>
                </div>

                {/* Orbiting folder icons */}
                {DESKTOP_ICONS.map((icon, i) => {
                  const angleDeg = -70 + (360 / n) * i;
                  const angleRad = (angleDeg * Math.PI) / 180;
                  const orbCx = cx + ORBIT_RX * Math.cos(angleRad);
                  const orbCy = cy + ORBIT_RY * Math.sin(angleRad);
                  // Folder dimensions
                  const FW = 150;  // folder body width
                  const FH = 123;  // folder body height
                  const TAB_W = 57; // tab width
                  const TAB_H = 18; // tab height
                  const R = 9;      // corner radius
                  const TOTAL_H = FH + TAB_H;
                  return (
                    <button
                      key={icon.key}
                      className="desktop-icon-btn"
                      onClick={() => openSection(icon.key)}
                      title={icon.label}
                      style={{
                        position: 'absolute',
                        left: orbCx - FW / 2,
                        top: orbCy - TOTAL_H / 2,
                        width: FW,
                        height: TOTAL_H,
                        padding: 0,
                        overflow: 'visible',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 7,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {/* Folder SVG */}
                      <div style={{ position: 'relative', width: FW, height: TOTAL_H, flexShrink: 0 }}>
                        <svg
                          viewBox={`0 0 ${FW} ${TOTAL_H}`}
                          width={FW}
                          height={TOTAL_H}
                          style={{ display: 'block', filter: `drop-shadow(0 5px 12px ${icon.accentColor}70)` }}
                        >
                          <defs>
                            <linearGradient id={`fg-${icon.key}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%"   stopColor={icon.accentColor} stopOpacity="0.55" />
                              <stop offset="100%" stopColor={icon.accentColor} stopOpacity="0.25" />
                            </linearGradient>
                            <linearGradient id={`ftab-${icon.key}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%"   stopColor={icon.accentColor} stopOpacity="0.75" />
                              <stop offset="100%" stopColor={icon.accentColor} stopOpacity="0.50" />
                            </linearGradient>
                          </defs>

                          {/* Tab (top-left raised flap) */}
                          <path
                            d={`M${R},0 H${TAB_W - R} Q${TAB_W},0 ${TAB_W},${R} V${TAB_H} H0 V${R} Q0,0 ${R},0 Z`}
                            fill={`url(#ftab-${icon.key})`}
                            stroke={`${icon.accentColor}cc`}
                            strokeWidth="1"
                          />

                          {/* Folder body */}
                          <path
                            d={`M0,${TAB_H} H${FW} V${TOTAL_H - R} Q${FW},${TOTAL_H} ${FW - R},${TOTAL_H} H${R} Q0,${TOTAL_H} 0,${TOTAL_H - R} Z`}
                            fill={`url(#fg-${icon.key})`}
                            stroke={`${icon.accentColor}cc`}
                            strokeWidth="1"
                          />

                          {/* Gloss shine on body */}
                          <path
                            d={`M1,${TAB_H} H${FW - 1} V${TAB_H + (FH * 0.42)} Q${FW / 2},${TAB_H + (FH * 0.55)} 1,${TAB_H + (FH * 0.42)} Z`}
                            fill="rgba(255,255,255,0.14)"
                          />
                        </svg>

                        {/* Emoji centered on folder body */}
                        <span style={{
                          position: 'absolute',
                          top: TAB_H + FH * 0.5,
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: 72,
                          lineHeight: 1,
                          pointerEvents: 'none',
                        }}>
                          {icon.emoji}
                        </span>
                      </div>

                      {/* Label */}
                      <span className="icon-label" style={{ whiteSpace: 'nowrap' }}>
                        {icon.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })()}

          <div className="mobile-home-launcher">
            <div className="mobile-home-title">HackSMU VII</div>
            <div className="mobile-home-date">April 11-12, 2026</div>
            <Link href={registerHref} passHref>
              <a className="aero-btn" style={{ textDecoration: 'none', display: 'inline-block', marginTop: 10 }}>
                Apply Now →
              </a>
            </Link>
            <div className="mobile-icon-grid">
              {DESKTOP_ICONS.slice(0, -1).map((icon) => (
                <button
                  key={icon.key}
                  className="mobile-icon-btn"
                  onClick={() => openSection(icon.key)}
                  title={icon.label}
                >
                  <span style={{ fontSize: 24 }}>{icon.emoji}</span>
                  <span>{icon.label}</span>
                </button>
              ))}
            </div>
            <div className="mobile-icon-last-row">
              <button
                key={DESKTOP_ICONS[DESKTOP_ICONS.length - 1].key}
                className="mobile-icon-btn mobile-icon-last"
                onClick={() => openSection(DESKTOP_ICONS[DESKTOP_ICONS.length - 1].key)}
                title={DESKTOP_ICONS[DESKTOP_ICONS.length - 1].label}
              >
                <span style={{ fontSize: 24 }}>{DESKTOP_ICONS[DESKTOP_ICONS.length - 1].emoji}</span>
                <span>{DESKTOP_ICONS[DESKTOP_ICONS.length - 1].label}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── TASKBAR ── */}
        <div className="aero-taskbar">
          <div className="taskbar-brand" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/assets2025/FrutigerAero.png" alt="HackSMU" style={{ height: 46, borderRadius: 6 }} onError={e => (e.currentTarget.style.display = 'none')} />
            <span className="taskbar-logo">HackSMU VII</span>
          </div>
          <div className="taskbar-actions" style={{ display: 'flex', gap: 42, alignItems: 'center' }}>
            {DESKTOP_ICONS.slice(0, 4).map(icon => (
              <button
                key={icon.key}
                onClick={() => openSection(icon.key)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 44, opacity: 0.85, transition: 'opacity 0.18s', padding: 8 }}
                title={icon.label}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}
              >
                {icon.emoji}
              </button>
            ))}
          </div>
          <div className="taskbar-time taskbar-meta">
            <div style={{ fontSize: 16 }}>{clockStr}</div>
            <div style={{ fontSize: 14, opacity: 0.85 }}>Dallas, TX</div>
          </div>
        </div>

        {/* ── MODAL ── */}
        {activeSection && (
          <div
            className="aero-modal-backdrop"
            onClick={closeSection}
            style={{ opacity: showModal ? 1 : 0, transition: 'opacity 0.32s ease' }}
          >
            <div
              className="aero-modal-window glass-panel glass-panel-thick"
              onClick={e => e.stopPropagation()}
              style={{ opacity: showModal ? 1 : 0 }}
            >
              {/* Title bar */}
              <div className="aero-titlebar">
                <span className="aero-titlebar-title">{SECTION_TITLES[activeSection] ?? activeSection}</span>
                <button className="aero-close-btn" onClick={closeSection} aria-label="Close">×</button>
              </div>

              {/* Modal body */}
              <div className="aero-modal-body aero-scroll">
                {activeSection === 'about' && <AboutContent />}
                {activeSection === 'faq' && (
                  <FaqContent
                    faqs={faqs}
                    loading={faqLoading}
                    openState={faqOpen}
                    onToggleItem={(i) =>
                      setFaqOpen(prev => {
                        const n = [...prev];
                        n[i] = !n[i];
                        return n;
                      })
                    }
                    onToggleAll={() =>
                      setFaqOpen(prev => {
                        const shouldExpandAll = !prev.every(Boolean);
                        return prev.map(() => shouldExpandAll);
                      })
                    }
                  />
                )}
                {activeSection === 'resources' && <ResourcesContent />}
                {activeSection === 'sponsors' && <SponsorsContent />}
                {activeSection === 'schedule' && <ScheduleContent />}
                {activeSection === 'team' && (
                  <TeamContent />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION CONTENT COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ── About ─────────────────────────────────────────────────────
function AboutContent() {
  const { isSignedIn } = useAuthContext();
  const registerHref = isSignedIn ? '/register' : '/auth';
  return (
    <div style={{ padding: '24px 22px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🐟</div>
        <h1 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 45,
          fontWeight: 900,
          background: 'linear-gradient(135deg, #a0f0ff, #60c8ff, #2090ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 6,
          letterSpacing: '0.08em',
        }}>
          HackSMU VII
        </h1>
        <p style={{ color: 'rgba(160,230,255,0.85)', fontSize: 16, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          April 11-12, 2026 · Dallas, Texas
        </p>
      </div>

      <div className="divider-aero" style={{ marginBottom: 20 }} />

      {/* Stats */}
      <div className="about-stats-grid" style={{ display: 'grid', gap: 10, marginBottom: 22 }}>
        {ABOUT_STATS.map(s => (
          <div key={s.label} className="about-stat-card">
            <div className="about-stat-number">{s.number}</div>
            <div className="about-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Description */}
      <div style={{
        background: 'rgba(0,100,200,0.10)',
        border: '1px solid rgba(100,200,255,0.22)',
        borderRadius: 10,
        padding: '16px 18px',
        marginBottom: 18,
      }}>
        <p style={{ color: 'rgba(220,240,255,0.90)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
          HackSMU is Southern Methodist University's annual hackathon hosted by{' '}
          <strong style={{ color: 'rgba(100,230,255,0.95)' }}>the SMU Computer Science Club and iMasons</strong>. Over 24 hours, hundreds of
          students collaborate, build, and ship incredible projects — from AI applications and mobile apps to
          hardware hacks and social impact tools. Whether you're a first-time hacker or a seasoned engineer,
          HackSMU is the place for you.
        </p>
      </div>

      {/* Details grid */}
      <div className="about-details-grid" style={{ display: 'grid', gap: 10 }}>
        {[
          { icon: '📍', label: 'Location', value: 'Hughes Trigg Student Center, SMU' },
          { icon: '📅', label: 'Dates', value: 'April 11-12, 2026' },
          { icon: '🎓', label: 'Open To', value: 'All College Students' },
          { icon: '💰', label: 'Entry Fee', value: 'Free!' },
          { icon: '🍕', label: 'Food', value: 'Meals Provided' },
          { icon: '🏆', label: 'Prizes', value: 'Massive Prize Pool!' },
        ].map(item => (
          <div key={item.label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            padding: '10px 14px',
          }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(140,210,255,0.70)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(230,245,255,0.95)' }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 22 }}>
        <Link href={registerHref} passHref>
          <a className="aero-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Register Now →
          </a>
        </Link>
      </div>
    </div>
  );
}

// ── FAQ ───────────────────────────────────────────────────────
function FaqContent({
  faqs,
  loading,
  openState,
  onToggleItem,
  onToggleAll,
}: {
  faqs: AnsweredQuestion[];
  loading: boolean;
  openState: boolean[];
  onToggleItem: (i: number) => void;
  onToggleAll: () => void;
}) {
  const allExpanded = openState.length > 0 && openState.every(Boolean);
  return (
    <div style={{ padding: '18px 18px' }}>
      {loading && faqs.length === 0 && (
        <div style={{ textAlign: 'center', color: 'rgba(100,220,255,0.85)', padding: '32px 0', fontSize: 15 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⟳</div>
          Loading FAQs…
        </div>
      )}
      {!loading && faqs.length === 0 && (
        <div style={{ textAlign: 'center', color: 'rgba(180,210,255,0.70)', padding: '32px 0', fontSize: 14 }}>
          No FAQs available yet. Check back soon!
        </div>
      )}
      {faqs.map((faq, i) => (
        <div key={faq.id ?? i} className="faq-item">
          <button className="faq-question-btn" onClick={() => onToggleItem(i)}>
            <span className="faq-question-text">{faq.question}</span>
            <svg
              className={`faq-chevron${openState[i] ? ' open' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <div className={`faq-answer-panel${openState[i] ? ' open' : ''}`}>
            <div className="faq-answer-text">
              {typeof faq.answer === 'string'
                ? faq.answer
                : Array.isArray(faq.answer)
                ? (faq.answer as any[]).map((chunk: any, ci: number) =>
                    chunk?.type === 'link' ? (
                      <a key={ci} href={chunk.url} style={{ color: 'rgba(80,200,255,0.95)', textDecoration: 'underline' }}>{chunk.text}</a>
                    ) : (
                      <span key={ci}>{chunk?.text ?? ''}</span>
                    )
                  )
                : null}
            </div>
          </div>
        </div>
      ))}
      {faqs.length > 0 && (
        <div style={{ marginTop: 10, textAlign: 'right' }}>
          <button
            className="aero-btn"
            style={{ fontSize: 14, padding: '7px 16px' }}
            onClick={onToggleAll}
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Resources ─────────────────────────────────────────────────
function ResourcesContent() {
  const hasCenteredLastRow = RESOURCES.length % 3 === 2;
  return (
    <div style={{ padding: '24px 22px' }}>
      <p style={{ color: 'rgba(180,225,255,0.80)', fontSize: 15, textAlign: 'center', marginBottom: 24 }}>
        Everything you need to build something amazing at HackSMU VII.
      </p>
      <div className="resources-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 16 }}>
        {RESOURCES.map((r, i) => {
          const isInLastRowPair = hasCenteredLastRow && i >= RESOURCES.length - 2;
          const centeredColumn = i === RESOURCES.length - 2 ? '2 / span 2' : '4 / span 2';
          return (
          <a
            key={r.label}
            href={r.href}
            target="_blank"
            rel="noreferrer"
            className="water-drop-btn resource-card"
            style={{
              gridColumn: isInLastRowPair ? centeredColumn : 'span 2',
              background: r.grad,
              width: '100%',
              aspectRatio: '1 / 1.1',
              padding: '18px 12px',
            }}
          >
            <div className="ripple-ring" />
            <span style={{ fontSize: 32, position: 'relative', zIndex: 1 }}>{r.emoji}</span>
            <span style={{
              fontSize: 17,
              fontWeight: 800,
              color: '#fff',
              textShadow: '0 1px 6px rgba(0,0,0,0.7)',
              position: 'relative',
              zIndex: 1,
              letterSpacing: '0.04em',
            }}>{r.label}</span>
            <span style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.75)',
              textAlign: 'center',
              position: 'relative',
              zIndex: 1,
              lineHeight: 1.3,
            }}>{r.desc}</span>
          </a>
        )})}
      </div>
    </div>
  );
}

// ── Sponsors ──────────────────────────────────────────────────
function SponsorsContent() {
  const sponsors = [
    { name: 'iMasons', logo: '/sponsors/iMasonsLogo.png' },
    { name: 'SMU Lyle School of Engineering', logo: '/sponsors/SMULyleLogo.png' },
    { name: 'SMU Student Senate', logo: '/sponsors/SMUStudentSenate.jpg' },
  ];

  return (
    <div style={{ padding: '22px 20px' }}>
      <div style={{ marginBottom: 24 }}>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            marginBottom: 12,
            color: 'rgba(200,245,255,0.95)',
          }}
        >
          Sponsors
        </h3>
        <div className="sponsors-grid" style={{ display: 'grid', gap: 12 }}>
          {sponsors.map((s) => (
            <div
              key={s.name}
              className="sponsor-glass-card shine-card"
              style={{ padding: '18px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
            >
              <img
                src={s.logo}
                alt={s.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: 90,
                  objectFit: 'contain',
                  filter: 'brightness(1.1)',
                  transform: s.name === 'SMU Lyle School of Engineering' ? 'scale(3)' : 'none',
                  transformOrigin: 'center',
                  marginTop: s.name === 'iMasons' ? 8 : 0,
                }}
                onError={e => (e.currentTarget.style.display = 'none')}
              />
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'rgba(220,240,255,0.90)',
                  textAlign: 'center',
                  lineHeight: 1.3,
                  marginTop: s.name === 'iMasons' ? 10 : 0,
                }}
              >
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p style={{ textAlign: 'center', color: 'rgba(160,215,255,0.65)', fontSize: 14, marginTop: 8 }}>
        Interested in sponsoring? Email{' '}
        <a href="mailto:hacksmu.team@gmail.com" style={{ color: 'rgba(100,220,255,0.85)', textDecoration: 'underline' }}>
          hacksmu.team@gmail.com
        </a>
      </p>
    </div>
  );
}

// ── Schedule ──────────────────────────────────────────────────
function ScheduleContent() {
  return (
    <div style={{ padding: '16px 0' }}>
      <div className="schedule-header-row" style={{ padding: '0 18px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'rgba(160,225,255,0.75)', fontSize: 13 }}>All times Central Time (CT)</p>
        <Link href="/dashboard#schedule" passHref>
          <a className="aero-btn" style={{ fontSize: 14, padding: '6px 14px', textDecoration: 'none', display: 'inline-block' }}>
            Full Schedule →
          </a>
        </Link>
      </div>
      <div className="divider-aero" />
      {SCHEDULE_ITEMS.map((item, i) => (
        <div key={i} className="schedule-row">
          <span className="schedule-time">{item.time}</span>
          <div className="schedule-bubble" style={{ backgroundColor: item.color, color: item.color }} />
          <div>
            <div className="schedule-event-name">{item.name}</div>
            <div className="schedule-event-loc">📍 {item.loc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Team ─────────────────────────────────────────────────────
function TeamContent() {
  const [mobileTeamIndex, setMobileTeamIndex] = useState(0);
  const mainTeamCards = TEAM_MEMBERS.slice(0, 6);
  const lastTeamCard = TEAM_MEMBERS[6];
  const teamCardWidth = 220;
  const mobileMember = TEAM_MEMBERS[mobileTeamIndex];

  const renderTeamCard = (member: { name: string; image: string; title: string }) => (
    <div
      key={member.name}
      className="member-glass-card"
      style={{ width: teamCardWidth, padding: '22px 16px', minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}
    >
      <img
        src={member.image}
        alt={member.name}
        style={{
          width: 142,
          height: 142,
          borderRadius: 12,
          objectFit: 'cover',
          border: '1px solid rgba(255,255,255,0.40)',
          boxShadow: '0 0 18px rgba(80,190,255,0.30)',
          margin: '0 auto 12px',
        }}
        onError={e => (e.currentTarget.style.display = 'none')}
      />
      <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(230,245,255,0.95)', lineHeight: 1.3, textAlign: 'center' }}>
        {member.name}
      </div>
      <div style={{ fontSize: 12, color: 'rgba(170,220,255,0.88)', lineHeight: 1.35, textAlign: 'center', marginTop: 6 }}>
        {member.title}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '18px' }}>
      <div className="team-desktop-layout">
        <div
          className="team-members-grid"
          style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${teamCardWidth}px, ${teamCardWidth}px))`, gap: 18, justifyContent: 'center' }}
        >
          {mainTeamCards.map((member) => renderTeamCard(member))}
        </div>
        {lastTeamCard && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
            {renderTeamCard(lastTeamCard)}
          </div>
        )}
      </div>

      <div className="team-mobile-slider">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 280, display: 'flex', justifyContent: 'center' }}>
            {mobileMember && renderTeamCard(mobileMember)}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 12 }}>
          <button
            className="aero-btn"
            style={{ fontSize: 13, padding: '6px 14px' }}
            onClick={() => setMobileTeamIndex((prev) => (prev - 1 + TEAM_MEMBERS.length) % TEAM_MEMBERS.length)}
          >
            ← Prev
          </button>
          <button
            className="aero-btn"
            style={{ fontSize: 13, padding: '6px 14px' }}
            onClick={() => setMobileTeamIndex((prev) => (prev + 1) % TEAM_MEMBERS.length)}
          >
            Next →
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'rgba(185,225,255,0.8)' }}>
          {mobileTeamIndex + 1} / {TEAM_MEMBERS.length}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SERVER-SIDE PROPS
// ═══════════════════════════════════════════════════════════════
export const getServerSideProps: GetServerSideProps<HomeProps> = async (context) => {
  const protocol = context.req.headers.referer?.split('://')[0] || 'http';
  const base = `${protocol}://${context.req.headers.host}`;
  try {
    const [faqRes, memberRes] = await Promise.all([
      RequestHelper.get<any[]>(`${base}/api/questions/faq`, {}),
      RequestHelper.get<any[]>(`${base}/api/members`, {}),
    ]);
    return {
      props: {
        answeredQuestion: Array.isArray(faqRes.data) ? faqRes.data : [],
        fetchedMembers: Array.isArray(memberRes.data) ? memberRes.data : [],
      },
    };
  } catch {
    return { props: { answeredQuestion: [], fetchedMembers: [] } };
  }
};
