import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/solid';

/**
 *
 * Represents props used by FaqDisclosure component
 *
 * @param question a frequently asked question
 * @param answer answer to corresponding question
 * @param isOpen boolean variable used to determine whether the disclosure should be open or not
 * @param toggleDisclosure function to call when user wants to open/close disclosure
 *
 */
interface FaqDisclosureProps {
  question: string;
  answer: string | string[] | { type: string; text: string; url: string }[];
  isOpen: boolean;
  toggleDisclosure: () => void;
}

/**
 *
 * Component representing a FAQ question in /about/faq
 *
 */
export default function FaqDisclosure({
  question,
  answer,
  isOpen,
  toggleDisclosure,
}: FaqDisclosureProps) {
  return (
    <Disclosure>
      <div className="z-10">
        <Disclosure.Button
          className="sm:p-2 z-20 text-left rounded-md w-full bg-teal p-2 text-tan"
          as="div"
        >
          <button
            className="w-full flex flex-row justify-between items-center"
            onClick={() => {
              toggleDisclosure();
            }}
          >
            <span className="text-tan text-lg sm:text-2xl font-bold">{question}</span>
            <ChevronUpIcon className={`${isOpen ? 'transform rotate-180' : ''} w-5 h-5`} />
          </button>
        </Disclosure.Button>
        {isOpen && (
          <Disclosure.Panel className="rounded-md my-2 py-2 bg-teal p-2 text-tan" static>
            {typeof answer === 'string'
              ? answer
              : typeof answer === 'object'
                ? answer.map((section) => {
                  if (section?.type === 'link') {
                    return (
                      <a className="text-tan" href={section.url}>
                        {section.text}
                      </a>
                    );
                  } else if (section?.type === 'plaintext') {
                    return section.text;
                  } else return 'test';
                })
                : null}
          </Disclosure.Panel>
        )}
      </div>
    </Disclosure>
  );
}
