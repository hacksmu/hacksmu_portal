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

  const expandAll = () => {
    setDisclosureStatus(new Array(disclosuresStatus.length).fill(true));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl text-neon-blue animate-pulse">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="bg-dark-blue min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      <div 
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-30 z-0"
        style={{
          backgroundImage: "url('/backgrounds2024/TokyoCity2.png')",
          backgroundAttachment: "fixed"
        }}
      ></div>
      <div className="max-w-3xl mx-auto relative z-10">
        <h2 className="font-orbitron text-5xl font-bold text-center text-white mb-8 neon-text">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
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
        <button
          onClick={expandAll}
          className="mt-8 w-full bg-gradient-to-r from-neon-pink to-neon-blue text-white font-bold py-2 px-4 rounded hover:from-neon-blue hover:to-neon-pink transition duration-300 ease-in-out"
        >
          Expand All
        </button>
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
