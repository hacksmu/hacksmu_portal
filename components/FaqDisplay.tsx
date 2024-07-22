import { useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface FaqDisplayProps {
  faqs: AnsweredQuestion[] | { question: string; answer: string[] }[] | any[];
}

const FaqDisplay = ({ faqs }: FaqDisplayProps) => {
  const [activeFaq, setActiveFaq] = useState(0);

  return (
    <div className="w-full z-20 bg-dark-blue p-8 rounded-2xl border-2 border-neon-blue shadow-neon">
      <h2 className="text-5xl font-bold text-center text-white mb-8 neon-text font-orbitron">FAQ</h2>
      <div className="mb-6">
        {faqs.map(({ question }, idx) => {
          const css = 'text-neon-blue text-xl pb-2 transition-colors duration-300';
          return (
            <div key={idx}>
              <button
                className={idx == activeFaq ? 'font-bold ' + css : css}
                onClick={() => setActiveFaq(idx)}
              >
                {'>> ' + question}
              </button>
            </div>
          );
        })}
      </div>

      <div className="text-6xl text-neon-blue relative flex-row flex items-center">
        <div
          className="cursor-pointer hover:text-neon-pink transition-colors duration-300"
          onClick={() =>
            activeFaq == 0 ? setActiveFaq(faqs.length - 1) : setActiveFaq(activeFaq - 1)
          }
        >
          <ChevronLeftIcon
            className="z-10"
            fontSize="inherit"
            color="inherit"
          />
        </div>

        <div className="bg-dark-blue-lighter p-6 rounded-xl border border-neon-blue flex-grow mx-4">
          <div className="text-3xl text-neon-pink font-bold mb-4">{faqs[activeFaq].question}</div>
          <div className="mt-2 text-xl text-white">
            {typeof faqs[activeFaq].answer === 'string'
              ? faqs[activeFaq].answer
              : typeof faqs[activeFaq].answer === 'object'
                ? faqs[activeFaq].answer.map((section, index) => {
                  if (section?.type === 'link') {
                    return (
                      <a key={index} className="text-neon-blue hover:text-neon-pink transition-colors duration-300" href={section.url}>
                        {section.text}
                      </a>
                    );
                  } else if (section?.type === 'plaintext') {
                    return <span key={index}>{section.text}</span>;
                  } else return null;
                })
                : null}
          </div>
        </div>

        <div
          className="cursor-pointer hover:text-neon-pink transition-colors duration-300"
          onClick={() =>
            activeFaq == faqs.length - 1 ? setActiveFaq(0) : setActiveFaq(activeFaq + 1)
          }
        >
          <ChevronRightIcon
            className="z-10"
            fontSize="inherit"
            color="inherit"
          />
        </div>
      </div>
    </div>
  );
};

export default FaqDisplay;