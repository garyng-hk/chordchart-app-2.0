import React, { useState, useCallback } from 'react';
import { SearchBar } from './components/SearchBar';
import { ResultsList } from './components/ChordDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { searchFiles } from './services/geminiService';
import type { DriveFile } from './types';
import { SearchIcon } from './components/icons/SearchIcon';

// PDF Viewer Modal Component, defined within App.tsx
const PdfViewerModal: React.FC<{ fileId: string | null; onClose: () => void }> = ({ fileId, onClose }) => {
    if (!fileId) return null;

    const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;

    return (
        <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in-fast"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-slate-800 rounded-lg shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <header className="flex items-center justify-between p-2 sm:p-4 bg-slate-900 border-b border-slate-700 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-slate-200">樂譜預覽</h3>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                        aria-label="Close PDF viewer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </header>
                <div className="flex-grow">
                    <iframe 
                        src={embedUrl}
                        className="w-full h-full border-0"
                        title="PDF Viewer"
                        allow="fullscreen"
                    />
                </div>
            </div>
             <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast {
                    animation: fade-in-fast 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};


function App() {
  const [results, setResults] = useState<DriveFile[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const handleSearch = useCallback(async (params: { songTitle: string; key: string; lyrics: string; }) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const files = await searchFiles(params, setLoadingMessage);
      setResults(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const WelcomeScreen = () => (
    <div className="text-center p-8">
        <SearchIcon className="w-24 h-24 mx-auto mb-6 text-cyan-400" />
        <h2 className="text-3xl font-bold text-slate-100 mb-2">歡迎使用 YLGC 樂譜搜尋系統</h2>
        <p className="text-slate-400 max-w-md mx-auto">
            請在上方欄位輸入歌名、KEY 或部份歌詞來尋找樂譜。
        </p>
    </div>
  );
  
  const hasSearched = results !== null;

  return (
    <>
        <div className="min-h-screen bg-slate-900 font-sans flex flex-col items-center p-4 sm:p-6">
        <header className="w-full max-w-5xl text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
                YLGC 樂譜搜尋系統
            </h1>
        </header>

        <main className="w-full max-w-5xl flex-grow">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-slate-700">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>

            <div className="mt-8">
            {isLoading && <LoadingSpinner message={loadingMessage} />}
            {error && <ErrorMessage message={error} />}
            {hasSearched && !isLoading && !error && (
                <ResultsList files={results} onFileSelect={setSelectedFileId} />
            )}
            {!isLoading && !error && !hasSearched && <WelcomeScreen />}
            </div>
        </main>

        <footer className="w-full max-w-5xl text-center py-6 mt-8 text-slate-500 text-sm">
            <p>Powered by Google Drive API.</p>
        </footer>
        </div>
        <PdfViewerModal fileId={selectedFileId} onClose={() => setSelectedFileId(null)} />
    </>
  );
}

export default App;