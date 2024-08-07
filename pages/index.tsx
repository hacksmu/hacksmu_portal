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
    date: "October 12-13, 2024",
    link: "https://uhcode.red/",
  }
];

export default function Home(props: {
  answeredQuestion: AnsweredQuestion[];
  fetchedMembers: TeamMember[];
  sponsorCard: Sponsor[];
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>HackSMU VI</title>
        <meta name="description" content="HackSMU Portal" />
        <link rel="icon" href="/favicon2.ico" />
      </Head>
      <section className="bg-contain bg-hero-pattern">
        <div className="hero-content">
          <h1 className="glow-text neon-title">HackSMU VI</h1>
          <p className="neon-date">October 5-6, 2024</p>
          <Link href="/auth" passHref>
            <a className="gradient-button neon-button">Apply Here!</a>
          </Link>
        </div>
      </section>
      <GradientDivider />

      {/* About HackSMU */}
      <section id="about" className="about-section">
        <h2 className="about-title">We are SMU&apos;s Annual 24-hour Hackathon.</h2>
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">150+</div>
            <div className="stat-label">Hackers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">20+</div>
            <div className="stat-label">Projects</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">$1500+</div>
            <div className="stat-label">In Prizes</div>
          </div>
        </div>
        <h3 className="about-title py-2">HackSMU is...</h3>
        <ul className="about-list">
          <li>A platform for entrepreneurs, designers, and developers to unlock their creativity and drive positive social impact.</li>
          <li>An opportunity to connect with like-minded individuals, network with companies, and advance your career.</li>
          <li>Open to participants from all majors and experience levels (truly inclusive!).</li>
          <li>Enjoy a variety of free food throughout the event (yum!).</li>
          <li>Packed with fun and excitement!</li>
        </ul>
      </section>
      <GradientDivider />

      {/* FAQ section */}
      <section id="faq" className="bg-purple">
        <div className="mt-4" />
        <FaqPage fetchedFaqs={props.answeredQuestion} />
      </section>
      <GradientDivider />

      {/* Resources for HackSMU */}
      <section id="resources" className="bg-mute-blue text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center mx-auto resources-title py-3">
            Info and Resources
          </h2>
          <div className="flex flex-col md:flex-row items-stretch justify-between gap-8">
            <div className="md:w-1/2 bg-dark-blue-lighter p-8 rounded-xl shadow-neon">
              <p className="text-2xl mb-6">
                HackSMU will take place fully in person on October 5-6, 2024. The address is{' '}
                <span className="font-bold text-neon-pink">3140 Dyer St, Dallas, TX 75205.</span>
              </p>
              <p className="text-2xl mb-8">
                Check out our live site for more information on schedule, location, events,
                prizes, and more!
              </p>
              <div className="text-center md:text-left">
                <Link href="/dashboard">
                  <a className="inline-block bg-gradient-to-r from-neon-pink to-neon-blue text-white font-bold py-3 px-8 rounded-full text-xl hover:shadow-neon transition duration-300">
                    Dashboard
                  </a>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 bg-dark-blue-lighter p-8 rounded-xl shadow-neon flex justify-center items-center">
              <NextImage
                src="/backgrounds2024/Dallas.gif"
                alt="Dallas, TX location"
                width={450}
                height={450}
              />
            </div>
          </div>
        </div>
      </section>
      <GradientDivider />

      {/* Team Members */}

      {/* <section>
        <div className="flex flex-col flex-grow bg-white">
          <div className="my-2">
            <h4 className="font-bold p-6 md:text-4xl text-2xl my-4">Meet Our Team :)</h4>{' '}
            <div className="flex flex-wrap justify-center md:px-2">

              {members.map(
                ({ name, description, linkedin, github, personalSite, fileName }, idx) => (
                  <MemberCards
                    key={idx}
                    name={name}
                    description={description}
                    fileName={fileName}
                    linkedin={linkedin}
                    github={github}
                    personalSite={personalSite}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </section> */}

      {/* Sponsors */}
      <section id="sponsors" className="relative bg-dark-blue text-white py-16 overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-30 z-0"
          style={{
            backgroundImage: "url('/backgrounds2024/City3.png')"
          }}
        ></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-center mx-auto resources-title py-3">
            Sponsors
          </h2>
          <div className="bg-dark-blue-lighter p-8 rounded-xl shadow-neon mb-8">
            <p className="text-xl mb-6">
              At HackSMU, our mission is to foster innovation, creativity, and collaboration among students.
              By sponsoring us, you&apos;ll not only support the next generation of tech leaders but also gain visibility within a vibrant and dynamic community.
              Join us in making a lasting impact and help us turn ideas into reality!
              Support Innovation. Empower Creativity. Inspire the Future.
            </p>
          </div>
          <div className="text-center">
            <a
              href="mailto:hacksmu.team@gmail.com"
              className="inline-block bg-gradient-to-r from-neon-pink to-neon-blue text-white font-bold py-3 px-8 rounded-full text-xl hover:shadow-neon transition duration-300"
            >
              Sponsor Us!
            </a>
          </div>
        </div>
      </section>
      <GradientDivider />
      
      {/* More Hackathons Section */}
      <section id="more-hackathons" className="animated-gradient text-white py-15">
        <div className="container mx-auto px-4 max-w-screen-md">
          <h2 className="text-center mx-auto resources-title py-5">
            More Hackathons...
          </h2>
          <p className="text-center mx-auto text-2xl mb-6">
            Check out these other amazing hackathons happening soon!
          </p>
          <ul className="list-disc list-inside mx-auto text-center text-2xl">
            {moreHackathons.map((hackathon, index) => (
              <li key={index} className="my-4">
                <a href={hackathon.link} className="text-white hover:underline" target="_blank" rel="noopener noreferrer">
                  {hackathon.name} - {hackathon.date}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <GradientDivider />

      {/* Footer */}
      <section className="bg-gray-100 px-6 py-8 md:text-base text-xs">
        {/* Upper Content */}
        <div className="my-2 relative">
          {/* Social icons */} {/* !change */}
          <div className="space-x-4 > * + *">
            <a href="https://twitter.com/officialhacksmu" rel="noopener noreferrer" target="_blank">
              <TwitterIcon className="footerIcon" />
            </a>
            <a href="https://www.instagram.com/hack.smu" rel="noopener noreferrer" target="_blank">
              <InstagramIcon className="footerIcon" />
            </a>
            <a
              href="https://www.facebook.com/smuhackathon/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <FacebookIcon className="footerIcon" />
            </a>
          </div>
          {/* Text */}
          <div className="absolute bottom-0 right-0">
            {' '}
            {/* !change */}© 2024 SMU Computer Science Club
          </div>
        </div>
        {/* Lower Content */}
        <div className="flex justify-between border-t-[1px] py-2 border-black">
          <p>
            Website designed by <p className="font-black inline">HackSMU</p> <br /> {/* !change */}
            {/* PLEASE DO NOT CHANGE <3 */}
            HackPortal developed with &lt;3 by <p className="font-black inline">HackUTD</p> and{' '}
            <p className="font-black inline">ACM Development</p>
            {/* PLEASE DO NOT CHANGE <3 */}
          </p>

          <div className="flex md:flex-row flex-col md:ml-0 ml-6">
            {/* !change */}
            <a
              href="mailto:hacksmu.team@gmail.com"
              rel="noopener noreferrer"
              target="_blank"
              className="hover:underline font-bold z-10"
            >
              Contact Us
            </a>
            {/* !change */}
          </div>
        </div>
      </section>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const protocol = context.req.headers.referer?.split('://')[0] || 'http';
  try {
    const { data: answeredQuestion } = await RequestHelper.get<AnsweredQuestion[]>(
      `${protocol}://${context.req.headers.host}/api/questions/faq`,
      {},
    );
    const { data: memberData } = await RequestHelper.get<TeamMember[]>(
      `${protocol}://${context.req.headers.host}/api/members`,
      {},
    );
    const { data: sponsorData } = await RequestHelper.get<Sponsor[]>(
      `${protocol}://${context.req.headers.host}/api/sponsor`,
      {},
    );
    return {
      props: {
        answeredQuestion: answeredQuestion,
        fetchedMembers: memberData,
        sponsorCard: sponsorData,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        answeredQuestion: [],
        fetchedMembers: [],
        sponsorCard: [],
      },
    };
  }
};
