import { View, Text } from "@react-pdf/renderer";

interface DialogLineProps {
  character: string;
  direction?: string;
  text: string;
  fontSize: number;
  fontFamily: string;
}

export function DialogLine({
  character,
  direction,
  text,
  fontSize,
  fontFamily,
}: DialogLineProps) {
  return (
    <View wrap={false} style={{ marginBottom: 3 }}>
      <Text style={{ fontFamily, fontSize, lineHeight: 1.35 }}>
        <Text style={{ fontWeight: "bold" }}>{character}</Text>
        {direction ? (
          <Text style={{ fontStyle: "italic" }}> {direction}</Text>
        ) : null}
        <Text>{`: ${text}`}</Text>
      </Text>
    </View>
  );
}
