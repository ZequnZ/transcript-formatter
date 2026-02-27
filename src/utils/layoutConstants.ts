import type { PDFSettings } from "../types/transcript";

export const PAGE_SIZES_PT = {
  letter: { width: 612, height: 792 },
  a4: { width: 595.28, height: 841.89 },
} as const;

export const MARGIN_VALUES = {
  narrow: 36,
  normal: 54,
  wide: 72,
} as const;

export const DIALOG_LINE = {
  marginBottom: 3,
  lineHeight: 1.35,
} as const;

export const SCENE_HEADER = {
  marginTop: 8,
  marginBottom: 2,
  lineHeight: 1.3,
  fontSizeOffset: -0.5,
} as const;

export const DIRECTION = {
  marginBottom: 2,
  lineHeight: 1.35,
  fontSizeOffset: -0.5,
} as const;

export const EPISODE_HEADER = {
  marginBottom: 16,
  subtitleFontSizeOffset: 1,
  titleFontSizeOffset: 4,
  ruleMarginTop: 8,
  subtitleMarginBottom: 3,
} as const;

export const PAGE_FOOTER = {
  bottomOffset: 20,
  fontSizeOffset: -2,
} as const;

export const COLUMN_VIEW = {
  paddingHorizontal: 8,
} as const;

export const SAFETY_FACTOR = 0.90;

export const AVG_CHAR_WIDTH_MULTIPLIER: Record<string, number> = {
  "Source Serif 4": 0.48,
  "Courier Prime": 0.60,
};

export function getMarginValue(margins: PDFSettings["margins"]): number {
  return MARGIN_VALUES[margins];
}
