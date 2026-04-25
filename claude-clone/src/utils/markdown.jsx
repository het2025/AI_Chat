import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import CodeBlock from "../components/ui/CodeBlock";

/**
 * Full markdown renderer using react-markdown with GFM + math support.
 */
export function MarkdownContent({ content, isStreaming }) {
  return (
    <div className="prose-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Unwrap <pre> — CodeBlock provides its own wrapper
          pre({ children }) {
            return <>{children}</>;
          },

          // Code blocks → CodeBlock component with syntax highlighting
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const code = String(children).replace(/\n$/, "");

            // Fenced code block or multi-line code
            if (match || code.includes("\n")) {
              return <CodeBlock lang={match?.[1] || ""} code={code} isStreaming={isStreaming} />;
            }

            // Inline code
            return <code className={className} {...props}>{children}</code>;
          },

          table({ children }) {
            return (
              <div className="table-wrapper">
                <table>{children}</table>
              </div>
            );
          },

          li({ children, node, ...props }) {
            const hasCheckbox = node?.children?.[0]?.type === "element" && node.children[0].tagName === "input";
            return (
              <li style={hasCheckbox ? { listStyle: "none", marginLeft: -20 } : {}} {...props}>
                {children}
              </li>
            );
          },

          a({ href, children, ...props }) {
            return (
              <a href={href} target="_blank" rel="noreferrer" {...props}>
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function renderMarkdown(text, isStreaming = false) {
  return <MarkdownContent content={text} isStreaming={isStreaming} />;
}
