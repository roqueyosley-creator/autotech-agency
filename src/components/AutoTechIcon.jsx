import React from 'react';

const AutoTechIcon = ({ size = 64, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Glow */}
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="pistonGradient" x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>

      {/* Outer Circle (Tech Ring) */}
      <circle cx="50" cy="50" r="48" stroke="#ffffff10" strokeWidth="0.5" />
      <path d="M50 2 A48 48 0 0 1 98 50" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      
      {/* Piston / 'A' Base Structure */}
      <path 
        d="M30 80 L30 40 L50 20 L70 40 L70 80" 
        stroke="url(#pistonGradient)" 
        strokeWidth="6" 
        strokeLinejoin="round" 
        filter="url(#glow)"
      />
      
      {/* The 'A' Bar & Lightning Bolt */}
      <path 
        d="M35 55 L65 55 L55 65 L65 65 L45 85" 
        stroke="white" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Tech Accents */}
      <circle cx="50" cy="20" r="2" fill="#3B82F6" />
      <rect x="45" y="88" width="10" height="2" rx="1" fill="#3B82F6" />
    </svg>
  );
};

export default AutoTechIcon;
