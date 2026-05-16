/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Shield, Trophy, Users, Activity, Sword, Target, Heart, Star, ChevronRight, Loader2, AlertCircle, Info, Hash, User, Zap, Globe, Crown } from "lucide-react";
import { getPlayerAllData, searchPlayers } from "./services/api";
import { ProApiResponse, SearchPlayer } from "./types";

// --- Subcomponents ---

const StatCard = ({ title, value, icon: Icon, color = "orange" }: { title: string, value: string | number, icon: any, color?: string }) => {
  const colorClass = color === "orange" ? "text-brand-orange" : color === "yellow" ? "text-brand-yellow" : color === "blue" ? "text-blue-400" : "text-brand-red";
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card hud-border p-4 rounded-xl flex flex-col gap-2 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 border border-white/5 hover:border-brand-orange/30"
    >
      <div className={`absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-20 transition-opacity ${colorClass}`}>
        <Icon size={48} />
      </div>
      <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-mono font-black">{title}</span>
      <span className={`text-2xl font-black ${colorClass} tracking-tighter drop-shadow-[0_0_8px_rgba(255,107,0,0.3)]`}>{value}</span>
    </motion.div>
  );
};

const SectionTitle = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="flex items-center gap-4 mb-8">
    <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center border border-brand-orange/20">
      <Icon className="text-brand-orange" size={20} />
    </div>
    <h2 className="text-2xl font-black uppercase tracking-tighter italic">{title}</h2>
    <div className="h-[1px] bg-gradient-to-r from-brand-orange/50 to-transparent flex-1" />
  </div>
);

