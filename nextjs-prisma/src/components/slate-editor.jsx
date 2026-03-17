"use client";

import { useCallback, useMemo, useState } from "react";
import { createEditor, Editor, Transforms, Element as SlateElement } from "slate";
import { Slate, Editable, withReact } from "slate-react";

const DEFAULT_VALUE = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

function isMarkActive(editor, format) {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
}

function toggleMark(editor, format) {
  const active = isMarkActive(editor, format);

  if (active) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
}

function isBlockActive(editor, format) {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      n.type === format,
  });

  return !!match;
}

function toggleBlock(editor, format) {
  const active = isBlockActive(editor, format);
  const isList = format === "bulleted-list" || format === "numbered-list";
  const isHeading = format === "heading-one" || format === "heading-two";

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      (n.type === "bulleted-list" || n.type === "numbered-list"),
    split: true,
  });

  let newType = "paragraph";

  if (!active) {
    if (isList) {
      newType = "list-item";
    } else if (isHeading) {
      newType = format;
    } else {
      newType = format;
    }
  }

  Transforms.setNodes(editor, { type: newType });

  if (!active && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
}

function clearFormatting(editor) {
  Transforms.setNodes(
    editor,
    { type: "paragraph" },
    {
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n),
    }
  );

  Editor.removeMark(editor, "bold");
  Editor.removeMark(editor, "italic");
  Editor.removeMark(editor, "underline");
  Editor.removeMark(editor, "code");
}

function insertDivider(editor) {
  const divider = {
    type: "divider",
    children: [{ text: "" }],
  };

  Transforms.insertNodes(editor, divider);
  Transforms.insertNodes(editor, {
    type: "paragraph",
    children: [{ text: "" }],
  });
}

function ToolbarButton({ type = "button", active = false, onClick, children }) {
  return (
    <button
      type={type}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`rounded-lg px-3 py-1.5 text-sm transition ${
        active
          ? "bg-slate-900 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-8 w-px bg-slate-200" />;
}

function Leaf({ attributes, children, leaf }) {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;
  if (leaf.code) {
    children = (
      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.95em] text-slate-900">
        {children}
      </code>
    );
  }

  return <span {...attributes}>{children}</span>;
}

function Element({ attributes, children, element }) {
  switch (element.type) {
    case "heading-one":
      return (
        <h1 {...attributes} className="mb-4 text-3xl font-semibold text-slate-900">
          {children}
        </h1>
      );

    case "heading-two":
      return (
        <h2 {...attributes} className="mb-3 mt-8 text-2xl font-semibold text-slate-900">
          {children}
        </h2>
      );

    case "block-quote":
      return (
        <blockquote
          {...attributes}
          className="my-4 border-l-4 border-slate-300 pl-4 italic text-slate-700"
        >
          {children}
        </blockquote>
      );

    case "bulleted-list":
      return (
        <ul {...attributes} className="my-3 list-disc pl-6 text-slate-700">
          {children}
        </ul>
      );

    case "numbered-list":
      return (
        <ol {...attributes} className="my-3 list-decimal pl-6 text-slate-700">
          {children}
        </ol>
      );

    case "list-item":
      return <li {...attributes}>{children}</li>;

    case "divider":
      return (
        <div {...attributes} className="my-6">
          <hr className="border-slate-200" />
          {children}
        </div>
      );

    default:
      return (
        <p {...attributes} className="mb-3 leading-7 text-slate-700">
          {children}
        </p>
      );
  }
}

export default function SlateEditor({ value, onChange, stickyTop = "top-4" }) {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [internalValue, setInternalValue] = useState(
    value?.length ? value : DEFAULT_VALUE
  );

  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  return (
    <div className="rounded-2xl border border-slate-300 bg-white">
      <div className={`sticky ${stickyTop} z-20 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur`}>
        <div className="flex flex-wrap gap-2">
          <ToolbarButton
            active={isBlockActive(editor, "paragraph")}
            onClick={() => toggleBlock(editor, "paragraph")}
          >
            P
          </ToolbarButton>

          <ToolbarButton
            active={isBlockActive(editor, "heading-one")}
            onClick={() => toggleBlock(editor, "heading-one")}
          >
            H1
          </ToolbarButton>

          <ToolbarButton
            active={isBlockActive(editor, "heading-two")}
            onClick={() => toggleBlock(editor, "heading-two")}
          >
            H2
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            active={isMarkActive(editor, "bold")}
            onClick={() => toggleMark(editor, "bold")}
          >
            Bold
          </ToolbarButton>

          <ToolbarButton
            active={isMarkActive(editor, "italic")}
            onClick={() => toggleMark(editor, "italic")}
          >
            Italic
          </ToolbarButton>

          <ToolbarButton
            active={isMarkActive(editor, "underline")}
            onClick={() => toggleMark(editor, "underline")}
          >
            Underline
          </ToolbarButton>

          <ToolbarButton
            active={isMarkActive(editor, "code")}
            onClick={() => toggleMark(editor, "code")}
          >
            Code
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            active={isBlockActive(editor, "bulleted-list")}
            onClick={() => toggleBlock(editor, "bulleted-list")}
          >
            • List
          </ToolbarButton>

          <ToolbarButton
            active={isBlockActive(editor, "numbered-list")}
            onClick={() => toggleBlock(editor, "numbered-list")}
          >
            1. List
          </ToolbarButton>

          <ToolbarButton
            active={isBlockActive(editor, "block-quote")}
            onClick={() => toggleBlock(editor, "block-quote")}
          >
            Quote
          </ToolbarButton>

          <ToolbarButton onClick={() => insertDivider(editor)}>
            Divider
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton onClick={() => clearFormatting(editor)}>
            Clear
          </ToolbarButton>
        </div>
      </div>

      <div className="min-h-[420px] px-4 py-4">
        <Slate
          editor={editor}
          initialValue={internalValue}
          onValueChange={(nextValue) => {
            setInternalValue(nextValue);
            onChange(nextValue);
          }}
        >
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="เริ่มเขียนเนื้อหาที่นี่..."
            className="min-h-[360px] max-w-none outline-none"
            onKeyDown={(event) => {
              if (!(event.metaKey || event.ctrlKey)) return;

              switch (event.key.toLowerCase()) {
                case "b":
                  event.preventDefault();
                  toggleMark(editor, "bold");
                  break;
                case "i":
                  event.preventDefault();
                  toggleMark(editor, "italic");
                  break;
                case "u":
                  event.preventDefault();
                  toggleMark(editor, "underline");
                  break;
                default:
                  break;
              }
            }}
          />
        </Slate>
      </div>
    </div>
  );
}