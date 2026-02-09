"use client";

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// Dynamically import ReactQuill to avoid SSR issues
// Using (any) to avoid strict type issues with dynamic imports if types are missing
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-zinc-50 animate-pulse rounded-xl border border-zinc-200" />
}) as any;

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image', 'video'],
        [{ 'align': [] }],
        ['clean']
      ],
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'indent',
    'link', 'image', 'video', 'align'
  ];

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Replacing style jsx with standard style tag to avoid potential styled-jsx dependency issues */}
      <style>{`
        .ql-container {
          font-family: inherit;
          font-size: 1rem;
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          border-color: #e4e4e7 !important;
        }
        .ql-toolbar {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          background-color: #fafafa;
          border-color: #e4e4e7 !important;
        }
        .ql-editor {
          min-height: 300px;
        }
        .ql-editor.ql-blank::before {
          color: #a1a1aa;
          font-style: normal;
        }
      `}</style>
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
