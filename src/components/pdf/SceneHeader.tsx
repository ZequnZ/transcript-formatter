import { View, Text } from "@react-pdf/renderer";

interface SceneHeaderProps {
  text: string;
  fontSize: number;
  fontFamily: string;
}

export function SceneHeader({ text, fontSize, fontFamily }: SceneHeaderProps) {
  return (
    <View style={{ marginTop: 8, marginBottom: 2 }}>
      <Text
        style={{
          fontFamily,
          fontSize: fontSize - 0.5,
          fontStyle: "italic",
          color: "#444",
          lineHeight: 1.3,
        }}
      >
        Scene: {text}
      </Text>
    </View>
  );
}
