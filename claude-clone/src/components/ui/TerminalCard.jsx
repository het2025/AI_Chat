import React, { useEffect, useState } from "react";
import { Copy, Terminal, Check } from "lucide-react";
import { cn } from "../../lib/utils";

// Native dynamic import handling for Vite instead of next/dynamic
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const TerminalCard = ({ command, language = "bash", className }) => {
  const [copied, setCopied] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // High performance interval based typing logic instead of framer-motion lag
  useEffect(() => {
    let timeout;
    
    if (index < command.length) {
      timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + command.charAt(index));
        setIndex((prev) => prev + 1);
      }, 10); // typing speed (faster for no lag)
    } else {
      setIsComplete(true);
    }

    return () => clearTimeout(timeout);
  }, [index, command]);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={cn(
        "border rounded-lg backdrop-blur-md min-w-[300px] max-w-full my-4",
        "bg-white border-gray-200 text-black",
        "dark:bg-[#1A1A1A] dark:border-gray-800 dark:text-white shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-[#202425] rounded-t-lg text-sm font-semibold text-gray-700 dark:text-gray-400 border-b dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-500" />
          Terminal
        </div>
        <button
          className="p-1 border border-transparent rounded transition hover:border-gray-300 dark:hover:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
          onClick={handleCopy}
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Content with Syntax Highlighting */}
      <div className="rounded-b-lg text-sm bg-black text-white dark:bg-black max-h-[300px] overflow-auto">
        {isComplete ? (
          <SyntaxHighlighter
            language={language}
            style={oneDark}
            wrapLongLines={true}
            customStyle={{ background: "transparent", margin: 0, padding: "16px" }}
          >
            {command}
          </SyntaxHighlighter>
        ) : (
          <pre className="whitespace-pre-wrap p-4 font-mono">
            {displayedText}
            <span className="inline-block w-2 h-4 bg-white ml-1 align-middle animate-pulse" />
          </pre>
        )}
      </div>
    </div>
  );
};

export default TerminalCard;
