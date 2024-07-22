import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/solid';

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
    <Disclosure>
      <div className="z-10 mb-4">
        <Disclosure.Button
          className="sm:p-3 z-20 text-left rounded-md w-full bg-dark-blue-lighter p-3 text-neon-blue border border-neon-blue transition-all duration-300 hover:bg-dark-blue-lightest"
          as="div"
        >
          <button
            className="w-full flex flex-row justify-between items-center"
            onClick={() => {
              toggleDisclosure();
            }}
          >
            <span className="text-neon-blue text-lg sm:text-xl font-bold">{question}</span>
            <ChevronUpIcon 
              className={`${isOpen ? 'transform rotate-180' : ''} w-5 h-5 text-neon-pink transition-transform duration-300`} 
            />
          </button>
        </Disclosure.Button>
        {isOpen && (
          <Disclosure.Panel className="rounded-md mt-2 py-3 bg-dark-blue-lightest p-3 text-white border-t border-neon-pink" static>
            {typeof answer === 'string'
              ? answer
              : typeof answer === 'object'
                ? answer.map((section, index) => {
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
          </Disclosure.Panel>
        )}
      </div>
    </Disclosure>
  );
}


