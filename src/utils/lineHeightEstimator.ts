import type { TranscriptLine, PDFSettings } from "../types/transcript";
import {
  PAGE_SIZES_PT,
  MARGIN_VALUES,
  DIALOG_LINE,
  SCENE_HEADER,
  DIRECTION,
  EPISODE_HEADER,
  PAGE_FOOTER,
  AVG_CHAR_WIDTH_MULTIPLIER,
} from "./layoutConstants";

function avgCharWidth(fontSize: number, fontFamily: string): number {
  const multiplier = AVG_CHAR_WIDTH_MULTIPLIER[fontFamily] ?? 0.48;
  return fontSize * multiplier;
}

function wrapCount(textLength: number, fontSize: number, columnWidthPt: number, fontFamily: string): number {
  const charW = avgCharWidth(fontSize, fontFamily);
  const charsPerLine = Math.max(1, Math.floor(columnWidthPt / charW));
  return Math.max(1, Math.ceil(textLength / charsPerLine));
}

export function estimateLineHeight(
  line: TranscriptLine,
  fontSize: number,
  columnWidthPt: number,
  fontFamily: string,
): number {
  if (line.type === "dialog") {
    const totalLen =
      (line.character?.length ?? 0) +
      (line.direction ? line.direction.length + 1 : 0) +
      2 + // ": "
      line.text.length;
    const wraps = wrapCount(totalLen, fontSize, columnWidthPt, fontFamily);
    return wraps * fontSize * DIALOG_LINE.lineHeight + DIALOG_LINE.marginBottom;
  }

  if (line.type === "scene") {
    const totalLen = "Scene: ".length + line.text.length;
    const effectiveFontSize = fontSize + SCENE_HEADER.fontSizeOffset;
    const wraps = wrapCount(totalLen, effectiveFontSize, columnWidthPt, fontFamily);
    return (
      wraps * effectiveFontSize * SCENE_HEADER.lineHeight +
      SCENE_HEADER.marginTop +
      SCENE_HEADER.marginBottom
    );
  }

  // direction
  const effectiveFontSize = fontSize + DIRECTION.fontSizeOffset;
  const wraps = wrapCount(line.text.length, effectiveFontSize, columnWidthPt, fontFamily);
  return wraps * effectiveFontSize * DIRECTION.lineHeight + DIRECTION.marginBottom;
}

export function estimateEpisodeHeaderHeight(fontSize: number): number {
  const subtitleLineHeight = (fontSize + EPISODE_HEADER.subtitleFontSizeOffset) * 1.2;
  const titleLineHeight = (fontSize + EPISODE_HEADER.titleFontSizeOffset) * 1.2;
  const rule = EPISODE_HEADER.ruleMarginTop + 0.5;
  return (
    subtitleLineHeight +
    EPISODE_HEADER.subtitleMarginBottom +
    titleLineHeight +
    rule +
    EPISODE_HEADER.marginBottom
  );
}

export function computeAvailableHeight(settings: PDFSettings): number {
  const pageHeight = PAGE_SIZES_PT[settings.paperSize].height;
  const margin = MARGIN_VALUES[settings.margins] as number;
  const topMargin = margin;
  const bottomMargin = margin + PAGE_FOOTER.bottomOffset;
  return pageHeight - topMargin - bottomMargin;
}

export function computeColumnWidthPt(settings: PDFSettings): number {
  const pageWidth = PAGE_SIZES_PT[settings.paperSize].width;
  const margin = MARGIN_VALUES[settings.margins] as number;
  const gutter = settings.bindingGutter.enabled ? settings.bindingGutter.size * 72 : 0;
  const mirror = settings.bindingGutter.enabled && settings.bindingGutter.mirror;
  const leftMargin = margin + gutter;
  const rightMargin = mirror ? margin + gutter : margin;
  const contentWidth = pageWidth - leftMargin - rightMargin;
  const columnWidth = contentWidth / settings.columns;
  return columnWidth - 8 * 2; // subtract paddingHorizontal from ColumnView
}
