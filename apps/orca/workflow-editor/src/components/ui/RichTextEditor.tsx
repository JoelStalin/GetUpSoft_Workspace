import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Code, List, ListOrdered, Heading2, Undo2, Redo2, Link } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  simple?: boolean
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write something...',
  simple = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    immediatelyRender: false,
  })

  if (!editor) {
    return null
  }

  const toolbarButtons = simple
    ? [
        { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), label: 'Bold' },
        { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), label: 'Italic' },
        { icon: Code, action: () => editor.chain().focus().toggleCode().run(), label: 'Code' },
      ]
    : [
        { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), label: 'Heading' },
        { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), label: 'Bold' },
        { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), label: 'Italic' },
        { icon: Code, action: () => editor.chain().focus().toggleCode().run(), label: 'Code' },
        { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), label: 'Bullet List' },
        { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), label: 'Ordered List' },
        { icon: Undo2, action: () => editor.chain().focus().undo().run(), label: 'Undo' },
        { icon: Redo2, action: () => editor.chain().focus().redo().run(), label: 'Redo' },
      ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
        borderRadius: '8px',
        border: '1px solid var(--stitch-border)',
        overflow: 'hidden',
        backgroundColor: 'rgb(var(--color-base-300))',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '8px',
          borderBottom: '1px solid var(--stitch-border)',
          backgroundColor: 'rgb(var(--color-base-200))',
          flexWrap: 'wrap',
        }}
      >
        {toolbarButtons.map(({ icon: Icon, action, label }) => (
          <button
            key={label}
            onClick={action}
            title={label}
            style={{
              padding: '6px',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              border: '1px solid var(--stitch-border)',
              color: 'var(--stitch-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--stitch-hover)'
              e.currentTarget.style.color = 'var(--stitch-accent)'
              e.currentTarget.style.borderColor = 'var(--stitch-accent)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--stitch-muted)'
              e.currentTarget.style.borderColor = 'var(--stitch-border)'
            }}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>

      {/* Editor */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '12px',
        }}
      >
        <EditorContent
          editor={editor}
          style={{
            fontSize: '13px',
            color: 'var(--stitch-text)',
            lineHeight: '1.6',
          }}
        />
      </div>

      <style>{`
        .tiptap {
          outline: none;
        }

        .tiptap p.is-editor-empty:first-child::before {
          color: var(--stitch-muted);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        .tiptap h2 {
          font-size: 16px;
          font-weight: 600;
          margin: 8px 0;
          color: var(--stitch-text);
        }

        .tiptap p {
          margin: 6px 0;
        }

        .tiptap ul,
        .tiptap ol {
          margin: 8px 0 8px 16px;
        }

        .tiptap li {
          margin: 4px 0;
        }

        .tiptap code {
          background-color: rgba(74, 158, 255, 0.15);
          color: var(--stitch-accent);
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 12px;
        }

        .tiptap pre {
          background-color: rgb(var(--color-base-200));
          border: 1px solid var(--stitch-border);
          border-radius: 6px;
          padding: 12px;
          overflow-x: auto;
          margin: 8px 0;
        }

        .tiptap pre code {
          background-color: transparent;
          color: var(--stitch-text);
          padding: 0;
          border-radius: 0;
        }

        .tiptap a {
          color: var(--stitch-accent);
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
