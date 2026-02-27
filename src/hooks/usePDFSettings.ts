import { useReducer, useCallback } from "react";
import type { PDFSettings } from "../types/transcript";

const DEFAULT_SETTINGS: PDFSettings = {
  columns: 2,
  fontSize: 9,
  fontFamily: "Source Serif 4",
  paperSize: "letter",
  margins: "normal",
  bindingGutter: { enabled: false, size: 0.25, mirror: false },
};

type Action =
  | { type: "SET_COLUMNS"; payload: 1 | 2 | 3 }
  | { type: "SET_FONT_SIZE"; payload: number }
  | { type: "SET_FONT_FAMILY"; payload: string }
  | { type: "SET_PAPER_SIZE"; payload: "letter" | "a4" }
  | { type: "SET_MARGINS"; payload: "normal" | "narrow" | "wide" }
  | { type: "SET_BINDING_GUTTER_ENABLED"; payload: boolean }
  | { type: "SET_BINDING_GUTTER_SIZE"; payload: number }
  | { type: "SET_BINDING_GUTTER_MIRROR"; payload: boolean };

function reducer(state: PDFSettings, action: Action): PDFSettings {
  switch (action.type) {
    case "SET_COLUMNS":
      return { ...state, columns: action.payload };
    case "SET_FONT_SIZE":
      return { ...state, fontSize: action.payload };
    case "SET_FONT_FAMILY":
      return { ...state, fontFamily: action.payload };
    case "SET_PAPER_SIZE":
      return { ...state, paperSize: action.payload };
    case "SET_MARGINS":
      return { ...state, margins: action.payload };
    case "SET_BINDING_GUTTER_ENABLED":
      return { ...state, bindingGutter: { ...state.bindingGutter, enabled: action.payload } };
    case "SET_BINDING_GUTTER_SIZE":
      return { ...state, bindingGutter: { ...state.bindingGutter, size: action.payload } };
    case "SET_BINDING_GUTTER_MIRROR":
      return { ...state, bindingGutter: { ...state.bindingGutter, mirror: action.payload } };
  }
}

export function usePDFSettings() {
  const [settings, dispatch] = useReducer(reducer, DEFAULT_SETTINGS);

  const setColumns = useCallback(
    (v: 1 | 2 | 3) => dispatch({ type: "SET_COLUMNS", payload: v }),
    [],
  );
  const setFontSize = useCallback(
    (v: number) => dispatch({ type: "SET_FONT_SIZE", payload: v }),
    [],
  );
  const setFontFamily = useCallback(
    (v: string) => dispatch({ type: "SET_FONT_FAMILY", payload: v }),
    [],
  );
  const setPaperSize = useCallback(
    (v: "letter" | "a4") => dispatch({ type: "SET_PAPER_SIZE", payload: v }),
    [],
  );
  const setMargins = useCallback(
    (v: "normal" | "narrow" | "wide") => dispatch({ type: "SET_MARGINS", payload: v }),
    [],
  );
  const setBindingGutterEnabled = useCallback(
    (v: boolean) => dispatch({ type: "SET_BINDING_GUTTER_ENABLED", payload: v }),
    [],
  );
  const setBindingGutterSize = useCallback(
    (v: number) => dispatch({ type: "SET_BINDING_GUTTER_SIZE", payload: v }),
    [],
  );
  const setBindingGutterMirror = useCallback(
    (v: boolean) => dispatch({ type: "SET_BINDING_GUTTER_MIRROR", payload: v }),
    [],
  );

  return {
    settings,
    setColumns,
    setFontSize,
    setFontFamily,
    setPaperSize,
    setMargins,
    setBindingGutterEnabled,
    setBindingGutterSize,
    setBindingGutterMirror,
  };
}
