import Head from 'next/head';
import NextImage from 'next/image';
import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { RequestHelper } from '../lib/request-helper';
import 'firebase/messaging';
import 'firebase/storage';
import SponsorCard from '../components/SponsorCard';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import FaqPage from '../components/faq';
import Link from 'next/link';
import GradientDivider from '../components/GradientDivider';

// Add a mock list of hackathons for the new section

const moreHackathons = [
  {
    name: "CodeRED Astra",
    date: "October 25-26th, 2025",
    link: "https://uhcode.red/",
  }
];

export default function Home(props: {
  answeredQuestion: AnsweredQuestion[];
  fetchedMembers: TeamMember[];
  sponsorCard: Sponsor[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stage, setStage] = useState<'intro' | 'zoom' | 'done'>('intro');

  useEffect(() => {
    const handleInteraction = () => {
      if (stage === 'intro') {
        setStage('zoom');
      }
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [stage]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (stage === 'intro') {
      video.src = '/videos/turnon.mp4';
      video.loop = false;
      video.play();
    }
    if (stage === 'zoom') {
      video.src = '/videos/zoomin.mp4';
      video.loop = false;
      video.play();
      video.onended = () => setStage('done');
    }
  }, [stage]);

  return (
    <>
      <Head>
        <title>HackSMU VII</title>
        <meta name="description" content="HackSMU Portal" />
        <link rel="icon" href="/favicon2.ico" />
      </Head>

      {/* 🟣 HERO SECTION with video */}
      <section className="relative h-screen overflow-hidden">
        {stage !== 'done' ? (
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
            muted
            autoPlay
            playsInline
          />
        ) : (
          <img
            src="/images/finalframe.png"
            alt="Final Frame"
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
          />
        )}

        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center text-white">
          <h1 className="glow-text neon-title">HackSMU VII</h1>
          <p className="neon-date">October 25–26th, 2025</p>
          <Link href="/auth" passHref>
            <a className="gradient-button neon-button">Apply here!</a>
          </Link>
        </div>
      </section>

      
     
