import { useState, useCallback, useMemo } from "react";
import { pdf } from "@react-pdf/renderer";
import JSZip from "jszip";
import { Menu } from "lucide-react";
import { usePDFSettings } from "./hooks/usePDFSettings";
import { useTranscript } from "./hooks/useTranscript";
import { ControlPanel } from "./components/ui/ControlPanel";
import { PDFPreview } from "./components/ui/PDFPreview";
import { StatusBar } from "./components/ui/StatusBar";
import { PDFDocument } from "./components/pdf/PDFDocument";
import { CombinedSeasonPDF } from "./components/pdf/CombinedSeasonPDF";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import type { Episode } from "./types/transcript";

function episodeSlug(ep: Episode): string {
  const s = String(ep.season).padStart(2, "0");
  const e = String(ep.episode).padStart(2, "0");
  const title = ep.title.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
  return `TBBT_S${s}E${e}_${title}`;
}

function App() {
  const [season, setSeason] = useState(1);
  const [episodeNum, setEpisodeNum] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [downloadingProgress, setDownloadingProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    settings,
    setColumns,
    setFontSize,
    setFontFamily,
    setPaperSize,
    setMargins,
    setBindingGutterEnabled,
    setBindingGutterSize,
    setBindingGutterMirror,
  } = usePDFSettings();
  const { index, episode, loading, error } = useTranscript(season, episodeNum);

  const handleSelectEpisode = useCallback((s: number, e: number) => {
    setSeason(s);
    setEpisodeNum(e);
    setSidebarOpen(false);
  }, []);

  async function handleDownload() {
    if (!episode) return;
    setDownloading(true);
    try {
      const blob = await pdf(
        <PDFDocument episode={episode} settings={settings} />,
      ).toBlob();
      triggerDownload(blob, `${episodeSlug(episode)}.pdf`);
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownloadSeason() {
    const seasonEntry = index?.seasons.find((s) => s.season === season);
    if (!seasonEntry) return;

    setDownloading(true);
    const total = seasonEntry.episodes.length;
    setDownloadingProgress({ current: 0, total });

    try {
      const zip = new JSZip();
      const seasonFolder = zip.folder(
        `TBBT_S${String(season).padStart(2, "0")}`,
      );

      for (let i = 0; i < seasonEntry.episodes.length; i++) {
        const ep = seasonEntry.episodes[i];
        setDownloadingProgress({ current: i + 1, total });

        const epData = await fetchEpisodeJSON(ep.file);
        const blob = await pdf(
          <PDFDocument episode={epData} settings={settings} />,
        ).toBlob();
        const arrayBuffer = await blob.arrayBuffer();
        seasonFolder?.file(`${episodeSlug(epData)}.pdf`, arrayBuffer);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      triggerDownload(
        zipBlob,
        `TBBT_S${String(season).padStart(2, "0")}.zip`,
      );
    } finally {
      setDownloading(false);
      setDownloadingProgress(null);
    }
  }

  async function handleDownloadSeasonCombined() {
    const seasonEntry = index?.seasons.find((s) => s.season === season);
    if (!seasonEntry) return;

    setDownloading(true);
    const total = seasonEntry.episodes.length;
    setDownloadingProgress({ current: 0, total });

    try {
      const episodes: Episode[] = [];
      for (let i = 0; i < seasonEntry.episodes.length; i++) {
        setDownloadingProgress({ current: i + 1, total });
        const ep = seasonEntry.episodes[i];
        const epData = await fetchEpisodeJSON(ep.file);
        episodes.push(epData);
      }

      const blob = await pdf(
        <CombinedSeasonPDF
          episodes={episodes}
          settings={settings}
          seasonNumber={season}
        />,
      ).toBlob();
      triggerDownload(
        blob,
        `TBBT_S${String(season).padStart(2, "0")}_Combined.pdf`,
      );
    } finally {
      setDownloading(false);
      setDownloadingProgress(null);
    }
  }

  const controlPanelProps = useMemo(
    () => ({
      index,
      season,
      episode: episodeNum,
      onSelectEpisode: handleSelectEpisode,
      settings,
      onSetColumns: setColumns,
      onSetFontSize: setFontSize,
      onSetFontFamily: setFontFamily,
      onSetPaperSize: setPaperSize,
      onSetMargins: setMargins,
      onSetBindingGutterEnabled: setBindingGutterEnabled,
      onSetBindingGutterSize: setBindingGutterSize,
      onSetBindingGutterMirror: setBindingGutterMirror,
      onDownload: handleDownload,
      onDownloadSeason: handleDownloadSeason,
      onDownloadSeasonCombined: handleDownloadSeasonCombined,
      downloading,
      downloadingProgress,
    }),
    [
      index,
      season,
      episodeNum,
      handleSelectEpisode,
      settings,
      setColumns,
      setFontSize,
      setFontFamily,
      setPaperSize,
      setMargins,
      setBindingGutterEnabled,
      setBindingGutterSize,
      setBindingGutterMirror,
      handleDownload,
      handleDownloadSeason,
      handleDownloadSeasonCombined,
      downloading,
      downloadingProgress,
    ],
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Mobile header */}
      <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-background shrink-0">
        <button
          type="button"
          className="p-1.5 rounded-md hover:bg-accent transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle controls"
        >
          <Menu className="size-5 text-foreground" />
        </button>
        <h1 className="text-sm font-semibold text-foreground">
          Transcript Printer
        </h1>
      </div>

      {/* Desktop: resizable panels */}
      <div className="hidden md:flex flex-1 min-h-0">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel
            id="sidebar"
            defaultSize="280px"
            minSize="220px"
            maxSize="50%"
          >
            <ControlPanel {...controlPanelProps} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel id="preview" minSize="40%">
            <PDFPreview
              episode={episode}
              settings={settings}
              loading={loading}
              error={error}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile: slide-over sidebar */}
      <div className="flex md:hidden flex-1 min-h-0 relative">
        <div
          className={`absolute inset-y-0 left-0 z-20 w-72 transform transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <ControlPanel {...controlPanelProps} />
        </div>

        {sidebarOpen && (
          <div
            className="absolute inset-0 z-10 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <PDFPreview
          episode={episode}
          settings={settings}
          loading={loading}
          error={error}
        />
      </div>

      <StatusBar episode={episode} settings={settings} />
    </div>
  );
}

async function fetchEpisodeJSON(file: string): Promise<Episode> {
  const res = await fetch(`/data/tbbt/${file}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${file}`);
  return res.json() as Promise<Episode>;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default App;
