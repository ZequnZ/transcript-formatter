import type { TranscriptLine } from "../types/transcript";

function lineWeight(line: TranscriptLine): number {
  if (line.type === "scene") return 2.5;
  if (line.type === "direction") return 1.5;
  const len = line.text.length + (line.character?.length ?? 0);
  return Math.max(1, Math.ceil(len / 60));
}

export function splitIntoColumns(
  lines: TranscriptLine[],
  columnCount: 1 | 2 | 3
): TranscriptLine[][] {
  if (columnCount === 1) return [lines];

  const totalWeight = lines.reduce((sum, l) => sum + lineWeight(l), 0);
  const targetWeight = totalWeight / columnCount;

  const columns: TranscriptLine[][] = [];
  let current: TranscriptLine[] = [];
  let currentWeight = 0;
  let colIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const w = lineWeight(line);
    const isSceneHeader = line.type === "scene";
    const nextLine = lines[i + 1];

    current.push(line);
    currentWeight += w;

    if (colIndex < columnCount - 1 && currentWeight >= targetWeight) {
      const wouldBreakBeforeDialog = isSceneHeader && nextLine && nextLine.type === "dialog";
      if (!wouldBreakBeforeDialog) {
        columns.push(current);
        current = [];
        currentWeight = 0;
        colIndex++;
      }
    }
  }

  if (current.length > 0) {
    columns.push(current);
  }

  while (columns.length < columnCount) {
    columns.push([]);
  }

  return columns;
}
