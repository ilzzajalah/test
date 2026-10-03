import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

export function TurnstileWidget({ onVerify, onExpire, onError }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string) || '';

  useEffect(() => {
    if (!siteKey) {
      // In local development or if site key is empty, pass empty token
      onVerify('dev-pass-token');
      return;
    }

    let isMounted = true;
    const interval = setInterval(() => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        clearInterval(interval);
        if (!isMounted) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'dark',
          callback: (token: string) => {
            onVerify(token);
          },
          'expired-callback': () => {
            if (onExpire) onExpire();
          },
          'error-callback': () => {
            if (onError) onError();
          },
        });
      }
    }, 150);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onVerify, onExpire, onError]);

  if (!siteKey) {
    return null;
  }

  return (
    <div className="flex items-center justify-center my-2 min-h-[65px]">
      <div ref={containerRef} />
    </div>
  );
}
