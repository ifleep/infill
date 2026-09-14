"use client";

import { useRef } from "react";
import { TextB, TextItalic, Link as LinkIcon, ListBullets } from "@phosphor-icons/react";

/**
 * Minimal WYSIWYG for rich-text content blocks — bold/italic/link/bullets
 * via the browser's contentEditable formatting commands, so an admin never
 * has to type HTML by hand to build product/page content (see requirement
 * #5: no HTML/React/Markdown authoring). Deliberately lightweight rather
 * than pulling in a full editor library — see requirement #23, "full
 * production-grade WYSIWYG not required if it introduces unnecessary
 * complexity."
 */
export function RichTextEditor({
  html,
  onChange,
  placeholder,
}: {
  html: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function exec(command: string, value?: string) {
    ref.current?.focus();
    document.execCommand(command, false, value);
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function handleLink() {
    const url = prompt("Link URL");
    if (url) exec("createLink", url);
  }

  return (
    <div className="rounded-md border border-border-strong">
      <div className="flex items-center gap-1 border-b border-border bg-surface-sunken px-2 py-1.5">
        <ToolbarButton label="Bold" onClick={() => exec("bold")}>
          <TextB size={15} weight="bold" />
        </ToolbarButton>
        <ToolbarButton label="Italic" onClick={() => exec("italic")}>
          <TextItalic size={15} weight="bold" />
        </ToolbarButton>
        <ToolbarButton label="Bullet list" onClick={() => exec("insertUnorderedList")}>
          <ListBullets size={15} weight="bold" />
        </ToolbarButton>
        <ToolbarButton label="Link" onClick={handleLink}>
          <LinkIcon size={15} weight="bold" />
        </ToolbarButton>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: html || "" }}
        data-placeholder={placeholder}
        className="focus-ring min-h-[80px] px-3 py-2 text-sm text-ink empty:before:text-ink-faint empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      title={label}
      className="focus-ring cursor-pointer rounded p-1.5 text-ink-muted hover:bg-border"
    >
      {children}
    </button>
  );
}
