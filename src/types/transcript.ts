export type LineType = "scene" | "dialog" | "direction";

export interface TranscriptLine {
  type: LineType;
  text: string;
  character?: string;
  direction?: string;
}

export interface Episode {
  series: string;
  season: number;
  episode: number;
  title: string;
  url: string;
  lines: TranscriptLine[];
}

export interface EpisodeIndexEntry {
  episode: number;
  title: string;
  file: string;
}

export interface SeasonEntry {
  season: number;
  episodes: EpisodeIndexEntry[];
}

export interface EpisodeIndex {
  series: string;
  seasons: SeasonEntry[];
}

export interface PDFSettings {
  columns: 1 | 2 | 3;
  fontSize: number;
  fontFamily: string;
  paperSize: "letter" | "a4";
  margins: "normal" | "narrow" | "wide";
  bindingGutter: { enabled: boolean; size: number; mirror: boolean };
}
