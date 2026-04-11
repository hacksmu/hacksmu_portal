import Link from 'next/link';
import { useRouter } from 'next/router';
import NavLink from '../NavLink';
import { useAuthContext } from '../../lib/user/AuthContext';
import { useEffect } from 'react';

function canReview(user): boolean {
  if (!user || !user.permissions) return false;
  return (
    (user.permissions as string[]).includes('organizer') ||
    (user.permissions as string[]).includes('admin') ||
    (user.permissions as string[]).includes('super_admin')
  );
}

function canManageAdmin(user): boolean {
  if (!user || !user.permissions) return false;
  return (
    (user.permissions as string[]).includes('admin') ||
    (user.permissions as string[]).includes('super_admin')
  );
}

/**
 * A dashboard header.
 */
export default function AdminHeader() {
  const { user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    accordion();
  }, []);

  const accordion = () => {
    var acc = document.getElementsByClassName('accordion');
    for (let i = 0; i < acc.length; i++) {
      acc[i].addEventListener('click', function () {
        this.classList.toggle('menuactive');
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    }
  };

  return (
    <section className="">
      <header className="top-0 sticky hidden md:flex flex-row justify-between p-2 md:p-4 items-center">
        <div className="mx-auto md:flex justify-center md:text-lg lg:text-xl font-header md:text-left gap-2">
          <NavLink href="/admin" exact={true} className="mx-4">
            <span style={navPillStyle(router.pathname === '/admin')}>Admin Dashboard</span>
          </NavLink>
          {canReview(user) && (
            <NavLink href="/admin/judge-applications" exact={true} className="mx-4">
              <span style={navPillStyle(router.pathname === '/admin/judge-applications')}>
                Judge Applications
              </span>
            </NavLink>
          )}
          {canManageAdmin(user) && (
            <NavLink href="/admin/scan" exact={true} className="mx-4">
              <span style={navPillStyle(router.pathname === '/admin/scan')}>Scanner</span>
            </NavLink>
          )}
          {canManageAdmin(user) && (
            <NavLink href="/admin/users" exact={true} className="mx-4">
              <span style={navPillStyle(router.pathname === '/admin/users')}>Users Dashboard</span>
            </NavLink>
          )}
        </div>
      </header>
      <div className="my-4 md:hidden ">
        <button className="accordion text-left p-2 text-sm bg-[#C1C8FF]">Admin Menu</button>
        <div className="panel w-full bg-[#F2F3FF] text-sm">
          <ul className="">
            <li className="p-2 hover:bg-[#DCDEFF]">
              <Link href="/admin">Admin Dashboard</Link>
            </li>
            {canReview(user) && (
              <li className="p-2 hover:bg-[#DCDEFF]">
                <Link href="/admin/judge-applications">Judge Applications</Link>
              </li>
            )}
            {canManageAdmin(user) && (
              <li className="p-2 hover:bg-[#DCDEFF]">
                <Link href="/admin/scan">Scanner</Link>
              </li>
            )}
            {canManageAdmin(user) && (
              <li className="p-2 hover:bg-[#DCDEFF]">
                <Link href="/admin/users">Users Dashboard</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

function navPillStyle(active: boolean): React.CSSProperties {
  return {
    display: 'inline-block',
    padding: '7px 22px',
    borderRadius: 24,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textDecoration: 'none',
    transition: 'all 0.22s',
    background: active
      ? 'linear-gradient(135deg, rgba(0,160,255,0.55) 0%, rgba(0,80,200,0.45) 100%)'
      : 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(100,160,255,0.07) 100%)',
    border: active
      ? '1px solid rgba(0,180,255,0.60)'
      : '1px solid rgba(255,255,255,0.20)',
    color: active ? '#fff' : 'rgba(200,232,255,0.82)',
    boxShadow: active
      ? 'inset 0 1px 0 rgba(255,255,255,0.30), 0 2px 12px rgba(0,100,255,0.30)'
      : 'none',
  };
}
