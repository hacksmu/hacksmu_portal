import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import DashboardHeader from '../../components/dashboardComponents/DashboardHeader';
import { useUser } from '../../lib/profile/user-data';
import { useAuthContext } from '../../lib/user/AuthContext';
import AnnouncementCard from '../../components/dashboardComponents/AnnouncementCards';
import Sidebar from '../../components/dashboardComponents/Sidebar';
import firebase from 'firebase';
import 'firebase/messaging';
import { GetServerSideProps } from 'next';
import { RequestHelper } from '../../lib/request-helper';
import SpotlightCard from '../../components/dashboardComponents/SpotlightCard';
import ChallengeCard from '../../components/dashboardComponents/ChallengeCard';

import { Navigation, Pagination, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

const glassPanel: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(120,180,255,0.10) 100%)',
  backdropFilter: 'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.30)',
  borderRadius: 16,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 32px rgba(0,30,80,0.28)',
};

const roleColors: Record<string, string> = {
  admin: '#ff8844',
  super_admin: '#ff4488',
  organizer: '#b080ff',
  sponsor: '#ffd040',
  judge: '#40ffb8',
  hacker: '#60c8ff',
};

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Orbitron', 'Roboto', sans-serif",
      fontSize: 18,
      fontWeight: 800,
      color: '#e0f0ff',
      textShadow: '0 0 12px rgba(0,180,255,0.5)',
      letterSpacing: '0.06em',
      marginBottom: 16,
      paddingBottom: 8,
      borderBottom: '1px solid rgba(255,255,255,0.15)',
    }}>
      {children}
    </div>
  );
}

function StatChip({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{
      ...glassPanel,
      borderRadius: 24,
      padding: '6px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: color,
        boxShadow: `0 0 8px ${color}`,
        flexShrink: 0,
      }} />
      <span style={{ color: '#c8e8ff', fontSize: 13, fontWeight: 700 }}>{value}</span>
      <span style={{ color: 'rgba(200,232,255,0.65)', fontSize: 12 }}>{label}</span>
    </div>
  );
}

