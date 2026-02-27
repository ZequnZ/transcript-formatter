import { Font } from "@react-pdf/renderer";

let registered = false;

export function registerFonts(): void {
  if (registered) return;
  registered = true;

  Font.register({
    family: "Source Serif 4",
    fonts: [
      {
        src: "/fonts/SourceSerif4-Regular.ttf",
        fontWeight: "normal",
        fontStyle: "normal",
      },
      {
        src: "/fonts/SourceSerif4-Bold.ttf",
        fontWeight: "bold",
        fontStyle: "normal",
      },
      {
        src: "/fonts/SourceSerif4-Italic.ttf",
        fontWeight: "normal",
        fontStyle: "italic",
      },
      {
        src: "/fonts/SourceSerif4-BoldItalic.ttf",
        fontWeight: "bold",
        fontStyle: "italic",
      },
    ],
  });

  Font.register({
    family: "Courier Prime",
    fonts: [
      {
        src: "/fonts/CourierPrime-Regular.ttf",
        fontWeight: "normal",
        fontStyle: "normal",
      },
      {
        src: "/fonts/CourierPrime-Bold.ttf",
        fontWeight: "bold",
        fontStyle: "normal",
      },
      {
        src: "/fonts/CourierPrime-Italic.ttf",
        fontWeight: "normal",
        fontStyle: "italic",
      },
      {
        src: "/fonts/CourierPrime-BoldItalic.ttf",
        fontWeight: "bold",
        fontStyle: "italic",
      },
    ],
  });
}
