import { View, Text } from "@react-pdf/renderer";

interface PageFooterProps {
  fontFamily: string;
  fontSize: number;
}

export function PageFooter({ fontFamily, fontSize }: PageFooterProps) {
  return (
    <View
      fixed
      style={{
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: "center",
      }}
    >
      <Text
        style={{ fontFamily, fontSize: fontSize - 2, color: "#888" }}
        render={({ pageNumber, totalPages }) =>
          `${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}
