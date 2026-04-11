import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import AdminHeader from '../../components/adminComponents/AdminHeader';
import UserList from '../../components/adminComponents/UserList';
import { RequestHelper } from '../../lib/request-helper';
import { UserData } from '../api/users';
import { useAuthContext } from '../../lib/user/AuthContext';
import UserAdminView from '../../components/adminComponents/UserAdminView';
import { isAuthorized } from '.';
import LoadIcon from '../../components/LoadIcon';

type UserIdentifier = Omit<UserData, 'scans'>;

const glassPanel: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(100,160,255,0.08) 100%)',
  backdropFilter: 'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.26)',
  borderRadius: 18,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 6px 28px rgba(0,20,70,0.24)',
};

const ROLES = ['hacker', 'admin', 'super_admin'] as const;

export default function UserPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserIdentifier[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserIdentifier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [activeRoles, setActiveRoles] = useState<Set<string>>(new Set(ROLES));
  const timer = useRef<NodeJS.Timeout>();
  const { user } = useAuthContext();

  async function fetchAllUsers() {
    setLoading(true);
    if (!user) return;
    const { data } = await RequestHelper.get<UserIdentifier[]>('/api/users', {
      headers: { Authorization: user.token },
    });
    setUsers(data);
    setFilteredUsers([...data]);
    setLoading(false);
  }

  useEffect(() => { fetchAllUsers(); }, []);

  useEffect(() => {
    if (loading) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const q = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(({ user: u }) => {
          const matchesName = `${u.firstName} ${u.lastName}`.toLowerCase().includes(q);
          const matchesRole = u.permissions.some((p) => activeRoles.has(p));
          return matchesName && matchesRole;
        }),
      );
    }, 300);
    return () => clearTimeout(timer.current);
  }, [searchQuery, activeRoles, loading, users]);

  const toggleRole = (role: string) => {
    setActiveRoles((prev) => {
      const next = new Set(prev);
      next.has(role) ? next.delete(role) : next.add(role);
      return next;
    });
  };

  const sortByName = () => {
    setFilteredUsers((prev) =>
      [...prev].sort((a, b) =>
        `${a.user.firstName} ${a.user.lastName}`.localeCompare(`${b.user.firstName} ${b.user.lastName}`),
      ),
    );
  };

  if (!user || !isAuthorized(user))
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8e8ff', fontSize: 22, fontFamily: "'Orbitron', sans-serif" }}>
        Unauthorized
      </div>
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Head>
        <title>HackSMU — Users</title>
        <meta name="description" content="HackSMU Admin Users" />
      </Head>

      <AdminHeader />

      <div style={{ padding: '24px 28px 48px', maxWidth: 900, width: '100%', margin: '0 auto' }}>
        {currentUser === '' ? (
          <>
            {/* Header */}
            <div style={{ ...glassPanel, padding: '20px 28px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontFamily: "'Orbitron', 'Roboto', sans-serif", fontSize: 22, fontWeight: 900, color: '#fff', textShadow: '0 0 18px rgba(0,200,255,0.6)', letterSpacing: '0.04em' }}>
                  Users Dashboard
                </div>
                {!loading && (
                  <div style={{ color: 'rgba(200,232,255,0.60)', fontSize: 13, marginTop: 4 }}>
                    {filteredUsers.length} of {users.length} users
                  </div>
                )}
              </div>
              <button
                onClick={sortByName}
                style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: '#c8e8ff', fontWeight: 700, fontSize: 12 }}
              >
                Sort A–Z
              </button>
            </div>

            {/* Search + filters */}
            <div style={{ ...glassPanel, padding: '16px 20px', marginBottom: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name…"
                style={{ flex: 1, minWidth: 180, padding: '9px 14px', borderRadius: 10, fontSize: 13, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: '#e8f4ff', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    style={{
                      padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      border: activeRoles.has(role) ? '2px solid rgba(0,200,255,0.55)' : '1px solid rgba(255,255,255,0.16)',
                      background: activeRoles.has(role) ? 'rgba(0,180,255,0.18)' : 'rgba(255,255,255,0.05)',
                      color: activeRoles.has(role) ? '#80d8ff' : 'rgba(200,232,255,0.45)',
                      transition: 'all 0.18s',
                    }}
                  >
                    {role.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* User list */}
            <div style={{ ...glassPanel, padding: '20px 24px' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                  <LoadIcon width={80} height={80} />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div style={{ color: 'rgba(200,232,255,0.50)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
                  No users match your search.
                </div>
              ) : (
                <UserList
                  hasAdminPrivilege={user.permissions.includes('super_admin') || user.permissions.includes('admin')}
                  users={filteredUsers}
                  onItemClick={setCurrentUser}
                />
              )}
            </div>
          </>
        ) : (
          <UserAdminView
            currentUserId={currentUser}
            goBack={() => setCurrentUser('')}
            updateCurrentUser={(value) => {
              setUsers((prev) => prev.map((obj) => (obj.id === value.id ? { ...value } : obj)));
            }}
          />
        )}
      </div>
    </div>
  );
}
