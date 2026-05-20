import { useCallback, useEffect, useState } from 'react';

import { pickFallbackQuote } from '@/constants/fallback-quotes';
import { fetchAiGreetingLine } from '@/lib/ai-notes';

export function useAiGreeting(enabled: boolean) {
  const [line, setLine] = useState(() => pickFallbackQuote());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    try {
      const text = await fetchAiGreetingLine(Date.now());
      setLine(text);
    } catch {
      setLine(pickFallbackQuote());
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { line, loading, refresh };
}
