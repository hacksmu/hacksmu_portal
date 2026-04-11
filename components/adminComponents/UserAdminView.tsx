import { useEffect, useState } from 'react';
import { RequestHelper } from '../../lib/request-helper';
import { arrayFields, fieldToName, singleFields } from '../../lib/stats/field';
import { useAuthContext } from '../../lib/user/AuthContext';
import { UserData } from '../../pages/api/users';
import ErrorList from '../ErrorList';
import LoadIcon from '../LoadIcon';

const glassPanel: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(100,160,255,0.08) 100%)',
  backdropFilter: 'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.26)',
  borderRadius: 18,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 6px 28px rgba(0,20,70,0.24)',
};

const roleColors: Record<string, string> = {
  admin: '#ff8844',
  super_admin: '#ff4488',
  organizer: '#b080ff',
  sponsor: '#ffd040',
  judge: '#40ffb8',
  hacker: '#60c8ff',
};

interface UserAdminViewProps {
  goBack: () => void;
  currentUserId: string;
  updateCurrentUser: (value: Omit<UserData, 'scans'>) => void;
}

interface UserProfile extends Omit<Registration, 'user'> {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    permissions: string[];
    preferredEmail: string;
  };
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <span style={{ color: 'rgba(200,232,255,0.55)', fontSize: 13, flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#e0f0ff', fontWeight: 600, fontSize: 13, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export default function UserAdminView({ goBack, currentUserId, updateCurrentUser }: UserAdminViewProps) {
  const [loading, setLoading] = useState(true);
  const [newRole, setNewRole] = useState('');
  const { user } = useAuthContext();
  const [errors, setErrors] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>();

  useEffect(() => {
    async function getUserData() {
      try {
        const { data } = await RequestHelper.get<UserProfile>(`/api/userinfo?id=${currentUserId}`, {
          headers: { Authorization: user.token! },
        });
        setCurrentUser(data);
      } catch (error) {
        console.error(error);
        setErrors((prev) => [...prev, 'Unexpected error. Please try again later']);
      } finally {
        setLoading(false);
      }
    }
    getUserData();
  }, []);

  const updateRole = async () => {
    if (!user.permissions.includes('super_admin')) {
      alert('You do not have permission to perform this functionality');
      return;
    }
    try {
      const { status, data } = await RequestHelper.post<{ userId: string; newRole: string }, any>(
        '/api/users/roles',
        { headers: { Authorization: user.token } },
        { userId: currentUser.id, newRole },
      );
      if (!status || data.statusCode >= 400) {
        setErrors([...errors, data.msg]);
      } else {
        alert(data.msg);
        const updated = { ...currentUser, user: { ...currentUser.user, permissions: [newRole] } };
        updateCurrentUser(updated);
        setCurrentUser(updated);
      }
    } catch (error) {
      console.error(error);
      setErrors((prev) => [...prev, 'Unexpected error. Please try again later']);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
      <LoadIcon height={100} width={100} />
    </div>
  );

  const role = currentUser?.user.permissions?.[0] ?? 'hacker';
  const roleColor = roleColors[role] ?? '#60c8ff';
  const initials = `${currentUser?.user.firstName?.[0] ?? ''}${currentUser?.user.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div style={{ padding: '0 28px 48px' }}>
      {errors.length > 0 && (
        <ErrorList errors={errors} onClose={(idx) => {
          const next = [...errors]; next.splice(idx, 1); setErrors(next);
        }} />
      )}

      <button
        onClick={goBack}
        style={{ marginBottom: 20, padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: '#c8e8ff', fontWeight: 700, fontSize: 13 }}
      >
        ← Back to User List
      </button>

      <div style={{ maxWidth: 580, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* User header card */}
        <div style={{ ...glassPanel, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
            background: `radial-gradient(circle at 38% 36%, rgba(255,255,255,0.45) 0%, ${roleColor}88 40%, ${roleColor}44 100%)`,
            border: `2px solid ${roleColor}88`,
            boxShadow: `0 0 18px ${roleColor}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 18, color: '#fff',
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontFamily: "'Orbitron', 'Roboto', sans-serif", fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '0.03em' }}>
              {currentUser.user.firstName} {currentUser.user.lastName}
            </div>
            <div style={{ marginTop: 6, display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: `${roleColor}22`, border: `1px solid ${roleColor}55`, color: roleColor, fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
              {role.replace('_', ' ')}
            </div>
          </div>
        </div>

        {/* Role change (super_admin only) */}
        {user.permissions.includes('super_admin') && (
          <div style={{ ...glassPanel, padding: '20px 24px' }}>
            <div style={{ color: 'rgba(200,232,255,0.70)', fontSize: 13, marginBottom: 12 }}>Change Role</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                style={{ padding: '9px 14px', borderRadius: 10, fontSize: 13, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.20)', color: '#e8f4ff', outline: 'none', cursor: 'pointer' }}
              >
                <option value="" disabled>Choose a role</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="hacker">Hacker</option>
              </select>
              {newRole && (
                <button onClick={updateRole} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(0,200,100,0.40)', cursor: 'pointer', background: 'rgba(0,200,100,0.22)', color: '#80ffcc', fontWeight: 700, fontSize: 13 }}>
                  Update Role
                </button>
              )}
            </div>
          </div>
        )}

        {/* Profile details */}
        <div style={{ ...glassPanel, padding: '20px 24px' }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 700, color: 'rgba(200,232,255,0.55)', letterSpacing: '0.08em', marginBottom: 8 }}>PROFILE</div>
          <Field label="Email" value={currentUser.user.preferredEmail} />
          <Field label="Role" value={role.replace('_', ' ')} />
          {singleFields.map((field) => {
            if (!currentUser.hasOwnProperty(field)) return null;
            return <Field key={field} label={fieldToName[field] ?? field} value={String(currentUser[field])} />;
          })}
          {arrayFields.map((field) => {
            if (!currentUser.hasOwnProperty(field) || (currentUser[field] as any[]).length === 0) return null;
            return <Field key={field} label={fieldToName[field] ?? field} value={(currentUser[field] as string[]).join(', ')} />;
          })}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '10px 0' }}>
            <span style={{ color: 'rgba(200,232,255,0.55)', fontSize: 13 }}>Resume</span>
            {currentUser.resume ? (
              <a href={currentUser.resume} target="_blank" rel="noreferrer" style={{ color: '#60c8ff', fontWeight: 600, fontSize: 13, textDecoration: 'underline' }}>
                View Resume
              </a>
            ) : (
              <span style={{ color: 'rgba(200,232,255,0.35)', fontSize: 13 }}>Not uploaded</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
