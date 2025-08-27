import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import type { GetServerSideProps, NextPage } from 'next';
import { useEffect, useState } from 'react';
import { RequestHelper } from '../lib/request-helper';
import FaqPage from '../components/faq';
import GradientDivider from '../components/GradientDivider';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';

// --- Local fallback types to avoid TS errors if not globally defined ---
export type AnsweredQuestion = {
  id: string | number;
  question: string;
  answer: string;
};
export type TeamMember = {
  name: string;
  description?: string;
  linkedin?: string;
  github?: string;
  personalSite?: string;
  fileName?: string;
};
export type Sponsor = {
  name: string;
  logoPath: string;
  url: string;
};

// Mock list of other hackathons (kept commented out in UI for now)
const moreHackathons = [
  {
    name: 'CodeRED Astra',
    date: 'October 25-26th, 2025',
    link: 'https://uhcode.red/',
  },
];

interface HomeProps {
  answeredQuestion: AnsweredQuestion[];
  fetchedMembers: TeamMember[];
  sponsorCard: Sponsor[];
}

const Home: NextPage<HomeProps> = (props) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>HackSMU VII</title>
        <meta name="description" content="HackSMU Portal" />
        <link rel="icon" href="/favicon2.ico" />
      </Head>

      {/* HERO */}
      <section className="bg-contain bg-hero-pattern">
        <div className="hero-content">
          <h1 className="glow-text neon-title">HackSMU VII</h1>
          <p className="neon-date">October 25-26th, 2025</p>
          <Link href="/auth" passHref>
            <a className="gradient-button neon-button">Apply here!</a>
          </Link>
        </div>
      </section>

      <GradientDivider />

      {/* ABOUT */}
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

      {/* FAQ */}
      <section id="faq" className="bg-purple">
        <div className="mt-4" />
        <FaqPage fetchedFaqs={props.answeredQuestion} />
      </section>

      <GradientDivider />

      {/* RESOURCES */}
      <section id="resources" className="bg-mute-blue text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center mx-auto resources-title py-3">Info and Resources</h2>

          <div className="flex flex-col md:flex-row items-stretch justify-between gap-8">
            <div className="md:w-1/2 bg-dark-blue-lighter p-8 rounded-xl shadow-neon">
              <p className="text-2xl mb-6">
                HackSMU will take place fully in person on October 25-26th, 2025. The address is{' '}
                <span className="font-bold text-neon-pink">3140 Dyer St, Dallas, TX 75205.</span>
              </p>
              <p className="text-2xl mb-8">
                Check out our live site for more information on schedule, location, events, prizes, and more!
              </p>
              <div className="text-center md:text-left">
                <Link href="/dashboard" passHref>
                  <a className="inline-block bg-gradient-to-r from-neon-pink to-neon-blue text-white font-bold py-3 px-8 rounded-full text-xl hover:shadow-neon transition duration-300">
                    Dashboard
                  </a>
                </Link>
              </div>
            </div>

            <div className="md:w-1/2 bg-dark-blue-lighter p-8 rounded-xl shadow-neon flex justify-center items-center">
              <Image
                src="/backgrounds2024/Dallas.gif"
                alt="Dallas, TX location"
                width={450}
                height={450}
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </section>

      <GradientDivider />

      {/* SPONSORS */}
      <section id="sponsors" className="relative bg-dark-blue text-white py-16 overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-30 z-0"
          style={{ backgroundImage: "url('/backgrounds2024/City3.png')" }}
          aria-hidden
        />

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-center mx-auto resources-title py-3">Sponsors</h2>

          <div className="bg-dark-blue-lighter p-8 rounded-xl shadow-neon mb-8">
            <p className="text-xl mb-6">
              At HackSMU, our mission is to foster innovation, creativity, and collaboration among students. By sponsoring us, you&apos;ll not only support the next generation of tech leaders but also gain visibility within a vibrant and dynamic community. Join us in making a lasting impact and help us turn ideas into reality! Support Innovation. Empower Creativity. Inspire the Future.
            </p>
          </div>

          <div className="sponsor-logos grid grid-cols-3 gap-1 justify-center items-center">
            {/* Row 1: PayPal + ParkHub */}
            <div className="col-span-3 flex justify-center gap-8">
              <a href="https://www.paypal.com" target="_blank" rel="noopener noreferrer" aria-label="PayPal">
                <Image src="/sponsors/PayPal.jpg" alt="PayPal" width={300} height={200} style={{ objectFit: 'contain' }} />
              </a>
              <a href="https://parkhub.com" target="_blank" rel="noopener noreferrer" aria-label="ParkHub">
                <Image src="/sponsors/ParkHub.jpg" alt="ParkHub" width={300} height={200} style={{ objectFit: 'contain' }} />
              </a>
            </div>

            {/* Row 2: Cartesi + IBM */}
            <div className="col-span-3 flex justify-center gap-8">
              <a href="https://cartesi.io" target="_blank" rel="noopener noreferrer" aria-label="Cartesi">
                <Image src="/sponsors/Cartesi.png" alt="Cartesi" width={200} height={150} style={{ objectFit: 'contain' }} />
              </a>
              <a href="https://www.ibm.com/us-en" target="_blank" rel="noopener noreferrer" aria-label="IBM">
                <Image src="/sponsors/IBM.png" alt="IBM" width={200} height={150} style={{ objectFit: 'contain' }} />
              </a>
            </div>

            {/* Row 3: Invesco */}
            <div className="col-span-3 flex justify-center">
              <a href="https://www.invesco.com" target="_blank" rel="noopener noreferrer" aria-label="Invesco">
                <Image src="/sponsors/Invesco.jpg" alt="Invesco" width={180} height={120} style={{ objectFit: 'contain' }} />
              </a>
            </div>

            {/* Row 4: StandOutStickers + MLH + SMU Student Senate */}
            <div className="col-span-3 flex justify-center gap-4">
              <a href="https://www.standoutstickers.com" target="_blank" rel="noopener noreferrer" aria-label="StandOut Stickers">
                <Image src="/sponsors/StandOutStickers.png" alt="StandOut Stickers" width={120} height={80} style={{ objectFit: 'contain' }} />
              </a>
              <a href="https://mlh.io" target="_blank" rel="noopener noreferrer" aria-label="Major League Hacking">
                <Image src="/sponsors/MLH.png" alt="Major League Hacking" width={120} height={80} style={{ objectFit: 'contain' }} />
              </a>
              <a href="http://www.smustudentsenate.com" target="_blank" rel="noopener noreferrer" aria-label="SMU Student Senate">
                <Image src="/sponsors/SMUStudentSenate.jpg" alt="SMU Student Senate" width={120} height={80} style={{ objectFit: 'contain' }} />
              </a>
            </div>
          </div>

          {/* Sponsor Us Button */}
          <div className="text-center mt-8">
            <a
              href="mailto:hacksmu.team@gmail.com"
              className="inline-block bg-gradient-to-r from-neon-pink to-neon-blue text-white font-bold py-6 px-16 rounded-full text-3xl hover:shadow-neon transition duration-300"
            >
              Sponsor Us!
            </a>
          </div>
        </div>
      </section>

      <GradientDivider />

      {/* MORE HACKATHONS (kept commented out for now)
      <section id="more-hackathons" className="animated-gradient text-white py-15">
        <div className="container mx-auto px-4 max-w-screen-md">
          <h2 className="text-center mx-auto resources-title py-5">More Hackathons...</h2>
          <p className="text-center mx-auto text-2xl mb-6">Check out these other amazing hackathons happening soon!!</p>
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
      <GradientDivider /> */}

      {/* FOOTER */}
      <section className="bg-gray-100 px-6 py-8 md:text-base text-xs">
        {/* Upper Content */}
        <div className="my-2 relative">
          {/* Social icons */}
          <div className="space-x-4">
            <a href="https://twitter.com/officialhacksmu" rel="noopener noreferrer" target="_blank" aria-label="Twitter">
              <TwitterIcon className="footerIcon" />
            </a>
            <a href="https://www.instagram.com/hack.smu" rel="noopener noreferrer" target="_blank" aria-label="Instagram">
              <InstagramIcon className="footerIcon" />
            </a>
            <a href="https://www.facebook.com/smuhackathon/" rel="noopener noreferrer" target="_blank" aria-label="Facebook">
              <FacebookIcon className="footerIcon" />
            </a>
          </div>

          {/* Text */}
          <div className="absolute bottom-0 right-0">© 2024 SMU Computer Science Club</div>
        </div>

        {/* Lower Content */}
        <div className="flex justify-between border-t-[1px] py-2 border-black">
          <p>
            Website designed by <span className="font-black">HackSMU</span>
            <br />
            {/* PLEASE DO NOT CHANGE <3 */}
            HackPortal developed with &lt;3 by <span className="font-black">HackUTD</span> and{' '}
            <span className="font-black">ACM Development</span>
            {/* PLEASE DO NOT CHANGE <3 */}
          </p>

          <div className="flex md:flex-row flex-col md:ml-0 ml-6">
            <a
              href="mailto:hacksmu.team@gmail.com"
              rel="noopener noreferrer"
              target="_blank"
              className="hover:underline font-bold z-10"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

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
        answeredQuestion: answeredQuestion ?? [],
        fetchedMembers: memberData ?? [],
        sponsorCard: sponsorData ?? [],
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

export default Home;
