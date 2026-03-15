import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/adminComponents/AdminHeader';
import { useAuthContext } from '../../lib/user/AuthContext';

const glassPanel: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(100,160,255,0.08) 100%)',
  backdropFilter: 'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.26)',
  borderRadius: 18,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 6px 28px rgba(0,20,70,0.24)',
};

function statusPillStyle(status: JudgeApplication['status']): React.CSSProperties {
  if (status === 'accepted') {
    return {
      background: 'rgba(90,220,130,0.16)',
      border: '1px solid rgba(90,220,130,0.36)',
      color: '#9af0b0',
    };
  }
  if (status === 'rejected') {
    return {
      background: 'rgba(255,120,120,0.16)',
      border: '1px solid rgba(255,120,120,0.36)',
      color: '#ffb0b0',
    };
  }
  if (status === 'reviewing') {
    return {
      background: 'rgba(255,200,90,0.16)',
      border: '1px solid rgba(255,200,90,0.36)',
      color: '#ffd58e',
    };
  }
  return {
    background: 'rgba(96,200,255,0.16)',
    border: '1px solid rgba(96,200,255,0.36)',
    color: '#80d8ff',
  };
}

function actionButtonStyle(tone: 'blue' | 'green' | 'red'): React.CSSProperties {
  const tones = {
    blue: {
      background: 'linear-gradient(135deg, rgba(129,218,255,0.26) 0%, rgba(46,127,255,0.18) 100%)',
      border: '1px solid rgba(129,218,255,0.34)',
      color: '#dff4ff',
    },
    green: {
      background: 'linear-gradient(135deg, rgba(102,236,155,0.22) 0%, rgba(50,160,110,0.16) 100%)',
      border: '1px solid rgba(102,236,155,0.30)',
      color: '#dfffea',
    },
    red: {
      background: 'linear-gradient(135deg, rgba(255,146,146,0.22) 0%, rgba(184,58,58,0.14) 100%)',
      border: '1px solid rgba(255,146,146,0.30)',
      color: '#ffe6e6',
    },
  };

  return {
    padding: '10px 14px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.02em',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
    ...tones[tone],
  };
}

type JudgeApplication = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    preferredEmail: string;
  };
  contactEmail: string;
  organization: string;
  roleTitle: string;
  judgingExperience: string;
  expertiseAreas: string[];
  portfolioLinks?: string;
  whyJudge: string;
  availability: string[];
  resumeUrl: string;
  status: 'submitted' | 'reviewing' | 'accepted' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
};

function isAuthorized(user): boolean {
  if (!user || !user.permissions) return false;
  return (
    (user.permissions as string[]).includes('admin') ||
    (user.permissions as string[]).includes('organizer') ||
    (user.permissions as string[]).includes('super_admin')
  );
}

