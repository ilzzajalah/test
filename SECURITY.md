# Kebijakan Keamanan (Security Policy)

## Pelaporan Kerentanan
Jika Anda menemukan kerentanan keamanan pada sistem seleksi Marga ZEVERD, mohon laporkan secara privat ke pengurus/admin Marga ZEVERD dan jangan membuka isu secara publik.

## Standar Keamanan Sistem
1. **Pencegahan SSRF**: Hostname dibatasi hanya pada domain TikTok resmi, dan resolusi ke alamat IP privat/loopback diblokir pada setiap hop redirect.
2. **Rate Limiting & Anti-Brute Force**: Pembatasan 8 request/menit dan 40 request/jam per hash IP.
3. **Pencegahan Replay**: SHA-256 hash video ID diverifikasi untuk mencegah penggunaan ulang video yang sama oleh peserta lain.
4. **Honeypot & Bot Defense**: Form submission divalidasi dengan honeypot dan Cloudflare Turnstile.
5. **Kerahasiaan Link Grup**: Link grup WhatsApp tidak pernah disertakan di frontend, sourcemap, atau network payload sebelum lolos.
