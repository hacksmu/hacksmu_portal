import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../lib/user/AuthContext';
import { hackPortalConfig } from '../hackportal.config';

const linkPattern = /(https?:\/\/[^\s)]+)/g;

function renderTextWithLinks(text: string) {
  const parts = text.split(linkPattern);

  return parts.map((part, idx) => {
    if (!part.match(linkPattern)) {
      return <React.Fragment key={`${part}-${idx}`}>{part}</React.Fragment>;
    }

    return (
      <a
        key={`${part}-${idx}`}
        href={part}
        target="_blank"
        rel="noreferrer"
        onClick={(event) => event.stopPropagation()}
        style={{ color: '#8fd3ff', textDecoration: 'underline' }}
      >
        {part}
      </a>
    );
  });
}

function getRegistrationTimestamp(value: any) {
  if (typeof value === 'number') {
    return value < 1_000_000_000_000 ? value * 1000 : value;
  }

  if (typeof value === 'string') {
    const numericValue = Number(value);
    if (!Number.isNaN(numericValue) && value.trim() !== '') {
      return numericValue < 1_000_000_000_000 ? numericValue * 1000 : numericValue;
    }

    const parsedValue = Date.parse(value);
    if (!Number.isNaN(parsedValue)) {
      return parsedValue;
    }
  }

  return NaN;
}

export default function MlhConsentModal() {
  const { isSignedIn, hasProfile, user, profile, updateProfile } = useAuthContext();
  const [mlhConsentSelection, setMlhConsentSelection] = useState<string[]>([]);
  const [showMlhConsentModal, setShowMlhConsentModal] = useState(false);
  const [savingMlhConsent, setSavingMlhConsent] = useState(false);
  const [mlhConsentError, setMlhConsentError] = useState<string | null>(null);

  const mlhConsentQuestion = hackPortalConfig.registrationFields.eventInfoQuestions
    .flatMap((section) => section.checkboxQuestions ?? [])
    .find((question) => question.name === 'mlhConsent');

  const handleMlhConsentToggle = (optionValue: string) => {
    setMlhConsentError(null);
    setMlhConsentSelection((current) =>
      current.includes(optionValue)
        ? current.filter((value) => value !== optionValue)
        : [...current, optionValue],
    );
  };

  const handleSaveMlhConsent = async () => {
    if (!mlhConsentQuestion || !user || !profile) return;

    const missingRequiredOptions = mlhConsentQuestion.options.filter(
      (option) => option.required && !mlhConsentSelection.includes(option.value),
    );

    if (missingRequiredOptions.length > 0) {
      setMlhConsentError(
        missingRequiredOptions.length === 1
          ? `Please accept: ${missingRequiredOptions[0].title}`
          : `Please accept: ${missingRequiredOptions.map((option) => option.title).join(', ')}`,
      );
      return;
    }

    setSavingMlhConsent(true);
    setMlhConsentError(null);

    try {
      const { default: firebase } = await import('firebase/app');
      const token = await firebase.auth().currentUser.getIdToken();
      const response = await fetch(`/api/applications/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ mlhConsent: mlhConsentSelection }),
      });

      if (response.status !== 200) {
        setMlhConsentError('Could not save your MLH consent choices. Please try again.');
        return;
      }

      updateProfile({ ...profile, mlhConsent: mlhConsentSelection });
      setShowMlhConsentModal(false);
    } catch (error) {
      console.error(error);
      setMlhConsentError('Could not save your MLH consent choices. Please try again.');
    } finally {
      setSavingMlhConsent(false);
    }
  };

  const registrationTimestamp = getRegistrationTimestamp(
    (profile as any)?.registrationCreatedAt ?? (profile as any)?.timestamp,
  );
  const mlhConsentValues = Array.isArray((profile as any)?.mlhConsent)
    ? (profile as any).mlhConsent
    : [];
  const requiredMlhOptions =
    mlhConsentQuestion?.options.filter((option) => option.required).map((option) => option.value) ?? [];
  const cutoffTimestamp = new Date('2024-10-07T00:00:00').getTime();
  const shouldShowMlhConsentPrompt =
    isSignedIn &&
    hasProfile &&
    !!mlhConsentQuestion &&
    !!profile &&
    !Number.isNaN(registrationTimestamp) &&
    registrationTimestamp >= cutoffTimestamp &&
    requiredMlhOptions.some((value) => !mlhConsentValues.includes(value));

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    console.log('[MLH modal]', {
      isSignedIn,
      hasProfile,
      registrationCreatedAt: (profile as any)?.registrationCreatedAt,
      timestamp: (profile as any)?.timestamp,
      registrationTimestamp,
      cutoffTimestamp,
      mlhConsentValues,
      requiredMlhOptions,
      shouldShowMlhConsentPrompt,
    });
  }, [
    cutoffTimestamp,
    hasProfile,
    isSignedIn,
    mlhConsentValues,
    profile,
    registrationTimestamp,
    requiredMlhOptions,
    shouldShowMlhConsentPrompt,
  ]);

  useEffect(() => {
    if (!mlhConsentQuestion) return;

    const nextMlhConsentValues = Array.isArray((profile as any)?.mlhConsent)
      ? (profile as any).mlhConsent
      : [];

    setMlhConsentSelection(nextMlhConsentValues);
    setShowMlhConsentModal(shouldShowMlhConsentPrompt);
  }, [shouldShowMlhConsentPrompt, mlhConsentQuestion, profile]);

  if (!showMlhConsentModal || !mlhConsentQuestion) {
    return null;
  }

  return (
    <div style={modalBackdropStyle}>
      <div className="glass-panel" style={modalCardStyle}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>MLH Consent Update</div>
        <div style={{ marginTop: 10, color: 'rgba(210,235,255,0.88)', lineHeight: 1.5, fontSize: 14 }}>
          {mlhConsentQuestion.question}
        </div>
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mlhConsentQuestion.options.map((option) => {
            const checked = mlhConsentSelection.includes(option.value);

            return (
              <label key={option.value} style={modalCheckboxRowStyle}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleMlhConsentToggle(option.value)}
                />
                <span style={{ color: 'rgba(240,248,255,0.96)', lineHeight: 1.45, fontSize: 14 }}>
                  {renderTextWithLinks(option.title)}
                  {option.required ? ' *' : ''}
                </span>
              </label>
            );
          })}
        </div>
        {mlhConsentError && (
          <div style={{ marginTop: 14, color: '#ff9090', fontSize: 13, fontWeight: 600 }}>
            {mlhConsentError}
          </div>
        )}
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSaveMlhConsent}
            disabled={savingMlhConsent}
            className="aero-btn"
            style={{ opacity: savingMlhConsent ? 0.7 : 1, cursor: savingMlhConsent ? 'wait' : 'pointer' }}
          >
            {savingMlhConsent ? 'Saving...' : 'Save and continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

const modalBackdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(5, 16, 36, 0.72)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  zIndex: 1000,
};

const modalCardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 760,
  padding: 28,
  borderRadius: 18,
};

const modalCheckboxRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 10,
};
