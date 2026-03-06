import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Map as MapIcon, 
  BarChart3, 
  PlusCircle, 
  Search, 
  ShieldAlert,
  TrendingUp,
  Activity,
  User,
  Phone,
  ArrowRight,
  ChevronRight,
  Camera,
  Languages,
  Zap,
  Droplets,
  Trash2,
  Construction as Road,
  Shield,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { Issue, DashboardStats, CrisisCluster } from './types';
import MapPicker from './components/MapPicker';
import WardHeatmap from './components/WardHeatmap';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const socket = io();

export default function App() {
  const [view, setView] = useState<'report' | 'track' | 'dashboard' | 'admin'>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [crisis, setCrisis] = useState<CrisisCluster[]>([]);
  const [loading, setLoading] = useState(false);
  const [trackPhone, setTrackPhone] = useState('');
  const [trackedIssues, setTrackedIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lat: 18.5204,
    lng: 73.8567,
    phone: '',
    photo: ''
  });

  useEffect(() => {
    fetchStats();
    fetchCrisis();

    socket.on('new_issue', (issue) => {
      setStats(prev => prev ? { ...prev, total: prev.total + 1, open: prev.open + 1, recent: [issue, ...prev.recent.slice(0, 9)] } : null);
      fetchCrisis();
    });

    socket.on('issue_updated', () => {
      fetchStats();
    });

    return () => {
      socket.off('new_issue');
      socket.off('issue_updated');
    };
  }, []);

  const fetchStats = async () => {
    const res = await fetch('/api/stats');
    const data = await res.json();
    setStats(data);
  };

  const fetchCrisis = async () => {
    const res = await fetch('/api/crisis');
    const data = await res.json();
    setCrisis(data);
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setSelectedIssue(data);
      setView('track');
      setTrackPhone(formData.phone);
      handleTrack(formData.phone);
      setFormData({ title: '', description: '', lat: 18.5204, lng: 73.8567, phone: '', photo: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (phone: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/issues/track/${phone}`);
      const data = await res.json();
      setTrackedIssues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'infrastructure': return <Activity className="w-4 h-4" />;
      case 'sanitation': return <Trash2 className="w-4 h-4" />;
      case 'water_supply': return <Droplets className="w-4 h-4" />;
      case 'electricity': return <Zap className="w-4 h-4" />;
      case 'roads': return <Road className="w-4 h-4" />;
      case 'public_safety': return <Shield className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-emerald-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-emerald-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-bottom border-black/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">CivicPulse AI</h1>
            <p className="text-[10px] uppercase tracking-widest font-mono text-black/40">Smart Governance Engine</p>
          </div>
        </div>
        <div className="flex gap-2">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Stats' },
            { id: 'report', icon: PlusCircle, label: 'Report' },
            { id: 'track', icon: Search, label: 'Track' },
            { id: 'admin', icon: ShieldAlert, label: 'Admin' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                view === item.id 
                  ? "bg-black text-white shadow-xl shadow-black/10" 
                  : "hover:bg-black/5 text-black/60"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {/* Crisis Alert */}
        <AnimatePresence>
          {crisis.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white animate-pulse">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-red-900 font-bold">Crisis Cluster Detected</h2>
                  <p className="text-red-700 text-sm">Multiple issues reported in a small radius within the last 6 hours.</p>
                </div>
              </div>
              <div className="flex gap-2">
                {crisis.map((c, i) => (
                  <span key={i} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-mono font-bold">
                    {c.count} {c.category}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {view === 'dashboard' && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Overview */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Issues', value: stats.total, icon: Activity, color: 'text-blue-600' },
                  { label: 'Open Now', value: stats.open, icon: Clock, color: 'text-orange-600' },
                  { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-600' },
                  { label: 'Critical', value: stats.critical, icon: AlertCircle, color: 'text-red-600' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <stat.icon className={cn("w-5 h-5 mb-3", stat.color)} />
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-[10px] uppercase tracking-wider font-mono text-black/40">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <WardHeatmap data={stats.wards} />
                <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-black/50 mb-6">Issue Map</h3>
                  <MapPicker onLocationSelect={() => {}} clusters={crisis} />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-black/50">Recent Activity</h3>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="divide-y divide-black/5">
                  {stats.recent.map((issue) => (
                    <div key={issue.id} className="p-4 hover:bg-black/[0.02] transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", getSeverityColor(issue.severity))}>
                          {getCategoryIcon(issue.category)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold group-hover:text-emerald-600 transition-colors">{issue.title}</h4>
                          <p className="text-xs text-black/40 font-mono">{issue.id} • {format(new Date(issue.created_at), 'MMM d, HH:mm')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono bg-black/5 px-2 py-1 rounded uppercase">{issue.status}</span>
                        <ChevronRight className="w-4 h-4 text-black/20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar / Admin Panel Suggestion */}
            <div className="space-y-8">
              <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Ward Health</h3>
                  <p className="text-emerald-200 text-sm mb-6">Composite score based on resolution speed and recurrence.</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black">84</span>
                    <span className="text-emerald-400 font-mono text-sm">/ 100</span>
                  </div>
                  <div className="mt-8 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[84%]"></div>
                  </div>
                </div>
                <Activity className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 rotate-12" />
              </div>

              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                <h3 className="text-xs font-mono uppercase tracking-wider text-black/50 mb-4">AI Insights</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-800 font-medium">Predictive Alert</p>
                    <p className="text-[11px] text-blue-600 mt-1">Water supply issues in Ward 4 likely to increase by 20% next week due to maintenance cycles.</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <p className="text-xs text-orange-800 font-medium">Workload Balance</p>
                    <p className="text-[11px] text-orange-600 mt-1">Officer Patil is currently over-assigned. Suggest routing new Ward 2 issues to Officer Deshmukh.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'report' && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight mb-2">Report an Issue</h2>
              <p className="text-black/40">Our AI will automatically categorize and route your complaint to the right department.</p>
            </div>

            <form onSubmit={handleReport} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-black/50">Issue Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Large pothole on Main Street"
                    className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-black/50">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide as much detail as possible..."
                    className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-black/50">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="10-digit number"
                        className="w-full bg-white border border-black/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-black/50">Photo (Optional)</label>
                    <label className="flex items-center gap-3 w-full bg-white border border-black/10 rounded-xl px-4 py-3 cursor-pointer hover:bg-black/[0.02] transition-all">
                      <Camera className="w-4 h-4 text-black/30" />
                      <span className="text-sm text-black/50">{formData.photo ? 'Photo Attached' : 'Upload Image'}</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-black/50">Location</label>
                  <MapPicker onLocationSelect={(lat, lng) => setFormData(prev => ({ ...prev, lat, lng }))} />
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Submit Report</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {view === 'track' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-black tracking-tight mb-4">Track Your Issues</h2>
              <div className="flex max-w-md mx-auto gap-2">
                <input
                  type="tel"
                  value={trackPhone}
                  onChange={e => setTrackPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="flex-1 bg-white border border-black/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                />
                <button
                  onClick={() => handleTrack(trackPhone)}
                  className="bg-black text-white px-8 rounded-2xl font-bold hover:bg-black/90 transition-all"
                >
                  Track
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {trackedIssues.map((issue) => (
                  <motion.div
                    layout
                    key={issue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden flex flex-col"
                  >
                    <div className="p-6 flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase", getSeverityColor(issue.severity))}>
                          {issue.severity}
                        </span>
                        <span className="text-[10px] font-mono text-black/30">{issue.id}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{issue.title}</h3>
                      <p className="text-sm text-black/60 line-clamp-2 mb-4">{issue.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-black/40 font-mono">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(issue.created_at), 'MMM d')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          <span className="capitalize">{issue.status}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-black/[0.02] p-6 border-t border-black/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <QRCodeSVG value={`${window.location.origin}/issue/${issue.id}`} size={48} />
                        <div className="text-[10px] font-mono text-black/40">
                          Scan to share or<br />track on mobile
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedIssue(issue)}
                        className="bg-white border border-black/10 px-4 py-2 rounded-xl text-xs font-bold hover:bg-black hover:text-white transition-all"
                      >
                        View Timeline
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {selectedIssue && (
              <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                  <div className="p-8 border-b border-black/5 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black">{selectedIssue.title}</h3>
                      <p className="text-sm text-black/40 font-mono">{selectedIssue.id}</p>
                    </div>
                    <button onClick={() => setSelectedIssue(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                      <PlusCircle className="w-6 h-6 rotate-45" />
                    </button>
                  </div>
                  <div className="p-8 overflow-y-auto flex-1 space-y-8">
                    <div className="flex items-center gap-4">
                      <div className={cn("px-4 py-2 rounded-2xl text-xs font-bold uppercase", getSeverityColor(selectedIssue.severity))}>
                        {selectedIssue.severity} Severity
                      </div>
                      <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2">
                        <Languages className="w-4 h-4" />
                        Detected: {selectedIssue.language}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-black/50">Resolution Timeline</h4>
                      <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-black/5">
                        <div className="relative">
                          <div className="absolute -left-8 top-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Issue Reported</p>
                            <p className="text-xs text-black/40">{format(new Date(selectedIssue.created_at), 'MMM d, yyyy HH:mm')}</p>
                            <p className="text-sm text-black/60 mt-2">Complaint successfully registered and assigned to {selectedIssue.ward_id}.</p>
                          </div>
                        </div>
                        {/* Mock updates for visual */}
                        <div className="relative opacity-40">
                          <div className="absolute -left-8 top-1 w-6 h-6 bg-gray-200 rounded-full border-4 border-white shadow-sm" />
                          <div>
                            <p className="text-sm font-bold">Verification Pending</p>
                            <p className="text-xs text-black/40">Estimated: {selectedIssue.resolution_time_est} hours</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {view === 'admin' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tight">Admin Intelligence</h2>
              <button className="bg-black text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Export Weekly Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-black/5 flex items-center justify-between bg-black/[0.01]">
                  <h3 className="text-sm font-bold">Active Issues Queue</h3>
                  <div className="flex gap-2">
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold">3 Critical</span>
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold">5 High</span>
                  </div>
                </div>
                <div className="divide-y divide-black/5">
                  {stats?.recent.map(issue => (
                    <div key={issue.id} className="p-6 flex items-center justify-between hover:bg-black/[0.01] transition-colors">
                      <div className="flex items-center gap-6">
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", getSeverityColor(issue.severity))}>
                          {getCategoryIcon(issue.category)}
                        </div>
                        <div>
                          <h4 className="font-bold">{issue.title}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-[10px] font-mono text-black/40">{issue.id}</span>
                            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{issue.ward_id}</span>
                            <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded capitalize">{issue.sentiment}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs font-bold">Officer Patil</p>
                          <p className="text-[10px] text-black/40">Status: {issue.status}</p>
                        </div>
                        <select 
                          value={issue.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value;
                            await fetch(`/api/issues/${issue.id}/status`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: newStatus, comment: 'Status updated by admin', officer_name: 'Admin' })
                            });
                            fetchStats();
                          }}
                          className="bg-white border border-black/10 rounded-lg px-2 py-1 text-[10px] font-bold focus:outline-none"
                        >
                          <option value="reported">Reported</option>
                          <option value="verified">Verified</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                          <option value="escalated">Escalated</option>
                        </select>
                        <button className="p-2 hover:bg-black/5 rounded-xl transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-black/50 mb-6">Officer Workload</h3>
                  <div className="space-y-6">
                    {[
                      { name: 'Officer Patil', load: 85, color: 'bg-red-500' },
                      { name: 'Officer Deshmukh', load: 42, color: 'bg-emerald-500' },
                      { name: 'Officer Kulkarni', load: 68, color: 'bg-orange-500' },
                    ].map((officer, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span>{officer.name}</span>
                          <span>{officer.load}%</span>
                        </div>
                        <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                          <div className={cn("h-full transition-all duration-1000", officer.color)} style={{ width: `${officer.load}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black text-white p-8 rounded-3xl shadow-xl">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-white/40 mb-4">System Health</h3>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold">AI Models Online</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-2xl">
                      <p className="text-[10px] font-mono text-white/40 uppercase">Latency</p>
                      <p className="text-xl font-bold">124ms</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl">
                      <p className="text-[10px] font-mono text-white/40 uppercase">Accuracy</p>
                      <p className="text-xl font-bold">98.2%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer / Chat Support */}
      <footer className="fixed bottom-6 right-6 z-50">
        <button className="w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group">
          <Activity className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>
      </footer>
    </div>
  );
}
