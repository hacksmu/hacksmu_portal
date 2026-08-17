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
    try {
      const auth = firebase.auth();
      const currentUser = auth.currentUser;

      if (currentUser !== null && !currentUser.emailVerified) {
        auth
          .signOut()
          .then(() => {
            //signed out succesfully
          })
          .catch((error) => {
            console.warn('Could not sign out');
          });
      }
    } catch (error) {
      console.warn('Firebase Auth is unavailable; skipping the header auth check.', error);
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
    <>
      <header className="sticky top-0 z-50 mt-[-24px] flex h-12 w-full flex-row items-center justify-between border-b-4 border-[#32e6ff] bg-[#05020d] px-3 py-1 shadow-[0_3px_0_#ff4fd8]">
        <div className="flex items-center justify-between md:w-9/12 md:max-w-full md:justify-start">
          <Link href="/">
            <a className="relative z-[0] order-2 ml-[12px] flex items-center self-center border-x-2 border-[#ff4fd8] px-1 font-display md:order-1 md:ml-0">
              <Image
                src="/assets2026/hacksmu-logo.png"
                alt="HackSMU VIII"
                width={38}
                height={38}
                objectFit="contain"
              />
            </a>
          </Link>
          {/* Smartphone nav */}
          <div
            onClick={toggleMenu}
            className="relative z-[1] border-2 border-[#32e6ff] bg-[#111d3d] px-1 md:hidden"
          >
            {mobileIcon ? <MenuIcon htmlColor="#ffe56b" /> : <CloseIcon htmlColor="#ff4fd8" />}
            <ul
              className={`${
                showMenu ? 'translate-x-0' : '-translate-x-full'
              } fixed top-0 left-0 z-[-1] flex h-screen w-7/12 transform flex-col border-r-4 border-[#32e6ff] bg-[#070315] pt-16 shadow-[6px_0_0_#ff4fd8] transition-all duration-300 ease-out`}
            >
              {dynamicNavItems.map((item) => (
                <Link key={item.text} href={item.path}>
                  <a className="border-b-2 border-[#743fc7] px-4 py-5 text-[#32e6ff] first:border-t-2 hover:bg-[#111d3d] hover:text-[#ffe56b]">
                    <p className="font-pixel text-xs uppercase tracking-wider">{item.text}</p>
                  </a>
                </Link>
              ))}
            </ul>
          </div>
          {/* PC nav */}
          <div className="order-2 hidden items-center font-pixel text-xs md:flex md:text-left lg:ml-8">
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
                  <p className="border-b-2 border-transparent px-1 py-1 text-xs uppercase tracking-wider text-[#32e6ff] hover:border-[#ff4fd8] hover:text-[#ffe56b] md:mx-3">
                    {item.text}
                  </p>
                </a>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex lg:mr-4">
          <button
            className="border-2 border-[#ffe56b] bg-[#111d3d] px-4 py-1 font-pixel text-[10px] uppercase text-white shadow-[3px_3px_0_#ff4fd8] hover:text-[#ffe56b] sm:px-6 sm:text-xs"
            onClick={toggleDialog}
          >
            {!user || !isSignedIn ? 'Sign in' : hasProfile ? 'Profile' : 'Register'}
          </button>
        </div>
        {showProfileDialog && <ProfileDialog onDismiss={dismissDialog} />}
      </header>
    </>
  );
}