export default function App() {
  const [searchValue, setSearchValue] = useState("");
  const [searchMode, setSearchMode] = useState<"uid" | "name">("uid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProApiResponse | null>(null);
  const [searchResults, setSearchResults] = useState<SearchPlayer[]>([]);
  const [detectedRegion, setDetectedRegion] = useState<string | null>(null);
  const [checkingRegion, setCheckingRegion] = useState<string | null>(null);

  const regions = ["BD", "PK", "IN", "US", "ID", "TH", "VN", "RU", "EU", "ME", "BR"];

  const fetchWithAutoRegion = async (uid: string) => {
    setLoading(true);
    setError(null);
    setProfile(null);
    setDetectedRegion(null);
    setCheckingRegion(null);

    // Auto-detect loop
    for (const region of regions) {
      setCheckingRegion(region);
      try {
        const data = await getPlayerAllData(uid, region);
        if (data && data.result) {
          setProfile(data);
          setDetectedRegion(region);
          setLoading(false);
          setCheckingRegion(null);
          return;
        }
      } catch (err) {
        console.log(`Failed for region ${region}, trying next...`);
        continue;
      }
    }

    setCheckingRegion(null);
    setError("Account not found. Tested all regional nodes (BD, PK, IN, US, etc.) but no data was returned. Ensure the UID is correct.");
    setLoading(false);
  };

  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!searchValue.trim()) return;

    if (searchMode === "uid") {
      fetchWithAutoRegion(searchValue);
    } else {
      setLoading(true);
      setError(null);
      setSearchResults([]);
      try {
        const res = await searchPlayers(searchValue, "BD"); // Name search still needs a base server
        if (res.data && res.data.length > 0) {
          setSearchResults(res.data);
        } else {
          setError("No players found with that nickname. Name search is currently optimized for BD region.");
        }
      } catch (err) {
        setError("Network signal lost. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectPlayer = (uid: string) => {
    setSearchValue(uid);
    setSearchMode("uid");
    setSearchResults([]);
    fetchWithAutoRegion(uid);
  };

  const servers = ["BD", "US", "BR", "IN", "ID", "ME", "PK", "TH", "VN", "RU", "EU"];

  return (
    <div className="min-h-screen bg-dark-surface text-white selection:bg-brand-orange selection:text-white pb-20 overflow-x-hidden relative">
      {/* Neural Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-orange/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-yellow/5 blur-[120px] rounded-full" />
        <div className="absolute top-0 left-0 w-full h-[1px] bg-brand-orange/20 animate-scanline"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 p-4 md:p-6 flex flex-col lg:flex-row justify-between items-center gap-6 border-b border-white/5 bg-dark-surface/50 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setProfile(null); setSearchResults([]); setError(null); }}>
          <div className="w-10 h-10 bg-brand-orange rounded-lg flex items-center justify-center glow-orange rotate-3 group-hover:rotate-0 transition-all duration-500">
            <Sword className="text-white" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tighter uppercase italic group-hover:text-brand-orange transition-colors">
                Fire<span className="text-brand-orange group-hover:text-white transition-colors">Stats</span>
              </h1>
              <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full mt-1 border border-white/5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                <span className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em]">Quantum Link</span>
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-mono font-black italic">Bypass Multi-Node Tracker</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full lg:w-auto">
          <div className="flex bg-white/5 p-1 rounded-xl self-start">
             <button 
              onClick={() => setSearchMode("uid")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${searchMode === "uid" ? 'bg-brand-orange text-white glow-orange shadow-lg shadow-brand-orange/20' : 'text-white/40 hover:text-white'}`}
             >
               <Hash size={14} /> ID Lookup
             </button>
             <button 
              onClick={() => setSearchMode("name")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${searchMode === "name" ? 'bg-brand-orange text-white glow-orange shadow-lg shadow-brand-orange/20' : 'text-white/40 hover:text-white'}`}
             >
               <User size={14} /> Global Search
             </button>
          </div>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 w-full">
            <div className="flex gap-2 w-full">
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-white/30 flex items-center gap-2 border-dashed">
                <Globe size={12} className="text-brand-orange" />
                Auto Node
              </div>
              <div className="relative group flex-1">
                <input 
                  type="text" 
                  placeholder={searchMode === "uid" ? "Enter Target UID..." : "Neural Name Search..."}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full md:w-72 bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-brand-orange transition-all placeholder:text-white/10 font-bold"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-orange transition-colors" size={16} />
                {searchValue && (
                  <button 
                    onClick={() => setSearchValue("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                  >
                    <AlertCircle size={14} className="rotate-45" />
                  </button>
                )}
              </div>
            </div>
            <button 
              disabled={loading}
              className="bg-brand-orange hover:bg-brand-red text-white px-8 py-2.5 rounded-xl font-bold uppercase text-xs flex flex-col items-center justify-center transition-all glow-orange disabled:opacity-80 disabled:cursor-not-allowed group tracking-widest shadow-lg shadow-brand-orange/30 min-w-[140px]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mb-1" size={16} />
                  <span className="text-[8px] animate-pulse">Scanning {checkingRegion || 'Nodes'}...</span>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="group-hover:scale-110 transition-transform" size={16} />
                  <span>Scan Agent</span>
                </div>
              )}
            </button>
          </form>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {!profile && searchResults.length === 0 && !loading && !error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-10 lg:py-20 text-center"
            >
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-brand-orange blur-[60px] opacity-20" />
                <Shield size={80} className="text-brand-orange relative z-10" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 max-w-2xl leading-none">
                The Most Accurate <br /> <span className="text-brand-orange">Battleground</span> Tracker
              </h2>
              <p className="text-white/50 max-w-md text-lg mb-10">
                Instantly retrieve detailed player data, career statistics, and rank history for any account.
              </p>

              <div className="flex flex-col gap-4 mb-16 w-full max-w-md">
                 <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Trending Hot-Lookups</p>
                 <div className="flex flex-wrap justify-center gap-2">
                    {[
                      { uid: "9351564274", name: "HAROON" },
                      { uid: "9067719977", name: "PRINCE" },
                      { uid: "4828986870", name: "WILLIAM" }
                    ].map((ex) => (
                      <button 
                        key={ex.uid} 
                        onClick={() => handleSelectPlayer(ex.uid)}
                        className="bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/5 hover:border-brand-orange/30 flex items-center gap-2 group"
                      >
                        <Zap size={12} className="text-brand-orange group-hover:animate-pulse" />
                        {ex.name} <span className="text-white/20 font-mono">#{ex.uid}</span>
                      </button>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
                <div className="glass-card p-6 rounded-2xl border-white/5">
                  <Activity className="text-brand-orange mb-3 mx-auto" />
                  <h3 className="text-sm font-bold uppercase mb-1">Real-time</h3>
                  <p className="text-xs text-white/30">Synced with official servers</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border-white/5">
                  <Target className="text-brand-yellow mb-3 mx-auto" />
                  <h3 className="text-sm font-bold uppercase mb-1">Precision</h3>
                  <p className="text-xs text-white/30">Detailed combat breakdown</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border-white/5">
                  <Users className="text-brand-red mb-3 mx-auto" />
                  <h3 className="text-sm font-bold uppercase mb-1">Clan Data</h3>
                  <p className="text-xs text-white/30">Team and guild information</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border-white/5">
                  <Trophy className="text-brand-yellow mb-3 mx-auto" />
                  <h3 className="text-sm font-bold uppercase mb-1">Rankings</h3>
                  <p className="text-xs text-white/30">Global and local standing</p>
                </div>
              </div>
            </motion.div>
          )}

          {searchResults.length > 0 && !profile && !loading && !error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-3xl mx-auto space-y-4"
            >
              <div className="flex items-center gap-4 mb-8">
                 <Users className="text-brand-orange" />
                 <h2 className="text-2xl font-bold uppercase">Search Results for "{searchValue}"</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((res, i) => (
                  <motion.div 
                    key={res.uid}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleSelectPlayer(res.uid)}
                    className="glass-card p-4 rounded-2xl border border-white/5 hover:border-brand-orange transition-all cursor-pointer group flex items-center justify-between shadow-lg hover:shadow-brand-orange/5"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all transform group-hover:rotate-6">
                          <User size={24} />
                       </div>
                       <div>
                          <h4 className="font-black text-lg group-hover:text-brand-orange transition-colors italic uppercase">{res.nickname}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono">UID: {res.uid}</span>
                            <div className="w-1 h-1 bg-white/20 rounded-full" />
                            <span className="text-[9px] text-brand-orange font-black">{res.server}</span>
                          </div>
                       </div>
                    </div>
                    <ChevronRight className="text-white/10 group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
                  </motion.div>
                ))}
              </div>
              <button 
                onClick={() => setSearchResults([])}
                className="text-white/40 text-xs hover:text-white transition-colors pt-4 font-bold flex items-center gap-2"
              >
                Clear Results
              </button>
            </motion.div>
          )}

          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-40"
            >
              <div className="relative w-20 h-20 mb-6">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-brand-orange/20 border-t-brand-orange rounded-full"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 border-4 border-brand-yellow/10 border-t-brand-yellow rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sword size={24} className="text-brand-orange animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest animate-pulse">Scanning Neural Network...</h3>
              <p className="text-white/40 text-sm mt-2 font-mono">RECOVERING PKTS FOR {searchMode === 'uid' ? `UID:${searchValue}` : `NAME:${searchValue}`}</p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card border-red-500/20 p-10 rounded-3xl max-w-md mx-auto text-center mt-20 relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-red-500/50" />
              <AlertCircle className="text-red-500 mx-auto mb-6" size={56} />
              <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">Access Denied</h3>
              <div className="bg-red-500/5 p-4 rounded-xl mb-8">
                 <p className="text-sm text-red-100 font-medium">{error}</p>
              </div>
              
              <div className="text-left space-y-4 mb-8">
                 <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Troubleshooting Guide:</p>
                 <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl">
                       <Info size={14} className="text-brand-orange mt-0.5 shrink-0" />
                       <p className="text-[10px] text-white/60 leading-relaxed uppercase">Verify that the UID or Nickname is correctly spelled.</p>
                    </div>
                    <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl">
                       <Shield size={14} className="text-brand-yellow mt-0.5 shrink-0" />
                       <p className="text-[10px] text-white/60 leading-relaxed uppercase">Ensure the correct Server Region (e.g., US, IN) is selected.</p>
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => setError(null)}
                className="w-full bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all font-black uppercase text-xs tracking-widest outline outline-1 outline-white/10"
              >
                Reset Connection
              </button>
            </motion.div>
          )}

          {profile && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4"
            >
              <div className="lg:col-span-4 space-y-8">
                {/* Profile Card */}
                <div className="glass-card rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl">
                  <div className="h-40 bg-gradient-to-br from-brand-orange/40 via-brand-red/20 to-transparent relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Shield size={160} />
                    </div>
                    <div className="absolute left-6 top-6">
                       <div className="bg-brand-orange/20 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Global Operative</span>
                       </div>
                    </div>
                  </div>
                  <div className="px-6 pb-8 -mt-16 relative z-10">
                    <div className="relative inline-block mb-4">
                      <div className="w-32 h-32 rounded-[2rem] border-4 border-dark-surface bg-dark-accent p-1 overflow-hidden glow-orange shadow-2xl flex items-center justify-center">
                         <div className="w-full h-full bg-brand-orange/10 flex items-center justify-center rounded-[1.8rem] border border-white/5 overflow-hidden">
                            <img 
                              src={`https://freefireinfo-zy9l.onrender.com/api/v1/avatar?id=${profile.result.AccountInfo.AccountAvatarId}`} 
                              alt="Avatar"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as any).src = "";
                                (e.target as any).parentElement.innerHTML = '<div class="text-brand-orange"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';
                              }}
                            />
                         </div>
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-brand-orange text-white font-black px-4 py-1.5 rounded-xl text-sm shadow-xl outline outline-4 outline-dark-surface animate-bounce-slow">
                        LV.{profile.result.AccountInfo.AccountLevel}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 mb-6">
                      <h2 className="text-4xl font-black tracking-tighter uppercase italic drop-shadow-lg">{profile.result.AccountInfo.AccountName}</h2>
                      <div className="flex flex-wrap items-center gap-2 text-white/50 font-mono text-xs">
                        <div className="bg-white/5 px-2 py-1 rounded-lg flex items-center gap-2 border border-white/5">
                           <Hash size={10} className="text-brand-orange" />
                           {searchValue}
                        </div>
                        <div className="bg-brand-orange/10 text-brand-orange px-2 py-1 rounded-lg font-black border border-brand-orange/20 uppercase tracking-widest flex items-center gap-2">
                          <Globe size={10} />
                          {profile.result.AccountInfo.AccountRegion} NODE
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-brand-orange/20 transition-colors">
                        <span className="block text-[8px] uppercase tracking-[0.2em] text-white/30 mb-2 font-black italic">Br Point</span>
                        <div className="flex items-center gap-3">
                          <Trophy className="text-brand-yellow" size={18} />
                          <span className="text-xl font-black italic tracking-tighter">{profile.result.AccountInfo.BrRankPoint}</span>
                        </div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-brand-orange/20 transition-colors">
                        <span className="block text-[8px] uppercase tracking-[0.2em] text-white/30 mb-2 font-black italic">Cs Point</span>
                        <div className="flex items-center gap-3">
                          <Sword className="text-brand-orange" size={18} />
                          <span className="text-xl font-black italic tracking-tighter">{profile.result.AccountInfo.CsRankPoint}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
                      {profile.result.creditScoreInfo && (
                        <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
                           <div className="flex items-center gap-2">
                             <Shield size={14} className="text-brand-orange" />
                             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Credit Score</span>
                           </div>
                           <div className="font-black text-sm tracking-tighter">
                              <span className={profile.result.creditScoreInfo.creditScore >= 100 ? "text-green-400" : "text-brand-orange"}>
                                {profile.result.creditScoreInfo.creditScore}
                              </span>
                              <span className="text-white/20">/100</span>
                           </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between px-2">
                         <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Commendations</span>
                         <div className="flex items-center gap-1.5 font-black text-xs text-white/80">
                            <Heart size={14} className="text-brand-red fill-brand-red animate-pulse" />
                            <span>{profile.result.AccountInfo.AccountLikes.toLocaleString()} LIKES</span>
                         </div>
                      </div>
                      <div className="flex items-center justify-between px-2">
                         <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Elite Badges</span>
                         <div className="flex items-center gap-1.5 font-black text-xs text-white/80">
                            <Star size={14} className="text-brand-yellow fill-brand-yellow" />
                            <span>{profile.result.AccountInfo.AccountBPBadges} SEASON</span>
                         </div>
                      </div>
                    </div>

                    {profile.result.petInfo && (
                      <div className="mt-6 bg-brand-orange/5 rounded-2xl p-4 border border-brand-orange/10 relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-5 text-brand-orange group-hover:scale-110 transition-transform">
                          <Activity size={80} />
                        </div>
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center shadow-lg">
                            <Zap className="text-white" size={20} />
                          </div>
                          <div>
                            <p className="text-[8px] uppercase tracking-[0.2em] text-brand-orange font-black">Combat Partner</p>
                            <p className="text-xs font-black uppercase italic tracking-tighter">Level {profile.result.petInfo.level} Operative</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Clan Card */}
                {profile.result.GuildInfo && (
                  <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl relative overflow-hidden group hover:border-brand-orange/30 transition-all">
                    <div className="absolute -right-8 -bottom-8 opacity-5 text-white group-hover:scale-110 transition-transform">
                       <Users size={120} />
                    </div>
                    <SectionTitle title="Neural Guild" icon={Users} />
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-5 cursor-default group transition-colors hover:bg-brand-orange/10">
                      <div className="w-14 h-14 rounded-2xl bg-brand-orange flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                        <span className="font-black text-2xl italic text-white drop-shadow-md">{profile.result.GuildInfo.GuildName[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                           <h4 className="font-black text-xl italic uppercase tracking-tighter truncate group-hover:text-brand-orange transition-colors">{profile.result.GuildInfo.GuildName}</h4>
                           <Crown size={14} className="text-brand-yellow shrink-0" />
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-white/40 uppercase tracking-[0.2em] font-black mt-1">
                          <span className="bg-white/5 px-2 py-0.5 rounded">Lv.{profile.result.GuildInfo.GuildLevel}</span>
                          <div className="w-1 h-1 bg-white/20 rounded-full" />
                          <span className="text-brand-orange">{profile.result.GuildInfo.GuildMember}/{profile.result.GuildInfo.GuildCapacity} CORE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats column */}
              <div className="lg:col-span-8 space-y-8">
                <div className="space-y-8">
                  {/* Tactical Loadout */}
                  {profile.result.AccountProfileInfo.EquippedSkills && profile.result.AccountProfileInfo.EquippedSkills.length > 0 && (
                    <div>
                      <SectionTitle title="Neural Loadout" icon={Zap} />
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {profile.result.AccountProfileInfo.EquippedSkills.map((skillId, idx) => (
                          <div key={idx} className="glass-card p-4 rounded-2xl border border-white/5 flex items-center gap-3 group hover:border-brand-orange/30 transition-all shadow-lg hover:shadow-brand-orange/5">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-brand-orange group-hover:scale-110 transition-transform border border-white/10 group-hover:border-brand-orange/30">
                              <Zap size={20} className="fill-brand-orange/10" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-[8px] uppercase tracking-widest text-white/30 font-black italic">Active Chip</p>
                              <p className="text-xs font-mono font-black truncate text-brand-orange">{skillId}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weaponry */}
                  {profile.result.AccountInfo.EquippedWeapon && profile.result.AccountInfo.EquippedWeapon.length > 0 && (
                    <div>
                      <SectionTitle title="Elite Armory" icon={Sword} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profile.result.AccountInfo.EquippedWeapon.map((weaponId, idx) => (
                          <div key={idx} className="glass-card p-5 rounded-2xl border border-white/5 flex items-center gap-4 group hover:border-brand-red/30 transition-all bg-gradient-to-r from-transparent to-brand-red/5">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-brand-red group-hover:rotate-12 transition-transform border border-white/5 group-hover:border-brand-red/30">
                              <Sword size={28} />
                            </div>
                            <div>
                               <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-black italic">Primary Asset</p>
                               <p className="text-lg font-black italic tracking-tighter text-white group-hover:text-brand-red transition-colors">WEAPON-ID:{weaponId}</p>
                               <div className="flex items-center gap-2 mt-1">
                                  <div className="w-2 h-2 bg-brand-red rounded-full" />
                                  <span className="text-[8px] font-black uppercase text-brand-red/60 tracking-widest">Modified Hardware</span>
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social & Rank History */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <SectionTitle title="Social Feed" icon={Activity} />
                        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                           <div className="flex items-start gap-4 mb-6">
                              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-orange shrink-0">
                                 <Heart size={24} className="fill-brand-orange/20" />
                              </div>
                              <div className="flex-1">
                                 <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1 italic">Agent Signature</p>
                                 <p className="text-sm font-medium leading-relaxed italic text-white/80">
                                    "{profile.result.socialinfo?.AccountSignature || "No operative signature recorded."}"
                                 </p>
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                              <div>
                                 <p className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1 italic">Dialect</p>
                                 <p className="text-xs font-black uppercase">{profile.result.socialinfo?.AccountLanguage?.split('_')[1] || "N/A"}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1 italic">Preferred Mode</p>
                                 <p className="text-xs font-black uppercase text-brand-orange">{profile.result.socialinfo?.AccountPreferMode?.split('_')[1] || "Global"}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                     
                     <div className="space-y-6">
                        <SectionTitle title="Rank Status" icon={Trophy} />
                        <div className="space-y-4">
                           <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-brand-yellow/30 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-brand-yellow/10 rounded-xl flex items-center justify-center text-brand-yellow border border-brand-yellow/20">
                                    <Trophy size={24} />
                                 </div>
                                 <div>
                                    <p className="text-[9px] font-black uppercase text-white/30 tracking-widest italic">Br Peak Rank</p>
                                    <p className="text-xl font-black italic tracking-tighter uppercase">{profile.result.AccountInfo.BrMaxRank || "Unranked"}</p>
                                 </div>
                              </div>
                              <ChevronRight className="text-white/10" size={20} />
                           </div>
                           <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-brand-orange/30 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange border border-brand-orange/20">
                                    <Sword size={24} />
                                 </div>
                                 <div>
                                    <p className="text-[9px] font-black uppercase text-white/30 tracking-widest italic">Cs Peak Rank</p>
                                    <p className="text-xl font-black italic tracking-tighter uppercase">{profile.result.AccountInfo.CsMaxRank || "Unranked"}</p>
                                 </div>
                              </div>
                              <ChevronRight className="text-white/10" size={20} />
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/5 p-8 text-center text-white/20 text-[10px] uppercase tracking-[0.4em]">
        <p>© 2026 FireStats • Intelligence Division • Secure Line</p>
      </footer>
    </div>
  );
}
