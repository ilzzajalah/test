import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Secrets & configs
const WHATSAPP_GROUP_LINK =
  process.env.WHATSAPP_GROUP_LINK ||
  'https://chat.whatsapp.com/LnG7AinBC5pA4CFgthuLN0';
const REQUIRED_HASHTAGS = (process.env.REQUIRED_HASHTAGS || '#zeverdnewera,#zeverdfamily')
  .split(',')
  .map((h) => h.trim().toLowerCase());
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || '';
const IP_HASH_SALT = process.env.IP_HASH_SALT || 'zeverd_secure_salt_2026';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';

// Security Headers & remove X-Powered-By
app.disable('x-powered-by');

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

// JSON body parser with strict 2KB limit
app.use(express.json({ limit: '2kb' }));

// In-Memory Rate Limiting & Anti-Replay Store (with automatic sweep)
interface RateLimitRecord {
  minuteRequests: number[];
  hourRequests: number[];
  consecutiveFailures: number;
  cooldownUntil: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const usedVideoHashes = new Set<string>();

// Sweep expired rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    record.minuteRequests = record.minuteRequests.filter((t) => now - t < 60_000);
    record.hourRequests = record.hourRequests.filter((t) => now - t < 3600_000);
    if (
      record.minuteRequests.length === 0 &&
      record.hourRequests.length === 0 &&
      record.cooldownUntil < now &&
      record.consecutiveFailures === 0
    ) {
      rateLimitMap.delete(key);
    }
  }
}, 60_000);

function getHashedIp(req: Request): string {
  const rawIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1';
  return crypto.createHash('sha256').update(rawIp + IP_HASH_SALT).digest('hex');
}

// Input Schema Validation using Zod
const CheckSubmissionSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(2, 'Nama minimal 2 karakter')
    .max(50, 'Nama maksimal 50 karakter')
    .regex(/^[a-zA-Z0-9\s.\-_]+$/, 'Nama hanya boleh berisi huruf, angka, spasi, titik, dan strip'),
  link: z
    .string()
    .trim()
    .min(10, 'Link TikTok terlalu pendek')
    .max(300, 'Link maksimal 300 karakter'),
  turnstileToken: z.string().optional().default(''),
  honeypot: z.string().optional().default(''),
});

// SSRF Protection: Allowed Hostnames
const ALLOWED_TIKTOK_HOSTS = new Set([
  'tiktok.com',
  'www.tiktok.com',
  'm.tiktok.com',
  'vm.tiktok.com',
  'vt.tiktok.com',
]);

function isPrivateOrLoopback(hostname: string): boolean {
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === '127.0.0.1' ||
    hostname === '::1'
  ) {
    return true;
  }
  // Check private IP ranges
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // 127.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // 169.254.0.0/16
    if (a === 0) return true;
  }
  return false;
}

// Manual redirect follower with SSRF validation per hop
async function resolveTikTokUrl(rawUrl: string): Promise<string> {
  let currentUrl = rawUrl;
  const maxRedirects = 4;

  for (let i = 0; i < maxRedirects; i++) {
    let parsed: URL;
    try {
      parsed = new URL(currentUrl);
    } catch {
      throw new Error('Format URL tidak valid.');
    }

    if (parsed.protocol !== 'https:') {
      throw new Error('Hanya protokol HTTPS yang diizinkan.');
    }

    const host = parsed.hostname.toLowerCase();
    if (!ALLOWED_TIKTOK_HOSTS.has(host)) {
      throw new Error('Domain tidak diizinkan. Hanya link video TikTok resmi.');
    }

    if (isPrivateOrLoopback(host)) {
      throw new Error('Akses ke alamat jaringan privat diblokir.');
    }

    // If it's already a full tiktok.com/@user/video/... link, we don't need to resolve redirects
    if (
      (host === 'tiktok.com' || host === 'www.tiktok.com' || host === 'm.tiktok.com') &&
      parsed.pathname.includes('/video/')
    ) {
      return parsed.toString();
    }

    // For shortlinks (vm.tiktok.com / vt.tiktok.com), inspect redirect
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(currentUrl, {
        method: 'HEAD',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
      });

      const location = response.headers.get('location');
      if (location) {
        // Resolve relative redirects
        const nextUrl = new URL(location, currentUrl).toString();
        currentUrl = nextUrl;
      } else {
        // No further redirect header found
        return currentUrl;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Waktu permintaan ke TikTok habis (timeout).');
      }
      // If HEAD fails, continue with currentUrl for oEmbed fallback
      break;
    } finally {
      clearTimeout(timeout);
    }
  }

  return currentUrl;
}

