import { UserData } from '../../pages/api/users';

interface UserListProps {
  hasAdminPrivilege: boolean;
  users: UserData[];
  onItemClick: (id: string) => void;
}

const roleColors: Record<string, string> = {
  admin: '#ff8844',
  super_admin: '#ff4488',
  organizer: '#b080ff',
  sponsor: '#ffd040',
  judge: '#40ffb8',
  hacker: '#60c8ff',
};

export default function UserList({ users, onItemClick, hasAdminPrivilege }: UserListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {users.map((u, idx) => {
        const role = u.user.permissions?.[0] ?? 'hacker';
        const roleColor = roleColors[role] ?? '#60c8ff';
        const initials = `${u.user.firstName?.[0] ?? ''}${u.user.lastName?.[0] ?? ''}`.toUpperCase();
        return (
          <div
            key={idx}
            onClick={() => { if (hasAdminPrivilege) onItemClick(u.id); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 18px', borderRadius: 12,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              cursor: hasAdminPrivilege ? 'pointer' : 'default',
              transition: 'background 0.18s, border-color 0.18s',
            }}
            onMouseEnter={e => {
              if (!hasAdminPrivilege) return;
              (e.currentTarget as HTMLElement).style.background = 'rgba(0,150,255,0.14)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,200,255,0.35)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
            }}
          >
            <div style={{
              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              background: `radial-gradient(circle at 38% 36%, rgba(255,255,255,0.45) 0%, ${roleColor}88 40%, ${roleColor}44 100%)`,
              border: `1.5px solid ${roleColor}88`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 13, color: '#fff',
            }}>
              {initials || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#e0f0ff', fontWeight: 700, fontSize: 14 }}>
                {u.user.firstName} {u.user.lastName}
              </div>
            </div>
            <div style={{
              padding: '2px 10px', borderRadius: 8,
              background: `${roleColor}22`, border: `1px solid ${roleColor}44`,
              color: roleColor, fontSize: 10, fontWeight: 700,
              letterSpacing: '0.10em', textTransform: 'uppercase', flexShrink: 0,
            }}>
              {role.replace('_', ' ')}
            </div>
            {hasAdminPrivilege && (
              <div style={{ color: 'rgba(0,200,255,0.55)', fontSize: 16, flexShrink: 0 }}>›</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
