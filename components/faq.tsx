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
  const [loading, setLoading] = useState(true)
  const [faqs, setFaqs] = useState<AnsweredQuestion[]>([])
  const [disclosuresStatus, setDisclosureStatus] = useState<boolean[]>([])

  useEffect(() => {
    // Fallback sort (keeps docs without 'order' at the end)
    const sorted = [...fetchedFaqs].sort(
      (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
    )
    setFaqs(sorted)
    setDisclosureStatus(sorted.map(() => false))
    setLoading(false)
  }, [fetchedFaqs])

  const expandAll = () => setDisclosureStatus(Array.from({ length: disclosuresStatus.length }, () => true))

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
          backgroundImage: "url('/assets2025/TitleBackground.png')",
          backgroundAttachment: "fixed"
        }}
      ></div>
      <div className="max-w-3xl mx-auto relative z-10">
        <h2 className="text-center mx-auto resources-title py-3">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map(({id, question, answer}, idx) => (
              <FaqDisclosure
                  key={id ?? idx}
                  question={question}
                  answer={answer}
                  isOpen={disclosuresStatus[idx]}
                  toggleDisclosure={() => {
                    const curr = [...disclosuresStatus]
                    curr[idx] = !curr[idx]
                    setDisclosureStatus(curr)
                  }}
              />
          ))}
        </div>
        <button
            onClick={expandAll}
            className="mt-8 w-full bg-gradient-to-r from-orange to-neon-blue text-white font-bold py-2 px-4 rounded hover:from-neon-blue hover:to-orange transition duration-300 ease-in-out"
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
  const {data} = await RequestHelper.get<AnsweredQuestion[]>(
      `${protocol}://${context.req.headers.host}/api/questions/faq`,
    {},
  );
  return {
    props: {
      fetchedFaqs: data,
    },
  };
};


