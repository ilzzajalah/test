import React from 'react';
import { SpotlightCard } from './SpotlightCard';

export function StepsCard() {
  const steps = [
    {
      num: '01',
      title: 'Unggah Video Editing',
      desc: 'Publikasikan video seleksi editing terbaikmu di akun TikTok pribadimu (setelan publik).',
    },
    {
      num: '02',
      title: 'Pasang Kedua Hashtag',
      desc: 'Pastikan caption video mencantumkan #zeverdnewera dan #zeverdfamily.',
    },
    {
      num: '03',
      title: 'Verifikasi di Sini',
      desc: 'Salin tautan video TikTok, masukkan namamu, dan lakukan pengecekan status seleksi.',
    },
  ];

  return (
    <SpotlightCard className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#C9A96E]">
            LANGKAH SELEKSI
          </span>
          <span className="font-mono text-[10px] text-[#8B8B90]">3 TAHAPAN</span>
        </div>

        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.num} className="flex gap-3">
              <span className="font-mono text-xs font-bold text-[#C9A96E] bg-[#C9A96E]/10 w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                {step.num}
              </span>
              <div>
                <h4 className="text-xs font-semibold text-[#F2F1EE]">{step.title}</h4>
                <p className="text-[11px] text-[#8B8B90] leading-relaxed mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.04] text-[10px] font-mono text-[#8B8B90]/70 flex items-center justify-between">
        <span>Video wajib publik</span>
        <span>1 Video = 1 Pendaftar</span>
      </div>
    </SpotlightCard>
  );
}
