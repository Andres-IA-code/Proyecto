import React, { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <h3 className="font-medium text-gray-700 mb-4">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
};

export default ChartCard;