import { NextRequest, NextResponse } from "next/server";
import { codeToHtml } from "shiki";

export async function POST(req: NextRequest) {
  const { code, language, theme } = await req.json();

  if (!code || !language || !theme) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const html = await codeToHtml(code, {
      lang: language,
      theme: theme,
    });
    return NextResponse.json({ html });
  } catch {
    // 지원하지 않는 언어 fallback
    const html = await codeToHtml(code, {
      lang: "text",
      theme: theme,
    });
    return NextResponse.json({ html });
  }
}
