import { preprocessLaTeX } from "@/util/latex";
import { Text, TypographyStylesProvider } from "@mantine/core";
import MarkdownBase from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export function Markdown({ content }: { content: string }) {
  try {
    const processed = preprocessLaTeX(content);
    return (
      <TypographyStylesProvider>
        <MarkdownBase
          remarkPlugins={[remarkMath]}
          rehypePlugins={[[rehypeKatex, { output: "mathml" }]]}
        >
          {processed}
        </MarkdownBase>
      </TypographyStylesProvider>
    );
  } catch {
    return <Text c="red">无法解析</Text>;
  }
}
