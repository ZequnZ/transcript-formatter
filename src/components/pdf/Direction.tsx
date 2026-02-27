import { View, Text } from "@react-pdf/renderer";

interface DirectionProps {
  text: string;
  fontSize: number;
  fontFamily: string;
}

export function Direction({ text, fontSize, fontFamily }: DirectionProps) {
  return (
    <View wrap={false} style={{ marginBottom: 2 }}>
      <Text
        style={{
          fontFamily,
          fontSize: fontSize - 0.5,
          fontStyle: "italic",
          color: "#555",
          lineHeight: 1.35,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
