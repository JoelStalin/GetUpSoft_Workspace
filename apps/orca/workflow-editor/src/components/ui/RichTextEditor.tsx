import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import { Bold, Italic, Code, List, Link2, Heading2 } from 'lucide-react'
import { useCallback } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  simple?: boolean
  minHeight?: number
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter text...',
  simple = false,
  minHeight = 200,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert',
      },
    },
  })

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run()
  }, [editor])

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run()
  }, [editor])

  const toggleCode = useCallback(() => {
    editor?.chain().focus().toggleCode().run()
  }, [editor])

  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run()
  }, [editor])

  const toggleHeading = useCallback(() => {
    editor?.chain().focus().toggleHeading({ level: 2 }).run()
  }, [editor])

  const addLink = useCallback(() => {
    const url = prompt('Enter URL:')
    if (url) {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }, [editor])

  const addImage = useCallback(() => {
    const url = prompt('Enter image URL:')
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  if (!editor) {
    return <div>Loading editor...</div>
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '1px solid var(--stitch-border)',
        backgroundColor: 'rgb(var(--color-base-100))',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '8px',
          borderBottom: '1px solid var(--stitch-border)',
          backgroundColor: 'rgba(var(--color-base-300), 0.3)',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <ToolbarButton
          icon={<Bold size={16} />}
          onClick={toggleBold}
          active={editor.isActive('bold')}
          title="Bold"
        />
        <ToolbarButton
          icon={<Italic size={16} />}
          onClick={toggleItalic}
          active={editor.isActive('italic')}
          title="Italic"
        />
        <ToolbarButton
          icon={<Code size={16} />}
          onClick={toggleCode}
          active={editor.isActive('code')}
          title="Code"
        />

        {!simple && (
          <>
            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--stitch-border)' }} />

            <ToolbarButton
              icon={<Heading2 size={16} />}
              onClick={toggleHeading}
              active={editor.isActive('heading', { level: 2 })}
              title="Heading"
            />
            <ToolbarButton
              icon={<List size={16} />}
              onClick={toggleBulletList}
              active={editor.isActive('bulletList')}
              title="List"
            />
            <ToolbarButton
              icon={<Link2 size={16} />}
              onClick={addLink}
              active={editor.isActive('link')}
              title="Link"
            />
          </>
        )}
      </div>

      {/* Editor */}
      <div
        style={{
          padding: '12px',
          color: 'var(--stitch-text)',
          minHeight: `${minHeight}px`,
          maxHeight: '400px',
          overflow: 'auto',
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

function ToolbarButton({
  icon,
  onClick,
  active = false,
  title,
}: {
  icon: React.ReactNode
  onClick: () => void
  active?: boolean
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        backgroundColor: active ? 'rgba(74, 158, 255, 0.2)' : 'transparent',
        border: active ? '1px solid rgb(74, 158, 255)' : '1px solid transparent',
        borderRadius: '4px',
        color: active ? 'rgb(74, 158, 255)' : 'var(--stitch-text)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'rgba(var(--color-base-400), 0.2)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent'
        }
      }}
    >
      {icon}
    </button>
  )
}
