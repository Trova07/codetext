"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const CodePreview = dynamic(() => import("./components/CodePreview"), {
  ssr: false,
});

const LANGUAGES = [
  "typescript", "javascript", "python", "java", "cpp", "c", "csharp",
  "go", "rust", "php", "ruby", "swift", "kotlin", "sql", "html", "css",
  "json", "yaml", "bash", "markdown", "dockerfile",
];

const THEMES = [
  { value: "github-dark", label: "GitHub Dark" },
  { value: "github-light", label: "GitHub Light" },
  { value: "monokai", label: "Monokai" },
  { value: "dracula", label: "Dracula" },
  { value: "one-dark-pro", label: "One Dark Pro" },
  { value: "nord", label: "Nord" },
  { value: "night-owl", label: "Night Owl" },
  { value: "tokyo-night", label: "Tokyo Night" },
  { value: "solarized-dark", label: "Solarized Dark" },
  { value: "solarized-light", label: "Solarized Light" },
  { value: "vitesse-dark", label: "Vitesse Dark" },
  { value: "vitesse-light", label: "Vitesse Light" },
  { value: "rose-pine", label: "Rosé Pine" },
  { value: "poimandres", label: "Poimandres" },
  { value: "material-theme-ocean", label: "Material Ocean" },
];

const FONTS = [
  { value: "var(--font-jetbrains-mono), monospace", label: "JetBrains Mono" },
  { value: "var(--font-fira-code), monospace", label: "Fira Code" },
  { value: "var(--font-source-code-pro), monospace", label: "Source Code Pro" },
  { value: "var(--font-ibm-plex-mono), monospace", label: "IBM Plex Mono" },
  { value: "var(--font-inconsolata), monospace", label: "Inconsolata" },
];

