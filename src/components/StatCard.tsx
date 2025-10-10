import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-start">
      <div className="bg-gray-100 p-3 rounded-full mr-4">
        {icon}
      </div>
      <div>
        <div className="font-bold text-2xl">{value}</div>
        <div className="text-gray-500 text-sm">{title}</div>
        {description && <div className="text-xs text-gray-400 mt-1">{description}</div>}
      </div>
    </div>
  );
};

export default StatCard;