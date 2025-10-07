// src/components/BlogEditor.jsx

"use client";

import React, { useState, useRef } from "react";
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
} from "lucide-react";

const BlogEditor = ({ isDarkMode }) => {
  const [content, setContent] = useState("");
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [codeContent, setCodeContent] = useState("");
  const editorRef = useRef(null);

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

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      formatText("createLink", url);
    }
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      formatText("insertImage", url);
    }
  };

  const openCodeModal = () => {
    setShowCodeModal(true);
    setCodeContent("");
  };

  const insertCodeBlock = () => {
    if (codeContent.trim()) {
      const codeBlock = `
        <div style="background: #2d3748; border-radius: 8px; padding: 16px; margin: 16px 0; font-family: 'Courier New', monospace; border-left: 4px solid #4299e1;">
          <div style="color: #a0aec0; font-size: 12px; margin-bottom: 8px; text-transform: uppercase; font-weight: bold;">
            ${
              languages.find((lang) => lang.value === selectedLanguage)
                ?.label || selectedLanguage
            }
          </div>
          <pre style="margin: 0; color: #e2e8f0; overflow-x: auto; white-space: pre-wrap;">${codeContent}</pre>
        </div>
        <div><br></div>
      `;

      editorRef.current.focus();
      document.execCommand("insertHTML", false, codeBlock);
      setShowCodeModal(false);
      setCodeContent("");
    }
  };

  const ToolbarButton = ({ onClick, children, title, active = false }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded transition-colors ${
        active
          ? "text-blue-400 bg-blue-900/30"
          : "text-gray-400 hover:text-white hover:bg-gray-700"
      }`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full max-w-4xl mx-auto pb-4">
      <div className="space-y-0">
        <div
          className={`${
            isDarkMode ? "bg-[#2A2A2A]" : "bg-[#ECEEF0]"
          } transition-colors duration-500 border border-gray-700 rounded-t-lg p-3`}
        >
          <div className="flex flex-wrap items-center gap-1">
            <ToolbarButton onClick={() => formatText("undo")} title="Undo">
              ↶
            </ToolbarButton>
            <ToolbarButton onClick={() => formatText("redo")} title="Redo">
              ↷
            </ToolbarButton>

            <div className="w-px h-6 bg-gray-600 mx-2 transition-colors duration-500"></div>

            <ToolbarButton onClick={() => formatText("bold")} title="Bold">
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => formatText("italic")} title="Italic">
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => formatText("underline")}
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => formatText("strikethrough")}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>

            <div
              className={`w-px h-6 ${
                isDarkMode ? "bg-[#2A2A2A]" : "bg-[#ECEEF0]"
              } transition-colors duration-500 mx-2`}
            ></div>

            <ToolbarButton
              onClick={() => formatText("insertUnorderedList")}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => formatText("insertOrderedList")}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>

            <div
              className={`w-px h-6 ${
                isDarkMode ? "bg-[#2A2A2A]" : "bg-[#ECEEF0]"
              } transition-colors duration-500 mx-2`}
            ></div>

            <ToolbarButton
              onClick={() => formatText("justifyLeft")}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => formatText("justifyCenter")}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => formatText("justifyRight")}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>

            <div
              className={`w-px h-6 ${
                isDarkMode ? "bg-[#2A2A2A]" : "bg-[#ECEEF0]"
              } transition-colors duration-500mx-2`}
            ></div>

            <ToolbarButton onClick={insertLink} title="Insert Link">
              <Link className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={insertImage} title="Insert Image">
              <Image className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={openCodeModal} title="Insert Code Block">
              <Code className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => formatText("formatBlock", "<blockquote>")}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => formatText("insertHorizontalRule")}
              title="Horizontal Rule"
            >
              <Minus className="w-4 h-4" />
            </ToolbarButton>

            <select
              className={`border ${
                isDarkMode
                  ? "bg-[#2A2A2A] text-white border-white"
                  : "bg-[#ECEEF0] text-black border-black"
              } transition-colors duration-500 text-sm rounded px-2 py-1 ml-2`}
              onChange={(e) => formatText("formatBlock", e.target.value)}
            >
              <option value="<div>">Normal</option>
              <option value="<h1>">Heading 1</option>
              <option value="<h2>">Heading 2</option>
              <option value="<h3>">Heading 3</option>
              <option value="<h4>">Heading 4</option>
              <option value="<h5>">Heading 5</option>
              <option value="<h6>">Heading 6</option>
              <option value="<p>">Paragraph</option>
            </select>
          </div>
        </div>

        <div
          ref={editorRef}
          contentEditable
          className={`min-h-96 p-4 ${
            isDarkMode ? "bg-[#2A2A2A] text-white " : "bg-[#ECEEF0] text-black"
          } transition-colors duration-500 border border-gray-700 border-t-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          style={{ minHeight: "500px" }}
          suppressContentEditableWarning={true}
          onInput={(e) => setContent(e.target.innerHTML)}
          data-placeholder="Start writing your blog post..."
        />
      </div>

      {showCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`${
              isDarkMode ? "bg-[#2A2A2A]" : "bg-[#ECEEF0]"
            } transition-colors duration-500 rounded-lg p-6 w-full max-w-2xl mx-4 border border-gray-700`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-black"
                }`}
              >
                Insert Code Block
              </h3>
              <button
                onClick={() => setShowCodeModal(false)}
                className={`text-gray-400 ${
                  isDarkMode ? "hover:text-white" : "hover:text-black"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-black"
                } mb-2`}
              >
                Programming Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className={`w-full p-3 ${
                  isDarkMode
                    ? "bg-[#2A2A2A] text-white"
                    : "bg-[#ECEEF0] text-black"
                } transition-colors duration-500 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500`}
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
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-black"
                } mb-2`}
              >
                Your Code
              </label>
              <textarea
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                placeholder={`Enter your ${
                  languages.find((lang) => lang.value === selectedLanguage)
                    ?.label || selectedLanguage
                } code here...`}
                rows={12}
                className={`w-full p-3 ${
                  isDarkMode
                    ? "bg-[#2A2A2A] text-green-400 "
                    : "bg-[#ECEEF0] text-green-600 "
                } transition-colors duration-500 border border-gray-600 rounded-lgfont-mono text-sm focus:outline-none focus:border-blue-500 resize-none`}
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
                  className={`${
                    isDarkMode ? "bg-[#2A2A2A]" : "bg-[#ECEEF0]"
                  } transition-colors duration-500 border border-gray-600 rounded-lg p-4`}
                >
                  <div className="text-blue-400 text-xs font-semibold mb-2 uppercase">
                    {languages.find((lang) => lang.value === selectedLanguage)
                      ?.label || selectedLanguage}
                  </div>
                  <pre
                    className={`${
                      isDarkMode ? "text-green-400" : "text-green-600"
                    } text-sm overflow-x-auto whitespace-pre-wrap font-mono`}
                  >
                    {codeContent}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCodeModal(false)}
                className={`px-4 py-2 ${
                  isDarkMode
                    ? "text-gray-300 hover:text-white"
                    : "text-black hover:text-gray-700"
                } transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={insertCodeBlock}
                disabled={!codeContent.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
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
