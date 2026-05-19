import React from 'react';

const Logo = ({ className = 'h-10 w-10', size = 40 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Top Circle - Cyan/Teal Gradient */}
        <linearGradient id="cmt-top" x1="50" y1="12" x2="50" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="100%" stopColor="#00a3ff" />
        </linearGradient>
        
        {/* Bottom Left - Pure Blue Gradient */}
        <linearGradient id="cmt-left" x1="16" y1="42" x2="68" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0072ff" />
          <stop offset="100%" stopColor="#0033ff" />
        </linearGradient>

        {/* Bottom Right - Royal Deep Blue Gradient */}
        <linearGradient id="cmt-right" x1="32" y1="42" x2="84" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0047ff" />
          <stop offset="100%" stopColor="#001aff" />
        </linearGradient>

        {/* Inner shadow/glow filter */}
        <filter id="glow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Cloud overlapping geometry */}
      <g filter="url(#glow)">
        {/* Bottom Left Circle */}
        <circle 
          cx="38" 
          cy="60" 
          r="26" 
          fill="url(#cmt-left)" 
          style={{ mixBlendMode: 'normal' }}
        />

        {/* Bottom Right Circle */}
        <circle 
          cx="62" 
          cy="60" 
          r="26" 
          fill="url(#cmt-right)" 
          style={{ mixBlendMode: 'normal' }}
        />

        {/* Top Circle (Intersects and overlays both) */}
        <circle 
          cx="50" 
          cy="38" 
          r="26" 
          fill="url(#cmt-top)" 
          opacity="0.9"
          style={{ mixBlendMode: 'normal' }}
        />
      </g>
    </svg>
  );
};

export default Logo;
