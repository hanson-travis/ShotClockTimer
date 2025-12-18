import React from 'react';

interface RadialTimerProps {
  timeLeft: number;
  totalTime: number;
  warningTime: number;
}

export const RadialTimer: React.FC<RadialTimerProps> = ({ timeLeft, totalTime, warningTime }) => {
  const radius = 120;
  const stroke = 15;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (timeLeft / totalTime) * circumference;

  let colorClass = "text-green-500";
  let bgClass = "text-green-900/30";
  
  if (timeLeft <= warningTime) {
    colorClass = "text-red-500 animate-pulse";
    bgClass = "text-red-900/30";
  } else if (timeLeft <= totalTime * 0.5) {
    colorClass = "text-yellow-500";
    bgClass = "text-yellow-900/30";
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={bgClass}
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s linear" }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={colorClass}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-6xl font-bold font-mono ${timeLeft <= warningTime ? 'text-red-400' : 'text-white'}`}>
          {timeLeft}
        </span>
        <span className="text-xs text-slate-400 uppercase tracking-widest mt-2">Seconds</span>
      </div>
    </div>
  );
};