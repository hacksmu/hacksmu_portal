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

/**
 * Global Frutiger Aero glass header — visible on all pages.
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
      firebase.auth().signOut().catch(() => console.warn('Could not sign out'));
    }
    if (
      isSignedIn &&
      profile &&
      (profile.user.permissions[0] === 'admin' || profile.user.permissions[0] === 'super_admin')
    ) {
      setDynamicNavItems((prev) => [...prev, { text: 'Admin', path: '/admin' }]);
    } else {
      setDynamicNavItems(navItems);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMenu = () => { setShowMenu(!showMenu); setMobileIcon(!mobileIcon); };
  const dismissDialog = () => setShowProfileDialog(false);
  const toggleDialog = () => setShowProfileDialog(!showProfileDialog);

  document.addEventListener('mousedown', (event) => {
    const targetComponent = document.querySelector('.profileDialog');
    if (targetComponent !== null && !targetComponent.contains(event.target as Node)) {
      dismissDialog();
    }
  });

  return (
    <>
      <header
        className="app-topbar mt-[-24px] sticky top-0 z-[110]"
        style={{
          backdropFilter: 'blur(18px) saturate(180%)',
          WebkitBackdropFilter: 'blur(18px) saturate(180%)',
          background: 'linear-gradient(180deg, rgba(10,60,140,0.82) 0%, rgba(5,40,100,0.72) 50%, rgba(3,25,70,0.65) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.22)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          height: 82,
          padding: '0 12px',
          position: 'sticky',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <Link href="/">
            <a
              className="app-brand-link"
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                marginLeft: 4,
                textDecoration: 'none',
                filter: 'drop-shadow(0 0 8px rgba(0,200,255,0.5))',
              }}
            >
              <img className="app-brand-logo" src="/assets/hacksmu_fish.png" width={56} height={90} alt="HackSMU" />
              <span
                style={{
                  fontFamily: "'Orbitron', 'Roboto', sans-serif",
                  fontSize: 30,
                  fontWeight: 900,
                  color: '#fff',
                  textShadow: '0 0 12px rgba(0,200,255,0.7), 0 1px 4px rgba(0,0,0,0.8)',
                  letterSpacing: '0.08em',
                  display: 'none',
                }}
                className="md:inline"
              >
                HackSMU VII
              </span>
            </a>
          </Link>

          {/* Mobile hamburger */}
          <div onClick={toggleMenu} style={{ position: 'relative', cursor: 'pointer' }} className="md:hidden z-[1]">
            {mobileIcon
              ? <MenuIcon htmlColor="rgba(200,235,255,0.9)" />
              : <CloseIcon htmlColor="rgba(200,235,255,0.9)" />}
            <ul
              className={`${showMenu ? 'translate-x-0' : '-translate-x-full'} transform transition-all ease-out duration-300`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '60vw',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: -1,
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                background: 'linear-gradient(160deg, rgba(5,30,90,0.95) 0%, rgba(3,50,80,0.95) 100%)',
                borderRight: '1px solid rgba(255,255,255,0.20)',
                boxShadow: '4px 0 32px rgba(0,0,0,0.5)',
                listStyle: 'none',
                margin: 0,
                paddingTop: '4rem',
              }}
            >
              {dynamicNavItems.map((item) => (
                <Link key={item.text} href={item.path}>
                  <a
                    style={{
                      display: 'block',
                      padding: '16px 24px',
                      color: 'rgba(200,235,255,0.90)',
                      fontWeight: 700,
                      fontSize: 18,
                      letterSpacing: '0.06em',
                      borderBottom: '1px solid rgba(255,255,255,0.10)',
                      textDecoration: 'none',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,150,255,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {item.text}
                  </a>
                </Link>
              ))}
            </ul>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex" style={{ alignItems: 'center', marginLeft: 48, gap: 3 }}>
            {dynamicNavItems.map((item) => (
              <Link
                key={item.text}
                href={item.path === '/dashboard' && isSignedIn ? '/dashboard' : item.path === 'dashboard' ? '/auth' : item.path}
              >
                <a
                  style={{
                    padding: '10px 18px',
                    borderRadius: 6,
                    color: 'rgba(200,235,255,0.88)',
                    fontWeight: 700,
                    fontSize: 20,
                    letterSpacing: '0.04em',
                    textDecoration: 'none',
                    transition: 'all 0.22s',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 8px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(200,235,255,0.88)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {item.text}
                </a>
              </Link>
            ))}
          </div>
        </div>

        {/* Auth button */}
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}>
          <button
            className="auth-trigger-btn"
            onClick={toggleDialog}
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.55) 0%, rgba(100,190,255,0.40) 35%, rgba(20,110,240,0.65) 65%, rgba(5,50,180,0.85) 100%)',
              border: '1px solid rgba(255,255,255,0.55)',
              borderRadius: 16,
              color: '#fff',
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: '0.05em',
              padding: '12px 32px',
              cursor: 'pointer',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.55), 0 3px 12px rgba(0,50,180,0.45)',
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
              transition: 'all 0.22s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.75), 0 5px 18px rgba(0,80,220,0.55), 0 0 24px rgba(0,200,255,0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.55), 0 3px 12px rgba(0,50,180,0.45)';
            }}
          >
            {/* Gloss highlight */}
            <span style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '50%',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 100%)',
              borderRadius: '20px 20px 0 0',
              pointerEvents: 'none',
            }} />
            {!user || !isSignedIn ? 'Sign In' : hasProfile ? 'Profile' : 'Register'}
          </button>
        </div>

        {showProfileDialog && <ProfileDialog onDismiss={dismissDialog} />}
      </header>
    </>
  );
}
