import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import CodeBlock from "../components/ui/CodeBlock";
import TerminalCard from "../components/ui/TerminalCard";
import CodeHoverCards from "../components/ui/CodeHoverCards";
import { Code, Terminal } from "lucide-react";

/**
 * Full markdown renderer using react-markdown with GFM + math support.
 */
export function MarkdownContent({ content, isStreaming }) {
  // If the AI just outputs a list of cards in a specific format, we could show HoverCards.
  // Instead, we will wrap CodeBlocks in the logic:
  // If the language is bash/sh/shell, we return a TerminalCard!
  return (
    <div className="prose-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Unwrap <pre> — CodeBlock provides its own wrapper
          pre(props) {
            // We pass a custom prop to children to let the code component know it's a block
            const childList = React.Children.toArray(props.children);
            if (childList.length === 1 && React.isValidElement(childList[0])) {
              return React.cloneElement(childList[0], { isBlock: true });
            }
            return <>{props.children}</>;
          },

          // Code blocks → CodeBlock component with syntax highlighting
          code({ className, node, children, isBlock, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match?.[1] || "";
            const codeText = String(children).replace(/\n$/, "");
            
            // Fenced code block or multi-line code or isBlock prop
            const isCodeBlock = isBlock || !!match || codeText.includes("\n");

            const isTerminalLang = ["bash", "sh", "shell", "zsh", "cmd", "powershell"].includes(lang.toLowerCase());
            
            // Auto-detect common terminal commands if language is not explicitly set
            const terminalCommandNames = [
              "npm ", "npx ", "yarn ", "pnpm ", "docker ", "docker-compose ", "git ", "pip ", "python ",
              "python3 ", "node ", "node.js ", "sudo ", "apt ", "brew ", "go ", "cargo ", "rustc ",
              "curl ", "wget ", "free ", "wmic ", "ls ", "cd ", "mkdir ", "rm ", "echo ", "cat "
            ];
            
            const looksLikeTerminal = 
              isCodeBlock && 
              (!lang || ["text", "plaintext"].includes(lang.toLowerCase())) && 
              terminalCommandNames.some(cmd => codeText.trim().toLowerCase().startsWith(cmd));

            // If it's a completely terminal-based command, use TerminalCard
            if (isTerminalLang || looksLikeTerminal) {
              return <TerminalCard command={codeText} language={lang || "bash"} />;
            }
            
            // If the AI specifically requests the hover cards UI
            if (lang.toLowerCase() === "code-hover-cards") {
              return <CodeHoverCards columns={3} minHeight={150} iconSize={48} />;
            }

            // Fenced code block or multi-line code
            if (isCodeBlock) {
              return (
                <div className="relative group">
                  <CodeBlock lang={lang} code={codeText} isStreaming={isStreaming} />
                </div>
              );
            }

            // Inline code
            return <code className={className} {...props}>{children}</code>;
          },

          // Detect standalone terminal commands that the AI forgets to format as code blocks
          p({ children, ...props }) {
            // Check if the paragraph contains exactly one string child that looks like a terminal command
            if (React.Children.count(children) === 1 && typeof children === "string") {
              const text = children.trim().toLowerCase();
              const terminalCommandNames = [
                "npm ", "npx ", "yarn ", "pnpm ", "docker ", "docker-compose ", "git ", "pip ", "python ",
                "python3 ", "node ", "node.js ", "sudo ", "apt ", "brew ", "go ", "cargo ", "rustc ",
                "curl ", "wget ", "free ", "wmic ", "ls ", "cd ", "mkdir ", "rm ", "echo ", "cat "
              ];
              
              if (terminalCommandNames.some(cmd => text.startsWith(cmd))) {
                 return <TerminalCard command={children.trim()} language="bash" />;
              }
            }
            return <p {...props}>{children}</p>;
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
