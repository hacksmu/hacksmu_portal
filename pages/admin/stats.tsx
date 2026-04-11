import Head from 'next/head';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import AdminHeader from '../../components/adminComponents/AdminHeader';
import { RequestHelper } from '../../lib/request-helper';
import { useAuthContext } from '../../lib/user/AuthContext';
import { fieldNames, statRecordTypes } from '../../hackportal.config';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';

const glassPanel: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(100,160,255,0.08) 100%)',
  backdropFilter: 'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.26)',
  borderRadius: 18,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 6px 28px rgba(0,20,70,0.24)',
};

const CHART_COLORS = [
  '#00c8ff', '#3fb98e', '#a78bfa', '#f472b6', '#facc15',
  '#34d399', '#60a5fa', '#fb923c', '#e879f9', '#4ade80',
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'Orbitron', 'Roboto', sans-serif",
        fontSize: 17,
        fontWeight: 800,
        color: '#e0f0ff',
        letterSpacing: '0.05em',
        marginBottom: 14,
        paddingBottom: 8,
        borderBottom: '1px solid rgba(255,255,255,0.14)',
        textShadow: '0 0 10px rgba(0,180,255,0.40)',
      }}
    >
      {children}
    </div>
  );
}

function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        ...glassPanel,
        padding: '20px 28px',
        flex: '1 1 180px',
        minWidth: 160,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ color: 'rgba(200,232,255,0.70)', fontSize: 12, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: 38,
        fontWeight: 900,
        color: '#fff',
        textShadow: '0 0 18px rgba(0,200,255,0.55)',
        lineHeight: 1,
      }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

function computeAverageAge(ageMap: Record<string | number, number>): string {
  let total = 0, count = 0;
  for (const [age, freq] of Object.entries(ageMap)) {
    const n = Number(age);
    if (!isNaN(n)) { total += n * freq; count += freq; }
  }
  return count > 0 ? (total / count).toFixed(1) : 'N/A';
}

function topEntry(map: Record<string | number, number>): string {
  if (!map || Object.keys(map).length === 0) return 'N/A';
  return Object.entries(map).sort((a, b) => b[1] - a[1])[0][0];
}

type StatsData = GeneralStats & statRecordTypes;

// Fields best displayed as pie charts (small number of categories)
const PIE_FIELDS = new Set(['gender', 'ethnicity', 'race', 'softwareExperience', 'size', 'studyLevel', 'heardFrom']);

function BarChart({ title, data }: { title: string; data: Record<string | number, number> }) {
  const items = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([k, v]) => ({ itemName: k, Count: v }));

  if (items.length === 0) return null;

  const longestKey = items.reduce((prev, curr) => Math.max(prev, curr.itemName.length), 0);

  return (
    <div style={{ ...glassPanel, padding: '24px 20px', marginBottom: 24 }}>
      <SectionTitle>{title}</SectionTitle>
      <div style={{ height: 340 }}>
        <ResponsiveBar
          data={items}
          indexBy="itemName"
          keys={['Count']}
          margin={{ top: 10, right: 20, bottom: longestKey >= 12 ? 90 : 50, left: 52 }}
          padding={0.35}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={CHART_COLORS}
          colorBy="indexValue"
          animate={true}
          enableLabel={false}
          theme={{
            axis: { ticks: { text: { fill: 'rgba(200,232,255,0.75)', fontSize: 11 } }, legend: { text: { fill: 'rgba(200,232,255,0.75)', fontSize: 12 } } },
            grid: { line: { stroke: 'rgba(255,255,255,0.07)' } },
          }}
          axisTop={null}
          axisRight={null}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Count',
            legendPosition: 'middle',
            legendOffset: -40,
          }}
          axisBottom={{
            tickRotation: longestKey >= 12 ? 30 : 0,
            legendPosition: 'middle',
          }}
          tooltip={({ id, value, indexValue }) => (
            <div style={{
              background: 'rgba(0,20,60,0.92)',
              border: '1px solid rgba(0,200,255,0.35)',
              borderRadius: 10,
              padding: '8px 14px',
              color: '#e0f0ff',
              fontSize: 13,
            }}>
              <strong>{indexValue}</strong>: {value}
            </div>
          )}
        />
      </div>
    </div>
  );
}

