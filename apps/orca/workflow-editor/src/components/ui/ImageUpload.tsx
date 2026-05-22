import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  maxSize?: number // in MB
}

export default function ImageUpload({
  value,
  onChange,
  maxSize = 5,
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      addToast(`File must be less than ${maxSize}MB`, 'error')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file', 'error')
      return
    }

    setLoading(true)

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        onChange(dataUrl)
        addToast('Image uploaded successfully', 'success')
        setLoading(false)
      }
      reader.onerror = () => {
        addToast('Failed to read image file', 'error')
        setLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      addToast('Failed to upload image', 'error')
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    multiple: false,
    disabled: loading,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        style={{
          padding: '20px',
          borderRadius: '8px',
          border: `2px dashed ${isDragActive ? 'var(--stitch-accent)' : 'var(--stitch-border)'}`,
          backgroundColor: isDragActive
            ? 'rgba(74, 158, 255, 0.1)'
            : 'rgb(var(--color-base-300))',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'center',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <input {...getInputProps()} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Upload
            size={24}
            style={{
              color: isDragActive ? 'var(--stitch-accent)' : 'var(--stitch-muted)',
              transition: 'color 0.2s ease',
            }}
          />
          <div>
            <p
              style={{
                margin: '0 0 4px 0',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--stitch-text)',
              }}
            >
              {loading ? 'Uploading...' : 'Drag image here or click to select'}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '11px',
                color: 'var(--stitch-muted)',
              }}
            >
              Max {maxSize}MB • JPEG, PNG, GIF, WebP
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      {value && (
        <div
          style={{
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            border: `1px solid var(--stitch-border)`,
            aspectRatio: '16 / 9',
          }}
        >
          <img
            src={value}
            alt="Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Remove Button */}
          <button
            onClick={() => onChange('')}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(237, 49, 93, 0.8)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
