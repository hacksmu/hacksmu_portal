import { useState } from 'react';

interface FaqDisclosureProps {
  question: string;
  answer: string | string[] | { type: string; text: string; url: string }[];
  isOpen: boolean;
  toggleDisclosure: () => void;
}

export default function FaqDisclosure({
  question,
  answer,
  isOpen,
  toggleDisclosure,
}: FaqDisclosureProps) {
  return (
    <div className="faq-item">
      <button className="faq-question-btn" onClick={toggleDisclosure}>
        <span className="faq-question-text">{question}</span>
        <svg
          className={`faq-chevron${isOpen ? ' open' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div className={`faq-answer-panel${isOpen ? ' open' : ''}`}>
        <div className="faq-answer-text">
          {typeof answer === 'string' ? (
            answer
          ) : Array.isArray(answer) ? (
            (answer as any[]).map((section: any, index: number) => {
              if (section?.type === 'link') {
                return (
                  <a
                    key={index}
                    href={section.url}
                    style={{ color: 'rgba(80,200,255,0.95)', textDecoration: 'underline' }}
                  >
                    {section.text}
                  </a>
                );
              } else if (section?.type === 'plaintext') {
                return <span key={index}>{section.text}</span>;
              }
              return null;
            })
          ) : null}
        </div>
      </div>
    </div>
  );
}
