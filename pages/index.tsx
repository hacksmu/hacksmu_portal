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

/**
 * The home page.
 *
 * Landing: /
 *
 */
export default function Home(props: {
  keynoteSpeakers: KeynoteSpeaker[];
  challenges: Challenge[];
  answeredQuestion: AnsweredQuestion[];
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

  const checkNotif = () => {
    //pop up visible if user did not enable push notif and browser supports push notif
    const isSupported =
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      firebase.messaging.isSupported();
    if (isSupported && Notification.permission !== 'granted') {
      Notification.requestPermission();
      return true;
    }
    return false;
  };

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
      {checkNotif() && (
        <div
          id="popup"
          className="fixed z-50 md:translate-x-0 translate-x-1/2 w-[22rem] rounded-md px-4 py-2 top-16 md:right-6 right-1/2 bg-red-200 md:text-base text-sm"
        >
          Turn on push notifications to recieve announcements!
        </div>
      )}
      {/* Header section */}
      <section className="md:px-4 bg-contain bg-hero-pattern">
        <div className="flex flex-row w-screen h-[95vh]">
          <NextImage src="/assets/hacksmu-photo1.png" layout="fill" objectFit="cover" />
          <div className="w-screen xl:w-[50vw] min-h-[105vh] h-auto relative">
            <div className="w-[90%] h-[80vh] xl:h-[60%] bg-white absolute top-[8%] left-[3%] xl:left-24 z-10" />
            <div className="w-[90%] h-[80vh] xl:h-[60%] bg-dark-blue absolute top-[10%] left-[5%] xl:left-28 z-20">
              <div className="flex flex-col justify-center items-center relative">
                <div className="flex mt-3">
                  <NextImage src="/assets/hacksmu.png" width="50" height="80" objectFit="cover" />
                  <h1 className="text-white text-center text-4xl mt-4 ms-4 font-bold">
                    HackSMU IV
                  </h1>
                </div>
                <span className="border-white w-11/12 mt-2 border-t-4" />
              </div>
              <div className="text-white text-2xl sm:text-3xl ml-8 sm:ml-12 mt-8">
                {'>>> MEET UP.'}
              </div>
              <div className="text-white text-2xl sm:text-3xl ml-12 sm:ml-20 mt-2">
                {'>>> HAVE FUN.'}
              </div>
              <div className="text-white text-2xl sm:text-3xl ml-16 sm:ml-28 mt-2">
                {'>>> CREATE AWESOME.'}
              </div>
              <div className="text-light-red text-5xl font-bold text-center mt-4">
                {'September 16-18, 2022'}
              </div>
              <div className="grid grid-cols-1 relative xl:absolute xl:grid-cols-3 mt-4 px-4 xl:space-x-8 space-y-4 xl:space-y-0 w-full xl:top-[75%]">
                <a
                  href="https://www.google.com"
                  rel="noreferrer"
                  target="_blank"
                  className="bg-light-red text-2xl text-center text-white font-bold md:max-w-full py-3 px-2"
                  role="button"
                >
                  Apply here!
                </a>
                <a
                  href="https://www.google.com"
                  rel="noreferrer"
                  target="_blank"
                  className="bg-medium-blue text-2xl text-center text-white font-bold md:max-w-full py-3 px-2"
                  role="button"
                >
                  Volunteer here!
                </a>
                <a
                  href="https://www.google.com"
                  rel="noreferrer"
                  target="_blank"
                  className="bg-medium-blue text-2xl text-center text-white font-bold md:max-w-full py-3 px-2"
                  role="button"
                >
                  Become a mentor!
                </a>
              </div>
            </div>
          </div>
          <div className="hidden xl:block w-[40vw] bottom-[5rem] mx-auto relative z-30">
            <NextImage src="/assets/robotcrew.svg" layout="fill" />
          </div>
        </div>
      </section>
      {/* Video Space */}
      <section className="z-0 relative md:h-[560px] py-[3rem] bg-white">
        <div className="flex flex-col justify-center items-center md:flex-row">
          {/* Video */}
          {/* !change */}
          <iframe
            className="video"
            width="700"
            height="400"
            src="https://www.youtube.com/embed/niFBblrblqo"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          {/* Stats */}
          <div className="">
            {stats.map((stat, index) => (
              <div
                key={stat.data}
                className={`${
                  index % 2 === 0 ? 'xl:ml-40 md:ml-20 ml-14' : 'md:mr-8 mr-24'
                } text-center md:my-6 my-4`}
              >
                <p className="font-bold text-2xl text-indigo-600 xl:text-5xl">{stat.data}</p>
                <p className="font-medium text-lg xl:text-3xl">{stat.object}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* About section */}
      <section className="md:p-12 p-6">
        <h1 className="md:text-4xl text-2xl font-bold my-4">About HackPortal</h1> {/* !change */}
        <div className="md:text-base text-sm">
          HackPortal is a platform for user-friendly hackathon event management. <br />
          <br />A few of its features include: A fully customizable front end, sign in with email/
          Google, hacker registration, images, challenges, sponsors, FAQ and more fetched from
          backend, push notifications, a spotlight carousel highlighting ongoing events, QR code
          check in and swag claims, report submission/ Ask a question, a built-in and easy to set up
          schedule, Hacker, Admin, and Super Admin roles, an Admin console to send announcements,
          update user roles, show number of check-ins, swag claims, and more!. <br />
          <br />
          To set up HackPortal for your hackathon, check out the{' '}
          <a
            href="https://github.com/acmutd/hackportal/blob/develop/docs/set-up.md"
            className="underline"
          >
            HackPortal Github
          </a>
          !
        </div>
      </section>
      {/* Featuring Keynotes speakers */}

      <section className="flex overflow-x-auto bg-gray-200 min-h-[24rem]">
        <div className="flex items-center justify-center font-bold p-6 md:text-4xl text-2xl my-4">
          Featuring Keynote Speakers
        </div>
        <div className="flex flex-col justify-center py-6 md:px-6">
          {/* Row 1 */}
          <div className="flex">
            {speakers.map(
              ({ name, description, fileName }, idx) =>
                idx < speakers.length / 2 && (
                  <KeynoteSpeaker
                    key={idx}
                    name={name}
                    description={description}
                    cardColor={colorSchemes[idx % 3]}
                    imageLink={fileName}
                  />
                ),
            )}
          </div>
          {/* row 2 */}
          <div className="flex md:ml-[7rem] ml-[5rem]">
            {speakers.map(
              ({ name, description, fileName }, idx) =>
                idx >= speakers.length / 2 && (
                  <KeynoteSpeaker
                    key={idx}
                    name={name}
                    description={description}
                    cardColor={colorSchemes[idx % 3]}
                    imageLink={fileName}
                  />
                ),
            )}
          </div>
        </div>
      </section>
      {/* Challenges */}
      <section className="p-6 ">
        <div className="font-bold p-6 md:text-4xl text-2xl my-4">Challenges</div>
        <div className="flex">
          {/* Challenge Orgs Selectors*/}
          <div className="md:w-1/4 w-1/5">
            {challenges.map((challenge, idx) => (
              <div
                id={`org${idx}`}
                className={`${idx} relative cursor-pointer text-center md:text-lg sm:text-sm text-xs md:py-6 py-4 my-4 bg-purple-200 rounded-sm`}
                key={idx}
                onClick={() => changeOrg(challenge, idx)}
              >
                {/* change arrow color in global css to match parent selector */}
                <div className="arrow-right absolute top-1/2 right-0 -translate-y-1/2 translate-x-full hidden"></div>
                {challenge.organization}
              </div>
            ))}
          </div>
          {/* Challenges Description Cards */}
          <div className="md:w-3/4 w-4/5 my-4 pl-6 min-h-full">
            {/* Card */}
            <HomeChallengeCard
              title={challengeData.title}
              organization={challengeData.organization}
              description={challengeData.description}
              prizes={challengeData.prizes}
            />
          </div>
        </div>
      </section>
      {/* FAQ */}
      <section>
        <FAQ fetchedFaqs={props.answeredQuestion}></FAQ>
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
      keynoteSpeakers: keynoteData,
      challenges: challengeData,
      answeredQuestion: answeredQuestion,
      fetchedMembers: memberData,
      sponsorCard: sponsorData,
    },
  };
};
