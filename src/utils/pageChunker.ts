import type { TranscriptLine, PDFSettings } from "../types/transcript";
import { SAFETY_FACTOR } from "./layoutConstants";
import {
  estimateLineHeight,
  estimateEpisodeHeaderHeight,
  computeAvailableHeight,
  computeColumnWidthPt,
} from "./lineHeightEstimator";

export function chunkIntoPages(
  lines: TranscriptLine[],
  settings: PDFSettings,
  hasEpisodeHeader: boolean,
): TranscriptLine[][] {
  if (lines.length === 0) return [[]];

  const availableHeight = computeAvailableHeight(settings);
  const columnWidthPt = computeColumnWidthPt(settings);
  const { columns, fontSize, fontFamily } = settings;

  const normalBudget = availableHeight * columns * SAFETY_FACTOR;
  const firstPageReduction = hasEpisodeHeader
    ? estimateEpisodeHeaderHeight(fontSize) * columns
    : 0;

  const pages: TranscriptLine[][] = [];
  let current: TranscriptLine[] = [];
  let accumulatedHeight = 0;
  let isFirstPage = true;

  const budget = () => (isFirstPage ? normalBudget - firstPageReduction : normalBudget);

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : undefined;
    const isSceneBeforeDialog =
      line.type === "scene" && nextLine !== undefined && nextLine.type === "dialog";

    let groupHeight = estimateLineHeight(line, fontSize, columnWidthPt, fontFamily);
    let groupSize = 1;

    if (isSceneBeforeDialog) {
      groupHeight += estimateLineHeight(nextLine, fontSize, columnWidthPt, fontFamily);
      groupSize = 2;
    }

    if (current.length > 0 && accumulatedHeight + groupHeight > budget()) {
      pages.push(current);
      current = [];
      accumulatedHeight = 0;
      isFirstPage = false;
    }

    for (let j = 0; j < groupSize; j++) {
      current.push(lines[i + j]);
    }
    accumulatedHeight += groupHeight;
    i += groupSize;
  }

  if (current.length > 0) {
    pages.push(current);
  }

  return pages;
}
