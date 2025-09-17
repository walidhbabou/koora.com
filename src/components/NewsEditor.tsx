import React, { useRef, useEffect } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import Table from "@editorjs/table";
import ImageTool from "@editorjs/image";
import Code from "@editorjs/code";
import Embed from "@editorjs/embed";
// Optional: Add more media/image tools if installed
// import Gallery from "@editorjs/gallery";
// import FileTool from "@editorjs/file";
// import AttachesTool from "@editorjs/attaches";
// import SimpleImage from "@editorjs/simple-image";
// import RawTool from "@editorjs/raw";
// import Delimiter from "@editorjs/delimiter";
// import Warning from "@editorjs/warning";
// import LinkTool from "@editorjs/link";

interface NewsEditorProps {
  initialData?: any;
  onSave?: (data: any) => void;
  placeholder?: string;
}

const NewsEditor: React.FC<NewsEditorProps> = ({ initialData, onSave, placeholder }) => {
  const editorRef = useRef<EditorJS | null>(null);
  const holderIdRef = useRef<string>(`editorjs-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = new EditorJS({
        holder: holderIdRef.current,
        placeholder: placeholder || "Écris ta news ici...",
        data: initialData || {},
        tools: {
          header: Header,
          paragraph: Paragraph,
          list: List,
          quote: Quote,
          table: Table,
          code: Code,
          embed: {
            class: Embed,
            config: {
              services: {
                youtube: true,
                coub: true,
                twitter: true,
                instagram: true,
                facebook: true,
                vimeo: true,
                vine: true,
                imgur: true,
                giphy: true,
                spotify: true,
                soundcloud: true,
                codepen: true,
                // Add more custom services here if needed
              },
            },
          },
          image: {
            class: ImageTool,
            config: {
              endpoints: {
                byFile: "http://localhost:5000/uploadFile",
                byUrl: "http://localhost:5000/fetchUrl",
              },
            },
          },
          // Uncomment if installed and configured:
          // gallery: Gallery,
          // file: FileTool,
          // attaches: AttachesTool,
          // simpleImage: SimpleImage,
          // raw: RawTool,
          // delimiter: Delimiter,
          // warning: Warning,
          // linkTool: LinkTool,
        },
      });
    }
    return () => {
      editorRef.current?.destroy?.();
      editorRef.current = null;
    };
  }, [initialData, placeholder]);

  const handleSave = async () => {
    if (editorRef.current) {
      const data = await editorRef.current.save();
      if (onSave) onSave(data);
    }
  };

  return (
    <div>
      <div
        id={holderIdRef.current}
        className="border rounded-md p-3 bg-white text-black border-slate-300"
        style={{
          background: 'var(--editor-bg, #fff)',
          color: 'var(--editor-text, #222)',
          borderColor: 'var(--editor-border, #ddd)',
        }}
      ></div>
      <style>{`
        body.dark #${holderIdRef.current} {
          background: #18181b !important;
          color: #fff !important;
          border-color: #444 !important;
        }
        body.dark #${holderIdRef.current} .ce-paragraph, body.dark #${holderIdRef.current} .ce-header {
          color: #fff !important;
        }
        body.dark #${holderIdRef.current} .ce-paragraph[data-placeholder]:empty:before {
          color: #aaa !important;
        }
      `}</style>
      <button
        type="button"
        onClick={handleSave}
        className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        style={{
          background: 'var(--editor-btn-bg, #7c3aed)',
          color: 'var(--editor-btn-text, #fff)',
        }}
      >
        Sauvegarder
      </button>
      <style>{`
        body.dark & {
          --editor-bg: #18181b;
          --editor-border: #444;
          --editor-text: #eee;
          --editor-btn-bg: #a78bfa;
          --editor-btn-text: #18181b;
        }
      `}</style>
    </div>
  );
};

export default NewsEditor;