export default function JudgeApplicationsPage() {
  const { user, isSignedIn } = useAuthContext();
  const [applications, setApplications] = useState<JudgeApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reviewNotesById, setReviewNotesById] = useState<Record<string, string>>({});
  const [reviewErrorsById, setReviewErrorsById] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadApplications() {
      if (!user?.token || !isAuthorized(user)) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/judge-applications', {
          headers: {
            Authorization: user.token,
          },
        });
        const data = await response.json();
        setApplications(Array.isArray(data) ? data : []);
        if (Array.isArray(data)) {
          setReviewNotesById(
            data.reduce((acc, application) => {
              acc[application.user.id] = application.reviewNotes ?? '';
              return acc;
            }, {}),
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, [user]);

  const updateStatus = async (applicationId: string, status: JudgeApplication['status']) => {
    if (!user?.token) return;

    const reviewNotes = (reviewNotesById[applicationId] ?? '').trim();

    if ((status === 'accepted' || status === 'rejected') && !reviewNotes) {
      setReviewErrorsById((prev) => ({
        ...prev,
        [applicationId]: 'Review comments are required before accepting or rejecting this application.',
      }));
      return;
    }

    setUpdatingId(applicationId);
    setReviewErrorsById((prev) => ({ ...prev, [applicationId]: '' }));
    try {
      const response = await fetch(`/api/judge-applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          Authorization: user.token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, reviewNotes }),
      });

      if (response.status !== 200) {
        const data = await response.json().catch(() => null);
        setReviewErrorsById((prev) => ({
          ...prev,
          [applicationId]: data?.msg ?? 'We could not update this application right now.',
        }));
        return;
      }

      setApplications((prev) =>
        prev.map((application) =>
          application.user.id === applicationId
            ? {
                ...application,
                status,
                reviewNotes,
                reviewedAt: new Date().toISOString(),
              }
            : application,
        ),
      );
    } catch (error) {
      console.error(error);
      setReviewErrorsById((prev) => ({
        ...prev,
        [applicationId]: 'We could not update this application right now.',
      }));
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isSignedIn || !isAuthorized(user)) {
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
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Head>
        <title>HackPortal - Judge Applications</title>
        <meta name="description" content="Review judge applications" />
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
              Judge Applications
            </div>
            <div style={{ marginTop: 8, color: 'rgba(200,232,255,0.78)', fontSize: 14 }}>
              Review incoming judge applications, inspect resumes, and update applicant status.
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
            reviewer
          </div>
        </div>

        {loading ? (
          <div style={{ ...glassPanel, padding: '24px 28px', color: 'rgba(200,232,255,0.72)' }}>
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div style={{ ...glassPanel, padding: '24px 28px', color: 'rgba(200,232,255,0.72)' }}>
            No judge applications yet.
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.user.id}
                style={{
                  ...glassPanel,
                  padding: '22px 24px',
                  color: '#e8f4ff',
                }}
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <div className="font-bold text-lg" style={{ color: '#fff' }}>
                      {application.user.firstName} {application.user.lastName}
                    </div>
                    <div className="text-sm" style={{ color: 'rgba(200,232,255,0.82)' }}>
                      {application.contactEmail}
                    </div>
                    <div className="text-sm" style={{ color: 'rgba(200,232,255,0.82)' }}>
                      {application.roleTitle} at {application.organization}
                    </div>
                  </div>
                  <div className="text-sm" style={{ color: 'rgba(200,232,255,0.82)' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '4px 12px',
                        borderRadius: 18,
                        textTransform: 'uppercase',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        ...statusPillStyle(application.status),
                      }}
                    >
                      {application.status}
                    </div>
                    {application.submittedAt && (
                      <div style={{ marginTop: 10 }}>
                        Submitted: {new Date(application.submittedAt).toLocaleString()}
                      </div>
                    )}
                    {application.reviewedAt && (
                      <div style={{ marginTop: 6 }}>
                        Reviewed: {new Date(application.reviewedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 text-sm" style={{ color: 'rgba(220,240,255,0.88)' }}>
                  <strong style={{ color: '#fff' }}>Judging experience:</strong>{' '}
                  {application.judgingExperience}
                </div>
                <div className="mt-2 text-sm" style={{ color: 'rgba(220,240,255,0.88)' }}>
                  <strong style={{ color: '#fff' }}>Expertise:</strong>{' '}
                  {application.expertiseAreas.join(', ')}
                </div>
                <div
                  className="mt-2 text-sm whitespace-pre-wrap"
                  style={{ color: 'rgba(220,240,255,0.88)' }}
                >
                  <strong style={{ color: '#fff' }}>Why judge:</strong> {application.whyJudge}
                </div>
                <div className="mt-2 text-sm" style={{ color: 'rgba(220,240,255,0.88)' }}>
                  <strong style={{ color: '#fff' }}>Availability:</strong>{' '}
                  {application.availability.join(' | ')}
                </div>
                {application.portfolioLinks && (
                  <div
                    className="mt-2 text-sm whitespace-pre-wrap"
                    style={{ color: 'rgba(220,240,255,0.88)' }}
                  >
                    <strong style={{ color: '#fff' }}>Links:</strong> {application.portfolioLinks}
                  </div>
                )}
                <div className="mt-4">
                  <div
                    style={{
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      marginBottom: 8,
                    }}
                  >
                    Review Comments
                  </div>
                  <textarea
                    rows={4}
                    value={reviewNotesById[application.user.id] ?? ''}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      setReviewNotesById((prev) => ({
                        ...prev,
                        [application.user.id]: nextValue,
                      }));
                      setReviewErrorsById((prev) => ({
                        ...prev,
                        [application.user.id]: '',
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      color: '#e8f4ff',
                      lineHeight: 1.6,
                      resize: 'vertical',
                    }}
                    placeholder="Leave review comments here. Required before accepting or rejecting."
                  />
                  {reviewErrorsById[application.user.id] && (
                    <div style={{ color: '#ff9a9a', fontSize: 13, marginTop: 8 }}>
                      {reviewErrorsById[application.user.id]}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-3 items-center">
                  <a
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: '#9ee7ff',
                      textDecoration: 'underline',
                      fontWeight: 700,
                    }}
                  >
                    View Resume
                  </a>
                  <button
                    type="button"
                    style={actionButtonStyle('blue')}
                    onClick={() => updateStatus(application.user.id, 'reviewing')}
                    disabled={updatingId === application.user.id}
                  >
                    Save Review / Mark Reviewing
                  </button>
                  <button
                    type="button"
                    style={actionButtonStyle('green')}
                    onClick={() => updateStatus(application.user.id, 'accepted')}
                    disabled={updatingId === application.user.id}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    style={actionButtonStyle('red')}
                    onClick={() => updateStatus(application.user.id, 'rejected')}
                    disabled={updatingId === application.user.id}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
