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
      <div className="">
        <Disclosure.Button
          className="sm:p-2 text-black text-left rounded-md w-full bg-white"
          as="div"
        >
          <button
            className="w-full flex flex-row justify-between items-center"
            onClick={() => {
              toggleDisclosure();
            }}
          >
            <span className="text-dark-red text-lg sm:text-2xl font-bold">{question}</span>
            <ChevronUpIcon className={`${isOpen ? 'transform rotate-180' : ''} w-5 h-5`} />
          </button>
        </Disclosure.Button>
        {isOpen && (
          <Disclosure.Panel className="rounded-md my-2 py-2 bg-medium-blue p-2 text-white" static>
            {typeof answer === 'string'
              ? answer
              : typeof answer === 'object'
              ? answer.map((section) => {
                  if (section?.type === 'link') {
                    return (
                      <a className="text-dark-red" href={section.url}>
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
