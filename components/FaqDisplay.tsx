import { useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface FaqDisplayProps {
  faqs: FAQ[];
}

const FaqDisplay = ({ faqs }: FaqDisplayProps) => {
  const [activeFaq, setActiveFaq] = useState(0);

  return (
    <div className="grid grid-cols-12 w-full">
      <div className="col-span-5">
        {faqs.map(({ question }, idx) => {
          const css = 'text-dark-red text-2xl pb-4';
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
      </div>
      <div className="col-span-7 h-full">
        <div className="text-8xl text-dark-red relative w-[90%] h-full">
          <div
            className="cursor-pointer"
            onClick={() =>
              activeFaq == 0 ? setActiveFaq(faqs.length - 1) : setActiveFaq(activeFaq - 1)
            }
          >
            <ChevronLeftIcon
              className="absolute translate-x-[-50%] translate-y-[-50%] top-[50%] left-[-5%] z-10"
              fontSize="inherit"
              color="inherit"
            />
          </div>

          <div className="bg-medium-blue p-8 rounded-3xl h-full w-[100%] relative">
            <div className="text-4xl text-white font-bold">{faqs[activeFaq].question}</div>
            <div className="mt-4 text-2xl text-white">
              {typeof faqs[activeFaq].answer === 'string'
                ? faqs[activeFaq].answer
                : typeof faqs[activeFaq].answer === 'object'
                ? faqs[activeFaq].answer.map((section) => {
                    if (section?.type === 'link') {
                      return (
                        <a className="text-dark-blue" href={section.url}>
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
            className="cursor-pointer"
            onClick={() =>
              activeFaq == faqs.length - 1 ? setActiveFaq(0) : setActiveFaq(activeFaq + 1)
            }
          >
            <ChevronRightIcon
              className="absolute translate-x-[-50%] translate-y-[-50%] top-[50%] left-[105%]"
              fontSize="inherit"
              color="inherit"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqDisplay;
