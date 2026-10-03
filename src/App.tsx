import React, { useState } from 'react';
import { TitleCard } from './components/TitleCard';
import { FormCard } from './components/FormCard';
import { HashtagCard } from './components/HashtagCard';
import { StepsCard } from './components/StepsCard';
import { StatusCard } from './components/StatusCard';
import { AppState, CheckFormData, VerificationResponse } from './lib/types';
import { ShieldCheckIcon } from './components/Icons';

export default function App() {
  const [appState, setAppState] = useState<AppState>('form');
  const [verificationResult, setVerificationResult] = useState<VerificationResponse | null>(null);
  const [formKey, setFormKey] = useState<number>(0);

  const handleCheckSubmission = async (formData: CheckFormData) => {
    setAppState('loading');
    setVerificationResult(null);

    const startTime = Date.now();

    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = (await response.json()) as VerificationResponse;

      // Ensure at least 1.5s loading time for a comfortable, smooth UX flow
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 1500 - elapsed);

      setTimeout(() => {
        setVerificationResult(data);
        if (data.success) {
          setAppState('success');
        } else {
          setAppState('failed');
        }
      }, remainingTime);
    } catch (err: any) {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 1500 - elapsed);

      setTimeout(() => {
        setVerificationResult({
          success: false,
          message: 'Terjadi kesalahan jaringan. Silakan periksa koneksi Anda dan coba lagi.',
        });
        setAppState('failed');
      }, remainingTime);
    }
  };

  const handleReset = () => {
    setAppState('form');
    setVerificationResult(null);
    setFormKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] bg-grain text-[#F2F1EE] flex flex-col justify-between selection:bg-[#C9A96E]/20 selection:text-[#C9A96E]">
      {/* Top Bar Contract (1 Row, 3 Zones) */}
      <header className="w-full border-b border-white/[0.06] bg-[#0A0A0B]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#F2F1EE]">
              MARGA <span className="text-[#C9A96E]">ZEVERD</span>
            </span>
          </div>

          {/* Zone 2: Quiet metadata */}
          <nav className="hidden sm:flex items-center gap-3 text-xs font-mono text-[#8B8B90]">
            <span>REKRUTMEN EDITOR</span>
            <span>·</span>
            <span>EDISI 2026</span>
          </nav>

          {/* Zone 3: Security badge indicator */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#8B8B90]">
            <ShieldCheckIcon size={14} className="text-[#C9A96E]" />
            <span className="hidden xs:inline">VERIFIED GATEWAY</span>
          </div>
        </div>
      </header>

      {/* Main Bento Grid Canvas */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4">
          {/* Row 1 & 2 */}
          <TitleCard />
          <FormCard
            key={formKey}
            onSubmit={handleCheckSubmission}
            isLoading={appState === 'loading'}
            disabled={appState === 'success'}
          />

          {/* Row 3 */}
          <HashtagCard />
          <StepsCard />
          <StatusCard
            appState={appState}
            result={verificationResult}
            onReset={handleReset}
          />
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="w-full border-t border-white/[0.06] py-6 text-center text-xs text-[#8B8B90]">
        <div className="max-w-[1100px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
          <div>
            &copy; 2026 Marga ZEVERD. Hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-3 text-[#8B8B90]/80">
            <span>Sistem Seleksi Otomatis</span>
            <span>·</span>
            <span>TikTok oEmbed API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
