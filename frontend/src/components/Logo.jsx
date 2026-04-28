import { Calendar } from 'lucide-react';

export default function Logo({ size = 28, showText = true, className = '' }) {
  return (
    <div className={`logo-icon-wrapper ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <Calendar 
          size={size} 
          strokeWidth={1.5} 
          className="logo-icon"
          style={{
            stroke: 'url(#logoGradient)',
            fill: 'none'
          }}
        />
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <span
          style={{
            fontSize: size * 0.8,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            letterSpacing: '-0.5px',
          }}
        >
          Calendry2.0
        </span>
      )}
    </div>
  );
}