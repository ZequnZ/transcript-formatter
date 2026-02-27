import { memo } from "react";
import type { Episode, PDFSettings } from "../../types/transcript";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface StatusBarProps {
  episode: Episode | null;
  settings: PDFSettings;
}

export const StatusBar = memo(function StatusBar({ episode, settings }: StatusBarProps) {
  const epLabel = episode
    ? `S${String(episode.season).padStart(2, "0")}E${String(episode.episode).padStart(2, "0")} – ${episode.title}`
    : "No episode loaded";

  const marginLabel =
    settings.margins.charAt(0).toUpperCase() + settings.margins.slice(1);
  const paperLabel = settings.paperSize === "letter" ? "Letter" : "A4";

  return (
    <div className="h-9 border-t border-border bg-background flex items-center px-4 text-xs text-muted-foreground gap-2 shrink-0 overflow-x-auto">
      <span className="font-medium text-foreground truncate max-w-64 shrink-0">
        {epLabel}
      </span>
      <Separator orientation="vertical" className="h-4" />
      <Badge variant="secondary" className="text-xs font-normal shrink-0">
        {settings.columns} {settings.columns === 1 ? "col" : "cols"}
      </Badge>
      <Badge variant="secondary" className="text-xs font-normal shrink-0">
        {settings.fontSize}pt
      </Badge>
      <Badge variant="secondary" className="text-xs font-normal shrink-0">
        {settings.fontFamily}
      </Badge>
      <Badge variant="secondary" className="text-xs font-normal shrink-0">
        {paperLabel}
      </Badge>
      <Badge variant="secondary" className="text-xs font-normal shrink-0">
        {marginLabel}
      </Badge>
      {settings.bindingGutter.enabled && (
        <>
          <Badge variant="secondary" className="text-xs font-normal shrink-0">
            Gutter {settings.bindingGutter.size.toFixed(2)}&quot;
          </Badge>
          {settings.bindingGutter.mirror && (
            <Badge
              variant="secondary"
              className="text-xs font-normal shrink-0"
            >
              Mirror
            </Badge>
          )}
        </>
      )}
    </div>
  );
});
