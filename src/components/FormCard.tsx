import React, { useState } from 'react';
import { SpotlightCard } from './SpotlightCard';
import { TurnstileWidget } from './Turnstile';
import { CheckFormData } from '../lib/types';
import { ShieldCheckIcon } from './Icons';

interface FormCardProps {
  onSubmit: (data: CheckFormData) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function FormCard({ onSubmit, isLoading, disabled = false }: FormCardProps) {
  const [nama, setNama] = useState('');
  const [link, setLink] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [errors, setErrors] = useState<{ nama?: string; link?: string }>({});

  const validateClient = (): boolean => {
    const newErrors: { nama?: string; link?: string } = {};

    const cleanNama = nama.trim();
    if (!cleanNama) {
      newErrors.nama = 'Nama lengkap atau alias wajib diisi.';
    } else if (cleanNama.length < 2) {
      newErrors.nama = 'Nama minimal 2 karakter.';
    } else if (cleanNama.length > 50) {
      newErrors.nama = 'Nama maksimal 50 karakter.';
    } else if (!/^[a-zA-Z0-9\s.\-_]+$/.test(cleanNama)) {
      newErrors.nama = 'Hanya huruf, angka, spasi, titik, dan strip (-).';
    }

    const cleanLink = link.trim();
    if (!cleanLink) {
      newErrors.link = 'Tautan video TikTok wajib diisi.';
    } else {
      try {
        const parsed = new URL(cleanLink);
        const host = parsed.hostname.toLowerCase();
        const validHosts = ['tiktok.com', 'www.tiktok.com', 'm.tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'];
        if (!validHosts.includes(host)) {
          newErrors.link = 'Gunakan tautan resmi TikTok (tiktok.com / vm.tiktok.com / vt.tiktok.com).';
        }
      } catch {
        newErrors.link = 'Format tautan URL tidak valid. Sertakan https://';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || disabled) return;

    if (!validateClient()) return;

    onSubmit({
      nama: nama.trim(),
      link: link.trim(),
      honeypot: honeypot.trim(),
      turnstileToken,
    });
  };

  return (
    <SpotlightCard className="lg:col-span-2 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#C9A96E]">
            FORMULIR SELEKSI
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#8B8B90] uppercase tracking-wider">
            <ShieldCheckIcon size={13} className="text-[#C9A96E]" />
            SECURE VERIFICATION
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Honeypot field (hidden from human visitors) */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Input Nama */}
          <div className="space-y-1.5">
            <label
              htmlFor="nama-input"
              className="block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B8B90]"
            >
              NAMA LENGKAP / ALIAS
            </label>
            <div className="relative group">
              <input
                id="nama-input"
                type="text"
                value={nama}
                onChange={(e) => {
                  setNama(e.target.value);
                  if (errors.nama) setErrors((prev) => ({ ...prev, nama: undefined }));
                }}
                disabled={isLoading || disabled}
                placeholder="Contoh: Rian Pratama (ZEVERD)"
                maxLength={50}
                className="w-full h-12 px-4 rounded-[12px] bg-[#0E0E10] border border-white/[0.08] text-[#F2F1EE] text-sm placeholder-[#8B8B90]/40 focus:outline-none focus:border-[#C9A96E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {errors.nama && (
              <p className="text-xs text-[#EB7A7A] mt-1 font-mono">{errors.nama}</p>
            )}
          </div>

          {/* Input Link TikTok */}
          <div className="space-y-1.5">
            <label
              htmlFor="link-input"
              className="block font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B8B90]"
            >
              LINK VIDEO SELEKSI TIKTOK
            </label>
            <div className="relative group">
              <input
                id="link-input"
                type="url"
                value={link}
                onChange={(e) => {
                  setLink(e.target.value);
                  if (errors.link) setErrors((prev) => ({ ...prev, link: undefined }));
                }}
                disabled={isLoading || disabled}
                placeholder="https://vt.tiktok.com/... atau https://www.tiktok.com/@user/video/..."
                maxLength={300}
                autoComplete="off"
                className="w-full h-12 px-4 rounded-[12px] bg-[#0E0E10] border border-white/[0.08] text-[#F2F1EE] text-sm font-mono placeholder:font-sans placeholder-[#8B8B90]/40 focus:outline-none focus:border-[#C9A96E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {errors.link && (
              <p className="text-xs text-[#EB7A7A] mt-1 font-mono">{errors.link}</p>
            )}
          </div>

          {/* Cloudflare Turnstile */}
          <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} />

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || disabled}
              className="w-full h-12 rounded-[12px] bg-[#C9A96E] hover:bg-[#D4B57A] active:scale-[0.98] text-[#0A0A0B] font-semibold text-sm tracking-wide transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#C9A96E] shadow-sm"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#0A0A0B]/30 border-t-[#0A0A0B] rounded-full animate-spin" />
                  <span>Memeriksa Berkas...</span>
                </span>
              ) : (
                <span>Cek Seleksi Sekarang</span>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.04] text-[11px] font-mono text-[#8B8B90]/70 flex items-center justify-between">
        <span>Tekan Enter untuk memeriksa</span>
        <span>Anti-Bot Active</span>
      </div>
    </SpotlightCard>
  );
}
