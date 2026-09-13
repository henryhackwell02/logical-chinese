'use client';

import { useEffect, useRef, useState } from 'react';
import type { Entry } from '@/lib/types';
import { suggestUrl } from '@/lib/site';

function plainText(entry: Entry) {
  return `${entry.char}  ${entry.pinyin}\n${entry.core}\n${entry.mnemonic}`;
}

export default function EntryTools({ entry }: { entry: Entry }) {
  const [canSpeak, setCanSpeak] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCanSpeak(typeof window !== 'undefined' && 'speechSynthesis' in window);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function speak() {
    const utterance = new SpeechSynthesisUtterance(entry.char);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  async function copy() {
    const text = plainText(entry);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const field = document.createElement('textarea');
      field.value = text;
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="reading-tools">
      {canSpeak && (
        <button type="button" className="tool" onClick={speak}>
          <span aria-hidden="true">♪</span> Hear {entry.pinyin}
        </button>
      )}
      <button type="button" className="tool" onClick={copy}>
        <span aria-hidden="true">⧉</span> {copied ? 'Copied' : 'Copy entry'}
      </button>
      <a
        className="tool"
        href={suggestUrl(entry.char, entry.pinyin, entry.mnemonic, entry.core)}
        target="_blank"
        rel="noreferrer noopener"
      >
        Suggest a better mnemonic
      </a>
      <span aria-live="polite" className="sr-only">
        {copied ? 'Entry copied to clipboard' : ''}
      </span>
    </div>
  );
}
