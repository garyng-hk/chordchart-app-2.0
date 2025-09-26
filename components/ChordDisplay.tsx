import React from 'react';
import type { DriveFile } from '../types';
import { FilePdfIcon } from './icons/GuitarIcon';

interface ResultsListProps {
  files: DriveFile[];
  onFileSelect: (id: string) => void;
}

// A new icon component specifically for Google Docs for better UI clarity.
const FileGdocIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
        <path d="M10 9H8" />
    </svg>
);


export const ResultsList: React.FC<ResultsListProps> = ({ files, onFileSelect }) => {
  if (files.length === 0) {
    return (
        <div className="text-center p-8 text-slate-400 bg-slate-800/50 rounded-xl border border-slate-700">
            <h3 className="font-bold text-slate-200 text-lg mb-2">找不到任何樂譜</h3>
            <p className="max-w-md mx-auto">
                請嘗試使用不同的關鍵字。也請確認 Google Drive 資料夾的分享權限已設為「任何知道連結的使用者」。
            </p>
        </div>
    );
  }
  
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 animate-fade-in">
        <ul className="divide-y divide-slate-700">
            {files.map((file) => {
                const IconComponent = file.mimeType === 'application/pdf' ? FilePdfIcon : FileGdocIcon;
                return (
                    <li key={file.id}>
                        <button
                            onClick={() => onFileSelect(file.id)}
                            className="w-full flex items-center p-4 text-left hover:bg-slate-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-md"
                            aria-label={`Open ${file.name}`}
                        >
                            <IconComponent className="w-6 h-6 mr-4 text-cyan-400 flex-shrink-0" />
                            <span className="text-slate-200">{file.name}</span>
                        </button>
                    </li>
                );
            })}
        </ul>
        <style>{`
            @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
            }
        `}</style>
    </div>
  );
};