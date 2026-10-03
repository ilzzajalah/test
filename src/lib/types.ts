export type AppState = 'form' | 'loading' | 'success' | 'failed';

export interface CheckFormData {
  nama: string;
  link: string;
  honeypot?: string;
  turnstileToken?: string;
}

export interface VerificationSuccess {
  success: true;
  name: string;
  authorName?: string;
  groupLink: string;
  matchedHashtags?: string[];
}

export interface VerificationFailure {
  success: false;
  message: string;
  missing?: string[];
  authorName?: string;
}

export type VerificationResponse = VerificationSuccess | VerificationFailure;
