import { ChevronUpIcon } from '@heroicons/react/solid';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import AboutHeader from './AboutHeader';
import FaqDisclosure from './FaqDisclosure';
import FaqDisplay from './FaqDisplay';
import { RequestHelper } from '../lib/request-helper';
import NextImage from 'next/image';

/**
 * The FAQ page.
 *
 * This page contains frequently asked questions for the hackathon.
 *
 * Route: /about/faq
 */
export default function FaqPage({ fetchedFaqs }: { fetchedFaqs: AnsweredQuestion[] }) {
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<AnsweredQuestion[]>([]);
  const [disclosuresStatus, setDisclosureStatus] = useState<boolean[]>();

  useEffect(() => {
    setFaqs(fetchedFaqs);
    setDisclosureStatus(fetchedFaqs.map(() => false));
    setLoading(false);
  }, [fetchedFaqs]);

  /**
   *
   * Expand all FAQ disclosures
   *
   */
  const expandAll = () => {
    setDisclosureStatus(new Array(disclosuresStatus.length).fill(true));
  };

  if (loading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="z-0 relative bg-cool-white min-h-[100vh] pt-[5rem] xl:pt-[6rem]">
      <div className="flex flex-col w-[calc(100vw + 2px)] xl:w-[85vw] xl:mx-auto pt-8 xl:pt-0 pb-24 xl:pb-64 px-0 relative container">
        <div className="flex flex-row w-full items-center">
          <div className="hidden xl:block relative self-start top-[5.5rem] left-[-6.5rem] mr-2">
            <NextImage
              className="transform-gpu rotate-[-30deg] scale-x-[-1]"
              src="/assets/Charlotte.svg"
              width={192}
              height={192}
            />
          </div>
          <div className="flex-1" />
          <div className="hidden xl:block relative self-end top-[5.5rem] right-[-6.5rem] mr-2">
            <NextImage
              className="transform-gpu rotate-[30deg]"
              src="/assets/Charlotte.svg"
              width={192}
              height={192}
            />
          </div>
        </div>
        <div className="rounded-[3rem] bg-light-red w-[90%] xl:w-[100%] relative z-10 mx-auto left-[-0.5rem] xl:left-[-1.5rem]">
          <div className="rounded-[3rem] bg-white w-[100%] z-20 relative left-4 xl:left-10 top-3 pb-8 pt-1 px-2">
            <h1 className="text-4xl text-left tracking-widest mt-[2rem] pl-[2rem] text-dark-red font-bold">
              FAQ
              <span className="border-dark-red border-solid w-[7.5%] border-t-[4px] self-left block rounded" />
            </h1>
            <div className="flex flex-col flex-grow">
              <div className="top-6 p-4 px-8">
                {/* FAQ for lg-md */}
                {/* Uses different section for mobile because using 2 columns is buggy when expanding FAQs */}
                <div className="xl:flex hidden justify-between">
                  <FaqDisplay faqs={faqs} />
                </div>
                {/* FAQ for mobile */}
                <div className="xl:hidden">
                  <div className="w-full my-3 space-y-4 > * + *">
                    {faqs.map(({ question, answer }, idx) => (
                      <FaqDisclosure
                        key={idx}
                        question={question}
                        answer={answer}
                        isOpen={disclosuresStatus[idx]}
                        toggleDisclosure={() => {
                          const currDisclosure = [...disclosuresStatus];
                          currDisclosure[idx] = !currDisclosure[idx];
                          setDisclosureStatus(currDisclosure);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 *
 * Fetch FAQ questions stored in the backend, which will be used as props by FaqPage component upon build time
 *
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  const protocol = context.req.headers.referer?.split('://')[0] || 'http';
  const { data } = await RequestHelper.get<AnsweredQuestion[]>(
    `${protocol}://${context.req.headers.host}/api/questions/faq`,
    {},
  );
  return {
    props: {
      fetchedFaqs: data,
    },
  };
};
