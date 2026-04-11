import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import AdminHeader from '../../../components/adminComponents/AdminHeader';
import QRCodeReader from '../../../components/dashboardComponents/QRCodeReader';
import LoadIcon from '../../../components/LoadIcon';
import { useAuthContext } from '../../../lib/user/AuthContext';
import { isAuthorized } from '..';
import { RequestHelper } from '../../../lib/request-helper';
import { Dialog } from '@headlessui/react';

const SHIRT_CUTOFF = 150;

const glassPanel: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(100,160,255,0.08) 100%)',
  backdropFilter: 'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.26)',
  borderRadius: 18,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 6px 28px rgba(0,20,70,0.24)',
};

const successStrings = {
  claimed: 'Scan claimed!',
  invalidUser: 'Invalid user',
  alreadyClaimed: 'Already claimed',
  unexpectedError: 'Unexpected error',
  notCheckedIn: 'Not checked in yet',
  invalidFormat: 'Invalid hacker tag',
};

function getSuccessColor(s: string) {
  return s === successStrings.claimed ? '#40ff9a' : '#ff5555';
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Orbitron', 'Roboto', sans-serif",
      fontSize: 17, fontWeight: 800, color: '#e0f0ff',
      letterSpacing: '0.05em', marginBottom: 14,
      paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.14)',
      textShadow: '0 0 10px rgba(0,180,255,0.40)',
    }}>
      {children}
    </div>
  );
}

function CheckInOrderBadge({ num }: { num: number }) {
  const hasShirt = num <= SHIRT_CUTOFF;
  return (
    <div style={{
      minWidth: 48, textAlign: 'center',
      padding: '3px 8px', borderRadius: 6, fontWeight: 800, fontSize: 12, flexShrink: 0,
      background: hasShirt ? 'rgba(255,200,0,0.18)' : 'rgba(255,255,255,0.07)',
      border: hasShirt ? '1px solid rgba(255,200,0,0.45)' : '1px solid rgba(255,255,255,0.14)',
      color: hasShirt ? '#ffd040' : 'rgba(200,232,255,0.50)',
    }}>
      #{num}
    </div>
  );
}

function RegNumberBadge({ num }: { num: number }) {
  return (
    <div style={{
      minWidth: 48, textAlign: 'center',
      padding: '3px 8px', borderRadius: 6, fontWeight: 800, fontSize: 12, flexShrink: 0,
      background: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.14)',
      color: 'rgba(200,232,255,0.50)',
    }}>
      #{num}
    </div>
  );
}

