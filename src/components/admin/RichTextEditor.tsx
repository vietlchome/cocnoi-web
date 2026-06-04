'use client'

import React, { useRef, useEffect } from 'react'
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Link, RemoveFormatting, Video } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder = 'Nhập mô tả chi tiết sản phẩm...' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isUpdatingRef = useRef(false)

  // Đồng bộ từ prop `value` vào innerHTML khi mount hoặc khi thay đổi từ bên ngoài (tránh vòng lặp re-render)
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || ''
      }
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true
      onChange(editorRef.current.innerHTML)
      isUpdatingRef.current = false
    }
  }

  // Thực thi các lệnh định dạng của trình duyệt (execCommand)
  const executeCommand = (command: string, arg: string = '') => {
    document.execCommand(command, false, arg)
    handleInput()
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  const addLink = () => {
    const url = prompt('Nhập đường dẫn liên kết (URL):', 'https://')
    if (url) {
      executeCommand('createLink', url)
    }
  }

  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null
    // RegExp for standard, share, embed, shorts, etc.
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/
    const match = url.match(regExp)
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`
    }
    return null
  }

  const addYoutubeEmbed = () => {
    const url = prompt('Nhập đường dẫn video YouTube hoặc Shorts:', 'https://www.youtube.com/watch?v=...')
    if (url) {
      const embedUrl = getYouTubeEmbedUrl(url)
      if (embedUrl) {
        const iframeHtml = `<iframe src="${embedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen class="w-full aspect-video rounded-xl my-4"></iframe><p><br></p>`
        executeCommand('insertHTML', iframeHtml)
      } else {
        alert('Đường dẫn video YouTube không hợp lệ. Vui lòng nhập đúng định dạng!')
      }
    }
  }

  return (
    <div className="w-full border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all duration-200 bg-white dark:bg-zinc-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50/80 dark:bg-zinc-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 select-none">
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
          title="In đậm"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
          title="In nghiêng"
        >
          <Italic size={16} />
        </button>
        <div className="w-[1px] h-6 bg-gray-200 dark:bg-zinc-700 mx-1" />
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h1>')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
          title="Tiêu đề lớn"
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h2>')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
          title="Tiêu đề phụ"
        >
          <Heading2 size={16} />
        </button>
        <div className="w-[1px] h-6 bg-gray-200 dark:bg-zinc-700 mx-1" />
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
          title="Danh sách dấu chấm"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
          title="Danh sách số"
        >
          <ListOrdered size={16} />
        </button>
        <div className="w-[1px] h-6 bg-gray-200 dark:bg-zinc-700 mx-1" />
        <button
          type="button"
          onClick={addLink}
          className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
          title="Thêm liên kết"
        >
          <Link size={16} />
        </button>
        <button
          type="button"
          onClick={addYoutubeEmbed}
          className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors hover:text-red-500 dark:hover:text-red-400"
          title="Nhúng YouTube"
        >
          <Video size={16} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('removeFormat')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
          title="Xóa định dạng"
        >
          <RemoveFormatting size={16} />
        </button>
      </div>

      {/* Editable Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className="p-4 min-h-[250px] max-h-[500px] overflow-y-auto focus:outline-none prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200"
        style={{ outline: 'none' }}
        data-placeholder={placeholder}
      />

      {/* CSS Placeholder fallback */}
      <style jsx global>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #a1a1aa;
          cursor: text;
        }
        .dark [contenteditable]:empty:before {
          color: #71717a;
        }
        /* Custom styles for content inside editor */
        .prose h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .prose h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .prose ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .prose a {
          color: #f97316;
          text-decoration: underline;
        }
        .prose iframe {
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 0.75rem;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        /* Dark Mode Overrides inside editor to make text white */
        .dark .prose {
          color: #f4f4f5 !important;
        }
        .dark .prose h1,
        .dark .prose h2,
        .dark .prose h3,
        .dark .prose h4,
        .dark .prose strong {
          color: #ffffff !important;
        }
        @media (prefers-color-scheme: dark) {
          .prose {
            color: #f4f4f5 !important;
          }
          .prose h1,
          .prose h2,
          .prose h3,
          .prose h4,
          .prose strong {
            color: #ffffff !important;
          }
        }
      `}</style>
    </div>
  )
}
