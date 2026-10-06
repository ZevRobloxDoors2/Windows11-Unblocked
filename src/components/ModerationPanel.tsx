import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Users, FileText, Activity, Megaphone, CheckCircle, 
  HelpCircle, Settings as SettingsIcon, BarChart3, X, Search, Ban, 
  UserCheck, Trash2, Check, AlertTriangle, RefreshCw, Send, Plus
} from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface ModerationPanelProps {
  onClose: () => void;
  userProfile?: any;
}

export const ModerationPanel: React.FC<ModerationPanelProps> = ({ onClose, userProfile }) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'appeals' | 'logs' | 'announcements' | 'verification' | 'suggestions' | 'settings' | 'analytics'>('reports');

  // Real users from Firestore & local profiles
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Real-time listener for all signed-in users in Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData: any[] = [];
      snapshot.forEach((docSnap) => {
        usersData.push({ id: docSnap.id, ...docSnap.data() });
      });
      setAllUsers(usersData);
      setLoadingUsers(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoadingUsers(false);
    });

    return () => unsubscribe();
  }, []);

  const [reports, setReports] = useState([
    { id: 'rep-1', type: 'Comment', submitter: 'user123', content: 'Inappropriate language in chat', status: 'Pending', time: '10 mins ago' },
    { id: 'rep-2', type: 'Account', submitter: 'gamer99', content: 'Suspicious bot activity / spamming', status: 'Pending', time: '1 hour ago' },
  ]);

  const [appeals, setAppeals] = useState([
    { id: 'app-1', username: 'badactor', reason: 'I promise I will follow the rules from now on please unban me', status: 'Pending' }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { id: 'log-1', admin: userProfile?.username || 'admin', action: 'Accessed Security & Moderation Panel', time: new Date().toLocaleString() }
  ]);

  const [announcements, setAnnouncements] = useState([
    { id: 'ann-1', text: 'Welcome to Ebox Cloud Halloween Update! Spooky themes are now live!', color: 'orange', active: true }
  ]);
  const [newAnnText, setNewAnnText] = useState('');

  const [verifications, setVerifications] = useState([
    { id: 'ver-1', username: 'gamedev99', fullName: 'Alex Miller', schoolIdUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80', status: 'Pending' }
  ]);

  const [suggestions, setSuggestions] = useState([
    { id: 'sug-1', username: 'gamer99', text: 'Please add more multiplayer IO games!', votes: 24, status: 'Reviewing' }
  ]);

  const [settingsToggles, setSettingsToggles] = useState({
    cacheEnabled: true,
    apiKeyRotation: true,
    serverCrashSim: false,
    maintenanceMode: false
  });

  const [userSearch, setUserSearch] = useState('');

  // Action helpers with Firestore persistence
  const handleToggleBan = async (targetUserId: string, currentBannedStatus: boolean) => {
    try {
      const userDocRef = doc(db, 'users', targetUserId);
      const newStatus = !currentBannedStatus;
      const reason = newStatus ? prompt('Enter reason for ban:') || 'Violating community guidelines' : '';
      
      await updateDoc(userDocRef, {
        banned: newStatus,
        banReason: newStatus ? reason : null
      });

      setAuditLogs(prev => [
        { id: `log-${Date.now()}`, admin: userProfile?.username || 'Staff', action: `${newStatus ? 'Banned' : 'Unbanned'} user ${targetUserId} (${reason})`, time: new Date().toLocaleString() },
        ...prev
      ]);
    } catch (e) {
      console.error("Error toggling ban:", e);
      alert("Failed to update ban status in database.");
    }
  };

  const handleForceRename = async (targetUserId: string, currentName: string) => {
    const newName = prompt('Enter new username for user:', currentName);
    if (!newName || newName.trim() === '') return;
    try {
      const userDocRef = doc(db, 'users', targetUserId);
      await updateDoc(userDocRef, {
        username: newName.trim(),
        gamertagLower: newName.trim().toLowerCase()
      });

      setAuditLogs(prev => [
        { id: `log-${Date.now()}`, admin: userProfile?.username || 'Staff', action: `Force-renamed user ${targetUserId} to ${newName}`, time: new Date().toLocaleString() },
        ...prev
      ]);
    } catch (e) {
      console.error("Error force-renaming user:", e);
      alert("Failed to update username.");
    }
  };

  const handleToggleVerification = async (targetUserId: string, currentVerifiedStatus: boolean) => {
    try {
      const userDocRef = doc(db, 'users', targetUserId);
      const newStatus = !currentVerifiedStatus;
      await updateDoc(userDocRef, {
        verified: newStatus
      });

      setAuditLogs(prev => [
        { id: `log-${Date.now()}`, admin: userProfile?.username || 'Staff', action: `${newStatus ? 'Granted' : 'Revoked'} verification for ${targetUserId}`, time: new Date().toLocaleString() },
        ...prev
      ]);
    } catch (e) {
      console.error("Error updating verification:", e);
    }
  };

  const handleUpdateRole = async (targetUserId: string, newRole: string) => {
    try {
      const userDocRef = doc(db, 'users', targetUserId);
      await updateDoc(userDocRef, {
        role: newRole
      });

      setAuditLogs(prev => [
        { id: `log-${Date.now()}`, admin: userProfile?.username || 'Staff', action: `Changed role of ${targetUserId} to ${newRole}`, time: new Date().toLocaleString() },
        ...prev
      ]);
    } catch (e) {
      console.error("Error updating role:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-6xl h-[85vh] bg-zinc-950 border border-red-500/40 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.2)] flex flex-col overflow-hidden text-white">
        
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 border border-red-500 rounded-xl text-red-500">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide flex items-center gap-2">
                Ebox Security & Moderation Panel 
                <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full border border-red-500/30 uppercase font-semibold">
                  {userProfile?.role || 'Staff / Owner'}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Complete platform governance, user management for all registered accounts, audit trails & security controls</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content Layout with Sidebar Tabs */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar Navigation */}
          <div className="w-64 bg-zinc-900/50 border-r border-zinc-800 flex flex-col p-3 gap-1 overflow-y-auto">
            <div className="text-[10px] font-semibold text-zinc-500 uppercase px-3 py-1 tracking-wider">Moderation</div>
            
            <button 
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'reports' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'}`}
            >
              <FileText size={18} /> Reports ({reports.length})
            </button>

            <button 
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'}`}
            >
              <Users size={18} /> All Users ({allUsers.length})
            </button>

            <button 
              onClick={() => setActiveTab('appeals')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'appeals' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'}`}
            >
              <UserCheck size={18} /> Ban Appeals ({appeals.length})
            </button>

            <button 
              onClick={() => setActiveTab('verification')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'verification' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'}`}
            >
              <CheckCircle size={18} /> Verification Requests
            </button>

            <div className="text-[10px] font-semibold text-zinc-500 uppercase px-3 pt-4 pb-1 tracking-wider">Operations & Logs</div>

            <button 
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'logs' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'}`}
            >
              <Activity size={18} /> Audit Logs
            </button>

            <button 
              onClick={() => setActiveTab('announcements')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'announcements' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'}`}
            >
              <Megaphone size={18} /> Announcements
            </button>

            <button 
              onClick={() => setActiveTab('suggestions')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'suggestions' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'}`}
            >
              <HelpCircle size={18} /> Community Suggestions
            </button>

            <div className="text-[10px] font-semibold text-zinc-500 uppercase px-3 pt-4 pb-1 tracking-wider">System</div>

            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'}`}
            >
              <SettingsIcon size={18} /> Platform Settings
            </button>

            <button 
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'}`}
            >
              <BarChart3 size={18} /> Analytics & Metrics
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 bg-zinc-950 p-6 overflow-y-auto">
            
            {/* 1. REPORTS TAB */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">User Reports Review</h3>
                  <p className="text-xs text-zinc-400">Review user-submitted reports for comments or accounts and take corrective action.</p>
                </div>

                <div className="space-y-3">
                  {reports.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 bg-zinc-900/40 rounded-xl border border-zinc-800">No pending reports!</div>
                  ) : (
                    reports.map(rep => (
                      <div key={rep.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded font-semibold">{rep.type}</span>
                            <span className="text-xs text-zinc-400">Submitted by: <strong className="text-white">{rep.submitter}</strong></span>
                            <span className="text-xs text-zinc-500">• {rep.time}</span>
                          </div>
                          <p className="text-sm text-zinc-200 font-medium">{rep.content}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setReports(reports.filter(r => r.id !== rep.id))}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium rounded-lg text-zinc-300 transition-colors"
                          >
                            Dismiss
                          </button>
                          <button 
                            onClick={() => {
                              setReports(reports.filter(r => r.id !== rep.id));
                              setAuditLogs(prev => [{ id: `log-${Date.now()}`, admin: userProfile?.username || 'Staff', action: `Resolved report ${rep.id} and took action`, time: new Date().toLocaleString() }, ...prev]);
                            }}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-xs font-medium rounded-lg text-white transition-colors flex items-center gap-1"
                          >
                            <Trash2 size={14} /> Delete & Penalize
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 2. USERS TAB (All Signed-In Accounts) */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">All Signed-In Users ({allUsers.length})</h3>
                    <p className="text-xs text-zinc-400">Inspect every account that has ever signed into the site, apply bans, force-rename, or manage roles.</p>
                  </div>
                  <div className="relative w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input 
                      type="text" 
                      placeholder="Search users by name/email..." 
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
                  {loadingUsers ? (
                    <div className="p-8 text-center text-zinc-500">Loading registered users from database...</div>
                  ) : allUsers.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500">No registered accounts found in database yet.</div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                          <th className="p-3">User / Gamertag</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {allUsers.filter(u => (u.username || '').toLowerCase().includes(userSearch.toLowerCase()) || (u.email || '').toLowerCase().includes(userSearch.toLowerCase())).map(u => (
                          <tr key={u.id || u.uid} className="hover:bg-zinc-900/50 transition-colors">
                            <td className="p-3 font-medium text-white flex items-center gap-2">
                              {u.photoURL && <img src={u.photoURL} alt="" className="w-6 h-6 rounded-full object-cover" />}
                              {u.username || 'Anonymous User'}
                              {u.verified && <span className="text-[#00A4EF] font-bold" title="Verified">✓</span>}
                            </td>
                            <td className="p-3 text-zinc-400">{u.email || 'No email'}</td>
                            <td className="p-3">
                              <select 
                                value={u.role || 'user'}
                                onChange={(e) => handleUpdateRole(u.id || u.uid, e.target.value)}
                                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[11px] text-white focus:outline-none"
                              >
                                <option value="user">User</option>
                                <option value="staff">Staff</option>
                                <option value="owner">Owner</option>
                              </select>
                            </td>
                            <td className="p-3">
                              {u.banned ? (
                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px] font-semibold" title={u.banReason}>Banned</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-[10px] font-semibold">Active</span>
                              )}
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button 
                                onClick={() => handleToggleBan(u.id || u.uid, !!u.banned)}
                                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${u.banned ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
                              >
                                {u.banned ? 'Unban' : 'Ban'}
                              </button>
                              <button 
                                onClick={() => handleForceRename(u.id || u.uid, u.username || 'User')}
                                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-[11px] font-medium text-zinc-300 transition-colors"
                              >
                                Rename
                              </button>
                              <button 
                                onClick={() => handleToggleVerification(u.id || u.uid, !!u.verified)}
                                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${u.verified ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'}`}
                              >
                                {u.verified ? 'Unverify' : 'Verify'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* 3. APPEALS TAB */}
            {activeTab === 'appeals' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Ban Appeals Review</h3>
                  <p className="text-xs text-zinc-400">Review ban appeals submitted by banned users seeking reinstatement.</p>
                </div>

                <div className="space-y-3">
                  {appeals.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 bg-zinc-900/40 rounded-xl border border-zinc-800">No pending ban appeals.</div>
                  ) : (
                    appeals.map(app => (
                      <div key={app.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-red-400">User: {app.username}</span>
                          <p className="text-sm text-zinc-200">"{app.reason}"</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setAppeals(appeals.filter(a => a.id !== app.id))}
                            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-medium rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => {
                              setAppeals(appeals.filter(a => a.id !== app.id));
                              setAuditLogs(prev => [{ id: `log-${Date.now()}`, admin: userProfile?.username || 'Staff', action: `Approved appeal for ${app.username}`, time: new Date().toLocaleString() }, ...prev]);
                            }}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-xs font-medium rounded-lg text-white transition-colors"
                          >
                            Approve (Unban)
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 4. AUDIT LOGS TAB */}
            {activeTab === 'logs' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Security & Audit Logs</h3>
                  <p className="text-xs text-zinc-400">Complete security trail tracking staff and owner actions with timestamps.</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 font-mono text-xs max-h-[500px] overflow-y-auto">
                  {auditLogs.map(log => (
                    <div key={log.id} className="p-3 bg-zinc-950 rounded-lg border border-zinc-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-red-400 font-semibold">[{log.admin}]</span>
                        <span className="text-zinc-200">{log.action}</span>
                      </div>
                      <span className="text-zinc-500">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. ANNOUNCEMENTS TAB */}
            {activeTab === 'announcements' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Platform Announcements & Banners</h3>
                  <p className="text-xs text-zinc-400">Broadcast platform-wide or game-targeted banner notifications.</p>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter announcement banner text..." 
                    value={newAnnText}
                    onChange={(e) => setNewAnnText(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                  <button 
                    onClick={() => {
                      if (newAnnText.trim()) {
                        setAnnouncements([...announcements, { id: `ann-${Date.now()}`, text: newAnnText, color: 'orange', active: true }]);
                        setAuditLogs(prev => [{ id: `log-${Date.now()}`, admin: userProfile?.username || 'Staff', action: `Broadcasted announcement: ${newAnnText}`, time: new Date().toLocaleString() }, ...prev]);
                        setNewAnnText('');
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-xs font-semibold rounded-xl text-white transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Broadcast
                  </button>
                </div>

                <div className="space-y-3">
                  {announcements.map(ann => (
                    <div key={ann.id} className="p-4 bg-zinc-900 border border-orange-500/30 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Megaphone size={18} className="text-orange-400" />
                        <span className="text-sm text-white font-medium">{ann.text}</span>
                      </div>
                      <button 
                        onClick={() => setAnnouncements(announcements.filter(a => a.id !== ann.id))}
                        className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs rounded-lg text-zinc-300"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. VERIFICATION TAB */}
            {activeTab === 'verification' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Verification Applications</h3>
                  <p className="text-xs text-zinc-400">Review pending School ID verification submissions and grant blue checkmarks.</p>
                </div>

                <div className="space-y-4">
                  {verifications.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 bg-zinc-900/40 rounded-xl border border-zinc-800">No pending verification requests.</div>
                  ) : (
                    verifications.map(v => (
                      <div key={v.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img src={v.schoolIdUrl} alt="School ID" className="w-16 h-12 rounded object-cover border border-zinc-700" />
                          <div>
                            <h4 className="font-semibold text-white">{v.fullName} <span className="text-xs text-zinc-400">({v.username})</span></h4>
                            <span className="text-[11px] text-yellow-400">School ID Verification Submitted</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setVerifications(verifications.filter(item => item.id !== v.id))}
                            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs rounded-lg"
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => {
                              setVerifications(verifications.filter(item => item.id !== v.id));
                              setAuditLogs(prev => [{ id: `log-${Date.now()}`, admin: userProfile?.username || 'Staff', action: `Approved verification for ${v.username}`, time: new Date().toLocaleString() }, ...prev]);
                            }}
                            className="px-3 py-1.5 bg-[#00A4EF] hover:bg-[#0090d4] text-xs font-semibold rounded-lg text-white"
                          >
                            Approve Verified ✓
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 7. SUGGESTIONS TAB */}
            {activeTab === 'suggestions' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Community Suggestions</h3>
                  <p className="text-xs text-zinc-400">Review feature suggestions and feedback submitted by users.</p>
                </div>

                <div className="space-y-3">
                  {suggestions.map(s => (
                    <div key={s.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs text-zinc-400">Suggested by <strong className="text-white">{s.username}</strong></span>
                        <p className="text-sm text-zinc-200">{s.text}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-zinc-800 px-2.5 py-1 rounded-lg text-zinc-300 font-semibold">👍 {s.votes} votes</span>
                        <button 
                          onClick={() => setSuggestions(suggestions.filter(item => item.id !== s.id))}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs rounded-lg text-zinc-300"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Global Platform Settings</h3>
                  <p className="text-xs text-zinc-400">Configure global platform switches and simulations.</p>
                </div>

                <div className="space-y-4 max-w-xl">
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white text-sm">Cache Toggles</h4>
                      <p className="text-xs text-zinc-400">Enable local storage caching for assets & app state</p>
                    </div>
                    <button 
                      onClick={() => {
                        const newVal = !settingsToggles.cacheEnabled;
                        setSettingsToggles({...settingsToggles, cacheEnabled: newVal});
                        setAuditLogs(prev => [{ id: `log-${Date.now()}`, admin: userProfile?.username || 'Staff', action: `Toggled Cache to ${newVal}`, time: new Date().toLocaleString() }, ...prev]);
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative p-1 ${settingsToggles.cacheEnabled ? 'bg-green-600' : 'bg-zinc-700'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settingsToggles.cacheEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white text-sm">API Key Rotation</h4>
                      <p className="text-xs text-zinc-400">Automatically rotate API service credentials</p>
                    </div>
                    <button 
                      onClick={() => {
                        const newVal = !settingsToggles.apiKeyRotation;
                        setSettingsToggles({...settingsToggles, apiKeyRotation: newVal});
                        setAuditLogs(prev => [{ id: `log-${Date.now()}`, admin: userProfile?.username || 'Staff', action: `Toggled API Key Rotation to ${newVal}`, time: new Date().toLocaleString() }, ...prev]);
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative p-1 ${settingsToggles.apiKeyRotation ? 'bg-green-600' : 'bg-zinc-700'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settingsToggles.apiKeyRotation ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white text-sm">Server Crash Testing Simulation</h4>
                      <p className="text-xs text-zinc-400">Simulate backend response failures for resilience testing</p>
                    </div>
                    <button 
                      onClick={() => {
                        const newVal = !settingsToggles.serverCrashSim;
                        setSettingsToggles({...settingsToggles, serverCrashSim: newVal});
                        setAuditLogs(prev => [{ id: `log-${Date.now()}`, admin: userProfile?.username || 'Staff', action: `Toggled Server Crash Simulation to ${newVal}`, time: new Date().toLocaleString() }, ...prev]);
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative p-1 ${settingsToggles.serverCrashSim ? 'bg-red-600' : 'bg-zinc-700'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settingsToggles.serverCrashSim ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white text-sm">Maintenance Mode</h4>
                      <p className="text-xs text-zinc-400">Lock site with maintenance banner</p>
                    </div>
                    <button 
                      onClick={() => {
                        const newVal = !settingsToggles.maintenanceMode;
                        setSettingsToggles({...settingsToggles, maintenanceMode: newVal});
                        setAuditLogs(prev => [{ id: `log-${Date.now()}`, admin: userProfile?.username || 'Staff', action: `Toggled Maintenance Mode to ${newVal}`, time: new Date().toLocaleString() }, ...prev]);
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative p-1 ${settingsToggles.maintenanceMode ? 'bg-red-600' : 'bg-zinc-700'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settingsToggles.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 9. ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold">Platform Analytics & Metrics</h3>
                  <p className="text-xs text-zinc-400">Real-time engagement statistics, active reports, and user growth.</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <span className="text-xs text-zinc-400">Total Registered Users</span>
                    <h4 className="text-3xl font-bold text-white mt-1">{allUsers.length}</h4>
                    <span className="text-[11px] text-green-400 mt-2 inline-block">Live database count</span>
                  </div>
                  <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <span className="text-xs text-zinc-400">Active Reports</span>
                    <h4 className="text-3xl font-bold text-red-400 mt-1">{reports.length}</h4>
                    <span className="text-[11px] text-zinc-500 mt-2 inline-block">Requires moderation</span>
                  </div>
                  <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
                    <span className="text-xs text-zinc-400">Staff / Owner Ratio</span>
                    <h4 className="text-3xl font-bold text-blue-400 mt-1">
                      {allUsers.filter(u => u.role === 'staff' || u.role === 'owner').length} / {allUsers.filter(u => u.role === 'owner').length || 1}
                    </h4>
                    <span className="text-[11px] text-blue-400 mt-2 inline-block">Fully operational</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
