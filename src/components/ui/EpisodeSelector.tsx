import type { EpisodeIndex } from "../../types/transcript";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EpisodeSelectorProps {
  index: EpisodeIndex | null;
  season: number;
  episode: number;
  onSelect: (season: number, episode: number) => void;
}

export function EpisodeSelector({
  index,
  season,
  episode,
  onSelect,
}: EpisodeSelectorProps) {
  const seasonEntry = index?.seasons.find((s) => s.season === season);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>Series</Label>
        <Select value="tbbt" disabled>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tbbt">The Big Bang Theory</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Season</Label>
        <Select
          value={String(season)}
          onValueChange={(v) => {
            const newSeason = Number(v);
            const firstEp =
              index?.seasons.find((s) => s.season === newSeason)?.episodes[0]
                ?.episode ?? 1;
            onSelect(newSeason, firstEp);
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {index?.seasons.map((s) => (
              <SelectItem key={s.season} value={String(s.season)}>
                Season {s.season}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Episode</Label>
        <Select
          value={String(episode)}
          onValueChange={(v) => onSelect(season, Number(v))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {seasonEntry?.episodes.map((ep) => (
              <SelectItem key={ep.episode} value={String(ep.episode)}>
                E{String(ep.episode).padStart(2, "0")} – {ep.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