const GRADIENTS = [
  { value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", label: "Purple Haze" },
  { value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", label: "Pink Dream" },
  { value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", label: "Ocean Blue" },
  { value: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", label: "Emerald" },
  { value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", label: "Sunset" },
  { value: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)", label: "Lavender" },
  { value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", label: "Peach" },
  { value: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", label: "Deep Space" },
  { value: "linear-gradient(135deg, #2d2d2d 0%, #0f0f13 100%)", label: "Dark Night" },
  { value: "none", label: "없음 (투명)" },
];

const parseHighlightLines = (input: string): number[] => {
  const lines = new Set<number>();
  input.split(",").forEach((part) => {
    const trimmed = part.trim();
    if (!trimmed) return;
    const range = trimmed.split("-").map(Number);
    if (range.length === 2 && !isNaN(range[0]) && !isNaN(range[1])) {
      for (let i = range[0]; i <= range[1]; i++) lines.add(i);
    } else if (!isNaN(range[0])) {
      lines.add(range[0]);
    }
  });
  return Array.from(lines);
};

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [theme, setTheme] = useState("github-dark");
  const [frameStyle, setFrameStyle] = useState<"macos" | "windows" | "none">("macos");
  const [filename, setFilename] = useState("");
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [highlightInput, setHighlightInput] = useState("");
  const [font, setFont] = useState(FONTS[0].value);
  const [gradient, setGradient] = useState(GRADIENTS[0].value);
  const [showWatermark, setShowWatermark] = useState(true);
  const [highlightedHtml, setHighlightedHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // 저장된 설정 + URL 파라미터 복원
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const urlCode = params.get("c");
    if (urlCode) {
      try {
        setCode(decodeURIComponent(escape(atob(urlCode))));
      } catch {}
    }

    const savedLanguage = params.get("lang") ?? localStorage.getItem("codetext-language");
    const savedTheme = params.get("theme") ?? localStorage.getItem("codetext-theme");
    const savedFrame = params.get("frame") ?? localStorage.getItem("codetext-frame");
    const savedFont = params.get("font") ?? localStorage.getItem("codetext-font");
    const savedGradient = params.get("gradient")
      ? decodeURIComponent(params.get("gradient")!)
      : localStorage.getItem("codetext-gradient");

    if (savedLanguage) setLanguage(savedLanguage);
    if (savedTheme) setTheme(savedTheme);
    if (savedFrame) setFrameStyle(savedFrame as "macos" | "windows" | "none");
    if (savedFont) setFont(savedFont);
    if (savedGradient) setGradient(savedGradient);
  }, []);

  // 실시간 미리보기 (500ms 디바운스)
  useEffect(() => {
    if (!code.trim()) {
      setHighlightedHtml("");
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/highlight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            language,
            theme,
            highlightLines: parseHighlightLines(highlightInput),
          }),
        });
        const data = await res.json();
        setHighlightedHtml(data.html);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [code, language, theme, highlightInput]);

  // Tab 키 → 2스페이스 삽입
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = el.value.substring(0, start) + "  " + el.value.substring(end);
      setCode(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2;
      });
    }
  };

  const handleShare = async () => {
    const params = new URLSearchParams();
    params.set("c", btoa(unescape(encodeURIComponent(code))));
    params.set("lang", language);
    params.set("theme", theme);
    params.set("frame", frameStyle);
    params.set("font", font);
    params.set("gradient", encodeURIComponent(gradient));
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    await navigator.clipboard.writeText(url);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  const save = (key: string, value: string) =>
    localStorage.setItem(`codetext-${key}`, value);

  return (
    <main className="min-h-screen bg-[#0f0f13] text-white">
      {/* 헤더 */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="9" height="9" rx="2" fill="#6366f1" />
            <rect x="13" y="2" width="9" height="9" rx="2" fill="#6366f1" opacity="0.6" />
            <rect x="2" y="13" width="9" height="9" rx="2" fill="#6366f1" opacity="0.6" />
            <rect x="13" y="13" width="9" height="9" rx="2" fill="#6366f1" opacity="0.3" />
          </svg>
          <span className="text-lg font-bold tracking-tight">codetext</span>
          <span className="text-xs text-white/30 font-mono">.io</span>
        </div>
        <span className="text-xs text-white/40 ml-2">코드를 아름다운 이미지로</span>
        {loading && (
          <span className="ml-auto text-xs text-indigo-400 animate-pulse">렌더링 중…</span>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 좌측: 입력 패널 */}
        <div className="flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">설정</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40">언어</label>
              <select
                value={language}
                onChange={(e) => { setLanguage(e.target.value); save("language", e.target.value); }}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l} className="bg-[#1a1a24]">{l}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40">테마</label>
              <select
                value={theme}
                onChange={(e) => { setTheme(e.target.value); save("theme", e.target.value); }}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {THEMES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-[#1a1a24]">{t.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40">창 프레임</label>
              <select
                value={frameStyle}
                onChange={(e) => {
                  const val = e.target.value as "macos" | "windows" | "none";
                  setFrameStyle(val);
                  save("frame", val);
                }}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="macos" className="bg-[#1a1a24]">macOS</option>
                <option value="windows" className="bg-[#1a1a24]">Windows</option>
                <option value="none" className="bg-[#1a1a24]">없음</option>
              </select>
            </div>

            {frameStyle !== "none" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/40">파일명</label>
                <input
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="예: main.ts"
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40">폰트</label>
              <select
                value={font}
                onChange={(e) => { setFont(e.target.value); save("font", e.target.value); }}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {FONTS.map((f) => (
                  <option key={f.value} value={f.value} className="bg-[#1a1a24]">{f.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40">배경 그라디언트</label>
              <select
                value={gradient}
                onChange={(e) => { setGradient(e.target.value); save("gradient", e.target.value); }}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {GRADIENTS.map((g) => (
                  <option key={g.value} value={g.value} className="bg-[#1a1a24]">{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 토글 옵션 */}
          <div className="flex flex-col gap-3">
            {[
              { label: "줄 번호 표시", value: showLineNumbers, toggle: () => setShowLineNumbers(!showLineNumbers) },
              { label: "워터마크 표시", value: showWatermark, toggle: () => setShowWatermark(!showWatermark) },
            ].map(({ label, value, toggle }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={toggle}
                  className={`w-9 h-5 rounded-full transition-colors relative ${value ? "bg-indigo-500" : "bg-white/10"}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${value ? "translate-x-4" : ""}`} />
                </div>
                <span className="text-sm text-white/60">{label}</span>
              </label>
            ))}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40">
                강조할 줄
                <span className="ml-2 text-white/20 font-mono">예: 1,3,5-7</span>
              </label>
              <input
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                placeholder="1,3,5-7"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/60"
              />
            </div>
          </div>

          {/* 코드 입력 */}
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs text-white/40">
              코드 입력
              <span className="ml-2 text-white/20">Tab → 2스페이스 · 자동 미리보기</span>
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              className="flex-1 min-h-[320px] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              placeholder="여기에 코드를 붙여넣으세요…"
              spellCheck={false}
            />
          </div>

          {/* URL 공유 버튼 */}
          <button
            onClick={handleShare}
            disabled={!code.trim()}
            className="py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 bg-white/5"
          >
            {shareToast ? "✓ URL이 클립보드에 복사됐습니다!" : "🔗 현재 설정을 URL로 공유"}
          </button>
        </div>

        {/* 우측: 미리보기 */}
        <div className="flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">미리보기</h2>

          {highlightedHtml ? (
            <CodePreview
              html={highlightedHtml}
              language={language}
              filename={filename}
              showLineNumbers={showLineNumbers}
              frameStyle={frameStyle}
              theme={theme}
              font={font}
              gradient={gradient}
              showWatermark={showWatermark}
            />
          ) : (
            <div className="flex-1 min-h-[400px] rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 text-white/20">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor" opacity="0.4" />
                <rect x="13" y="2" width="9" height="9" rx="2" fill="currentColor" opacity="0.25" />
                <rect x="2" y="13" width="9" height="9" rx="2" fill="currentColor" opacity="0.25" />
                <rect x="13" y="13" width="9" height="9" rx="2" fill="currentColor" opacity="0.1" />
              </svg>
              <p className="text-sm">코드를 입력하면 자동으로 미리보기됩니다</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