function PieChart({ title, data }: { title: string; data: Record<string | number, number> }) {
  const pieData = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v], i) => ({
      id: k,
      label: k,
      value: v,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

  if (pieData.length === 0) return null;

  return (
    <div style={{ ...glassPanel, padding: '24px 20px', marginBottom: 24 }}>
      <SectionTitle>{title}</SectionTitle>
      <div style={{ height: 340 }}>
        <ResponsivePie
          data={pieData}
          margin={{ top: 20, right: 120, bottom: 30, left: 120 }}
          innerRadius={0.5}
          padAngle={1.5}
          cornerRadius={4}
          colors={({ data }) => data.color}
          borderWidth={1}
          borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
          animate={true}
          theme={{
            labels: { text: { fill: '#e0f0ff', fontSize: 12 } },
            legends: { text: { fill: 'rgba(200,232,255,0.80)', fontSize: 12 } },
          }}
          legends={[
            {
              anchor: 'right',
              direction: 'column',
              translateX: 110,
              translateY: 0,
              itemWidth: 100,
              itemHeight: 22,
              itemTextColor: 'rgba(200,232,255,0.80)',
              symbolSize: 12,
              symbolShape: 'circle',
            },
          ]}
          tooltip={({ datum }) => (
            <div style={{
              background: 'rgba(0,20,60,0.92)',
              border: '1px solid rgba(0,200,255,0.35)',
              borderRadius: 10,
              padding: '8px 14px',
              color: '#e0f0ff',
              fontSize: 13,
            }}>
              <strong>{datum.label}</strong>: {datum.value}
            </div>
          )}
        />
      </div>
    </div>
  );
}

function isAuthorized(user): boolean {
  if (!user || !user.permissions) return false;
  return (user.permissions as string[]).includes('super_admin');
}

export default function StatsPage() {
  const { user, isSignedIn } = useAuthContext();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthorized(user)) {
      setLoading(false);
      return;
    }
    async function fetchStats() {
      try {
        const token = await firebase.auth().currentUser?.getIdToken();
        if (!token) {
          setError('Could not get auth token. Please sign in again.');
          return;
        }
        const res = await RequestHelper.get<StatsData>('/api/stats', {
          headers: { Authorization: token },
        });
        if ((res as any).status === 403) {
          setError('Access denied. Super Admin role required.');
          return;
        }
        setStats(res.data);
      } catch (e) {
        setError('Failed to load stats. Please try again.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user]);

  if (!isSignedIn || !isAuthorized(user)) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#c8e8ff', fontSize: 22, fontFamily: "'Orbitron', sans-serif",
        textShadow: '0 0 16px rgba(0,180,255,0.5)',
      }}>
        Unauthorized — Super Admin access required
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Head>
        <title>HackPortal - Stats</title>
        <meta name="description" content="HackPortal Admin Stats" />
      </Head>
      <AdminHeader />

      <div style={{ padding: '24px 28px 64px', maxWidth: 1100, width: '100%', margin: '0 auto' }}>
        {/* Back button + title */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-start' }}>
          <Link href="/admin">
            <a className="aero-btn" style={{ fontSize: 13, padding: '9px 16px', textDecoration: 'none' }}>
              ← Admin Dashboard
            </a>
          </Link>
        </div>

        <div style={{
          ...glassPanel,
          padding: '20px 24px',
          marginBottom: 28,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{
              fontFamily: "'Orbitron', 'Roboto', sans-serif",
              fontSize: 24, fontWeight: 900, color: '#fff',
              textShadow: '0 0 18px rgba(0,200,255,0.6)', letterSpacing: '0.04em',
            }}>
              Registration Stats
            </div>
            <div style={{ marginTop: 8, color: 'rgba(200,232,255,0.78)', fontSize: 14 }}>
              Aggregate data from all registered hackers
            </div>
          </div>
          <div style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: 18,
            background: 'rgba(96,200,255,0.16)', border: '1px solid rgba(96,200,255,0.36)',
            color: '#80d8ff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Super Admin
          </div>
        </div>

        {loading && (
          <div style={{ color: 'rgba(200,232,255,0.72)', fontSize: 16, textAlign: 'center', padding: '60px 0' }}>
            Loading stats...
          </div>
        )}

        {error && (
          <div style={{ ...glassPanel, padding: '20px 24px', color: '#ff8080', fontSize: 15 }}>
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Summary badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
              <StatBadge label="Total Registered" value={(stats.hackerCount ?? 0) + (stats.adminCount ?? 0) + (stats.superAdminCount ?? 0)} />
              <StatBadge label="Hackers" value={stats.hackerCount ?? 0} />
              <StatBadge label="Checked In" value={stats.checkedInCount ?? 0} />
              <StatBadge label="Avg Age" value={computeAverageAge(stats.age ?? {})} />
              <StatBadge label="Top School" value={topEntry(stats.school ?? {})} />
              <StatBadge label="Top Gender" value={topEntry(stats.gender ?? {})} />
            </div>

            {/* Quick breakdown row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
              {(['race', 'ethnicity', 'softwareExperience', 'heardFrom'] as const).map((field) => {
                const data: Record<string, number> = (stats as any)[field] ?? {};
                const total = Object.values(data).reduce((s, n) => s + n, 0);
                if (total === 0) return null;
                const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);
                const labels: Record<string, string> = {
                  race: 'Race', ethnicity: 'Ethnicity',
                  softwareExperience: 'Experience', heardFrom: 'Heard From',
                };
                return (
                  <div key={field} style={{ ...glassPanel, padding: '18px 22px', flex: '1 1 200px', minWidth: 180 }}>
                    <div style={{ color: 'rgba(200,232,255,0.70)', fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 10 }}>
                      {labels[field]}
                    </div>
                    {sorted.map(([k, v]) => (
                      <div key={k} style={{ marginBottom: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#c8e8ff', marginBottom: 2 }}>
                          <span>{k}</span>
                          <span style={{ color: '#80d8ff', fontWeight: 700 }}>{Math.round((v / total) * 100)}%</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.10)' }}>
                          <div style={{ height: '100%', borderRadius: 2, width: `${(v / total) * 100}%`, background: 'linear-gradient(90deg, #00c8ff, #3fb98e)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Top Schools table */}
            {stats.school && Object.keys(stats.school).length > 0 && (() => {
              const sorted = Object.entries(stats.school).sort((a, b) => b[1] - a[1]).slice(0, 10);
              const max = sorted[0][1];
              return (
                <div style={{ ...glassPanel, padding: '24px 28px', marginBottom: 24 }}>
                  <SectionTitle>Top Schools</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sorted.map(([school, count], i) => (
                      <div key={school} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 22, color: 'rgba(200,232,255,0.45)', fontSize: 12, textAlign: 'right', flexShrink: 0 }}>
                          #{i + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#c8e8ff', marginBottom: 3 }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>{school}</span>
                            <span style={{ fontWeight: 700, color: '#80d8ff', flexShrink: 0 }}>{count}</span>
                          </div>
                          <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                            <div style={{ height: '100%', borderRadius: 3, width: `${(count / max) * 100}%`, background: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${CHART_COLORS[(i + 1) % CHART_COLORS.length]})` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Charts — iterate all fieldNames from config */}
            {Object.entries(fieldNames).map(([field, title]) => {
              const data: Record<string | number, number> = (stats as any)[field] ?? {};
              if (Object.keys(data).length === 0) return null;

              if (field === 'scans') {
                return <BarChart key={field} title="Event Scans / Swag Claims" data={data} />;
              }
              if (field === 'timestamp') {
                return <BarChart key={field} title="Registrations Over Time" data={data} />;
              }
              return PIE_FIELDS.has(field) ? (
                <PieChart key={field} title={title} data={data} />
              ) : (
                <BarChart key={field} title={title} data={data} />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
