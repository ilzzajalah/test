# SELEKSI MARGA ZEVERD

Website resmi seleksi member editing Marga ZEVERD dengan verifikasi caption video TikTok secara otomatis dan proteksi keamanan berlapis.

## Fitur Utama
- **Verifikasi Hashtag Otomatis**: Memeriksa caption video TikTok secara real-time melalui TikTok oEmbed API untuk memastikan kedua hashtag wajib (`#zeverdnewera` dan `#zeverdfamily`) ada sebagai token utuh.
- **Bento Grid Minimalis & Handcrafted**: Desain dark-mode modern dengan palet warna `#0A0A0B`, aksen emas `#C9A96E`, mikrointeraksi spotlight kursor, dan efek konfeti saat lolos.
- **Proteksi Anti-SSRF & DNS Filtering**: Validasi ketat terhadap hostname TikTok (`tiktok.com`, `vm.tiktok.com`, `vt.tiktok.com`) serta pencegahan akses ke IP privat/loopback pada setiap hop redirect.
- **Sliding-Window Rate Limiter**: 8 permintaan per menit dan 40 permintaan per jam per IP (dengan salt hash SHA-256 untuk privasi).
- **Anti-Replay / Single-Use Check**: Setiap tautan video hanya dapat digunakan satu kali untuk mencegah kecurangan.
- **Honeypot & Turnstile Ready**: Proteksi bot otomatis tanpa mengganggu pengalaman pengguna.
- **Perlindungan Link WhatsApp**: Tautan grup WhatsApp hanya tersimpan di variabel server (`WHATSAPP_GROUP_LINK`) dan baru dikirimkan setelah status kelulusan terverifikasi.

## Menjalankan Secara Lokal

```bash
# Instal dependensi
npm install

# Salin konfigurasi environment
cp .env.example .env

# Jalankan server pengembangan
npm run dev
```

Buka peramban di `http://localhost:3000`.

## Skrip yang Tersedia
- `npm run dev`: Menjalankan server full-stack Express + Vite
- `npm run build`: Membangun aset produksi Vite
- `npm run start`: Menjalankan server dalam mode produksi
- `npm run lint`: Memeriksa tipe TypeScript