export default function Dashboard(props: {
  announcements: Announcement[];
  scheduleEvents: ScheduleEvent[];
  challenges: Challenge[];
}) {
  const { isSignedIn } = useAuthContext();
  const user = useUser();
  const role = user.permissions?.length > 0 ? user.permissions[0] : 'hacker';
  const permissions = user.permissions ?? [];
  const isOrganizerView =
    permissions.includes('organizer') ||
    permissions.includes('admin') ||
    permissions.includes('super_admin');
  const roleColor = roleColors[role] ?? '#60c8ff';

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [liveEvents, setLiveEvents] = useState<ScheduleEvent[]>([]);
  const [clock, setClock] = useState('');
  const [expandedChallenge, setExpandedChallenge] = useState<number | null>(null);

  const isLive = (start: any, end: any): boolean => {
    if (!start || !end) return false;
    const now = firebase.firestore.Timestamp.now().seconds;
    return now > (start._seconds ?? 0) && now < (end._seconds ?? 0);
  };

  useEffect(() => {
    const safe = <T,>(val: T[] | null | undefined): T[] => (Array.isArray(val) ? val : []);

    setAnnouncements(safe(props.announcements));
    setChallenges(safe(props.challenges).sort((a, b) => (a.rank > b.rank ? 1 : -1)));
    setLiveEvents(
      safe(props.scheduleEvents).filter((e) => isLive(e.startTimestamp, e.endTimestamp)),
    );

    if (firebase.messaging.isSupported()) {
      firebase.messaging().onMessage((payload) => {
        setAnnouncements((prev) => [JSON.parse(payload.data.notification) as Announcement, ...prev]);
      });
    }

    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setClock(`${h}:${m}:${s}`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isSignedIn) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#c8e8ff',
        fontSize: 22,
        fontFamily: "'Orbitron', sans-serif",
        textShadow: '0 0 16px rgba(0,180,255,0.5)',
      }}>
        Please sign in to view your dashboard
      </div>
    );
  }

  const firstName = user?.firstName || 'Hacker';

  return (
    <>
      <Head>
        <title>HackSMU — Dashboard</title>
        <meta name="description" content="HackSMU Dashboard" />
      </Head>

      <div style={{ display: 'flex', minHeight: '100vh', background: 'transparent' }}>
        <Sidebar />

        {/* Main content */}
        <main style={{ flex: 1, padding: '24px 28px 48px', minWidth: 0 }}>
          <DashboardHeader />

          {/* Welcome banner */}
          <div style={{
            ...glassPanel,
            padding: '20px 28px',
            marginBottom: 24,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}>
            <div>
              <div style={{
                fontFamily: "'Orbitron', 'Roboto', sans-serif",
                fontSize: 22,
                fontWeight: 900,
                color: '#fff',
                textShadow: '0 0 18px rgba(0,200,255,0.6)',
                letterSpacing: '0.04em',
              }}>
                Welcome back, {firstName}
              </div>
              <div style={{
                marginTop: 4,
                display: 'inline-block',
                padding: '2px 12px',
                borderRadius: 12,
                background: `linear-gradient(90deg, ${roleColor}33, ${roleColor}22)`,
                border: `1px solid ${roleColor}66`,
                color: roleColor,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {role.replace('_', ' ')}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              {clock && (
                <div style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#80d8ff',
                  textShadow: '0 0 12px rgba(0,180,255,0.6)',
                  letterSpacing: '0.1em',
                }}>
                  {clock}
                </div>
              )}
              <StatChip label="announcements" value={announcements.length} color="#60c8ff" />
              <StatChip label="live now" value={liveEvents.length} color="#40ff9a" />
              <StatChip label="challenges" value={challenges.length} color="#ffd040" />
            </div>
          </div>

          {/* Discord CTA */}
          <div style={{
            ...glassPanel,
            padding: '12px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.015.04.032.05a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 13.99 13.99 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.07 13.07 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" fill="#5865F2"/>
            </svg>
            <span style={{ color: 'rgba(200,232,255,0.85)', fontSize: 14 }}>
              Join our community on Discord:&nbsp;
              <a
                href="https://hacksmu.org/discord"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#7289da', fontWeight: 700, textDecoration: 'none' }}
              >
                hacksmu.org/discord
              </a>
            </span>
          </div>

          <div
            style={{
              ...glassPanel,
              padding: '18px 20px',
              marginBottom: 24,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
            }}
          >
            <div>
              <div
                style={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 18,
                  textShadow: '0 0 14px rgba(0,200,255,0.45)',
                }}
              >
                {isOrganizerView ? 'Organizer review tools' : 'Interested in judging?'}
              </div>
              <div style={{ marginTop: 6, color: 'rgba(200,232,255,0.78)', fontSize: 14 }}>
                {isOrganizerView
                  ? 'Open the admin dashboard to answer pending questions and review judge applications.'
                  : 'Apply to help review projects, support teams, and score submissions during HackSMU VII.'}
              </div>
            </div>
            <Link href={isOrganizerView ? '/admin' : '/dashboard/judge-apply'}>
              <a
                className="aero-btn"
                style={{
                  fontSize: 14,
                  padding: '10px 18px',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {isOrganizerView ? 'Open Admin Dashboard' : 'Apply to Be a Judge'}
              </a>
            </Link>
          </div>

          {/* Spotlight + Announcements */}
          <div style={{ display: 'grid', gridTemplateColumns: liveEvents.length > 0 ? '1fr 1fr' : '1fr', gap: 24, marginBottom: 28 }}>
            {/* Live Spotlight */}
            {liveEvents.length > 0 && (
              <div style={{ ...glassPanel, padding: 20 }}>
                <SectionHeader>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 9, height: 9, borderRadius: '50%',
                      background: '#40ff9a',
                      boxShadow: '0 0 10px #40ff9a',
                      display: 'inline-block',
                    }} />
                    Live Spotlight ({liveEvents.length})
                  </span>
                </SectionHeader>
                <Swiper
                  modules={[Navigation, Pagination, A11y]}
                  spaceBetween={16}
                  slidesPerView={1}
                  navigation
                  loop={false}
                  pagination={{ clickable: true }}
                  style={{ borderRadius: 12 }}
                >
                  {liveEvents.map(({ title, speakers, startTimestamp, endTimestamp, location, page }, idx) => (
                    <SwiperSlide key={idx}>
                      <div style={{ height: '17rem' }}>
                        <SpotlightCard
                          title={title}
                          speakers={speakers}
                          startDate={startTimestamp}
                          location={location}
                          endDate={endTimestamp}
                          page={page}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}

            {/* Announcements */}
            <div style={{ ...glassPanel, padding: 20, display: 'flex', flexDirection: 'column' }}>
              <SectionHeader>Announcements</SectionHeader>
              <div style={{ overflowY: 'auto', flex: 1, maxHeight: 320, paddingRight: 4 }}>
                {announcements.length === 0 ? (
                  <div style={{ color: 'rgba(200,232,255,0.45)', fontSize: 14, textAlign: 'center', paddingTop: 24 }}>
                    No announcements yet
                  </div>
                ) : (
                  announcements.map((announcement, idx) => {
                    const dateObj = new Date(announcement.timestamp!);
                    const h = dateObj.getHours(), m = dateObj.getMinutes();
                    const time = `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`;
                    return <AnnouncementCard key={idx} text={announcement.announcement} time={time} />;
                  })
                )}
              </div>
            </div>
          </div>

          {/* Challenges */}
          <div style={{ ...glassPanel, padding: 20 }}>
            <SectionHeader>Challenges</SectionHeader>
            {challenges.length === 0 ? (
              <div style={{ color: 'rgba(200,232,255,0.45)', fontSize: 14, textAlign: 'center', paddingTop: 16 }}>
                No challenges posted yet
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}>
                {challenges.map(({ title, description, prizes, organization }, idx) => (
                  <ChallengeCard
                    key={idx}
                    title={title}
                    description={description}
                    prizes={prizes}
                    organization={organization}
                    expanded={expandedChallenge === idx}
                    onToggle={() => setExpandedChallenge(expandedChallenge === idx ? null : idx)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const protocol = context.req.headers.referer?.split('://')[0] || 'http';
  const baseUrl = `${protocol}://${context.req.headers.host}`;

  const safe = async <T,>(fn: () => Promise<{ data: T }>): Promise<T | []> => {
    try {
      const res = await fn();
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  };

  const [announcements, scheduleEvents, challenges] = await Promise.all([
    safe<Announcement[]>(() => RequestHelper.get(`${baseUrl}/api/announcements/`, {})),
    safe<ScheduleEvent[]>(() => RequestHelper.get(`${baseUrl}/api/schedule/`, {})),
    safe<Challenge[]>(() => RequestHelper.get(`${baseUrl}/api/challenges/`, {})),
  ]);

  return { props: { announcements, scheduleEvents, challenges } };
};
