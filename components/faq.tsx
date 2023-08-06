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
    <div className="z-0 relative bg-gradient-to-tl from-purple to-teal min-h-[105vh] xl:py-[6rem]">
      <div className="hidden lg:block z-[2]">
        <NextImage src="/assets2023/faq_building.svg" layout="fill" objectFit="cover" />
      </div>
      <div className="flex flex-grow">
        <div className="top-6 p-4 px-8">
          {/* FAQ for lg-md */}
          {/* Uses different section for mobile because using 2 columns is buggy when expanding FAQs */}
          <div className="xl:block hidden absolute left-[40%] mr-[5rem]">
            <FaqDisplay faqs={faqs} />
          </div>
          {/* FAQ for mobile */}
          <div className="bg-dark-teal xl:hidden p-4 mt-10 rounded-lg border-4 border-dark-teal z-20">
            <h2 className="text-4xl font-bold text-tan">FAQ</h2>
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
