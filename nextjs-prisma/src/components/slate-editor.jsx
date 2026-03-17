"use client";

import { useCallback, useMemo, useState } from "react";
import { createEditor, Editor, Transforms, Text, Element as SlateElement } from "slate";
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

function ToolbarButton({ type = "button", active = false, onClick, children }) {
  return (
    <button
      type={type}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`rounded-lg px-3 py-1 text-sm transition ${
        active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function Leaf({ attributes, children, leaf }) {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  return <span {...attributes}>{children}</span>;
}

function Element({ attributes, children, element }) {
  switch (element.type) {
    case "heading-one":
      return (
        <h1 {...attributes} className="text-3xl font-semibold text-slate-900">
          {children}
        </h1>
      );

    case "heading-two":
      return (
        <h2 {...attributes} className="text-2xl font-semibold text-slate-900">
          {children}
        </h2>
      );

    case "block-quote":
      return (
        <blockquote
          {...attributes}
          className="border-l-4 border-slate-300 pl-4 italic text-slate-700"
        >
          {children}
        </blockquote>
      );

    case "bulleted-list":
      return (
        <ul {...attributes} className="list-disc pl-6">
          {children}
        </ul>
      );

    case "numbered-list":
      return (
        <ol {...attributes} className="list-decimal pl-6">
          {children}
        </ol>
      );

    case "list-item":
      return <li {...attributes}>{children}</li>;

    default:
      return (
        <p {...attributes} className="mb-3">
          {children}
        </p>
      );
  }
}

export default function SlateEditor({ value, onChange }) {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [internalValue, setInternalValue] = useState(value?.length ? value : DEFAULT_VALUE);

  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-300">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-3">
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

        <ToolbarButton
          active={isMarkActive(editor, "bold")}
          onClick={() => toggleMark(editor, "bold")}
        >
          B
        </ToolbarButton>

        <ToolbarButton
          active={isMarkActive(editor, "italic")}
          onClick={() => toggleMark(editor, "italic")}
        >
          I
        </ToolbarButton>

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
      </div>

      <div className="min-h-[400px] p-4">
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

              switch (event.key) {
                case "b":
                  event.preventDefault();
                  toggleMark(editor, "bold");
                  break;
                case "i":
                  event.preventDefault();
                  toggleMark(editor, "italic");
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