import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/adminComponents/AdminHeader';
import ErrorList from '../../components/ErrorList';
import EventDetailLink from '../../components/adminComponents/eventComponents/EventDetailLink';
import PendingQuestion from '../../components/dashboardComponents/PendingQuestion';
import SuccessCard from '../../components/adminComponents/SuccessCard';
import { RequestHelper } from '../../lib/request-helper';
import { useAuthContext } from '../../lib/user/AuthContext';
import { QADocument } from '../api/questions';

const glassPanel: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(100,160,255,0.08) 100%)',
  backdropFilter: 'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.26)',
  borderRadius: 18,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 6px 28px rgba(0,20,70,0.24)',
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'Orbitron', 'Roboto', sans-serif",
        fontSize: 17,
        fontWeight: 800,
        color: '#e0f0ff',
        letterSpacing: '0.05em',
        marginBottom: 14,
        paddingBottom: 8,
        borderBottom: '1px solid rgba(255,255,255,0.14)',
        textShadow: '0 0 10px rgba(0,180,255,0.40)',
      }}
    >
      {children}
    </div>
  );
}

export function isAuthorized(user): boolean {
  if (!user || !user.permissions) return false;
  return (
    (user.permissions as string[]).includes('admin') ||
    (user.permissions as string[]).includes('organizer') ||
    (user.permissions as string[]).includes('super_admin')
  );
}

/**
 * The main page of Admin Console.
 *
 * Route: /admin
 */
export default function Admin() {
  const { user, isSignedIn } = useAuthContext();

  const [announcement, setAnnouncement] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [questions, setQuestions] = useState<QADocument[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const addError = (errMsg: string) => {
    setErrors((prev) => [...prev, errMsg]);
  };

  const postAnnouncement = async () => {
    if (!user.permissions.includes('super_admin')) {
      alert('You do not have permission to perform this functionality');
      return;
    }
    try {
      await RequestHelper.post<Announcement, void>(
        '/api/announcements',
        {
          headers: {
            Authorization: user.token,
          },
        },
        {
          announcement,
        },
      );

      setShowSuccessMsg(true);
      setTimeout(() => {
        setShowSuccessMsg(false);
      }, 2000);
      setAnnouncement('');
    } catch (error) {
      addError('Failed to post announcement! Please try again later');
      console.log(error);
    }
  };

  useEffect(() => {
    async function loadPendingQuestions() {
      if (!user?.token || !isAuthorized(user)) {
        setLoadingQuestions(false);
        return;
      }

      try {
        const { data } = await RequestHelper.get<QADocument[]>('/api/questions/pending', {
          headers: {
            Authorization: user.token,
          },
        });
        setQuestions(data ?? []);
      } catch (error) {
        addError('Failed to load pending questions.');
      } finally {
        setLoadingQuestions(false);
      }
    }

    loadPendingQuestions();
  }, [user]);

  if (!isSignedIn || !isAuthorized(user))
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#c8e8ff',
          fontSize: 22,
          fontFamily: "'Orbitron', sans-serif",
          textShadow: '0 0 16px rgba(0,180,255,0.5)',
        }}
      >
        Unauthorized
      </div>
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Head>
        <title>HackPortal - Admin</title>
        <meta name="description" content="HackPortal's Admin Page" />
      </Head>
      <AdminHeader />

      <div style={{ padding: '24px 28px 48px', maxWidth: 1040, width: '100%', margin: '0 auto' }}>
        <div
          style={{
            ...glassPanel,
            padding: '20px 24px',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Orbitron', 'Roboto', sans-serif",
                fontSize: 24,
                fontWeight: 900,
                color: '#fff',
                textShadow: '0 0 18px rgba(0,200,255,0.6)',
                letterSpacing: '0.04em',
              }}
            >
              Event Dashboard
            </div>
            <div style={{ marginTop: 8, color: 'rgba(200,232,255,0.78)', fontSize: 14 }}>
              Review pending questions, manage judge applications, and coordinate event operations.
            </div>
          </div>
          <div
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 18,
              background: 'rgba(96,200,255,0.16)',
              border: '1px solid rgba(96,200,255,0.36)',
              color: '#80d8ff',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {user.permissions[0]?.replace('_', ' ') ?? 'admin'}
          </div>
        </div>

        {user.permissions.includes('super_admin') && (
          <div style={{ ...glassPanel, padding: '24px 28px', marginBottom: 24 }}>
          <ErrorList
            errors={errors}
            onClose={(idx: number) => {
              const newErrorList = [...errors];
              newErrorList.splice(idx, 1);
              setErrors(newErrorList);
            }}
          />
          {showSuccessMsg && (
            <div style={{ marginBottom: 14 }}>
              <SuccessCard msg="Announcement posted successfully" />
            </div>
          )}
          <SectionTitle>Post Announcement</SectionTitle>
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.18)',
              color: '#e8f4ff',
              lineHeight: 1.6,
            }}
            placeholder="Type your announcement here"
            rows={5}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button
              type="button"
              className="aero-btn"
              style={{ fontSize: 14, padding: '10px 18px' }}
              onClick={() => {
                postAnnouncement();
              }}
            >
              Post
            </button>
          </div>
          </div>
        )}

        <div style={{ ...glassPanel, padding: '24px 28px', marginBottom: 24 }}>
          <SectionTitle>Pending Questions</SectionTitle>
          {loadingQuestions ? (
            <div style={{ color: 'rgba(200,232,255,0.72)', paddingTop: 8 }}>Loading pending questions...</div>
          ) : questions.length === 0 ? (
            <div style={{ color: 'rgba(200,232,255,0.72)', paddingTop: 8 }}>No pending questions right now.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {questions.map((question, idx) => (
                <Link key={idx} passHref href={`/admin/resolve/${question.id}`}>
                  <a style={{ textDecoration: 'none' }}>
                    <PendingQuestion key={idx} question={question.question} />
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div style={{ ...glassPanel, padding: '24px 28px', marginBottom: 24 }}>
          <SectionTitle>Judge Applications</SectionTitle>
          <div style={{ paddingTop: 4 }}>
            <EventDetailLink title="Review Judge Applications" href="/admin/judge-applications" />
          </div>
        </div>

        {user.permissions[0] === 'super_admin' && (
          <div style={{ ...glassPanel, padding: '24px 28px' }}>
            <SectionTitle>Event Details</SectionTitle>
            <div style={{ paddingTop: 4 }}>
              <EventDetailLink title="View Events" href="/admin/events" />
              <EventDetailLink title="View Challenges" href="/admin/challenges" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
