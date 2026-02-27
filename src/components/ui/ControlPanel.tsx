import { memo } from "react";
import type { EpisodeIndex, PDFSettings } from "../../types/transcript";
import { EpisodeSelector } from "./EpisodeSelector";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Archive,
  BookOpen,
  Loader2,
} from "lucide-react";

interface ControlPanelProps {
  index: EpisodeIndex | null;
  season: number;
  episode: number;
  onSelectEpisode: (season: number, episode: number) => void;
  settings: PDFSettings;
  onSetColumns: (v: 1 | 2 | 3) => void;
  onSetFontSize: (v: number) => void;
  onSetFontFamily: (v: string) => void;
  onSetPaperSize: (v: "letter" | "a4") => void;
  onSetMargins: (v: "normal" | "narrow" | "wide") => void;
  onSetBindingGutterEnabled: (v: boolean) => void;
  onSetBindingGutterSize: (v: number) => void;
  onSetBindingGutterMirror: (v: boolean) => void;
  onDownload: () => void;
  onDownloadSeason: () => void;
  onDownloadSeasonCombined: () => void;
  downloading: boolean;
  downloadingProgress: { current: number; total: number } | null;
}

export const ControlPanel = memo(function ControlPanel({
  index,
  season,
  episode,
  onSelectEpisode,
  settings,
  onSetColumns,
  onSetFontSize,
  onSetFontFamily,
  onSetPaperSize,
  onSetMargins,
  onSetBindingGutterEnabled,
  onSetBindingGutterSize,
  onSetBindingGutterMirror,
  onDownload,
  onDownloadSeason,
  onDownloadSeasonCombined,
  downloading,
  downloadingProgress,
}: ControlPanelProps) {
  return (
    <aside className="h-full bg-muted/40 overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-base font-semibold text-foreground">
          Transcript Printer
        </h1>
      </div>

      <div className="p-4 flex flex-col gap-5 flex-1">
        <EpisodeSelector
          index={index}
          season={season}
          episode={episode}
          onSelect={onSelectEpisode}
        />

        <Separator />

        <div className="flex flex-col gap-1.5">
          <Label>Columns</Label>
          <ToggleGroup
            type="single"
            value={String(settings.columns)}
            onValueChange={(v) => {
              if (v) onSetColumns(Number(v) as 1 | 2 | 3);
            }}
          >
            <ToggleGroupItem value="1">1</ToggleGroupItem>
            <ToggleGroupItem value="2">2</ToggleGroupItem>
            <ToggleGroupItem value="3">3</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Font Size</Label>
          <ToggleGroup
            type="single"
            value={String(settings.fontSize)}
            onValueChange={(v) => {
              if (v) onSetFontSize(Number(v));
            }}
          >
            {[8, 9, 10, 11, 12].map((n) => (
              <ToggleGroupItem key={n} value={String(n)}>
                {n}pt
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Font</Label>
          <Select
            value={settings.fontFamily}
            onValueChange={onSetFontFamily}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Source Serif 4">Source Serif 4</SelectItem>
              <SelectItem value="Courier Prime">Courier Prime</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Paper Size</Label>
          <ToggleGroup
            type="single"
            value={settings.paperSize}
            onValueChange={(v) => {
              if (v) onSetPaperSize(v as "letter" | "a4");
            }}
          >
            <ToggleGroupItem value="letter">Letter</ToggleGroupItem>
            <ToggleGroupItem value="a4">A4</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Margins</Label>
          <ToggleGroup
            type="single"
            value={settings.margins}
            onValueChange={(v) => {
              if (v) onSetMargins(v as "normal" | "narrow" | "wide");
            }}
          >
            <ToggleGroupItem value="narrow">Narrow</ToggleGroupItem>
            <ToggleGroupItem value="normal">Normal</ToggleGroupItem>
            <ToggleGroupItem value="wide">Wide</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <Label>Binding Gutter</Label>
            <Switch
              checked={settings.bindingGutter.enabled}
              onCheckedChange={onSetBindingGutterEnabled}
            />
          </div>
          {settings.bindingGutter.enabled && (
            <>
              <div className="flex items-center gap-3">
                <Slider
                  min={0.25}
                  max={0.5}
                  step={0.05}
                  value={[settings.bindingGutter.size]}
                  onValueChange={([v]) => onSetBindingGutterSize(v)}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-12 text-right tabular-nums">
                  {settings.bindingGutter.size.toFixed(2)}&quot;
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Mirror margins
                </span>
                <Switch
                  checked={settings.bindingGutter.mirror}
                  onCheckedChange={onSetBindingGutterMirror}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-border flex flex-col gap-2">
        {downloadingProgress && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Generating season…</span>
              <span className="tabular-nums">
                {downloadingProgress.current}/{downloadingProgress.total}
              </span>
            </div>
            <Progress
              value={
                (downloadingProgress.current / downloadingProgress.total) * 100
              }
            />
          </div>
        )}
        <Button onClick={onDownload} disabled={downloading} className="w-full">
          {downloading && !downloadingProgress ? (
            <>
              <Loader2 className="animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Download /> Download Episode PDF
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onDownloadSeason}
          disabled={downloading}
          className="w-full"
        >
          <Archive /> Download Season (zip)
        </Button>
        <Button
          variant="secondary"
          onClick={onDownloadSeasonCombined}
          disabled={downloading}
          className="w-full"
        >
          <BookOpen /> Download Combined PDF
        </Button>
      </div>
    </aside>
  );
});
