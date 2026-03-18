"use client";

import { useCallback, useMemo, useState } from "react";
import {
  createEditor,
  Editor,
  Transforms,
  Element as SlateElement,
  Range,
} from "slate";
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  useSlateStatic,
} from "slate-react";
import { withHistory, HistoryEditor } from "slate-history";

const DEFAULT_VALUE = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

function withImages(editor) {
  const { isVoid } = editor;

  editor.isVoid = (element) => {
    return element.type === "image" ? true : isVoid(element);
  };

  return editor;
}

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
  Editor.removeMark(editor, "link");
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

function insertImage(editor, src, alt = "", link = null) {
  const image = {
    type: "image",
    src,
    alt,
    link,
    children: [{ text: "" }],
  };

  Transforms.insertNodes(editor, image);
  Transforms.insertNodes(editor, {
    type: "paragraph",
    children: [{ text: "" }],
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

async function insertImagesFromFiles(editor, files, event, setEditorError) {
  const imageFiles = Array.from(files || []).filter((file) =>
    file.type.startsWith("image/")
  );

  if (!imageFiles.length) return false;

  setEditorError(null);

  if (event) {
    const range = ReactEditor.findEventRange(editor, event);
    if (range) {
      Transforms.select(editor, range);
    }
  }

  let insertedAny = false;

  for (const file of imageFiles) {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setEditorError(`ไฟล์ "${file.name}" ใหญ่เกิน 2 MB`);
      continue;
    }

    const src = await readFileAsDataURL(file);
    insertImage(editor, src, file.name || "image");
    insertedAny = true;
  }

  return insertedAny;
}

function isLinkMarkActive(editor) {
  const marks = Editor.marks(editor);
  return Boolean(marks?.link?.href);
}

function ToolbarButton({
  type = "button",
  active = false,
  disabled = false,
  onClick,
  children,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!disabled) onClick();
      }}
      className={`rounded-lg px-3 py-1.5 text-sm transition ${disabled
        ? "cursor-not-allowed bg-slate-100 text-slate-400"
        : active
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

function canUndo(editor) {
  return (editor.history?.undos?.length ?? 0) > 0;
}

function canRedo(editor) {
  return (editor.history?.redos?.length ?? 0) > 0;
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

  if (leaf.link?.href) {
    children = (
      <a
        href={leaf.link.href}
        target={leaf.link.target || "_self"}
        rel={leaf.link.target === "_blank" ? "noopener noreferrer" : undefined}
        className="text-slate-900 underline decoration-slate-300 underline-offset-2"
      >
        {children}
      </a>
    );
  }

  return <span {...attributes}>{children}</span>;
}

function ImageElement({ attributes, children, element, onEditLink }) {
  const editor = useSlateStatic();

  const removeImage = () => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.removeNodes(editor, { at: path });
  };

  const imageNode = (
    <img
      src={element.src}
      alt={element.alt || ""}
      className="max-h-[520px] max-w-full rounded-xl border border-slate-200"
    />
  );

  return (
    <div {...attributes} className="group relative my-4">
      <div contentEditable={false} className="relative inline-block max-w-full">
        {element.link?.href ? (
          <a
            href={element.link.href}
            target={element.link.target || "_self"}
            rel={element.link.target === "_blank" ? "noopener noreferrer" : undefined}
            className="inline-block"
          >
            {imageNode}
          </a>
        ) : (
          imageNode
        )}

        <div className="absolute right-2 top-2 flex gap-2">
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              onEditLink(element);
            }}
            className="rounded-lg bg-black/70 px-2 py-1 text-xs font-medium text-white"
            aria-label="Set image link"
          >
            ลิงก์
          </button>

          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              removeImage();
            }}
            className="rounded-lg bg-black/70 px-2 py-1 text-xs font-medium text-white"
            aria-label="Remove image"
          >
            ลบ
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

function Element({ attributes, children, element, onEditImageLink }) {
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

    case "image":
      return (
        <ImageElement
          attributes={attributes}
          element={element}
          onEditLink={onEditImageLink}
        >
          {children}
        </ImageElement>
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
  const [editorError, setEditorError] = useState(null);

  const editor = useMemo(
    () => withHistory(withImages(withReact(createEditor()))),
    []
  );

  const [internalValue, setInternalValue] = useState(
    value?.length ? value : DEFAULT_VALUE
  );

  const [linkPanelOpen, setLinkPanelOpen] = useState(false);
  const [linkMode, setLinkMode] = useState("text");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTarget, setLinkTarget] = useState("_self");
  const [savedSelection, setSavedSelection] = useState(null);
  const [activeImageElement, setActiveImageElement] = useState(null);

  const openTextLinkPanel = useCallback(() => {
    if (!editor.selection || Range.isCollapsed(editor.selection)) {
      setEditorError("กรุณาคลุมข้อความก่อนใส่ลิงก์");
      return;
    }

    setEditorError(null);
    setSavedSelection(editor.selection);

    const marks = Editor.marks(editor);
    const currentLink = marks?.link || null;

    setLinkMode("text");
    setLinkUrl(currentLink?.href || "");
    setLinkTarget(currentLink?.target || "_self");
    setActiveImageElement(null);
    setLinkPanelOpen(true);
  }, [editor]);

  const openImageLinkPanel = useCallback((element) => {
    setEditorError(null);
    setLinkMode("image");
    setLinkUrl(element?.link?.href || "");
    setLinkTarget(element?.link?.target || "_self");
    setActiveImageElement(element);
    setSavedSelection(null);
    setLinkPanelOpen(true);
  }, []);

  const closeLinkPanel = useCallback(() => {
    setLinkPanelOpen(false);
    setLinkUrl("");
    setLinkTarget("_self");
    setSavedSelection(null);
    setActiveImageElement(null);
  }, []);

  const applyLink = useCallback(() => {
    const href = linkUrl.trim();

    if (!href) {
      setEditorError("กรุณาใส่ URL ปลายทาง");
      return;
    }

    setEditorError(null);

    if (linkMode === "text") {
      if (!savedSelection) return;

      Transforms.select(editor, savedSelection);
      Editor.addMark(editor, "link", {
        href,
        target: linkTarget,
      });
    }

    if (linkMode === "image" && activeImageElement) {
      const path = ReactEditor.findPath(editor, activeImageElement);
      Transforms.setNodes(
        editor,
        {
          link: {
            href,
            target: linkTarget,
          },
        },
        { at: path }
      );
    }

    closeLinkPanel();
  }, [
    linkUrl,
    linkMode,
    savedSelection,
    editor,
    linkTarget,
    activeImageElement,
    closeLinkPanel,
  ]);

  const removeLink = useCallback(() => {
    setEditorError(null);

    if (linkMode === "text") {
      if (savedSelection) {
        Transforms.select(editor, savedSelection);
      }
      Editor.removeMark(editor, "link");
    }

    if (linkMode === "image" && activeImageElement) {
      const path = ReactEditor.findPath(editor, activeImageElement);
      Transforms.setNodes(editor, { link: null }, { at: path });
    }

    closeLinkPanel();
  }, [linkMode, savedSelection, editor, activeImageElement, closeLinkPanel]);

  const renderElement = useCallback(
    (props) => <Element {...props} onEditImageLink={openImageLinkPanel} />,
    [openImageLinkPanel]
  );

  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  return (
    <div className="rounded-2xl border border-slate-300 bg-white">
      <div
        className={`sticky ${stickyTop} z-20 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur`}
      >
        <div className="flex flex-wrap gap-2">
          <ToolbarButton
            disabled={!canUndo(editor)}
            onClick={() => HistoryEditor.undo(editor)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="h-4 w-4"
              fill="currentColor"
            >
              <path d="M88 256L232 256C241.7 256 250.5 250.2 254.2 241.2C257.9 232.2 255.9 221.9 249 215L202.3 168.3C277.6 109.7 386.6 115 455.8 184.2C530.8 259.2 530.8 380.7 455.8 455.7C380.8 530.7 259.3 530.7 184.3 455.7C174.1 445.5 165.3 434.4 157.9 422.7C148.4 407.8 128.6 403.4 113.7 412.9C98.8 422.4 94.4 442.2 103.9 457.1C113.7 472.7 125.4 487.5 139 501C239 601 401 601 501 501C601 401 601 239 501 139C406.8 44.7 257.3 39.3 156.7 122.8L105 71C98.1 64.2 87.8 62.1 78.8 65.8C69.8 69.5 64 78.3 64 88L64 232C64 245.3 74.7 256 88 256z" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            disabled={!canRedo(editor)}
            onClick={() => HistoryEditor.redo(editor)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className="h-4 w-4"
              fill="currentColor"
            >
              <path d="M552 256L408 256C398.3 256 389.5 250.2 385.8 241.2C382.1 232.2 384.1 221.9 391 215L437.7 168.3C362.4 109.7 253.4 115 184.2 184.2C109.2 259.2 109.2 380.7 184.2 455.7C259.2 530.7 380.7 530.7 455.7 455.7C463.9 447.5 471.2 438.8 477.6 429.6C487.7 415.1 507.7 411.6 522.2 421.7C536.7 431.8 540.2 451.8 530.1 466.3C521.6 478.5 511.9 490.1 501 501C401 601 238.9 601 139 501C39.1 401 39 239 139 139C233.3 44.7 382.7 39.4 483.3 122.8L535 71C541.9 64.1 552.2 62.1 561.2 65.8C570.2 69.5 576 78.3 576 88L576 232C576 245.3 565.3 256 552 256z" />
            </svg>
          </ToolbarButton>

          <ToolbarDivider />

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

          <ToolbarButton
            active={isLinkMarkActive(editor)}
            onClick={openTextLinkPanel}
          >
            Link
          </ToolbarButton>

          <ToolbarButton onClick={() => clearFormatting(editor)}>
            Clear
          </ToolbarButton>
        </div>
      </div>

      {linkPanelOpen && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-[140px_1fr_180px]">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  ประเภท
                </label>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                  {linkMode === "image" ? "รูปภาพ" : "ข้อความ"}
                </div>
              </div>

              <div className="min-w-0">
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  URL ปลายทาง
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium whitespace-nowrap text-slate-500">
                  เปิดลิงก์ใน
                </label>
                <select
                  value={linkTarget}
                  onChange={(e) => setLinkTarget(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                >
                  <option value="_self">แท็บเดิม</option>
                  <option value="_blank">แท็บใหม่</option>
                  <option value="_top">Top frame</option>
                  <option value="_parent">Parent frame</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeLinkPanel}
                className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={removeLink}
                className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
              >
                ลบลิงก์
              </button>

              <button
                type="button"
                onClick={applyLink}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-[420px] px-4 py-4">
        {editorError && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {editorError}
          </div>
        )}

        <Slate
          editor={editor}
          initialValue={internalValue}
          onValueChange={(nextValue) => {
            setEditorError(null);
            setInternalValue(nextValue);
            onChange(nextValue);
          }}
        >
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="เริ่มเขียนเนื้อหาที่นี่..."
            className="min-h-[360px] max-w-none outline-none"
            onDragOver={(event) => {
              const hasFiles = Array.from(event.dataTransfer?.types || []).includes("Files");
              if (hasFiles) {
                event.preventDefault();
              }
            }}
            onDrop={async (event) => {
              const hasFiles = event.dataTransfer?.files?.length > 0;

              if (hasFiles) {
                event.preventDefault();
                event.stopPropagation();

                await insertImagesFromFiles(
                  editor,
                  event.dataTransfer.files,
                  event,
                  setEditorError
                );
              }
            }}
            onPaste={async (event) => {
              const inserted = await insertImagesFromFiles(
                editor,
                event.clipboardData?.files,
                null,
                setEditorError
              );

              if (inserted) {
                event.preventDefault();
              }
            }}
            onKeyDown={(event) => {
              if (!(event.metaKey || event.ctrlKey)) return;

              const key = event.key.toLowerCase();

              if (key === "z" && !event.shiftKey) {
                event.preventDefault();
                HistoryEditor.undo(editor);
                return;
              }

              if ((key === "z" && event.shiftKey) || key === "y") {
                event.preventDefault();
                HistoryEditor.redo(editor);
                return;
              }

              if (key === "k") {
                event.preventDefault();
                openTextLinkPanel();
                return;
              }

              switch (key) {
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