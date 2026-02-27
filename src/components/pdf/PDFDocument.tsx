import { Document, Page, View } from "@react-pdf/renderer";
import type { Episode, PDFSettings } from "../../types/transcript";
import { registerFonts } from "../../utils/fontLoader";
import { splitIntoColumns } from "../../utils/columnSplitter";
import { MARGIN_VALUES, PAGE_FOOTER } from "../../utils/layoutConstants";
import { chunkIntoPages } from "../../utils/pageChunker";
import type { TranscriptLine } from "../../types/transcript";
import { ColumnView } from "./ColumnView";
import { EpisodeHeader } from "./EpisodeHeader";
import { PageFooter } from "./PageFooter";

registerFonts();

const PAGE_SIZES = {
  letter: { format: "LETTER" as const },
  a4: { format: "A4" as const },
};

interface PDFDocumentProps {
  episode: Episode;
  settings: PDFSettings;
  pageChunks?: TranscriptLine[][];
}

export function PDFDocument({ episode, settings, pageChunks: externalChunks }: PDFDocumentProps) {
  const { columns, fontSize, fontFamily, paperSize, margins, bindingGutter } =
    settings;

  const margin = MARGIN_VALUES[margins] as number;
  const gutter = bindingGutter.enabled ? bindingGutter.size * 72 : 0;
  const mirror = bindingGutter.enabled && bindingGutter.mirror;

  const pageChunks = externalChunks ?? chunkIntoPages(episode.lines, settings, true);
  const colWidth = `${(100 / columns).toFixed(4)}%`;

  return (
    <Document>
      {pageChunks.map((pageLines, pageIndex) => {
        const columnData = splitIntoColumns(pageLines, columns);
        const isEven = pageIndex % 2 === 0;
        const leftPad = mirror
          ? margin + (isEven ? gutter : 0)
          : margin + gutter;
        const rightPad = mirror
          ? margin + (isEven ? 0 : gutter)
          : margin;

        return (
          <Page
            key={pageIndex}
            wrap={false}
            size={PAGE_SIZES[paperSize].format}
            style={{
              paddingTop: margin,
              paddingBottom: margin + PAGE_FOOTER.bottomOffset,
              paddingLeft: leftPad,
              paddingRight: rightPad,
              fontFamily,
              fontSize,
            }}
          >
            {pageIndex === 0 && (
              <EpisodeHeader
                series={episode.series}
                season={episode.season}
                episode={episode.episode}
                title={episode.title}
                fontSize={fontSize}
                fontFamily={fontFamily}
              />
            )}
            <View style={{ flexDirection: "row" }}>
              {columnData.map((colLines, i) => (
                <ColumnView
                  key={i}
                  lines={colLines}
                  isLast={i === columns - 1}
                  width={colWidth}
                  fontSize={fontSize}
                  fontFamily={fontFamily}
                />
              ))}
            </View>
            <PageFooter fontFamily={fontFamily} fontSize={fontSize} />
          </Page>
        );
      })}
    </Document>
  );
}
