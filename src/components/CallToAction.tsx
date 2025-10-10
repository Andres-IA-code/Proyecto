import React from 'react';

interface CallToActionProps {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  imageUrl?: string;
}

const CallToAction: React.FC<CallToActionProps> = ({
  title,
  description,
  buttonText,
  onClick,
  imageUrl,
}) => {
  return (
    <div className="bg-[#0F172A] text-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="p-8 md:w-2/3">
          <h2 className="text-2xl font-bold mb-3">{title}</h2>
          <p className="text-gray-300 mb-6">{description}</p>
          <button
            onClick={onClick}
            className="bg-white text-[#0F172A] px-6 py-2 rounded font-medium hover:bg-gray-100 transition-colors"
          >
            {buttonText}
          </button>
        </div>
        {imageUrl && (
          <div className="md:w-1/3 bg-gray-700 flex items-center justify-center p-4">
            <div className="bg-gray-600 w-full h-48 flex items-center justify-center rounded">
              <span className="text-gray-300 text-sm text-center">
                Espacio para imagen de camión/logística
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallToAction;