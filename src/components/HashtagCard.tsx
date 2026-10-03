import React, { useState } from 'react';
import { SpotlightCard } from './SpotlightCard';
import { CopyIcon, CheckIcon } from './Icons';

export function HashtagCard() {
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTag(label);
    setTimeout(() => {
      setCopiedTag((current) => (current === label ? null : current));
    }, 2000);
  };

  const copyAll = () => {
    copyToClipboard('#zeverdnewera #zeverdfamily', 'all');
  };

  return (
    <SpotlightCard className="flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#C9A96E]">
            HASHTAG WAJIB
          </span>
          <span className="font-mono text-[10px] text-[#8B8B90]">CAPTION TIKTOK</span>
        </div>

        <p className="text-xs text-[#8B8B90] leading-relaxed mb-4">
          Video seleksi harus memuat kedua hashtag persis sebagai kata utuh di dalam caption:
        </p>

        <div className="space-y-2.5">
          {/* Hashtag 1 */}
          <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#0E0E10] border border-white/[0.06] hover:border-[#C9A96E]/40 transition-colors group">
            <span className="font-mono text-xs font-semibold text-[#C9A96E] tracking-tight">
              #zeverdnewera
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard('#zeverdnewera', 'tag1')}
              aria-label="Salin hashtag #zeverdnewera"
              className="px-2 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-[#8B8B90] hover:text-[#F2F1EE] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedTag === 'tag1' ? (
                <>
                  <CheckIcon size={12} className="text-[#6FCF97]" />
                  <span className="text-[#6FCF97] text-[11px]">Tersalin</span>
                </>
              ) : (
                <>
                  <CopyIcon size={12} />
                  <span className="text-[11px]">Salin</span>
                </>
              )}
            </button>
          </div>

          {/* Hashtag 2 */}
          <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#0E0E10] border border-white/[0.06] hover:border-[#C9A96E]/40 transition-colors group">
            <span className="font-mono text-xs font-semibold text-[#C9A96E] tracking-tight">
              #zeverdfamily
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard('#zeverdfamily', 'tag2')}
              aria-label="Salin hashtag #zeverdfamily"
              className="px-2 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-[#8B8B90] hover:text-[#F2F1EE] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedTag === 'tag2' ? (
                <>
                  <CheckIcon size={12} className="text-[#6FCF97]" />
                  <span className="text-[#6FCF97] text-[11px]">Tersalin</span>
                </>
              ) : (
                <>
                  <CopyIcon size={12} />
                  <span className="text-[11px]">Salin</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.04]">
        <button
          type="button"
          onClick={copyAll}
          className="w-full py-2 px-3 rounded-[10px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-[11px] font-mono text-[#F2F1EE]/80 hover:text-[#F2F1EE] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          {copiedTag === 'all' ? (
            <>
              <CheckIcon size={13} className="text-[#6FCF97]" />
              <span className="text-[#6FCF97]">Kedua Hashtag Tersalin!</span>
            </>
          ) : (
            <>
              <CopyIcon size={13} />
              <span>Salin Keduanya Sekaligus</span>
            </>
          )}
        </button>
      </div>
    </SpotlightCard>
  );
}
