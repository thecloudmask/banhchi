"use client";

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// Dynamically import ReactQuill to avoid SSR issues
// Using (any) to avoid strict type issues with dynamic imports if types are missing
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-64 w-full bg-zinc-50 animate-pulse rounded-xl border border-zinc-200" />
}) as any;

import { uploadToCloudinary } from '@/lib/cloudinary';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          // You might want to show a loading state here
          const url = await uploadToCloudinary(file, 'banhchi/editor', 'gallery');
          
          // Get the quill instance from the ref
          const quill = (window as any).QuillInstance; 
          if (quill) {
            const range = quill.getSelection();
            quill.insertEmbed(range.index, 'image', url);
          }
        } catch (error) {
          console.error('Editor image upload failed:', error);
        }
      }
    };
  };

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
      handlers: {
        image: imageHandler
      }
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
          border-color: var(--border) !important;
          background-color: transparent;
          color: var(--foreground);
        }
        .ql-toolbar {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          background-color: var(--muted);
          border-color: var(--border) !important;
        }
        .ql-editor {
          min-height: 300px;
        }
        .ql-editor.ql-blank::before {
          color: var(--muted-foreground);
          font-style: normal;
          opacity: 0.5;
        }
        .ql-snow .ql-stroke {
          stroke: var(--foreground);
        }
        .ql-snow .ql-fill {
          fill: var(--foreground);
        }
        .ql-snow .ql-picker {
          color: var(--foreground);
        }
      `}</style>
      <ReactQuill 
        ref={(el: any) => {
           if (el) (window as any).QuillInstance = el.getEditor();
        }}
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
