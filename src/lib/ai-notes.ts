import { supabase } from '@/lib/supabase';

export async function fetchAiGreetingLine(seed?: number): Promise<string> {
  const body = seed != null ? { seed } : {};

  const { data, error } = await supabase.functions.invoke<{ text?: string; error?: string }>('ai-notes', {
    body,
  });

  if (error) throw error;
  if (data?.error || !data?.text?.trim()) throw new Error(data?.error ?? 'No response');

  return data.text.trim();
}
