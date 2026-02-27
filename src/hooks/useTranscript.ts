import { useState, useEffect, useRef } from "react";
import type { Episode, EpisodeIndex } from "../types/transcript";

interface TranscriptState {
  index: EpisodeIndex | null;
  episode: Episode | null;
  loading: boolean;
  error: string | null;
}

export function useTranscript(season: number, episodeNum: number) {
  const [state, setState] = useState<TranscriptState>({
    index: null,
    episode: null,
    loading: true,
    error: null,
  });

  const cache = useRef<Map<string, Episode>>(new Map());

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetch("/data/tbbt/index.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<EpisodeIndex>;
      })
      .then((index) => {
        if (!cancelled) {
          setState((s) => ({ ...s, index, loading: false }));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            loading: false,
            error: err instanceof Error ? err.message : String(err),
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state.index) return;

    const seasonEntry = state.index.seasons.find((s) => s.season === season);
    if (!seasonEntry) return;

    const epEntry = seasonEntry.episodes.find((e) => e.episode === episodeNum);
    if (!epEntry) return;

    const key = epEntry.file;

    if (cache.current.has(key)) {
      setState((s) => ({ ...s, episode: cache.current.get(key)!, loading: false }));
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null, episode: null }));

    fetch(`/data/tbbt/${key}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Episode>;
      })
      .then((ep) => {
        if (!cancelled) {
          cache.current.set(key, ep);
          setState((s) => ({ ...s, episode: ep, loading: false }));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            loading: false,
            error: err instanceof Error ? err.message : String(err),
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [state.index, season, episodeNum]);

  return state;
}
