'use client';

import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface RiskGaugeProps {
  score: number;
}

export function RiskGauge({ score }: RiskGaugeProps) {
  const getColors = (val: number) => {
    // These should match globals.css tokens, but chart.js needs hex/rgb values for some things
    // or we can use computed styles. For now, hardcode the hex matches of our CSS for ChartJS
    if (val <= 25) return { color: '#22C55E', bg: 'rgba(34, 197, 94, 0.1)' }; // genuine
    if (val <= 50) return { color: '#EAB308', bg: 'rgba(234, 179, 8, 0.1)' }; // suspicious
    if (val <= 75) return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' }; // cloned
    return { color: '#DC2626', bg: 'rgba(220, 38, 38, 0.1)' }; // critical
  };

  const colors = getColors(score);

  const data = useMemo(() => {
    return {
      datasets: [
        {
          data: [score, 100 - score],
          backgroundColor: [
            colors.color,
            'var(--border)' // Remaining part
          ],
          borderWidth: 0,
          circumference: 180, // Half circle
          rotation: 270,      // Start from left
          cutout: '80%',      // Thickness
        },
      ],
    };
  }, [score, colors.color]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
    animation: {
      animateRotate: true,
      animateScale: false,
    },
  };

  return (
    <div className="relative w-full aspect-[2/1] flex flex-col items-center justify-end">
      <div className="absolute inset-0 pb-4">
        <Doughnut data={data} options={options} />
      </div>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="text-4xl font-bold font-mono text-text-primary" style={{ color: colors.color }}>
          {score.toFixed(1)}
        </span>
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider mt-1">
          Risk Score
        </span>
      </div>
    </div>
  );
}