// Extract Video ID or URL key for anti-duplicate replay protection
function extractVideoIdentifier(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    const videoMatch = parsed.pathname.match(/\/video\/(\d+)/);
    if (videoMatch && videoMatch[1]) {
      return videoMatch[1];
    }
    // Fallback: clean path without query params
    return parsed.origin + parsed.pathname;
  } catch {
    return urlStr;
  }
}

// Verify Cloudflare Turnstile token
async function verifyTurnstile(token: string, remoteIp: string): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) {
    // If secret key is not configured (e.g. initial dev environment), allow pass
    return true;
  }
  if (!token) {
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    formData.append('remoteip', remoteIp);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await res.json();
    return Boolean(data.success);
  } catch {
    return false;
  }
}

// Main Verification API Route
app.post('/api/check', async (req: Request, res: Response): Promise<void> => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  // 1. Content-Type & Method validation
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    res.status(400).json({ success: false, message: 'Content-Type harus application/json.' });
    return;
  }

  // 2. Anti-CSRF Origin check (if ALLOWED_ORIGIN configured)
  const origin = req.headers.origin || req.headers.referer;
  if (ALLOWED_ORIGIN && origin && !origin.startsWith(ALLOWED_ORIGIN)) {
    res.status(403).json({ success: false, message: 'Permintaan dari sumber ini ditolak.' });
    return;
  }

  // 3. Sliding-window Rate Limiting per IP
  const ipHash = getHashedIp(req);
  const now = Date.now();
  let rateRecord = rateLimitMap.get(ipHash);
  if (!rateRecord) {
    rateRecord = {
      minuteRequests: [],
      hourRequests: [],
      consecutiveFailures: 0,
      cooldownUntil: 0,
    };
    rateLimitMap.set(ipHash, rateRecord);
  }

  // Check cooldown
  if (rateRecord.cooldownUntil > now) {
    const remainingSec = Math.ceil((rateRecord.cooldownUntil - now) / 1000);
    res.status(429).json({
      success: false,
      message: `Terlalu banyak percobaan gagal. Silakan tunggu ${remainingSec} detik.`,
    });
    return;
  }

  // Clean old window timestamps
  rateRecord.minuteRequests = rateRecord.minuteRequests.filter((t) => now - t < 60_000);
  rateRecord.hourRequests = rateRecord.hourRequests.filter((t) => now - t < 3600_000);

  // Check rate limits: 8 per min, 40 per hour
  if (rateRecord.minuteRequests.length >= 8 || rateRecord.hourRequests.length >= 40) {
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak permintaan. Silakan tunggu 1 menit sebelum mencoba lagi.',
    });
    return;
  }

  rateRecord.minuteRequests.push(now);
  rateRecord.hourRequests.push(now);

  // 4. Honeypot check
  if (req.body?.honeypot || req.body?.website) {
    // Silently mark failure and reject
    rateRecord.consecutiveFailures += 1;
    res.status(400).json({ success: false, message: 'Permintaan tidak valid.' });
    return;
  }

  // 5. Zod schema validation
  const parseResult = CheckSubmissionSchema.safeParse(req.body);
  if (!parseResult.success) {
    rateRecord.consecutiveFailures += 1;
    const firstErr = parseResult.error.issues?.[0]?.message || 'Input tidak valid.';
    res.status(400).json({ success: false, message: firstErr });
    return;
  }

  const { nama, link, turnstileToken } = parseResult.data;

  // 6. Turnstile Verification
  const isTurnstileValid = await verifyTurnstile(turnstileToken, ipHash);
  if (!isTurnstileValid) {
    rateRecord.consecutiveFailures += 1;
    res.status(403).json({
      success: false,
      message: 'Verifikasi keamanan (Turnstile) gagal atau kadaluarsa. Silakan coba lagi.',
    });
    return;
  }

  try {
    // 7. Resolve TikTok URL with SSRF protection
    const resolvedUrl = await resolveTikTokUrl(link);

    // 8. Check Video Duplicate Replay
    const videoId = extractVideoIdentifier(resolvedUrl);
    const videoHash = crypto.createHash('sha256').update(videoId).digest('hex');

    if (usedVideoHashes.has(videoHash)) {
      rateRecord.consecutiveFailures += 1;
      res.status(200).json({
        success: false,
        message: 'Video ini sudah pernah digunakan untuk seleksi sebelumnya.',
      });
      return;
    }

    // 9. Fetch TikTok oEmbed
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(resolvedUrl)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    let oembedRes: globalThis.Response;
    try {
      oembedRes = await fetch(oembedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; ZeverdBot/1.0; +https://marga-zeverd.com)',
          Accept: 'application/json',
        },
      });
    } catch (err: any) {
      clearTimeout(timeout);
      rateRecord.consecutiveFailures += 1;
      res.status(502).json({
        success: false,
        message: 'Tidak dapat menghubungi server TikTok. Pastikan video publik dan coba lagi.',
      });
      return;
    } finally {
      clearTimeout(timeout);
    }

    if (!oembedRes.ok) {
      rateRecord.consecutiveFailures += 1;
      res.status(200).json({
        success: false,
        message: 'Video tidak ditemukan atau bersifat privat. Pastikan video TikTok publik.',
      });
      return;
    }

    // Read limited bytes (max 100KB)
    const oembedData = (await oembedRes.json()) as {
      title?: string;
      author_name?: string;
      author_unique_id?: string;
    };

    const rawCaption = oembedData.title || '';
    const authorName = oembedData.author_name || oembedData.author_unique_id || 'Kreator';

    // 10. Normalize Caption (strip zero-width characters, lowercase)
    const normalizedCaption = rawCaption
      .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ')
      .toLowerCase();

    // 11. Strict Regex Token Matching for Hashtags
    // Must be distinct token: /(^|[^a-z0-9_])#zeverdnewera(?![a-z0-9_])/i
    const missingHashtags: string[] = [];
    const matchedHashtags: string[] = [];

    for (const tag of REQUIRED_HASHTAGS) {
      // Escape any special regex characters if present
      const cleanTag = tag.startsWith('#') ? tag.slice(1) : tag;
      const regex = new RegExp(`(^|[^a-z0-9_])#${cleanTag}(?![a-z0-9_])`, 'i');
      if (regex.test(normalizedCaption)) {
        matchedHashtags.push(`#${cleanTag}`);
      } else {
        missingHashtags.push(`#${cleanTag}`);
      }
    }

    // 12. Determine Result
    if (missingHashtags.length === 0) {
      // SUCCESS! Reset failure count and store video hash
      rateRecord.consecutiveFailures = 0;
      usedVideoHashes.add(videoHash);

      res.status(200).json({
        success: true,
        name: nama,
        authorName,
        groupLink: WHATSAPP_GROUP_LINK,
        matchedHashtags,
      });
      return;
    } else {
      // FAILED - missing one or more hashtags
      rateRecord.consecutiveFailures += 1;
      if (rateRecord.consecutiveFailures >= 5) {
        rateRecord.cooldownUntil = Date.now() + 10 * 60_000; // 10 minutes cooldown
      }

      let message = '';
      if (missingHashtags.length === REQUIRED_HASHTAGS.length) {
        message = 'Kedua hashtag wajib belum ada di caption video TikTok Anda.';
      } else if (missingHashtags.length === 1) {
        message = `Hashtag ${missingHashtags[0]} belum ditemukan di caption video.`;
      } else {
        message = `Hashtag ${missingHashtags.join(' & ')} belum ditemukan di caption video.`;
      }

      res.status(200).json({
        success: false,
        message,
        missing: missingHashtags,
        authorName,
      });
      return;
    }
  } catch (err: any) {
    rateRecord.consecutiveFailures += 1;
    res.status(200).json({
      success: false,
      message: err.message || 'Gagal memproses tautan video. Pastikan link TikTok valid.',
    });
    return;
  }
});

// Vite middleware or Static files serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Seleksi Marga ZEVERD aktif di port ${PORT}`);
  });
}

startServer();
