import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SpotlightCard } from './SpotlightCard';
import { AppState, VerificationResponse } from '../lib/types';
import { fireSuccessConfetti } from './Confetti';
import { WhatsAppIcon, ArrowUpRightIcon, RefreshIcon, AlertCircleIcon, CheckIcon } from './Icons';

interface StatusCardProps {
  appState: AppState;
  result: VerificationResponse | null;
  onReset: () => void;
}

export function StatusCard({ appState, result, onReset }: StatusCardProps) {
  const [loadingStep, setLoadingStep] = useState(0);

  // Rotating loading messages
  useEffect(() => {
    if (appState !== 'loading') {
      setLoadingStep(0);
      return;
    }

    const timer1 = setTimeout(() => setLoadingStep(1), 600);
    const timer2 = setTimeout(() => setLoadingStep(2), 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [appState]);

  // Fire confetti on success
  useEffect(() => {
    if (appState === 'success') {
      fireSuccessConfetti();
    }
  }, [appState]);

  const loadingMessages = [
    'Membuka tautan video TikTok...',
    'Membaca metadata caption video...',
    'Mencocokkan hashtag #zeverdnewera & #zeverdfamily...',
  ];

  return (
    <SpotlightCard className="lg:col-span-2 min-h-[220px] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#C9A96E]">
          STATUS SELEKSI
        </span>
        <span
          className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full text-xs"
          style={{
            backgroundColor:
              appState === 'success'
                ? 'rgba(111, 207, 151, 0.15)'
                : appState === 'failed'
                ? 'rgba(235, 122, 122, 0.15)'
                : appState === 'loading'
                ? 'rgba(201, 169, 110, 0.15)'
                : 'rgba(255, 255, 255, 0.05)',
            color:
              appState === 'success'
                ? '#6FCF97'
                : appState === 'failed'
                ? '#EB7A7A'
                : appState === 'loading'
                ? '#C9A96E'
                : '#8B8B90',
          }}
        >
          {appState === 'form' && 'MENUNGGU BERKAS'}
          {appState === 'loading' && 'MEMERIKSA'}
          {appState === 'success' && 'LOLOS SELEKSI'}
          {appState === 'failed' && 'BELUM LOLOS'}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center py-2" aria-live="polite">
        <AnimatePresence mode="wait">
          {/* 1. STANDBY / FORM STATE */}
          {appState === 'form' && (
            <motion.div
              key="state-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-center py-4"
            >
              <p className="text-sm font-medium text-[#F2F1EE]">Siap Memeriksa Berkas</p>
              <p className="text-xs text-[#8B8B90] mt-1 max-w-md mx-auto">
                Isi formulir di atas dengan nama dan link video TikTok yang sudah diberi kedua hashtag wajib.
              </p>
            </motion.div>
          )}

          {/* 2. LOADING STATE */}
          {appState === 'loading' && (
            <motion.div
              key="state-loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="py-4 space-y-4"
            >
              <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden relative">
                <div className="bg-[#C9A96E] h-full w-1/3 rounded-full animate-pulse-scan" />
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C9A96E] animate-ping" />
                <p className="font-mono text-xs text-[#C9A96E] tracking-tight">
                  {loadingMessages[loadingStep]}
                </p>
              </div>
            </motion.div>
          )}

          {/* 3. SUCCESS STATE */}
          {appState === 'success' && result?.success && (
            <motion.div
              key="state-success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="p-4 sm:p-5 rounded-[16px] bg-[#6FCF97]/[0.08] border border-[#6FCF97]/30 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#6FCF97]/20 text-[#6FCF97] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckIcon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F2F1EE]">
                    Lolos, <span className="text-[#6FCF97]">{result.name}</span>!
                  </h3>
                  <p className="text-xs text-[#F2F1EE]/90 mt-1 leading-relaxed">
                    Selamat bergabung di <strong className="text-[#C9A96E]">Marga ZEVERD</strong>. Berkas video editing Anda telah memenuhi semua persyaratan hashtag wajib.
                  </p>
                  {result.authorName && (
                    <p className="font-mono text-[11px] text-[#8B8B90] mt-1">
                      Kreator TikTok: @{result.authorName}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={result.groupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-11 px-4 rounded-[12px] bg-[#6FCF97] hover:bg-[#5EBF87] text-[#0A0A0B] font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] shadow-sm cursor-pointer"
                >
                  <WhatsAppIcon size={16} />
                  <span>Gabung Grup WhatsApp ZEVERD</span>
                  <ArrowUpRightIcon size={14} />
                </a>

                <button
                  type="button"
                  onClick={onReset}
                  className="px-4 h-11 rounded-[12px] bg-white/[0.05] hover:bg-white/[0.09] text-xs font-mono text-[#8B8B90] hover:text-[#F2F1EE] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshIcon size={13} />
                  <span>Cek Berkas Lain</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* 4. FAILED STATE */}
          {appState === 'failed' && result && !result.success && (
            <motion.div
              key="state-failed"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="p-4 sm:p-5 rounded-[16px] bg-[#EB7A7A]/[0.08] border border-[#EB7A7A]/30 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EB7A7A]/20 text-[#EB7A7A] flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircleIcon size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#EB7A7A]">
                    Verifikasi Belum Memenuhi Syarat
                  </h3>
                  <p className="text-xs text-[#F2F1EE]/90 leading-relaxed">
                    {result.message}
                  </p>
                  {result.missing && result.missing.length > 0 && (
                    <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[10px] text-[#8B8B90]">Hashtag kurang:</span>
                      {result.missing.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#EB7A7A]/20 text-[#EB7A7A] font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onReset}
                  className="w-full h-11 rounded-[12px] bg-white/[0.08] hover:bg-white/[0.12] active:scale-[0.98] text-xs font-semibold text-[#F2F1EE] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshIcon size={14} />
                  <span>Ulangi dari Awal</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.04] text-[10px] font-mono text-[#8B8B90]/70 flex items-center justify-between">
        <span>Tautan grup hanya diberikan saat verifikasi sukses</span>
        <span>Secure Response</span>
      </div>
    </SpotlightCard>
  );
}
