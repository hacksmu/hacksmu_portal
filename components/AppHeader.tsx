/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import ProfileDialog from './ProfileDialog';
import { useUser } from '../lib/profile/user-data';
import { useAuthContext } from '../lib/user/AuthContext';
import { navItems } from '../lib/data';
import firebase from 'firebase/app';
import Image from 'next/image';
import { isTemplateSpan } from 'typescript';

/**
 * A global site header throughout the entire app.
 */
export default function AppHeader() {
  const [showMenu, setShowMenu] = useState(false);
  const { isSignedIn, hasProfile, profile } = useAuthContext();
  const [mobileIcon, setMobileIcon] = useState(true);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [dynamicNavItems, setDynamicNavItems] = useState(navItems);
  const user = useUser();

  useEffect(() => {
    if (firebase.auth().currentUser !== null && !firebase.auth().currentUser.emailVerified) {
      firebase
        .auth()
        .signOut()
        .then(() => {
          //signed out succesfully
        })
        .catch((error) => {
          console.warn('Could not sign out');
        });
    }

    //creating dynamic nav items
    if (
      isSignedIn &&
      profile &&
      (profile.user.permissions[0] === 'admin' || profile.user.permissions[0] === 'super_admin')
    ) {
      setDynamicNavItems((dynamicNavItems) => [
        ...dynamicNavItems,
        { text: 'Admin', path: '/admin' },
      ]);
    } else {
      setDynamicNavItems(navItems);
    }
  }, []);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    setMobileIcon(!mobileIcon);
  };

  const dismissDialog = () => {
    setShowProfileDialog(false);
  };
  const toggleDialog = () => {
    setShowProfileDialog(!showProfileDialog);
  };

  document.addEventListener('mousedown', (event) => {
    const targetComponent = document.querySelector('.profileDialog');
    if (
      targetComponent !== null &&
      !document.querySelector('.profileDialog').contains(event.target as Node)
    ) {
      dismissDialog();
    }
  });

  return (
    <header className="sticky top-0 mt-[-24px] z-20">
      <div className="justify-between flex flex-row w-full bg-dark-blue items-center h-24 p-4">
        <a
          className="left-[128px] md:left-[84px]"
          id="mlh-trust-badge"
          style={{
            display: 'inline-block',
            position: 'absolute',
            top: '0px',
            width: '54px',
            zIndex: '0',
          }}
          href={
            'https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2024-season&utm_content=gray'
          }
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="https://s3.amazonaws.com/logged-assets/trust-badge/2024/mlh-trust-badge-2024-gray.svg"
            alt="Major League Hacking 2024 Hackathon Season"
            style={{ width: '100%' }}
          />
        </a>
        <div className="flex justify-between items-center md:max-w-full md:justify-start md:w-9/12">
          <Link href="/">
            <a className="flex gap-2 order-2 relative ml-[12px] font-display self-center items-center md:order-1 md:ml-0 z-[0]">
              <Image src={'/assets/hacksmu.png'} width="50px" height="81px" alt="hacksmu logo" />
            </a>
          </Link>
          {/* Smartphone nav */}
          <div onClick={toggleMenu} className={'relative md:hidden z-[1]'}>
            {mobileIcon ? <MenuIcon htmlColor="white" /> : <CloseIcon htmlColor="white" />}
            <ul
              className={`${
                showMenu ? 'translate-x-0' : '-translate-x-full'
              } transform transition-all ease-out duration-300 flex w-6/12 h-screen border-2 border-white flex-col bg-medium-blue fixed top-0 left-0 z-[-1] pt-16`}
            >
              {dynamicNavItems.map((item) => (
                <Link key={item.text} href={item.path}>
                  <a className="border-b-2 first:border-t-2 text-white border-white p-4 py-6 hover:bg-dark-blue">
                    <p className="text-sm font-bold">{item.text}</p>
                  </a>
                </Link>
              ))}
            </ul>
          </div>
          {/* PC nav */}
          <div className="hidden text-xs order-2 md:flex items-center md:text-left lg:ml-14">
            {dynamicNavItems.map((item) => (
              <Link
                key={item.text}
                href={
                  item.path == '/dashboard' && isSignedIn
                    ? '/dashboard'
                    : item.path == 'dashboard'
                    ? '/auth'
                    : item.path
                }
              >
                <a>
                  <p className="md:mx-4 text-xl font-bold text-white">{item.text}</p>
                </a>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex lg:mr-8">
          <button
            className="font-header font-bold bg-white rounded-full border-2 border-black text-sm px-8 py-1"
            onClick={toggleDialog}
          >
            {!user || !isSignedIn ? 'Sign in' : hasProfile ? 'Profile' : 'Register'}
          </button>
        </div>
        {showProfileDialog && <ProfileDialog onDismiss={dismissDialog} />}
      </div>
      <div className="h-16 top-0 bg-[#ff8000] font-sans text-2xl font-bold text-center py-4 sticky">Date and venue change! <Link passHref href="/#resources"><button className="text-tan">More info</button></Link></div>
    </header>
  );
}
