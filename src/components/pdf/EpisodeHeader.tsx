import { View, Text } from "@react-pdf/renderer";

interface EpisodeHeaderProps {
  series: string;
  season: number;
  episode: number;
  title: string;
  fontSize: number;
  fontFamily: string;
}

export function EpisodeHeader({
  series: _series,
  season,
  episode,
  title,
  fontSize,
  fontFamily,
}: EpisodeHeaderProps) {
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <View style={{ marginBottom: 16, alignItems: "center" }}>
      <Text
        style={{
          fontFamily,
          fontSize: fontSize + 1,
          color: "#555",
          marginBottom: 3,
        }}
      >
        {`Season ${pad(season)} · Episode ${pad(episode)}`}
      </Text>
      <Text
        style={{
          fontFamily,
          fontSize: fontSize + 4,
          fontWeight: "bold",
          textTransform: "uppercase",
        }}
      >
        {title}
      </Text>
      <View
        style={{
          marginTop: 8,
          width: "100%",
          borderBottom: "0.5pt solid #999",
        }}
      />
    </View>
  );
}
