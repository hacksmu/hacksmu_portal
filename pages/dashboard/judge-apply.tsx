import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { Field, Form, Formik, ErrorMessage } from 'formik';
import DashboardHeader from '../../components/dashboardComponents/DashboardHeader';
import { useAuthContext } from '../../lib/user/AuthContext';
import LoadIcon from '../../components/LoadIcon';
import { getFileExtension } from '../../lib/util';

const glassPanel: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(100,160,255,0.08) 100%)',
  backdropFilter: 'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.26)',
  borderRadius: 18,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 6px 28px rgba(0,20,70,0.24)',
};

const expertiseOptions = [
  'Frontend',
  'Backend',
  'AI / ML',
  'Data Science',
  'Product / UX',
  'Mobile',
  'Hardware',
  'Entrepreneurship',
];

const availabilityOptions = [
  'I can attend judge orientation on Saturday, April 12th from 11:00 AM to 12:00 PM.',
  'I can participate in the full judging process on Saturday, April 12th from 1:00 PM to 5:00 PM.',
  'I can review projects fairly using the judging rubric.',
  'I am comfortable giving constructive feedback to student teams.',
];

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
  portfolioLinks: string;
  whyJudge: string;
  availability: string[];
  resumeUrl: string;
  status?: string;
  submittedAt?: string;
};

