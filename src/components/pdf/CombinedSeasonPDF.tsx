import { Document, Page, View, Text } from "@react-pdf/renderer";
import type { Episode, PDFSettings } from "../../types/transcript";
import { registerFonts } from "../../utils/fontLoader";
import { splitIntoColumns } from "../../utils/columnSplitter";
import { MARGIN_VALUES, PAGE_FOOTER } from "../../utils/layoutConstants";
import { chunkIntoPages } from "../../utils/pageChunker";
import { ColumnView } from "./ColumnView";
import { EpisodeHeader } from "./EpisodeHeader";
import { PageFooter } from "./PageFooter";

registerFonts();

const PAGE_SIZES = {
  letter: { format: "LETTER" as const },
  a4: { format: "A4" as const },
};

interface CombinedSeasonPDFProps {
  episodes: Episode[];
  settings: PDFSettings;
  seasonNumber: number;
}

export function CombinedSeasonPDF({ episodes, settings, seasonNumber }: CombinedSeasonPDFProps) {
  const { columns, fontSize, fontFamily, paperSize, margins, bindingGutter } = settings;
  const margin = MARGIN_VALUES[margins] as number;
  const gutter = bindingGutter.enabled ? bindingGutter.size * 72 : 0;
  const mirror = bindingGutter.enabled && bindingGutter.mirror;
  const colWidth = `${(100 / columns).toFixed(4)}%`;

  const pad = (n: number) => String(n).padStart(2, "0");

  function pageStyle(pageIndex: number, includeFooterPadding: boolean) {
    const isEven = pageIndex % 2 === 0;
    const leftPad = mirror ? margin + (isEven ? gutter : 0) : margin + gutter;
    const rightPad = mirror ? margin + (isEven ? 0 : gutter) : margin;
    return {
      paddingTop: margin,
      paddingBottom: includeFooterPadding ? margin + PAGE_FOOTER.bottomOffset : margin,
      paddingLeft: leftPad,
      paddingRight: rightPad,
      fontFamily,
      fontSize,
    };
  }

  let globalPageIndex = 0;

  const coverPageIndex = globalPageIndex++;
  const tocPageIndex = globalPageIndex++;

  const episodePages: { episode: Episode; chunks: ReturnType<typeof chunkIntoPages>; startPageIndex: number }[] = [];
  for (const ep of episodes) {
    const chunks = chunkIntoPages(ep.lines, settings, true);
    episodePages.push({ episode: ep, chunks, startPageIndex: globalPageIndex });
    globalPageIndex += chunks.length;
  }

  return (
    <Document>
      <Page
        size={PAGE_SIZES[paperSize].format}
        style={{
          ...pageStyle(coverPageIndex, false),
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontFamily, fontSize: fontSize + 1, color: "#555", marginBottom: 6 }}>
            The Big Bang Theory
          </Text>
          <Text style={{ fontFamily, fontSize: fontSize + 8, fontWeight: "bold", textTransform: "uppercase", marginBottom: 8 }}>
            Season {pad(seasonNumber)}
          </Text>
          <View style={{ width: 120, borderBottom: "0.5pt solid #999", marginBottom: 8 }} />
          <Text style={{ fontFamily, fontSize: fontSize + 1, color: "#555" }}>
            {episodes.length} Episodes
          </Text>
        </View>
      </Page>

      <Page
        size={PAGE_SIZES[paperSize].format}
        style={pageStyle(tocPageIndex, false)}
      >
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontFamily, fontSize: fontSize + 4, fontWeight: "bold", marginBottom: 8 }}>
            Contents
          </Text>
          <View style={{ borderBottom: "0.5pt solid #999", marginBottom: 8 }} />
        </View>
        {episodes.map((ep) => (
          <View
            key={ep.episode}
            style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}
          >
            <Text style={{ fontFamily, fontSize }}>
              {`E${pad(ep.episode)} – ${ep.title}`}
            </Text>
          </View>
        ))}
      </Page>

      {episodePages.flatMap(({ episode: ep, chunks, startPageIndex }) =>
        chunks.map((pageLines, chunkIndex) => {
          const absPageIndex = startPageIndex + chunkIndex;
          const columnData = splitIntoColumns(pageLines, columns);
          return (
            <Page
              key={`${ep.episode}-${chunkIndex}`}
              wrap={false}
              size={PAGE_SIZES[paperSize].format}
              style={pageStyle(absPageIndex, true)}
            >
              {chunkIndex === 0 && (
                <EpisodeHeader
                  series={ep.series}
                  season={ep.season}
                  episode={ep.episode}
                  title={ep.title}
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
        })
      )}
    </Document>
  );
}
