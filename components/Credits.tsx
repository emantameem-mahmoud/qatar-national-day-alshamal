import React from 'react';
import { CreditsProps } from '../types';

export const Credits: React.FC<CreditsProps> = ({ minimal = false }) => {
  if (minimal) {
    return null;
  }

  return (
    <div className="bg-[#8A1538] text-white p-4 rounded-t-3xl shadow-lg mt-auto w-full backdrop-blur-md bg-opacity-90">
      <div className="flex flex-col items-center justify-center space-y-2 text-center">
        <div className="bg-white/10 px-6 py-2 rounded-lg backdrop-blur-sm transform hover:scale-105 transition duration-300">
          <span className="opacity-80 text-xs ml-1">إعداد وتنفيذ:</span>
          <span className="font-bold text-sm">أ. إيمان محمود</span>
        </div>
        
        <div className="text-[10px] opacity-50 mt-2 font-light">
          © 2025 جميع الحقوق محفوظة
        </div>
      </div>
    </div>
  );
};