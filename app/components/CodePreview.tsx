"use client";

import { useRef } from "react";
import { toPng } from "html-to-image";

interface CodePreviewProps {
  html: string;
  language: string;
  filename: string;
  showLineNumbers: boolean;
  frameStyle: "macos" | "windows" | "none";
  theme: string;
}

const DARK_THEMES = [
  "github-dark",
  "github-dark-dimmed",
  "monokai",
  "dracula",
  "dracula-soft",
  "one-dark-pro",
  "nord",
  "night-owl",
  "material-theme",
  "material-theme-darker",
  "material-theme-ocean",
  "material-theme-palenight",
  "poimandres",
  "rose-pine",
  "rose-pine-moon",
  "slack-dark",
  "solarized-dark",
  "tokyo-night",
  "vitesse-dark",
  "vesper",
];

export default function CodePreview({
  html,
  language,
  filename,
  showLineNumbers,
  frameStyle,
  theme,
}: CodePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const isDark = DARK_THEMES.includes(theme);

  const handleDownload = async () => {
    if (!previewRef.current) return;
    const dataUrl = await toPng(previewRef.current, {
      pixelRatio: 2,
      backgroundColor: undefined,
    });
    const link = document.createElement("a");
    link.download = `codetext-${filename || "code"}.png`;
    link.href = dataUrl;
    link.click();
  };

  const macosFrame = (
    <div
      className="flex items-center gap-2 px-4 py-3 rounded-t-xl"
      style={{ background: isDark ? "#2d2d2d" : "#e8e8e8" }}
    >
      <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
      <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
      <span className="w-3 h-3 rounded-full bg-[#28c840]" />
      {filename && (
        <span
          className="mx-auto text-xs font-medium opacity-60"
          style={{ color: isDark ? "#fff" : "#000" }}
        >
          {filename}
        </span>
      )}
    </div>
  );

  const windowsFrame = (
    <div
      className="flex items-center justify-between px-4 py-2 rounded-t-xl"
      style={{ background: isDark ? "#2d2d2d" : "#e8e8e8" }}
    >
      <span
        className="text-xs font-medium opacity-60"
        style={{ color: isDark ? "#fff" : "#000" }}
      >
        {filename || "code"}
      </span>
      <div className="flex items-center gap-3 text-xs opacity-50">
        <span>─</span>
        <span>□</span>
        <span>✕</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={previewRef}
        className="relative rounded-xl overflow-hidden shadow-2xl"
        style={{ display: "inline-block", minWidth: "100%" }}
      >
        {frameStyle === "macos" && macosFrame}
        {frameStyle === "windows" && windowsFrame}

        {frameStyle === "none" && filename && (
          <div
            className="px-4 py-2 text-xs font-mono opacity-70 border-b"
            style={{
              background: isDark ? "#1e1e1e" : "#f5f5f5",
              color: isDark ? "#ccc" : "#555",
              borderColor: isDark ? "#333" : "#ddd",
            }}
          >
            {filename}
          </div>
        )}

        <div
          className={`overflow-x-auto text-sm leading-relaxed ${showLineNumbers ? "line-numbers" : ""}`}
          style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* 워터마크 */}
        <div
          className="flex items-center justify-end gap-1 px-3 py-1.5"
          style={{
            background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.5)",
            backdropFilter: "blur(4px)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="8" height="8" rx="1" fill={isDark ? "#7c6af7" : "#6366f1"} />
            <rect x="13" y="3" width="8" height="8" rx="1" fill={isDark ? "#7c6af7" : "#6366f1"} opacity="0.6" />
            <rect x="3" y="13" width="8" height="8" rx="1" fill={isDark ? "#7c6af7" : "#6366f1"} opacity="0.6" />
            <rect x="13" y="13" width="8" height="8" rx="1" fill={isDark ? "#7c6af7" : "#6366f1"} opacity="0.3" />
          </svg>
          <span
            className="text-xs font-semibold tracking-wide"
            style={{ color: isDark ? "#a89fff" : "#6366f1", opacity: 0.8 }}
          >
            codetext.io
          </span>
          <span
            className="text-xs opacity-40"
            style={{ color: isDark ? "#ccc" : "#555" }}
          >
            · {language}
          </span>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-95"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
      >
        PNG로 다운로드 (2x 고화질)
      </button>
    </div>
  );
}
