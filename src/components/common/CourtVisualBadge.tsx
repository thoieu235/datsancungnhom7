import React from 'react';
import { Court, SportType } from '../../types';

interface CourtVisualBadgeProps {
  court: Court;
  className?: string;
  height?: string;
}

export const CourtVisualBadge: React.FC<CourtVisualBadgeProps> = ({
  court,
  className = '',
  height = 'h-48'
}) => {
  // Football Pitch Visual
  if (court.sport === 'football') {
    const is7Side = court.name.includes('7 người');
    return (
      <div className={`relative w-full ${height} overflow-hidden rounded-xl bg-linear-to-b from-emerald-800 to-emerald-950 flex flex-col justify-between p-3 select-none ${className}`}>
        {/* Subtle Turf Pattern / Striping */}
        <div className="absolute inset-0 opacity-25 pointer-events-none bg-[repeating-linear-gradient(90deg,#064e3b,#064e3b_24px,#047857_24px,#047857_48px)]"></div>

        {/* Pitch Lines Vector Overlay */}
        <svg
          className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] opacity-70 pointer-events-none"
          viewBox="0 0 400 240"
          preserveAspectRatio="none"
        >
          {/* Outer Boundary */}
          <rect x="10" y="10" width="380" height="220" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          {/* Halfway Line */}
          <line x1="200" y1="10" x2="200" y2="230" stroke="#ffffff" strokeWidth="2" />
          {/* Center Circle & Spot */}
          <circle cx="200" cy="120" r="42" fill="none" stroke="#ffffff" strokeWidth="2" />
          <circle cx="200" cy="120" r="3" fill="#ffffff" />
          {/* Left Penalty Box */}
          <rect x="10" y="55" width="65" height="130" fill="none" stroke="#ffffff" strokeWidth="2" />
          <rect x="10" y="85" width="28" height="70" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          {/* Right Penalty Box */}
          <rect x="325" y="55" width="65" height="130" fill="none" stroke="#ffffff" strokeWidth="2" />
          <rect x="362" y="85" width="28" height="70" fill="none" stroke="#ffffff" strokeWidth="1.5" />
        </svg>

        {/* Realistic Lighting Reflections */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 blur-2xl pointer-events-none rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-300/15 blur-2xl pointer-events-none rounded-full"></div>

        {/* Badges on Court Card */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black/60 text-emerald-300 backdrop-blur-md border border-emerald-500/40 uppercase tracking-wider">
            {is7Side ? 'Sân 7 người' : 'Sân 5 người'}
          </span>
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/20 font-mono">
            Sân #{court.courtNumber}
          </span>
        </div>

        <div className="relative z-10 bg-black/65 backdrop-blur-md p-2 rounded-lg border border-white/10 flex items-center justify-between">
          <div className="text-[11px] text-slate-200">
            <span className="font-semibold text-emerald-400">{court.surface}</span>
          </div>
          <span className="text-[10px] text-slate-300 font-mono">
            {is7Side ? '30m × 50m' : '20m × 40m'}
          </span>
        </div>
      </div>
    );
  }

  // Badminton Court Visual
  if (court.sport === 'badminton') {
    return (
      <div className={`relative w-full ${height} overflow-hidden rounded-xl bg-linear-to-b from-blue-900 to-slate-950 flex flex-col justify-between p-3 select-none ${className}`}>
        {/* Court Mat Texture */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:12px_12px]"></div>

        {/* Badminton Court Lines Vector Overlay */}
        <svg
          className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] opacity-80 pointer-events-none"
          viewBox="0 0 400 240"
          preserveAspectRatio="none"
        >
          {/* Green Court Mat Fill */}
          <rect x="25" y="15" width="350" height="210" fill="#047857" rx="4" />
          {/* Doubles Boundary Line (White) */}
          <rect x="35" y="25" width="330" height="190" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          {/* Singles Sidelines */}
          <line x1="35" y1="42" x2="365" y2="42" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="35" y1="198" x2="365" y2="198" stroke="#ffffff" strokeWidth="1.5" />
          {/* Doubles Long Service Lines */}
          <line x1="55" y1="25" x2="55" y2="215" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="345" y1="25" x2="345" y2="215" stroke="#ffffff" strokeWidth="1.5" />
          {/* Short Service Lines */}
          <line x1="150" y1="25" x2="150" y2="215" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="250" y1="25" x2="250" y2="215" stroke="#ffffff" strokeWidth="1.5" />
          {/* Center Line */}
          <line x1="35" y1="120" x2="150" y2="120" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="250" y1="120" x2="365" y2="120" stroke="#ffffff" strokeWidth="1.5" />
          {/* Center Net Post & Net */}
          <line x1="200" y1="18" x2="200" y2="222" stroke="#f8fafc" strokeWidth="3" strokeDasharray="4 2" />
        </svg>

        {/* Ambient Overhead LED Lighting Reflection */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-48 h-6 bg-blue-300/25 blur-xl pointer-events-none rounded-full"></div>

        {/* Badges on Court Card */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black/60 text-blue-300 backdrop-blur-md border border-blue-500/40 uppercase tracking-wider">
            Thảm BWF Tiêu Chuẩn
          </span>
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/20 font-mono">
            Sân #{court.courtNumber}
          </span>
        </div>

        <div className="relative z-10 bg-black/65 backdrop-blur-md p-2 rounded-lg border border-white/10 flex items-center justify-between">
          <div className="text-[11px] text-slate-200">
            <span className="font-semibold text-blue-300">{court.surface}</span>
          </div>
          <span className="text-[10px] text-slate-300 font-mono">
            6.1m × 13.4m · Trần 9m
          </span>
        </div>
      </div>
    );
  }

  // Pickleball Court Visual
  return (
    <div className={`relative w-full ${height} overflow-hidden rounded-xl bg-linear-to-b from-sky-900 to-indigo-950 flex flex-col justify-between p-3 select-none ${className}`}>
      {/* Pickleball Acrylic Court Vector Overlay */}
      <svg
        className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] opacity-90 pointer-events-none"
        viewBox="0 0 400 240"
        preserveAspectRatio="none"
      >
        {/* Out-of-bounds Blue Border */}
        <rect x="20" y="15" width="360" height="210" fill="#0284c7" rx="4" />
        {/* Main In-bounds Green Play Area */}
        <rect x="35" y="25" width="330" height="190" fill="#10b981" />
        {/* Non-Volley Zone (The Kitchen) in Sky Blue */}
        <rect x="145" y="25" width="110" height="190" fill="#38bdf8" />
        {/* Outer Boundary White Line */}
        <rect x="35" y="25" width="330" height="190" fill="none" stroke="#ffffff" strokeWidth="2.5" />
        {/* Kitchen Lines (Non-Volley Line) */}
        <line x1="145" y1="25" x2="145" y2="215" stroke="#ffffff" strokeWidth="2" />
        <line x1="255" y1="25" x2="255" y2="215" stroke="#ffffff" strokeWidth="2" />
        {/* Centerline (divides service courts on left and right) */}
        <line x1="35" y1="120" x2="145" y2="120" stroke="#ffffff" strokeWidth="2" />
        <line x1="255" y1="120" x2="365" y2="120" stroke="#ffffff" strokeWidth="2" />
        {/* Net */}
        <line x1="200" y1="18" x2="200" y2="222" stroke="#ffffff" strokeWidth="3" strokeDasharray="3 3" />
      </svg>

      {/* Sun/Canopy Lighting Reflection */}
      <div className="absolute top-0 right-1/4 w-36 h-20 bg-amber-300/20 blur-2xl pointer-events-none rounded-full"></div>

      {/* Badges on Court Card */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black/60 text-amber-300 backdrop-blur-md border border-amber-500/40 uppercase tracking-wider">
          {court.name.includes('Center') ? 'Center Court VIP' : court.name.includes('Mái che') ? 'Sân Mái Che' : 'Sân Ngoài Trời'}
        </span>
        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/20 font-mono">
          Sân #{court.courtNumber}
        </span>
      </div>

      <div className="relative z-10 bg-black/65 backdrop-blur-md p-2 rounded-lg border border-white/10 flex items-center justify-between">
        <div className="text-[11px] text-slate-200">
          <span className="font-semibold text-amber-300">{court.surface}</span>
        </div>
        <span className="text-[10px] text-slate-300 font-mono">
          6.1m × 13.4m · Giảm chấn
        </span>
      </div>
    </div>
  );
};
