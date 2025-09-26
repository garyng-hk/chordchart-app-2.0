
import React, { useState } from 'react';
import { SearchIcon } from './icons/SearchIcon';

interface SearchBarProps {
  onSearch: (params: { songTitle: string; key: string; lyrics: string; }) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [songTitle, setSongTitle] = useState('');
  const [key, setKey] = useState('');
  const [lyrics, setLyrics] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ songTitle, key, lyrics });
  };

  const canSearch = !isLoading && (songTitle.trim() !== '' || key.trim() !== '' || lyrics.trim() !== '');

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
      <div className="md:col-span-2">
        <label htmlFor="songTitle" className="block text-sm font-medium text-slate-300 mb-1">歌名</label>
        <input
          id="songTitle"
          type="text"
          value={songTitle}
          onChange={(e) => setSongTitle(e.target.value)}
          placeholder="e.g., How Great Thou Art"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
          disabled={isLoading}
        />
      </div>
      <div className="md:col-span-1">
        <label htmlFor="key" className="block text-sm font-medium text-slate-300 mb-1">KEY (調性)</label>
        <input
          id="key"
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="e.g., C"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
          disabled={isLoading}
        />
      </div>
       <div className="md:col-span-2">
        <label htmlFor="lyrics" className="block text-sm font-medium text-slate-300 mb-1">歌詞 (部份)</label>
        <input
          id="lyrics"
          type="text"
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder="e.g., 稱頌你聖名"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
          disabled={isLoading}
        />
      </div>
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={!canSearch}
          className="w-full flex items-center justify-center px-4 py-2 bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
             <SearchIcon className="w-5 h-5 mr-2" />
          )}
          <span>{isLoading ? '搜尋中...' : '搜尋'}</span>
        </button>
      </div>
    </form>
  );
};