interface CheckedInUser {
  id: string;
  checkInOrder: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Registrant {
  id: string;
  registrationNumber: number;
  firstName: string;
  lastName: string;
  email: string;
}

export default function Admin() {
  const { user, isSignedIn } = useAuthContext();

  const [activeTab, setActiveTab] = useState<'scanner' | 'checkedin' | 'registrations'>('scanner');

  // Scanner state
  const [scanTypes, setScanTypes] = useState([]);
  const [scansFetched, setScansFetched] = useState(false);
  const [currentScan, setCurrentScan] = useState(undefined);
  const [currentScanIdx, setCurrentScanIdx] = useState(-1);
  const [scanData, setScanData] = useState(undefined);
  const [success, setSuccess] = useState(undefined);
  const [showNewScanForm, setShowNewScanForm] = useState(false);
  const [newScanForm, setNewScanForm] = useState({ name: '', isCheckIn: false });
  const [startScan, setStartScan] = useState(false);
  const [editScan, setEditScan] = useState(false);
  const [currentEditScan, setCurrentEditScan] = useState(undefined);
  const [showDeleteScanDialog, setShowDeleteScanDialog] = useState(false);

  // Checked-in list state
  const [checkedInUsers, setCheckedInUsers] = useState<CheckedInUser[]>([]);
  const [checkedInLoading, setCheckedInLoading] = useState(false);
  const [checkedInFetched, setCheckedInFetched] = useState(false);
  const [checkedInSearch, setCheckedInSearch] = useState('');

  // Registrations list state
  const [registrants, setRegistrants] = useState<Registrant[]>([]);
  const [registrantsLoading, setRegistrantsLoading] = useState(false);
  const [registrantsFetched, setRegistrantsFetched] = useState(false);
  const [registrantsSearch, setRegistrantsSearch] = useState('');
  // Manual check-in: track which IDs are checked in and which are loading
  const [manualCheckedInIds, setManualCheckedInIds] = useState<Set<string>>(new Set());
  const [manualCheckInLoading, setManualCheckInLoading] = useState<Set<string>>(new Set());

  const handleScanClick = (data, idx) => {
    setCurrentScan(data);
    setCurrentScanIdx(idx);
  };

  const handleScan = async (data: string) => {
    if (!data.startsWith('hack:')) {
      setScanData(data);
      setSuccess(successStrings.invalidFormat);
      return;
    }
    fetch('/api/scan', {
      mode: 'cors',
      headers: { Authorization: user.token },
      method: 'POST',
      body: JSON.stringify({ id: data.replaceAll('hack:', ''), scan: currentScan.name }),
    })
      .then(async (result) => {
        setScanData(data);
        if (result.status === 404) return setSuccess(successStrings.invalidUser);
        else if (result.status === 201) return setSuccess(successStrings.alreadyClaimed);
        else if (result.status === 403) return setSuccess(successStrings.notCheckedIn);
        else if (result.status !== 200) return setSuccess(successStrings.unexpectedError);
        setSuccess(successStrings.claimed);
        setCheckedInFetched(false);
      })
      .catch(() => { setScanData(data); setSuccess(successStrings.unexpectedError); });
  };

  const updateScan = async () => {
    if (!user.permissions.includes('super_admin')) { alert('You do not have the required permission to use this functionality'); return; }
    try {
      const { status, data } = await RequestHelper.post<any, any>('/api/scan/update', { headers: { 'Content-Type': 'application/json', Authorization: user.token } }, { scanData: { ...currentEditScan } });
      if (status >= 400) { alert(data.msg); return; }
      alert(data.msg);
      const next = [...scanTypes];
      next[currentScanIdx] = { ...currentEditScan };
      setScanTypes(next);
      setCurrentScan({ ...currentEditScan });
    } catch (e) { console.error(e); }
  };

  const createNewScan = async () => {
    if (!user.permissions.includes('super_admin')) { alert('You do not have the required permission to use this functionality'); return; }
    try {
      const newScan = { ...newScanForm, precedence: scanTypes.length };
      const { status, data } = await RequestHelper.post<any, any>('/api/scan/create', { headers: { Authorization: user.token } }, { ...newScanForm, precedence: scanTypes.length });
      if (status >= 400) { alert(data.msg); return; }
      alert('Scan added');
      setScanTypes((prev) => [...prev, newScan]);
    } catch (e) { console.log(e); }
  };

  const deleteScan = async () => {
    if (!user.permissions.includes('super_admin')) { alert('You do not have the required permission to use this functionality'); return; }
    try {
      const { status, data } = await RequestHelper.post<any, any>('/api/scan/delete', { headers: { 'Content-Type': 'application/json', Authorization: user.token } }, { scanData: currentScan });
      setShowDeleteScanDialog(false);
      if (status >= 400) { alert(data.msg); return; }
      alert(data.msg);
      const next = [...scanTypes];
      next.splice(currentScanIdx, 1);
      setScanTypes(next);
      setCurrentScan(undefined);
      setCurrentScanIdx(-1);
    } catch (e) { console.log(e); }
  };

  const fetchScanTypes = () => {
    if (!isSignedIn || scansFetched) return;
    fetch('/api/scantypes', { mode: 'cors', headers: { Authorization: user.token }, method: 'GET' })
      .then(async (r) => { if (r.status !== 200) return; const d = await r.json(); setScanTypes(d); setScansFetched(true); })
      .catch(console.log);
  };

  const fetchCheckedIn = async () => {
    if (!isSignedIn || checkedInFetched) return;
    setCheckedInLoading(true);
    try {
      const { status, data } = await RequestHelper.get<CheckedInUser[]>('/api/checkedin', { headers: { Authorization: user.token } });
      if (status === 200) { setCheckedInUsers(data); setCheckedInFetched(true); }
    } catch (e) { console.error(e); } finally { setCheckedInLoading(false); }
  };

  const fetchRegistrants = async () => {
    if (!isSignedIn || registrantsFetched) return;
    setRegistrantsLoading(true);
    try {
      const { status, data } = await RequestHelper.get<Registrant[]>('/api/registrations', { headers: { Authorization: user.token } });
      if (status === 200) { setRegistrants(data); setRegistrantsFetched(true); }
    } catch (e) { console.error(e); } finally { setRegistrantsLoading(false); }
  };

  const manualCheckIn = async (registrantId: string) => {
    // Find the check-in scan type from already-fetched scan types
    const checkInScan = scanTypes.find((s: any) => s.isCheckIn);
    if (!checkInScan) {
      alert('No check-in scan type found. Please set one up in the Scanner tab first.');
      return;
    }
    setManualCheckInLoading((prev) => new Set(prev).add(registrantId));
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { Authorization: user.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: registrantId, scan: (checkInScan as any).name }),
      });
      if (res.status === 200) {
        setManualCheckedInIds((prev) => new Set(prev).add(registrantId));
        setCheckedInFetched(false); // invalidate checked-in cache
      } else if (res.status === 201) {
        setManualCheckedInIds((prev) => new Set(prev).add(registrantId));
        alert('Already checked in.');
      } else if (res.status === 404) {
        alert('User not found.');
      } else {
        alert('Unexpected error. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error. Please try again.');
    } finally {
      setManualCheckInLoading((prev) => { const next = new Set(prev); next.delete(registrantId); return next; });
    }
  };

  useEffect(() => { fetchScanTypes(); });

  useEffect(() => {
    if (activeTab === 'checkedin' && !checkedInFetched) fetchCheckedIn();
    if (activeTab === 'registrations' && !registrantsFetched) fetchRegistrants();
  }, [activeTab]);

  if (!isSignedIn || !isAuthorized(user))
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8e8ff', fontSize: 22, fontFamily: "'Orbitron', sans-serif", textShadow: '0 0 16px rgba(0,180,255,0.5)' }}>
        Unauthorized
      </div>
    );

  const filteredCheckedIn = checkedInUsers.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(checkedInSearch.toLowerCase()),
  );

  const filteredRegistrants = registrants
    .filter((r) => `${r.firstName} ${r.lastName} ${r.email}`.toLowerCase().includes(registrantsSearch.toLowerCase()));

  const tabs = [
    { key: 'scanner', label: '📷 Scanner' },
    { key: 'checkedin', label: `✅ Checked In${checkedInFetched ? ` (${checkedInUsers.length})` : ''}` },
    { key: 'registrations', label: `📋 Registrations${registrantsFetched ? ` (${registrants.length})` : ''}` },
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Head>
        <title>HackSMU — Scanner</title>
        <meta name="description" content="HackSMU Admin Scanner" />
      </Head>

      <AdminHeader />

      {currentScan && (
        <Dialog open={showDeleteScanDialog} onClose={() => setShowDeleteScanDialog(false)} className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
            <div style={{ ...glassPanel, position: 'relative', padding: '28px 32px', maxWidth: 380, width: '90%', margin: '0 auto' }}>
              <Dialog.Title style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 800, color: '#e0f0ff', marginBottom: 12 }}>
                Delete <span style={{ color: '#ff5555' }}>{currentScan.name}</span>
              </Dialog.Title>
              <Dialog.Description style={{ color: 'rgba(200,232,255,0.70)', fontSize: 14, marginBottom: 8 }}>
                This will permanently delete <strong>{currentScan.name}</strong>.
              </Dialog.Description>
              <p style={{ color: 'rgba(200,232,255,0.60)', fontSize: 13, marginBottom: 24 }}>This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={deleteScan} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(255,80,80,0.40)', cursor: 'pointer', background: 'rgba(255,60,60,0.25)', color: '#ff9999', fontWeight: 700, fontSize: 13 }}>Delete</button>
                <button onClick={() => setShowDeleteScanDialog(false)} style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.20)', cursor: 'pointer', background: 'rgba(255,255,255,0.10)', color: '#c8e8ff', fontWeight: 700, fontSize: 13 }}>Cancel</button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      <div style={{ padding: '24px 28px 48px', maxWidth: 860, width: '100%', margin: '0 auto' }}>

        {/* Page header */}
        <div style={{ ...glassPanel, padding: '20px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, background: 'radial-gradient(circle at 38% 35%, rgba(255,255,255,0.45) 0%, rgba(0,180,255,0.50) 50%, rgba(0,80,200,0.60) 100%)', border: '2px solid rgba(0,200,255,0.55)', boxShadow: '0 0 20px rgba(0,180,255,0.40)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            📷
          </div>
          <div>
            <div style={{ fontFamily: "'Orbitron', 'Roboto', sans-serif", fontSize: 22, fontWeight: 900, color: '#fff', textShadow: '0 0 18px rgba(0,200,255,0.6)', letterSpacing: '0.04em' }}>Scanner</div>
            <div style={{ color: 'rgba(200,232,255,0.70)', fontSize: 13, marginTop: 4 }}>Scan QR codes · view check-ins · track registration order</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: '9px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, border: activeTab === tab.key ? '2px solid rgba(0,200,255,0.65)' : '1px solid rgba(255,255,255,0.18)', background: activeTab === tab.key ? 'rgba(0,180,255,0.22)' : 'rgba(255,255,255,0.06)', color: activeTab === tab.key ? '#80d8ff' : 'rgba(200,232,255,0.65)', transition: 'all 0.18s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── SCANNER TAB ── */}
        {activeTab === 'scanner' && (
          <>
            {showNewScanForm ? (
              <div style={{ ...glassPanel, padding: '28px 32px' }}>
                <SectionTitle>Add New Scan Type</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                  <input type="text" value={newScanForm.name} onChange={e => setNewScanForm(p => ({ ...p, name: e.target.value }))} placeholder="Scan type name (e.g. Lunch)" style={{ padding: '12px 16px', borderRadius: 12, fontSize: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: '#e8f4ff', outline: 'none' }} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(200,232,255,0.80)', fontSize: 14, cursor: 'pointer' }}>
                    <input type="checkbox" checked={newScanForm.isCheckIn} onChange={e => setNewScanForm(p => ({ ...p, isCheckIn: e.target.checked }))} style={{ width: 16, height: 16 }} />
                    This is the check-in scan type
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button onClick={createNewScan} style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(0,200,100,0.40)', cursor: 'pointer', background: 'rgba(0,200,100,0.22)', color: '#80ffcc', fontWeight: 700, fontSize: 13 }}>Add Scan Type</button>
                  <button onClick={() => setShowNewScanForm(false)} style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: '#c8e8ff', fontWeight: 700, fontSize: 13 }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ ...glassPanel, padding: '24px 28px', marginBottom: 24 }}>
                  <SectionTitle>Scan Types</SectionTitle>
                  {!scansFetched ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}><LoadIcon width={80} height={80} /></div>
                  ) : scanTypes.length === 0 ? (
                    <div style={{ color: 'rgba(200,232,255,0.60)', fontSize: 14 }}>No scan types yet. Add one below.</div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {scanTypes.map((d, idx) => (
                        <button key={d.name} onClick={() => { handleScanClick(d, idx); setStartScan(false); setScanData(undefined); setEditScan(false); }} style={{ padding: '10px 18px', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 700, border: currentScan?.name === d.name ? '2px solid rgba(0,200,255,0.70)' : '1px solid rgba(255,255,255,0.20)', background: currentScan?.name === d.name ? 'rgba(0,180,255,0.22)' : 'rgba(255,255,255,0.08)', color: currentScan?.name === d.name ? '#80d8ff' : 'rgba(200,232,255,0.80)', transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {d.isCheckIn && <span style={{ fontSize: 11, background: 'rgba(0,200,255,0.20)', border: '1px solid rgba(0,200,255,0.40)', color: '#60d8ff', borderRadius: 6, padding: '1px 6px' }}>CHECK-IN</span>}
                          {d.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {user.permissions.includes('super_admin') && !currentScan && (
                    <button onClick={() => setShowNewScanForm(true)} style={{ marginTop: 18, padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(0,200,100,0.35)', cursor: 'pointer', background: 'rgba(0,200,100,0.18)', color: '#80ffcc', fontWeight: 700, fontSize: 13 }}>+ Add Scan Type</button>
                  )}
                </div>

                {currentScan && (
                  <div style={{ ...glassPanel, padding: '24px 28px' }}>
                    <SectionTitle>
                      {currentScan.isCheckIn && <span style={{ fontSize: 11, background: 'rgba(0,200,255,0.20)', border: '1px solid rgba(0,200,255,0.40)', color: '#60d8ff', borderRadius: 6, padding: '2px 8px', marginRight: 10 }}>CHECK-IN</span>}
                      {currentScan.name}
                    </SectionTitle>
                    {editScan ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
                        <input type="text" value={currentEditScan.name} onChange={e => setCurrentEditScan(p => ({ ...p, name: e.target.value }))} style={{ padding: '12px 16px', borderRadius: 12, fontSize: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: '#e8f4ff', outline: 'none' }} />
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(200,232,255,0.80)', fontSize: 14, cursor: 'pointer' }}>
                          <input type="checkbox" checked={currentEditScan.isCheckIn} onChange={e => setCurrentEditScan(p => ({ ...p, isCheckIn: e.target.checked }))} style={{ width: 16, height: 16 }} />
                          This is the check-in scan type
                        </label>
                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                          <button onClick={updateScan} style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(0,200,100,0.40)', cursor: 'pointer', background: 'rgba(0,200,100,0.22)', color: '#80ffcc', fontWeight: 700, fontSize: 13 }}>Save Changes</button>
                          <button onClick={() => setEditScan(false)} style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: '#c8e8ff', fontWeight: 700, fontSize: 13 }}>Cancel</button>
                        </div>
                      </div>
                    ) : startScan ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                        {!scanData ? (
                          <>
                            <p style={{ color: 'rgba(200,232,255,0.72)', fontSize: 14, margin: 0 }}>Point camera at a hacker&apos;s QR code</p>
                            <div style={{ borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(0,200,255,0.35)', boxShadow: '0 0 24px rgba(0,180,255,0.20)' }}>
                              <QRCodeReader width={260} height={260} callback={handleScan} />
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Orbitron', sans-serif", color: getSuccessColor(success), textShadow: `0 0 20px ${getSuccessColor(success)}88`, textAlign: 'center' }}>
                              {success ?? 'Unexpected error'}
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                              <button onClick={() => setScanData(undefined)} style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(0,200,100,0.40)', cursor: 'pointer', background: 'rgba(0,200,100,0.22)', color: '#80ffcc', fontWeight: 700, fontSize: 13 }}>Next Scan</button>
                              <button onClick={() => { setScanData(undefined); setCurrentScan(undefined); setStartScan(false); }} style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: '#c8e8ff', fontWeight: 700, fontSize: 13 }}>Done</button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        <button onClick={() => setStartScan(true)} style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(0,180,255,0.40)', cursor: 'pointer', background: 'rgba(0,180,255,0.22)', color: '#80d8ff', fontWeight: 700, fontSize: 13 }}>Start Scan</button>
                        {user.permissions.includes('super_admin') && (
                          <>
                            <button onClick={() => { setCurrentEditScan(currentScan); setEditScan(true); }} style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: '#c8e8ff', fontWeight: 700, fontSize: 13 }}>Edit</button>
                            <button onClick={() => { if (currentScan.isCheckIn) { alert('Check-in scan cannot be deleted'); return; } setShowDeleteScanDialog(true); }} style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(255,80,80,0.35)', cursor: 'pointer', background: 'rgba(255,60,60,0.18)', color: '#ff9999', fontWeight: 700, fontSize: 13 }}>Delete</button>
                          </>
                        )}
                        <button onClick={() => { setCurrentScan(undefined); setCurrentScanIdx(-1); }} style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'rgba(200,232,255,0.60)', fontWeight: 700, fontSize: 13 }}>Deselect</button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── CHECKED-IN TAB ── */}
        {activeTab === 'checkedin' && (
          <div style={{ ...glassPanel, padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <SectionTitle>Checked-In Attendees{checkedInFetched ? ` — ${checkedInUsers.length}` : ''}</SectionTitle>
              <button onClick={() => { setCheckedInFetched(false); fetchCheckedIn(); }} style={{ padding: '7px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: '#c8e8ff', fontWeight: 700, fontSize: 12 }}>Refresh</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 12, color: 'rgba(200,232,255,0.60)' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(255,200,0,0.40)', border: '1px solid rgba(255,200,0,0.60)', display: 'inline-block' }} />
              Gold # = first {SHIRT_CUTOFF} to check in (shirt eligible)
            </div>

            {checkedInLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}><LoadIcon width={80} height={80} /></div>
            ) : (
              <>
                <input type="text" value={checkedInSearch} onChange={e => setCheckedInSearch(e.target.value)} placeholder="Search by name or email…" style={{ width: '100%', padding: '11px 16px', borderRadius: 12, fontSize: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: '#e8f4ff', outline: 'none', marginBottom: 16, boxSizing: 'border-box' }} />
                {filteredCheckedIn.length === 0 ? (
                  <div style={{ color: 'rgba(200,232,255,0.55)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
                    {checkedInSearch ? 'No results match your search.' : 'No one has checked in yet.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filteredCheckedIn.map((u) => (
                      <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: u.checkInOrder <= SHIRT_CUTOFF ? 'rgba(255,200,0,0.06)' : 'rgba(255,255,255,0.06)', border: u.checkInOrder <= SHIRT_CUTOFF ? '1px solid rgba(255,200,0,0.20)' : '1px solid rgba(255,255,255,0.12)' }}>
                        <CheckInOrderBadge num={u.checkInOrder} />
                        <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'radial-gradient(circle at 38% 36%, rgba(255,255,255,0.45) 0%, rgba(0,180,255,0.50) 50%, rgba(0,80,200,0.60) 100%)', border: '1.5px solid rgba(0,200,255,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 12, color: '#fff' }}>
                          {(u.firstName?.[0] ?? '?').toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: '#e0f0ff', fontWeight: 700, fontSize: 14 }}>{u.firstName} {u.lastName}</div>
                          <div style={{ color: 'rgba(200,232,255,0.55)', fontSize: 12, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                          <div style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(0,200,100,0.15)', border: '1px solid rgba(0,200,100,0.30)', color: '#60ffb8', fontWeight: 700 }}>✓ IN</div>
                          {u.checkInOrder <= SHIRT_CUTOFF && <div style={{ fontSize: 10, color: '#ffd040', fontWeight: 700 }}>👕 SHIRT</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── REGISTRATIONS TAB ── */}
        {activeTab === 'registrations' && (
          <div style={{ ...glassPanel, padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <SectionTitle>All Registrants{registrantsFetched ? ` — ${registrants.length}` : ''}</SectionTitle>
              <button onClick={() => { setRegistrantsFetched(false); fetchRegistrants(); }} style={{ padding: '7px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', background: 'rgba(255,255,255,0.08)', color: '#c8e8ff', fontWeight: 700, fontSize: 12 }}>Refresh</button>
            </div>

            {registrantsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}><LoadIcon width={80} height={80} /></div>
            ) : (
              <>
                <input type="text" value={registrantsSearch} onChange={e => setRegistrantsSearch(e.target.value)} placeholder="Search by name or email…" style={{ width: '100%', padding: '11px 16px', borderRadius: 12, fontSize: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: '#e8f4ff', outline: 'none', marginBottom: 16, boxSizing: 'border-box' }} />

                {filteredRegistrants.length === 0 ? (
                  <div style={{ color: 'rgba(200,232,255,0.55)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
                    {registrantsSearch ? 'No results match your search.' : 'No registrations yet.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filteredRegistrants.map((r) => {
                      const isCheckedIn = manualCheckedInIds.has(r.id);
                      const isLoading = manualCheckInLoading.has(r.id);
                      return (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                          <RegNumberBadge num={r.registrationNumber} />
                          <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'radial-gradient(circle at 38% 36%, rgba(255,255,255,0.45) 0%, rgba(0,180,255,0.50) 50%, rgba(0,80,200,0.60) 100%)', border: '1.5px solid rgba(0,200,255,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 12, color: '#fff' }}>
                            {(r.firstName?.[0] ?? '?').toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: '#e0f0ff', fontWeight: 700, fontSize: 14 }}>{r.firstName} {r.lastName}</div>
                            <div style={{ color: 'rgba(200,232,255,0.55)', fontSize: 12, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.email}</div>
                          </div>
                          {isCheckedIn ? (
                            <div style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(0,200,100,0.15)', border: '1px solid rgba(0,200,100,0.30)', color: '#60ffb8', fontWeight: 700, flexShrink: 0 }}>✓ IN</div>
                          ) : (
                            <button
                              onClick={() => manualCheckIn(r.id)}
                              disabled={isLoading}
                              style={{ padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(0,180,255,0.40)', cursor: isLoading ? 'not-allowed' : 'pointer', background: 'rgba(0,180,255,0.18)', color: '#80d8ff', fontWeight: 700, fontSize: 11, flexShrink: 0, opacity: isLoading ? 0.6 : 1 }}
                            >
                              {isLoading ? '…' : 'Check In'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
