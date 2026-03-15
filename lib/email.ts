type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const RESEND_API_URL = 'https://api.resend.com/emails';

function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(message: EmailMessage): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn('Email delivery skipped because RESEND_API_KEY or EMAIL_FROM is not configured.');
    return false;
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Failed to send email', errorBody);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error while sending email', error);
    return false;
  }
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildAnsweredQuestionEmail(question: string, answer: string) {
  const safeQuestion = escapeHtml(question);
  const safeAnswer = escapeHtml(answer);

  return {
    subject: 'HackSMU: Your question has been answered',
    text: `Your HackSMU question has been answered.\n\nQuestion:\n${question}\n\nAnswer:\n${answer}\n`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #102040;">
        <h2 style="margin-bottom: 16px;">Your HackSMU question has been answered</h2>
        <p>One of the organizers replied to your question.</p>
        <div style="margin: 20px 0; padding: 16px; border-radius: 12px; background: #f4f9ff; border: 1px solid #d4e9ff;">
          <p style="margin: 0 0 8px;"><strong>Question</strong></p>
          <p style="margin: 0;">${safeQuestion}</p>
        </div>
        <div style="margin: 20px 0; padding: 16px; border-radius: 12px; background: #f4f9ff; border: 1px solid #d4e9ff;">
          <p style="margin: 0 0 8px;"><strong>Answer</strong></p>
          <p style="margin: 0; white-space: pre-wrap;">${safeAnswer}</p>
        </div>
        <p>If you still need help, you can ask another question from your dashboard.</p>
      </div>
    `,
  };
}

export function buildJudgeStatusEmail(status: string) {
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

  return {
    subject: `HackSMU: Your judge application is now ${statusLabel}`,
    text: `Your HackSMU judge application status has been updated to: ${statusLabel}.\n\nYou can sign in to the portal to review your application details.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #102040;">
        <h2 style="margin-bottom: 16px;">Judge application update</h2>
        <p>Your HackSMU judge application status has been updated.</p>
        <div style="display: inline-block; margin: 16px 0; padding: 10px 16px; border-radius: 999px; background: #edf7ff; border: 1px solid #cce7ff; font-weight: 700;">
          ${escapeHtml(statusLabel)}
        </div>
        <p>You can sign in to the portal if you want to review your application details.</p>
      </div>
    `,
  };
}

export function buildRejectedJudgeStatusEmail(reviewNotes: string) {
  const safeReviewNotes = escapeHtml(reviewNotes);

  return {
    subject: 'HackSMU: Update on your judge application',
    text: `Thank you for applying to judge at HackSMU.\n\nAt this time, we are not moving forward with your application.\n\nFeedback from the review:\n${reviewNotes}\n`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #102040;">
        <h2 style="margin-bottom: 16px;">Judge application update</h2>
        <p>Thank you for applying to judge at HackSMU. At this time, we are not moving forward with your application.</p>
        <div style="margin: 20px 0; padding: 16px; border-radius: 12px; background: #fff4f4; border: 1px solid #ffd1d1;">
          <p style="margin: 0 0 8px;"><strong>Feedback from the review</strong></p>
          <p style="margin: 0; white-space: pre-wrap;">${safeReviewNotes}</p>
        </div>
      </div>
    `,
  };
}
