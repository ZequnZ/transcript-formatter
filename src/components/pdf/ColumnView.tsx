import { View } from "@react-pdf/renderer";
import type { TranscriptLine } from "../../types/transcript";
import { DialogLine } from "./DialogLine";
import { SceneHeader } from "./SceneHeader";
import { Direction } from "./Direction";

interface ColumnViewProps {
  lines: TranscriptLine[];
  isLast: boolean;
  width: string;
  fontSize: number;
  fontFamily: string;
}

export function ColumnView({
  lines,
  isLast,
  width,
  fontSize,
  fontFamily,
}: ColumnViewProps) {
  return (
    <View
      style={{
        width,
        paddingHorizontal: 8,
        borderRight: isLast ? undefined : "0.5pt solid #ccc",
      }}
    >
      {lines.map((line, i) => {
        if (line.type === "scene") {
          return (
            <SceneHeader
              key={i}
              text={line.text}
              fontSize={fontSize}
              fontFamily={fontFamily}
            />
          );
        }
        if (line.type === "dialog") {
          return (
            <DialogLine
              key={i}
              character={line.character ?? ""}
              direction={line.direction}
              text={line.text}
              fontSize={fontSize}
              fontFamily={fontFamily}
            />
          );
        }
        return (
          <Direction
            key={i}
            text={line.text}
            fontSize={fontSize}
            fontFamily={fontFamily}
          />
        );
      })}
    </View>
  );
}
