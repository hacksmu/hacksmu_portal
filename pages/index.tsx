import Head from 'next/head';
import NextImage from 'next/image';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { buttonDatas, stats } from '../lib/data';
import { RequestHelper } from '../lib/request-helper';
import firebase from 'firebase/app';
import 'firebase/messaging';
import 'firebase/storage';
import KeynoteSpeaker from '../components/KeynoteSpeaker';
import HomeChallengeCard from '../components/HomeChallengeCard';
import MemberCards from '../components/MemberCards';
import SponsorCard from '../components/SponsorCard';
import FAQ from '../components/faq';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import FaqPage from '../components/faq';
import Link from 'next/link';

/**
 * The home page.
 *
 * Landing: /
 *
 */
export default function Home(props: {
  keynoteSpeakers: KeynoteSpeaker[];
  challenges: Challenge[];
  faqs: FAQ[];
  fetchedMembers: TeamMember[];
  sponsorCard: Sponsor[];
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [speakers, setSpeakers] = useState<KeynoteSpeaker[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [sponsor, setSponsor] = useState<Sponsor[]>([]);
  const [challengeData, setChallengeData] = useState({
    title: '',
    organization: '',
    description: '',
    prizes: [],
  });

  const [faqs, setFaqs] = useState<FAQ[]>([]);

  const colorSchemes: ColorScheme[] = [
    {
      light: '#F2F3FF',
      dark: '#C1C8FF',
    },
    {
      light: '#D8F8FF',
      dark: '#B0F1FF',
    },
    {
      dark: '#FCD7FF',
      light: '#FDECFF',
    },
  ];

  useEffect(() => {
    // Set amount of time notification prompt gets displayed before fading out
    setTimeout(fadeOutEffect, 3000);
    setSpeakers(props.keynoteSpeakers);

    //Organize challenges in order by rank given in firebase
    const sortedChallenges = props.challenges.sort((a, b) => (a.rank > b.rank ? 1 : -1));
    setChallenges(sortedChallenges);
    setChallengeData({
      title: sortedChallenges[0].title,
      organization: sortedChallenges[0].organization,
      description: sortedChallenges[0].description,
      prizes: sortedChallenges[0].prizes,
    });
    setSponsor(props.sponsorCard);

    setFaqs(props.faqs);

    //Organize members in order by rank given in firebase
    setMembers(props.fetchedMembers.sort((a, b) => (a.rank > b.rank ? 1 : -1)));
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initialize styles to first organization in list
    if (document.getElementById(`org${challengeIdx}`) !== null) {
      document.getElementById(`org${challengeIdx}`).style.textDecoration = 'underline';
      (
        document.getElementById(`org${challengeIdx}`).firstElementChild as HTMLElement
      ).style.display = 'block';
    }
  });

  // Fade out notification prompt
  const fadeOutEffect = () => {
    var fadeTarget = document.getElementById('popup');

    if (fadeTarget !== undefined && fadeTarget !== null) {
      var fadeEffect = setInterval(() => {
        if (!fadeTarget.style.opacity) {
          fadeTarget.style.opacity = '1';
        }
        if (parseFloat(fadeTarget.style.opacity) > 0) {
          fadeTarget.style.opacity = (parseFloat(fadeTarget.style.opacity) - 0.1).toString();
        } else {
          clearInterval(fadeEffect);
        }
      }, 100);
    }
  };

  // const checkNotif = () => {
  //   //pop up visible if user did not enable push notif and browser supports push notif
  //   const isSupported =
  //     'Notification' in window &&
  //     'serviceWorker' in navigator &&
  //     'PushManager' in window &&
  //     firebase.messaging.isSupported();
  //   if (isSupported && Notification.permission !== 'granted') {
  //     Notification.requestPermission();
  //     return true;
  //   }
  //   return false;
  // };

  const changeOrg = (challenge, newIdx) => {
    document.getElementById(`org${challengeIdx}`).style.textDecoration = 'none';
    (document.getElementById(`org${challengeIdx}`).firstElementChild as HTMLElement).style.display =
      'none';
    document.getElementById(`org${newIdx}`).style.textDecoration = 'underline';
    (document.getElementById(`org${newIdx}`).firstElementChild as HTMLElement).style.display =
      'block';

    setChallengeIdx(newIdx);
    setChallengeData({
      title: challenge.title,
      organization: challenge.organization,
      description: challenge.description,
      prizes: challenge.prizes,
    });
  };

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
        <title>HackSMU IV</title> {/* !change */}
        <meta name="description" content="HackSMU Portal" /> {/* !change */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* Notification info pop up */}
      {/* {checkNotif() && (
        <div
          id="popup"
          className="fixed z-50 md:translate-x-0 translate-x-1/2 w-[22rem] rounded-md px-4 py-2 top-16 md:right-6 right-1/2 bg-red-200 md:text-base text-sm"
        >
          Turn on push notifications to recieve announcements!
        </div>
      )} */}
      {/* Header section */}
      <section id="" className=" bg-contain bg-hero-pattern">
        <div className="flex flex-col w-[calc(100vw + 2px)] py-16 px-0 relative">
          <div className="">
            <NextImage src="/assets/hacksmu-photo1.png" layout="fill" objectFit="cover" />
          </div>
          <div className="w-screen xl:w-[50vw] min-h-[85vh] relative">
            <div className="w-[90%]  bg-white relative top-[-2.5rem] md:top-[1rem] xl:top-[5%] right-[0.5rem] xl:left-24 z-10 mx-auto">
              <div className="w-[100%] bg-dark-blue relative top-[1rem] left-4 z-20 mx-auto">
                <div className="flex flex-col justify-center items-center relative">
                  <div className="flex mt-3">
                    <NextImage src="/assets/hacksmu.png" width="50" height="80" objectFit="cover" />
                    <h1 className="text-white text-center text-4xl mt-4 ms-4 font-bold">
                      HackSMU IV
                    </h1>
                  </div>
                  <span className="border-white w-11/12 mt-2 border-t-4" />
                </div>
                <p className="text-white text-2xl sm:text-3xl ml-8 sm:ml-12 mt-8">
                  {'>>> MEET UP.'}
                </p>
                <p className="text-white text-2xl sm:text-3xl ml-12 sm:ml-20 mt-2">
                  {'>>> HAVE FUN.'}
                </p>
                <p className="text-white text-2xl sm:text-3xl ml-16 sm:ml-28 mt-2">
                  {'>>> CREATE AWESOME.'}
                </p>
                <h2 className="text-light-red text-5xl 2xl:text-7xl font-bold text-center mt-4 font-jetbrains">
                  {'September 16-18, 2022'}
                </h2>
                <div className="w-full text-center">
                  <NextImage
                    className="block w-[10%] z-40 mx-auto p-3"
                    src="/assets/robotcrew.svg"
                    width="512"
                    height="256"
                  />
                </div>
                <div className="grid grid-cols-1 relative xl:w-[50%] xl:mx-auto mt-4 px-4 xl:space-x-8 space-y-4 xl:space-y-0 w-full xl:top-[75%] pb-8">
                  <Link passHref href="/auth">
                    <div className="bg-light-red text-2xl text-center text-white font-bold md:max-w-full py-3 px-2 rounded cursor-pointer">
                      Apply here!
                    </div>
                  </Link>
                  <a
                    href="https://www.google.com"
                    rel="noreferrer"
                    target="_blank"
                    className="hidden bg-medium-blue text-2xl text-center text-white font-bold md:max-w-full py-3 px-2 rounded"
                    role="button"
                  >
                    Volunteer here!
                  </a>
                  <a
                    href="https://www.google.com"
                    rel="noreferrer"
                    target="_blank"
                    className="hidden bg-medium-blue text-2xl text-center text-white font-bold md:max-w-full py-3 px-2 rounded"
                    role="button"
                  >
                    Become a mentor!
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About HackSMU */}
      <section id="about" className="z-0 relative bg-cool-white min-h-[95vh]">
        <div className="flex flex-col w-[calc(100vw + 2px)] xl:w-[50vw] pt-8 xl:pt-0 pb-24 xl:pb-64 px-0 relative container justify-center items-end">
          <div className="hidden xl:block relative top-[6rem] mr-12">
            <NextImage
              className="transform-gpu rotate-[20deg]"
              src="/assets/Robin.svg"
              width={256}
              height={256}
            />
          </div>
          <div className="rounded-[3rem] bg-light-red w-[90%] xl:w-[100%] relative z-10 mx-auto left-[-.5rem]">
            <div className="rounded-[3rem] bg-white w-[100%] z-20 relative left-4 top-3 pb-8 pt-1 px-2">
              <h1 className="text-3xl text-center mt-[2rem] text-dark-red font-bold">
                {"We are SMU's Annual 36-hour Hackathon."}
                <span className="border-dark-red border-solid w-[75%] mt-2 ml-4 border-t-[4px] self-left inline-block rounded" />
              </h1>

              <div className="grid xl:grid-cols-3 gap-0 mt-4 relative px-6">
                <div>
                  <h2 className="font-jetbrains text-6xl text-dark-red text-center">150+</h2>
                  <h3 className="text-3xl text-dark-red text-center">Hackers</h3>
                </div>
                <div>
                  <h2 className="font-jetbrains text-6xl text-dark-red text-center">20+</h2>
                  <h3 className="text-3xl text-dark-red text-center">Projects</h3>
                </div>
                <div>
                  <h2 className="font-jetbrains text-6xl text-dark-red text-center">$1500+</h2>
                  <h3 className="text-3xl text-dark-red text-center">In Prizes</h3>
                </div>
              </div>
              <h2 className="text-3xl text-dark-red font-bold ml-4 mt-8">HackSMU is...</h2>
              <ul className="list-disc text-2xl text-dark-red ml-10 xl:ml-14 mt-4">
                <li className="mb-4">
                  A space for enterpreneurs, designers, and developers to unleash their creativity
                  and spark positive social change.
                </li>
                <li className="mb-4">
                  A place to meet likeminded individuals, network with companies and advance your
                  career.
                </li>
                <li className="mb-4">Open to all majors and experience levels (seriously!)</li>
                <li className="mb-4">Offering a lot of free food (mmm...)</li>
                <li className="mb-4">An absurd amount of fun!</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="hidden xl:block w-[20rem] h-[10rem] mx-auto absolute top-[6%] left-[2%] z-40">
          <NextImage src="/assets/cloud-sm.svg" layout="fill" />
        </div>
        <div className="hidden xl:block w-[12rem] h-[6rem] mx-auto absolute top-[45%] left-[6%] z-40">
          <NextImage src="/assets/cloud-sm.svg" layout="fill" />
        </div>
        <div className="hidden xl:block w-[16rem] h-[8rem] mx-auto absolute bottom-[75%] right-[3%] z-40">
          <NextImage src="/assets/cloud-sm.svg" layout="fill" />
        </div>
        <div className="hidden xl:block w-[12rem] h-[6rem] mx-auto absolute bottom-[40%] right-[3%] z-40">
          <NextImage src="/assets/cloud-sm.svg" layout="fill" />
        </div>
      </section>

      {/* FAQ section */}
      <section id="faq">
        <FaqPage fetchedFaqs={props.faqs} />
      </section>

      {/* Resources for HackSMU */}
      <section id="resources" className="z-0 relative bg-cool-white min-h-[100vh] flex flex-row">
        <div className="flex flex-col w-[calc(100vw + 2px)] xl:w-[50vw] pt-8 xl:pt-0 pb-24 xl:pb-64 px-0 relative container justify-center items-start">
          <div className="hidden xl:block relative top-[3rem] mr-12">
            <NextImage
              className="transform-gpu rotate-[-10deg]"
              src="/assets/Momin.svg"
              width={192}
              height={192}
            />
          </div>
          <div className="rounded-[3rem] bg-light-red w-[90%] xl:w-[100%] relative z-10 mx-auto left-[-.5rem]">
            <div className="rounded-[3rem] bg-white w-[100%] z-20 relative left-4 xl:left-8 top-3 pb-8 pt-1 px-4 ">
              <h1 className="text-5xl text-start ms-4 mt-[2rem] text-dark-red font-bold">
                Info and Resources
                <span className="border-dark-red border-solid w-[75%] border-t-[4px] self-left inline-block rounded top-[-1.5rem] relative" />
              </h1>
              <p className="text-dark-red text-3xl ms-4">
                HackSMU will take place fully in person on September 16-18, 2022. The address is{' '}
                <span className="font-bold">3140 Dyer Street, Dallas, TX, 75275.</span> <br />
                <br />
                <p>
                  Check out our live site for more information on schedule, location, events,
                  prizes, and more!
                </p>{' '}
                <br /> <br />
                <div className="w-[30%] mx-auto">
                  <Link passHref href="/auth">
                    <div className="bg-medium-blue text-2xl text-center text-white font-bold py-3 px-2 rounded cursor-pointer">
                      Apply here!
                    </div>
                  </Link>
                </div>
              </p>
            </div>
          </div>
        </div>

        <div className="hidden xl:block relative top-[12rem] mr-12">
          <NextImage src="/assets/dallas-texas.svg" width={512} height={512} />
        </div>
      </section>

      <section>
        {/* Team Members */}
        <div className="flex flex-col flex-grow bg-white">
          <div className="my-2">
            <h4 className="font-bold p-6 md:text-4xl text-2xl my-4">Meet Our Team :)</h4>{' '}
            {/* !change */}
            <div className="flex flex-wrap justify-center md:px-2">
              {/* Member Cards */}
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
      </section>
      {/* Sponsors */}
      <section>
        <div className="flex flex-col flex-grow bg-white">
          <h4 className="font-bold p-6 md:text-4xl text-2xl my-4">Sponsors</h4>
          {/* Sponsor Card */}
          <section className="flex flex-wrap justify-center p-4">
            {sponsor.map(({ link, reference }, idx) => (
              <SponsorCard key={idx} link={link} reference={reference} />
            ))}
          </section>
          <h2 className="my-2 text-center">
            {' '}
            {/* !change */}
            If you would like to sponsor HackPortal, please reach out to us at&nbsp;
            <a
              href="mailto:email@organization.com"
              rel="noopener noreferrer"
              target="_blank"
              className="underline"
            >
              email@organization.com
            </a>
          </h2>
        </div>
      </section>

      {/* Footer */}
      <section className="bg-gray-100 mt-16 px-6 py-8 md:text-base text-xs">
        {/* Upper Content */}
        <div className="my-2 relative">
          {/* Social icons */} {/* !change */}
          <div className="space-x-4 > * + *">
            <a href="https://twitter.com/hackutd" rel="noopener noreferrer" target="_blank">
              <TwitterIcon className="footerIcon" />
            </a>
            <a
              href="https://www.instagram.com/hackutd/?hl=en"
              rel="noopener noreferrer"
              target="_blank"
            >
              <InstagramIcon className="footerIcon" />
            </a>
            <a href="https://www.facebook.com/hackutd/" rel="noopener noreferrer" target="_blank">
              <FacebookIcon className="footerIcon" />
            </a>
          </div>
          {/* Text */}
          <div className="absolute bottom-0 right-0">
            {' '}
            {/* !change */}
            Checkout HackUTD&apos;s{' '}
            <a
              href="https://acmutd.co/"
              rel="noopener noreferrer"
              target="_blank"
              className="font-black hover:underline"
            >
              organizer site
            </a>
          </div>
        </div>
        {/* Lower Content */}
        <div className="flex justify-between border-t-[1px] py-2 border-black">
          <p>
            Designed by <p className="font-black inline">HackUTD</p> <br /> {/* !change */}
            {/* PLEASE DO NOT CHANGE <3 */}
            HackPortal developed with &lt;3 by <p className="font-black inline">HackUTD</p> and{' '}
            <p className="font-black inline">ACM Development</p>
            {/* PLEASE DO NOT CHANGE <3 */}
          </p>

          <div className="flex md:flex-row flex-col md:ml-0 ml-6">
            {/* !change */}
            <a
              href="mailto:email@organization.com"
              rel="noopener noreferrer"
              target="_blank"
              className="hover:underline md:mr-8 font-thin"
            >
              Contact Us
            </a>
            {/* !change */}
            <a
              href="https://github.com/acmutd/hackportal"
              target="_blank"
              rel="noreferrer"
              className="hover:underline font-thin whitespace-nowrap"
            >
              Source Code
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const protocol = context.req.headers.referer?.split('://')[0] || 'http';
  const { data: keynoteData } = await RequestHelper.get<KeynoteSpeaker[]>(
    `${protocol}://${context.req.headers.host}/api/keynotespeakers`,
    {},
  );
  const { data: challengeData } = await RequestHelper.get<Challenge[]>(
    `${protocol}://${context.req.headers.host}/api/challenges/`,
    {},
  );
  const { data: faqs } = await RequestHelper.get<FAQ[]>(
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
      keynoteSpeakers: keynoteData,
      challenges: challengeData,
      faqs: faqs,
      fetchedMembers: memberData,
      sponsorCard: sponsorData,
    },
  };
};