export default function JudgeApplyPage() {
  const { isSignedIn, user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [existingApplication, setExistingApplication] = useState<JudgeApplication | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>(
    'idle',
  );

  const initialValues = useMemo(
    () => ({
      contactEmail: user?.preferredEmail || '',
      organization: '',
      roleTitle: '',
      judgingExperience: '',
      expertiseAreas: [] as string[],
      portfolioLinks: '',
      whyJudge: '',
      availability: [] as string[],
      resumeUrl: '',
    }),
    [user],
  );

  useEffect(() => {
    async function loadApplication() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { default: firebase } = await import('firebase/app');
        const token = await firebase.auth().currentUser?.getIdToken();

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/judge-applications/${user.id}`, {
          method: 'GET',
          headers: { Authorization: token },
        });

        if (response.status === 200) {
          const data = await response.json();
          setExistingApplication(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, [user]);

  if (!isSignedIn) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#c8e8ff',
          fontSize: 20,
          fontFamily: "'Orbitron', sans-serif",
          textShadow: '0 0 16px rgba(0,180,255,0.5)',
        }}
      >
        Please sign in to apply as a judge
      </div>
    );
  }

  if (loading) {
    return <LoadIcon width={160} height={160} />;
  }

  const validate = (values) => {
    const errors: Record<string, string> = {};

    if (!values.contactEmail) errors.contactEmail = 'Required';
    if (!values.organization) errors.organization = 'Required';
    if (!values.roleTitle) errors.roleTitle = 'Required';
    if (!values.judgingExperience) errors.judgingExperience = 'Required';
    if (values.expertiseAreas.length === 0) errors.expertiseAreas = 'Select at least one area';
    if (!values.whyJudge) errors.whyJudge = 'Required';
    if (values.availability.length !== availabilityOptions.length) {
      errors.availability = 'Please confirm all judge availability and expectations checkboxes';
    }
    if (!resumeFile) errors.resumeUrl = 'Resume upload is required';
    if (
      values.contactEmail &&
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.contactEmail)
    ) {
      errors.contactEmail = 'Invalid email address';
    }

    return errors;
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length !== 1) {
      setResumeError('Please upload exactly one resume file.');
      setResumeFile(null);
      return;
    }

    const file = e.target.files[0];
    const fileExtension = getFileExtension(file.name);
    const accepted = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.txt', '.rtf'];

    if (!accepted.includes(fileExtension)) {
      setResumeError(`Accepted file types: ${accepted.join(' ')}`);
      setResumeFile(null);
      return;
    }

    setResumeError(null);
    setResumeFile(file);
  };

  const renderCheckboxGroup = (name: string, options: string[]) => (
    <div role="group" aria-labelledby={`${name}-group`} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
      {options.map((option) => (
        <label key={option} style={{ color: 'rgba(220,240,255,0.92)', fontSize: 14 }}>
          <Field type="checkbox" name={name} value={option} />
          <span style={{ marginLeft: 8 }}>{option}</span>
        </label>
      ))}
      <ErrorMessage name={name} render={(msg) => <div style={{ color: '#ff9090', fontSize: 13 }}>{msg}</div>} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '24px 28px 48px', maxWidth: 900, margin: '0 auto' }}>
      <Head>
        <title>HackSMU — Judge Application</title>
        <meta name="description" content="Apply to be a judge for HackSMU VII" />
      </Head>

      <DashboardHeader />

      <div style={{ ...glassPanel, padding: '24px 28px', marginBottom: 24 }}>
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
          Judge Application
        </div>
        <div style={{ marginTop: 10, color: 'rgba(200,232,255,0.78)', lineHeight: 1.6, fontSize: 14 }}>
          Apply to help evaluate projects, give feedback to teams, and support the event during judging.
        </div>
      </div>

      {existingApplication ? (
        <div style={{ ...glassPanel, padding: '24px 28px' }}>
          <div style={{ color: '#40ff9a', fontWeight: 800, fontSize: 18 }}>Application submitted</div>
          <div style={{ marginTop: 12, color: 'rgba(220,240,255,0.88)', lineHeight: 1.7 }}>
            We already have your judge application on file.
          </div>
          <div style={{ marginTop: 16, color: 'rgba(200,232,255,0.78)', fontSize: 14 }}>
            Status: <strong>{existingApplication.status ?? 'submitted'}</strong>
          </div>
          {existingApplication.submittedAt && (
            <div style={{ marginTop: 6, color: 'rgba(200,232,255,0.68)', fontSize: 13 }}>
              Submitted: {new Date(existingApplication.submittedAt).toLocaleString()}
            </div>
          )}
          <div style={{ marginTop: 22 }}>
            <Link href="/dashboard">
              <a className="aero-btn" style={{ fontSize: 14, padding: '9px 18px', textDecoration: 'none' }}>
                Back to Dashboard
              </a>
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ ...glassPanel, padding: '24px 28px' }}>
          <Formik
            initialValues={initialValues}
            enableReinitialize
            validate={validate}
            onSubmit={async (values) => {
              setSubmitStatus('submitting');

              try {
                const { default: firebase } = await import('firebase/app');
                const token = await firebase.auth().currentUser?.getIdToken();

                if (!token) {
                  setSubmitStatus('error');
                  return;
                }

                if (!resumeFile) {
                  setResumeError('Resume upload is required');
                  setSubmitStatus('error');
                  return;
                }

                const formData = new FormData();
                formData.append('resume', resumeFile);
                formData.append('fileName', `${user.id}${getFileExtension(resumeFile.name)}`);
                formData.append('userId', user.id);

                const resumeResponse = await fetch('/api/judge-applications/resume-upload', {
                  method: 'POST',
                  body: formData,
                });

                if (resumeResponse.status !== 200) {
                  setResumeError('We could not upload your resume. Please try again.');
                  setSubmitStatus('error');
                  return;
                }

                const { resumeUrl } = await resumeResponse.json();

                const response = await fetch('/api/judge-applications', {
                  method: 'POST',
                  headers: {
                    Authorization: token,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    ...values,
                    resumeUrl,
                    user: {
                      id: user.id,
                      firstName: user.firstName || '',
                      lastName: user.lastName || '',
                      preferredEmail: user.preferredEmail || '',
                    },
                  }),
                });

                if (response.status !== 200) {
                  setSubmitStatus('error');
                  return;
                }

                const nextApplication = {
                  ...values,
                  resumeUrl,
                  user: {
                    id: user.id,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    preferredEmail: user.preferredEmail || '',
                  },
                  status: 'submitted',
                  submittedAt: new Date().toISOString(),
                };

                setExistingApplication(nextApplication);
                setSubmitStatus('success');
              } catch (error) {
                console.error(error);
                setSubmitStatus('error');
              }
            }}
          >
            <Form style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={labelStyle}>Contact Email *</label>
                <Field name="contactEmail" style={inputStyle} />
                <ErrorMessage name="contactEmail" render={(msg) => <div style={errorStyle}>{msg}</div>} />
              </div>

              <div style={twoColumnStyle}>
                <div>
                  <label style={labelStyle}>Organization or School *</label>
                  <Field name="organization" style={inputStyle} />
                  <ErrorMessage name="organization" render={(msg) => <div style={errorStyle}>{msg}</div>} />
                </div>

                <div>
                  <label style={labelStyle}>Role / Title *</label>
                  <Field name="roleTitle" style={inputStyle} />
                  <ErrorMessage name="roleTitle" render={(msg) => <div style={errorStyle}>{msg}</div>} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Judging Experience *</label>
                <Field as="select" name="judgingExperience" style={inputStyle}>
                  <option value="">Select one</option>
                  <option value="first-time">First time judging</option>
                  <option value="some">1-2 hackathons judged before</option>
                  <option value="experienced">3+ hackathons judged before</option>
                </Field>
                <ErrorMessage name="judgingExperience" render={(msg) => <div style={errorStyle}>{msg}</div>} />
              </div>

              <div>
                <label style={labelStyle}>Areas of Expertise *</label>
                {renderCheckboxGroup('expertiseAreas', expertiseOptions)}
              </div>

              <div>
                <label style={labelStyle}>Portfolio / LinkedIn / Website</label>
                <Field
                  name="portfolioLinks"
                  as="textarea"
                  rows={3}
                  style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                  placeholder="Share links that help us understand your background."
                />
              </div>

              <div>
                <label style={labelStyle}>Resume Upload *</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.rtf"
                  onChange={handleResumeFileChange}
                  style={{ ...inputStyle, padding: '10px 12px' }}
                />
                {resumeFile && !resumeError && (
                  <div style={{ color: 'rgba(200,232,255,0.78)', fontSize: 13, marginTop: 8 }}>
                    Selected: {resumeFile.name}
                  </div>
                )}
                {(resumeError || submitStatus === 'error') && (
                  <div style={errorStyle}>{resumeError}</div>
                )}
                <ErrorMessage name="resumeUrl" render={(msg) => <div style={errorStyle}>{msg}</div>} />
              </div>

              <div>
                <label style={labelStyle}>Why do you want to judge at HackSMU VII? *</label>
                <Field
                  name="whyJudge"
                  as="textarea"
                  rows={5}
                  style={{ ...inputStyle, minHeight: 140, resize: 'vertical' }}
                  placeholder="Tell us about your background and how you'd support teams."
                />
                <ErrorMessage name="whyJudge" render={(msg) => <div style={errorStyle}>{msg}</div>} />
              </div>

              <div>
                <label style={labelStyle}>Availability and Expectations *</label>
                {renderCheckboxGroup('availability', availabilityOptions)}
              </div>

              {submitStatus === 'error' && (
                <div style={{ color: '#ff9090', fontSize: 13, fontWeight: 700 }}>
                  We could not submit your application. Please try again.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <Link href="/dashboard">
                  <a style={{ color: 'rgba(200,232,255,0.78)', textDecoration: 'none', fontWeight: 700 }}>
                    Cancel
                  </a>
                </Link>
                <button
                  type="submit"
                  className="aero-btn"
                  style={{ fontSize: 14, padding: '10px 18px' }}
                  disabled={submitStatus === 'submitting'}
                >
                  {submitStatus === 'submitting' ? 'Submitting…' : 'Submit Judge Application'}
                </button>
              </div>
            </Form>
          </Formik>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: 'rgba(220,240,255,0.94)',
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '0.04em',
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.20)',
  color: '#e8f4ff',
  fontSize: 14,
  lineHeight: 1.5,
  boxSizing: 'border-box',
};

const errorStyle: React.CSSProperties = {
  color: '#ff9090',
  fontSize: 13,
  marginTop: 6,
};

const twoColumnStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 18,
};
