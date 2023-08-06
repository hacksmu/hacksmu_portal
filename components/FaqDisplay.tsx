import { useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface FaqDisplayProps {
  faqs: AnsweredQuestion[] | { question: string; answer: string[] }[] | any[];
}

const FaqDisplay = ({ faqs }: FaqDisplayProps) => {
  const [activeFaq, setActiveFaq] = useState(0);

  return (
    <div className="w-full z-20 bg-dark-teal p-8 rounded-2xl">
      <h2 className="text-4xl font-bold text-tan mb-4">FAQ</h2>
      {faqs.map(({ question }, idx) => {
        const css = 'text-tan text-2xl pb-4';
        return (
          <div key={idx}>
            <button
              className={idx == activeFaq ? 'font-bold ' + css : css}
              onClick={() => setActiveFaq(idx)}
            >
              {'>>> ' + question}
            </button>
          </div>
        );
      })}


      <div className="text-8xl text-tan relative flex-row flex ">
        <div
          className="cursor-pointer"
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

        <div className="bg-teal p-8 rounded-3xl h-full relative flex-initial">
          <div className="text-4xl text-tan font-bold">{faqs[activeFaq].question}</div>
          <div className="mt-4 text-2xl text-tan">
            {typeof faqs[activeFaq].answer === 'string'
              ? faqs[activeFaq].answer
              : typeof faqs[activeFaq].answer === 'object'
                ? faqs[activeFaq].answer.map((section) => {
                  if (section?.type === 'link') {
                    return (
                      <a className="text-white" href={section.url}>
                        {section.text}
                      </a>
                    );
                  } else if (section?.type === 'plaintext') {
                    return section.text;
                  } else return 'test';
                })
                : null}
          </div>
        </div>

        <div
          className="cursor-pointer flex-initial"
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
