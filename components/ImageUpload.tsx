'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/validation'

interface ImageUploadProps {
  bucket: 'avatars' | 'post-images'
  onUploaded: (url: string) => void
  onCancel?: () => void
}

export function ImageUpload({ bucket, onUploaded, onCancel }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Only JPEG and PNG images are allowed')
      return
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image must be less than 2MB')
      return
    }

    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: MAX_IMAGE_SIZE,
    multiple: false,
  })

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('bucket', bucket)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload image')
      }

      const data = await response.json()
      onUploaded(data.url)
      toast.success('Image uploaded!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setPreview(null)
    setSelectedFile(null)
    onCancel?.()
  }

  if (preview) {
    return (
      <div className="space-y-3">
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="max-h-48 rounded-lg object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleCancel}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleUpload} disabled={isUploading} className="flex-1">
            {isUploading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        {isDragActive ? (
          <>
            <Upload className="h-8 w-8 text-primary" />
            <p className="text-sm text-primary">Drop the image here</p>
          </>
        ) : (
          <>
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drag and drop an image, or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              JPEG or PNG, max 2MB
            </p>
          </>
        )}
      </div>
    </div>
  )
}
