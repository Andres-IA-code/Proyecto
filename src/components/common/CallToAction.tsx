import React from 'react';

interface CallToActionProps {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}

export function CallToAction({ title, description, buttonText, onClick }: CallToActionProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-blue-100">{description}</p>
        </div>
        <button
          onClick={onClick}
          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
