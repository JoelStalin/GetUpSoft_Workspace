import { useCallback, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void
  maxSize?: number
  multiple?: boolean
}

export default function ImageUpload({
  onImageSelect,
  maxSize = 5242880, // 5MB default
  multiple = false,
}: ImageUploadProps) {
  const [selectedImages, setSelectedImages] = useState<Array<{ url: string; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null)
      
      acceptedFiles.forEach((file) => {
        // Validate file size
        if (file.size > maxSize) {
          setError(`File ${file.name} exceeds ${maxSize / 1024 / 1024}MB limit`)
          return
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError(`${file.name} is not an image`)
          return
        }

        // Read file as data URL
        const reader = new FileReader()
        reader.onload = (e) => {
          const url = e.target?.result as string
          const newImage = { url, name: file.name }
          
          if (multiple) {
            setSelectedImages((prev) => [...prev, newImage])
          } else {
            setSelectedImages([newImage])
            onImageSelect(url)
          }
        }
        reader.readAsDataURL(file)
      })
    },
    [maxSize, multiple, onImageSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
  })

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Drop zone */}
      <div
        {...getRootProps()}
        style={{
          padding: '24px',
          border: isDragActive ? '2px dashed rgb(74, 158, 255)' : '2px dashed var(--stitch-border)',
          borderRadius: '8px',
          backgroundColor: isDragActive ? 'rgba(74, 158, 255, 0.1)' : 'rgba(var(--color-base-300), 0.5)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'center',
          color: isDragActive ? 'rgb(74, 158, 255)' : 'var(--stitch-muted)',
        }}
      >
        <input {...getInputProps()} />
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
          <Upload size={24} />
        </div>
        <div style={{ fontSize: '14px', fontWeight: 500 }}>
          {isDragActive ? 'Drop images here...' : 'Drag images here or click to browse'}
        </div>
        <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
          Supported: JPG, PNG, GIF, WebP (max {maxSize / 1024 / 1024}MB)
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: 'rgba(237, 49, 93, 0.1)',
            border: '1px solid rgb(237, 49, 93)',
            borderRadius: '4px',
            color: 'rgb(237, 49, 93)',
            fontSize: '12px',
          }}
        >
          {error}
        </div>
      )}

      {/* Image previews */}
      {selectedImages.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '8px',
          }}
        >
          {selectedImages.map((image, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                borderRadius: '6px',
                overflow: 'hidden',
                border: '1px solid var(--stitch-border)',
                backgroundColor: 'rgba(var(--color-base-300), 0.5)',
              }}
            >
              <img
                src={image.url}
                alt={image.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <button
                onClick={() => removeImage(index)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                }}
                title="Remove image"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
