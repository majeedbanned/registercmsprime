'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

interface TurnstileRenderOptions {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'flexible';
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface TurnstileWidgetProps {
  siteKey: string;
  resetSignal: number;
  onVerify: (token: string) => void;
  onError: (message: string) => void;
  messages?: {
    loadFailed?: string;
    expired?: string;
    scriptFailed?: string;
  };
}

export default function TurnstileWidget({
  siteKey,
  resetSignal,
  onVerify,
  onError,
  messages,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const previousResetSignalRef = useRef(resetSignal);
  const verifyCallbackRef = useRef(onVerify);
  const errorCallbackRef = useRef(onError);
  const messagesRef = useRef(messages);
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== 'undefined' && Boolean(window.turnstile)
  );

  useEffect(() => {
    verifyCallbackRef.current = onVerify;
    errorCallbackRef.current = onError;
    messagesRef.current = messages;
  }, [messages, onVerify, onError]);

  useEffect(() => {
    if (!scriptReady || !siteKey || !containerRef.current || !window.turnstile || widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: 'light',
      size: 'flexible',
      callback: (token) => {
        verifyCallbackRef.current(token);
      },
      'error-callback': () => {
        verifyCallbackRef.current('');
        errorCallbackRef.current(
          messagesRef.current?.loadFailed || 'Captcha failed to load. Please try again.'
        );
      },
      'expired-callback': () => {
        verifyCallbackRef.current('');
        errorCallbackRef.current(
          messagesRef.current?.expired || 'Captcha expired. Please complete it again.'
        );
      },
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [scriptReady, siteKey]);

  useEffect(() => {
    if (previousResetSignalRef.current === resetSignal) {
      return;
    }

    previousResetSignalRef.current = resetSignal;

    if (!widgetIdRef.current || !window.turnstile) {
      return;
    }

    verifyCallbackRef.current('');
    window.turnstile.reset(widgetIdRef.current);
  }, [resetSignal]);

  return (
    <>
      <Script
        id="cloudflare-turnstile"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => {
          setScriptReady(true);
        }}
        onError={() => {
          errorCallbackRef.current(
            messagesRef.current?.scriptFailed ||
              'Captcha script failed to load. Please refresh and try again.'
          );
        }}
      />
      <div ref={containerRef} />
    </>
  );
}
