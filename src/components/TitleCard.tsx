import React from 'react';
import { SpotlightCard } from './SpotlightCard';

export function TitleCard() {
  return (
    <SpotlightCard className="lg:col-span-2 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[#C9A96E]">
            <span className="w-2 h-2 rounded-full bg-[#C9A96E] animate-pulse" />
            OPEN RECRUITMENT
          </span>
          <span className="text-white/20 font-mono text-xs">·</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#8B8B90]">
            TAHAP SELEKSI RESMI
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-[#F2F1EE] leading-[1.1] text-balance">
          SELEKSI MARGA <span className="text-[#C9A96E]">ZEVERD</span>
        </h1>

        <p className="mt-3 text-sm sm:text-base text-[#8B8B90] leading-relaxed max-w-xl">
          Seleksi member editing resmi Marga ZEVERD. Pastikan video hasil editing Anda telah diunggah ke TikTok dengan mencantumkan seluruh hashtag wajib pada caption.
        </p>
      </div>

      <div className="pt-6 mt-6 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs text-[#8B8B90]">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span>VERIFIKASI REAL-TIME</span>
          <span>·</span>
          <span>SSRF & ANTI-REPLAY PROTECTED</span>
        </div>
        <div className="font-mono text-[11px] text-[#C9A96E]/80">
          SEASON 2026
        </div>
      </div>
    </SpotlightCard>
  );
}
