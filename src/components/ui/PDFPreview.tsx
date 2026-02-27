import { useMemo } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { FileText, Loader2, AlertCircle } from "lucide-react";
import type { Episode, PDFSettings } from "../../types/transcript";
import { PDFDocument } from "../pdf/PDFDocument";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { chunkIntoPages } from "../../utils/pageChunker";

interface PDFPreviewProps {
  episode: Episode | null;
  settings: PDFSettings;
  loading: boolean;
  error: string | null;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function PDFPreview({
  episode,
  settings,
  loading,
  error,
}: PDFPreviewProps) {
  const debouncedSettings = useDebouncedValue(settings, 300);
  const debouncedEpisode = useDebouncedValue(episode, 300);

  const isStale = settings !== debouncedSettings || episode !== debouncedEpisode;

  const pageChunks = useMemo(
    () =>
      debouncedEpisode
        ? chunkIntoPages(debouncedEpisode.lines, debouncedSettings, true)
        : [],
    [debouncedEpisode, debouncedSettings],
  );

  return (
    <div className="flex flex-col h-full bg-muted/30">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background shrink-0">
        <FileText className="size-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium truncate text-foreground">
          {episode
            ? `S${pad(episode.season)}E${pad(episode.episode)} – ${episode.title}`
            : "No episode selected"}
        </span>
        {isStale && (
          <Loader2 className="size-3 animate-spin text-muted-foreground shrink-0 ml-auto" />
        )}
      </div>

      <div className="flex-1 min-h-0 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                Loading episode…
              </span>
            </div>
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-destructive">
              <AlertCircle className="size-6" />
              <p className="text-sm">Error: {error}</p>
            </div>
          </div>
        )}
        {!episode && !loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <FileText className="size-10 opacity-40" />
              <p className="text-sm">Select an episode to preview</p>
            </div>
          </div>
        )}
        {debouncedEpisode && !loading && (
          <PDFViewer style={{ width: "100%", height: "100%", border: "none" }}>
            <PDFDocument episode={debouncedEpisode} settings={debouncedSettings} pageChunks={pageChunks} />
          </PDFViewer>
        )}
      </div>
    </div>
  );
}
