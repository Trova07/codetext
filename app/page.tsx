"use client";

import { useState, useCallback } from "react";
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

const SAMPLE_CODE = `function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 메모이제이션 버전
function fibMemo(n: number, memo = new Map<number, number>()): number {
  if (memo.has(n)) return memo.get(n)!;
  if (n <= 1) return n;
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}

console.log(fibMemo(40)); // 102334155`;

export default function Home() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [language, setLanguage] = useState("typescript");
  const [theme, setTheme] = useState("github-dark");
  const [frameStyle, setFrameStyle] = useState<"macos" | "windows" | "none">("macos");
  const [filename, setFilename] = useState("fibonacci.ts");
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [highlightInput, setHighlightInput] = useState("");
  const [highlightedHtml, setHighlightedHtml] = useState("");
  const [loading, setLoading] = useState(false);

  // "1,3,5-7" → [1, 3, 5, 6, 7]
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

  const handleHighlight = useCallback(async () => {
    if (!code.trim()) return;
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
  }, [code, language, theme, highlightInput]);

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
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 좌측: 입력 패널 */}
        <div className="flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest">설정</h2>

          {/* 옵션 행 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40">언어</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
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
                onChange={(e) => setTheme(e.target.value)}
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
                onChange={(e) => setFrameStyle(e.target.value as "macos" | "windows" | "none")}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="macos" className="bg-[#1a1a24]">macOS</option>
                <option value="windows" className="bg-[#1a1a24]">Windows</option>
                <option value="none" className="bg-[#1a1a24]">없음</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40">파일명</label>
              <input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="예: main.ts"
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                onClick={() => setShowLineNumbers(!showLineNumbers)}
                className={`w-9 h-5 rounded-full transition-colors relative ${showLineNumbers ? "bg-indigo-500" : "bg-white/10"}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${showLineNumbers ? "translate-x-4" : ""}`} />
              </div>
              <span className="text-sm text-white/60">줄 번호 표시</span>
            </label>

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
            <label className="text-xs text-white/40">코드 입력</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 min-h-[320px] bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              placeholder="여기에 코드를 붙여넣으세요..."
              spellCheck={false}
            />
          </div>

          <button
            onClick={handleHighlight}
            disabled={loading || !code.trim()}
            className="py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            {loading ? "하이라이팅 중..." : "이미지 생성하기 →"}
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
            />
          ) : (
            <div className="flex-1 min-h-[400px] rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 text-white/20">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor" opacity="0.4" />
                <rect x="13" y="2" width="9" height="9" rx="2" fill="currentColor" opacity="0.25" />
                <rect x="2" y="13" width="9" height="9" rx="2" fill="currentColor" opacity="0.25" />
                <rect x="13" y="13" width="9" height="9" rx="2" fill="currentColor" opacity="0.1" />
              </svg>
              <p className="text-sm">이미지 생성하기 버튼을 눌러주세요</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
