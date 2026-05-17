import { NextRequest, NextResponse } from "next/server";
import { codeToHtml } from "shiki";

export async function POST(req: NextRequest) {
  const { code, language, theme, highlightLines = [] } = await req.json();

  if (!code || !language || !theme) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const lineSet = new Set<number>(highlightLines);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformer: any = {
    line(node: any, line: number) {
      if (lineSet.has(line)) {
        node.properties ??= {};
        const existing = (node.properties.class as string) ?? "";
        node.properties.class = existing ? `${existing} highlighted-line` : "highlighted-line";
      }
    },
  };

  try {
    const html = await codeToHtml(code, {
      lang: language,
      theme,
      transformers: [transformer],
    });
    return NextResponse.json({ html });
  } catch {
    const html = await codeToHtml(code, {
      lang: "text",
      theme,
      transformers: [transformer],
    });
    return NextResponse.json({ html });
  }
}
