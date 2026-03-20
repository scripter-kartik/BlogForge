"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import LinkExt from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Code,
  Quote,
  Minus,
  Image,
  X,
  Check,
  Undo,
  Redo,
} from "lucide-react";

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "typescript", label: "TypeScript" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
];

const ToolbarButton = ({
  onClick,
  children,
  title,
  active = false,
  disabled = false,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded transition-colors ${
      active
        ? "text-blue-400 bg-blue-900/30"
        : "text-gray-400 hover:text-white hover:bg-gray-700"
    } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
  >
    {children}
  </button>
);

const BlogEditor = ({ isDarkMode, onContentChange, initialContent }) => {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [codeContent, setCodeContent] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const editor = useEditor({
    immediatelyRender: false, // ✅ ADD THIS LINE
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      UnderlineExt,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      LinkExt.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-400 underline cursor-pointer" },
      }),
      ImageExt.configure({
        HTMLAttributes: { class: "max-w-full rounded-lg my-4" },
      }),
      Placeholder.configure({ placeholder: "Start writing your blog post..." }),
    ],
    content: initialContent || "",
    onUpdate: ({ editor }) => {
      if (onContentChange) onContentChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none focus:outline-none min-h-[500px] p-4 ${
          isDarkMode ? "text-white" : "text-black"
        }`,
      },
    },
  });

  useEffect(() => {
    if (editor && initialContent && editor.isEmpty) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  const insertCodeBlock = () => {
    if (!codeContent.trim() || !editor) return;
    const langLabel =
      languages.find((l) => l.value === selectedLanguage)?.label ||
      selectedLanguage;
    const html = `<div style="background:#2d3748;border-radius:8px;padding:16px;margin:16px 0;font-family:'Courier New',monospace;border-left:4px solid #4299e1;"><div style="color:#a0aec0;font-size:12px;margin-bottom:8px;text-transform:uppercase;font-weight:bold;">${langLabel}</div><pre style="margin:0;color:#e2e8f0;overflow-x:auto;white-space:pre-wrap;">${codeContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre></div>`;
    editor.commands.insertContent(html);
    setShowCodeModal(false);
    setCodeContent("");
  };

  const insertLink = () => {
    if (!linkUrl.trim() || !editor) return;
    if (editor.state.selection.empty) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${linkUrl}">${linkUrl}</a>`)
        .run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    setShowLinkModal(false);
    setLinkUrl("");
  };

  const insertImage = () => {
    if (!imageUrl.trim() || !editor) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setShowImageModal(false);
    setImageUrl("");
  };

  const setHeading = (e) => {
    if (!editor) return;
    const val = e.target.value;
    if (val === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else if (val === "h1") {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (val === "h2") {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (val === "h3") {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    } else if (val === "h4") {
      editor.chain().focus().toggleHeading({ level: 4 }).run();
    } else if (val === "h5") {
      editor.chain().focus().toggleHeading({ level: 5 }).run();
    } else if (val === "h6") {
      editor.chain().focus().toggleHeading({ level: 6 }).run();
    }
  };

  const divider = <div className="w-px h-6 bg-gray-600 mx-1" />;

  return (
    <div className="w-full max-w-4xl mx-auto pb-4">
      <style>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #6b7280;
          pointer-events: none;
          height: 0;
        }
        .tiptap h1 { font-size: 2rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .tiptap h2 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .tiptap h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
        .tiptap h4 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0; }
        .tiptap ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .tiptap ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .tiptap blockquote { border-left: 4px solid #6b7280; padding-left: 1rem; margin: 1rem 0; color: #9ca3af; font-style: italic; }
        .tiptap hr { border: none; border-top: 1px solid #4b5563; margin: 1.5rem 0; }
        .tiptap code { background: #374151; padding: 0.15rem 0.4rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.9em; }
        .tiptap pre { background: #1f2937; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0; }
        .tiptap pre code { background: none; padding: 0; }
      `}</style>

      <div
        className={`${isDarkMode ? "bg-[#2A2A2A]" : "bg-[#ECEEF0]"} transition-colors duration-500 border border-gray-700 rounded-t-lg p-3`}
      >
        <div className="flex flex-wrap items-center gap-1">
          <ToolbarButton
            onClick={() => editor?.chain().focus().undo().run()}
            title="Undo"
            disabled={!editor?.can().undo()}
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().redo().run()}
            title="Redo"
            disabled={!editor?.can().redo()}
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>

          {divider}

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            title="Bold"
            active={editor?.isActive("bold")}
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            title="Italic"
            active={editor?.isActive("italic")}
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            title="Underline"
            active={editor?.isActive("underline")}
          >
            <Underline className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            title="Strikethrough"
            active={editor?.isActive("strike")}
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>

          {divider}

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            title="Bullet List"
            active={editor?.isActive("bulletList")}
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
            active={editor?.isActive("orderedList")}
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>

          {divider}

          <ToolbarButton
            onClick={() => editor?.chain().focus().setTextAlign("left").run()}
            title="Align Left"
            active={editor?.isActive({ textAlign: "left" })}
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().setTextAlign("center").run()}
            title="Align Center"
            active={editor?.isActive({ textAlign: "center" })}
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().setTextAlign("right").run()}
            title="Align Right"
            active={editor?.isActive({ textAlign: "right" })}
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>

          {divider}

          <ToolbarButton
            onClick={() => setShowLinkModal(true)}
            title="Insert Link"
            active={editor?.isActive("link")}
          >
            <Link className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setShowImageModal(true)}
            title="Insert Image"
          >
            <Image className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setShowCodeModal(true)}
            title="Insert Code Block"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            title="Quote"
            active={editor?.isActive("blockquote")}
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <Minus className="w-4 h-4" />
          </ToolbarButton>

          <select
            className={`border ${isDarkMode ? "bg-[#2A2A2A] text-white border-white" : "bg-[#ECEEF0] text-black border-black"} transition-colors duration-500 text-sm rounded px-2 py-1 ml-2`}
            onChange={setHeading}
            value={
              editor?.isActive("heading", { level: 1 })
                ? "h1"
                : editor?.isActive("heading", { level: 2 })
                  ? "h2"
                  : editor?.isActive("heading", { level: 3 })
                    ? "h3"
                    : editor?.isActive("heading", { level: 4 })
                      ? "h4"
                      : editor?.isActive("heading", { level: 5 })
                        ? "h5"
                        : editor?.isActive("heading", { level: 6 })
                          ? "h6"
                          : "paragraph"
            }
          >
            <option value="paragraph">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
          </select>
        </div>
      </div>

      <div
        className={`${isDarkMode ? "bg-[#2A2A2A]" : "bg-[#ECEEF0]"} transition-colors duration-500 border border-gray-700 border-t-0 rounded-b-lg`}
      >
        <EditorContent editor={editor} />
      </div>

      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`${isDarkMode ? "bg-[#2A2A2A]" : "bg-[#ECEEF0]"} rounded-lg p-6 w-full max-w-md border border-gray-700`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}
              >
                Insert Link
              </h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className={`w-full p-3 ${isDarkMode ? "bg-[#1a1a1a] text-white" : "bg-white text-black"} border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 mb-4`}
              onKeyDown={(e) => {
                if (e.key === "Enter") insertLink();
              }}
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLinkModal(false)}
                className={`px-4 py-2 ${isDarkMode ? "text-gray-300 hover:text-white" : "text-black"}`}
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                disabled={!linkUrl.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`${isDarkMode ? "bg-[#2A2A2A]" : "bg-[#ECEEF0]"} rounded-lg p-6 w-full max-w-md border border-gray-700`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}
              >
                Insert Image
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={`w-full p-3 ${isDarkMode ? "bg-[#1a1a1a] text-white" : "bg-white text-black"} border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 mb-4`}
              onKeyDown={(e) => {
                if (e.key === "Enter") insertImage();
              }}
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowImageModal(false)}
                className={`px-4 py-2 ${isDarkMode ? "text-gray-300 hover:text-white" : "text-black"}`}
              >
                Cancel
              </button>
              <button
                onClick={insertImage}
                disabled={!imageUrl.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {showCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`${isDarkMode ? "bg-[#2A2A2A]" : "bg-[#ECEEF0]"} rounded-lg p-6 w-full max-w-2xl border border-gray-700`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}
              >
                Insert Code Block
              </h3>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label
                className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-black"} mb-2`}
              >
                Programming Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={`w-full p-3 ${isDarkMode ? "bg-[#2A2A2A] text-white" : "bg-[#ECEEF0] text-black"} border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500`}
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label
                className={`block text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-black"} mb-2`}
              >
                Your Code
              </label>
              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                placeholder={`Enter your ${languages.find((l) => l.value === selectedLanguage)?.label || selectedLanguage} code here...`}
                rows={12}
                className={`w-full p-3 ${isDarkMode ? "bg-[#2A2A2A] text-green-400" : "bg-[#ECEEF0] text-green-600"} border border-gray-600 rounded-lg font-mono text-sm focus:outline-none focus:border-blue-500 resize-none`}
                style={{
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                }}
              />
            </div>
            {codeContent && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preview
                </label>
                <div
                  className={`${isDarkMode ? "bg-[#2A2A2A]" : "bg-[#ECEEF0]"} border border-gray-600 rounded-lg p-4`}
                >
                  <div className="text-blue-400 text-xs font-semibold mb-2 uppercase">
                    {languages.find((l) => l.value === selectedLanguage)
                      ?.label || selectedLanguage}
                  </div>
                  <pre
                    className={`${isDarkMode ? "text-green-400" : "text-green-600"} text-sm overflow-x-auto whitespace-pre-wrap font-mono`}
                  >
                    {codeContent}
                  </pre>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCodeModal(false)}
                className={`px-4 py-2 ${isDarkMode ? "text-gray-300 hover:text-white" : "text-black"}`}
              >
                Cancel
              </button>
              <button
                onClick={insertCodeBlock}
                disabled={!codeContent.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Insert Code Block</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogEditor;
