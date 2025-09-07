"use client"

import React, { useCallback, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useLanguage } from '@/lib/hooks/useLanguage'
import {
  Upload,
  File,
  FileText,
  Image,
  X,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  onFileRemove?: (file: File) => void
  acceptedFileTypes?: string[]
  maxFiles?: number
  maxSize?: number // in bytes
  className?: string
  disabled?: boolean
  showPreview?: boolean
}

interface UploadedFile {
  file: File
  url?: string
  error?: string
}

export function FileUpload({
  onFilesSelected,
  onFileRemove,
  acceptedFileTypes = ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  disabled = false,
  showPreview = true,
}: FileUploadProps) {
  const { t } = useTranslation()
  const { isRTL } = useLanguage()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return t('documents.fileSizeExceeds', { size: formatFileSize(maxSize) })
    }

    // Check file type
    const isValidType = acceptedFileTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1))
      }
      return file.type === type
    })

    if (!isValidType) {
      return t('documents.fileTypeNotAccepted')
    }

    return null
  }

  const handleFiles = useCallback((files: FileList | File[]) => {
    if (disabled) return

    const fileArray = Array.from(files)
    const validFiles: File[] = []
    const errors: string[] = []

    fileArray.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      errors.forEach(error => console.error(error))
    }

    if (validFiles.length > 0) {
      const newUploadedFiles: UploadedFile[] = validFiles.map(file => ({
        file,
        url: URL.createObjectURL(file) // Assuming URL.createObjectURL is available
      }))

      setUploadedFiles(prev => {
        // Remove any existing files with the same name
        const filtered = prev.filter(f => !validFiles.some(vf => vf.name === f.file.name))
        return [...filtered, ...newUploadedFiles]
      })
      onFilesSelected(validFiles)
    }
  }, [disabled, onFilesSelected, maxSize, acceptedFileTypes])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToRemove))
    onFileRemove?.(fileToRemove)
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />
    if (file.type === 'application/pdf') return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const getFileTypeColor = (file: File) => {
    if (file.type.startsWith('image/')) return 'bg-blue-100 text-blue-800'
    if (file.type === 'application/pdf') return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <Card className={cn(
        "border-2 border-dashed transition-colors",
        dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
        <CardContent className="p-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center justify-center space-y-4 cursor-pointer",
              disabled && "cursor-not-allowed"
            )}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedFileTypes.join(',')}
              onChange={handleFileInput}
              className="hidden"
              disabled={disabled}
            />
            <div className={`flex flex-col items-center ${isRTL ? 'space-y-reverse gap-2' : 'space-y-2'}`}>
              <Upload className={cn(
                "h-8 w-8",
                dragActive ? "text-blue-500" : "text-gray-400"
              )} />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">
                  {dragActive ? t('documents.dropFilesHere') : t('documents.dragDropFiles')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('documents.orClickToBrowse')}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center">
              <p>{t('documents.acceptedFileTypes')}</p>
              <p>{t('documents.maxFileSize', { size: formatFileSize(maxSize), count: maxFiles })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">{t('documents.uploadedFiles')}</h4>
          {uploadedFiles.map((uploadedFile, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className={`flex items-center ${isRTL ? 'justify-between' : 'justify-between'}`}>
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse gap-3' : 'space-x-3'} flex-1 min-w-0`}>
                    <div className={cn(
                      "p-2 rounded-lg",
                      getFileTypeColor(uploadedFile.file)
                    )}>
                      {getFileIcon(uploadedFile.file)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-center ${isRTL ? 'space-x-reverse gap-2' : 'space-x-2'}`}>
                    {uploadedFile.error && (
                      <div className={`flex items-center ${isRTL ? 'space-x-reverse gap-1' : 'space-x-1'}`}>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-600">{t('documents.error')}</span>
                      </div>
                    )}

                    {showPreview && uploadedFile.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(uploadedFile.url, '_blank')}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadedFile.file)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {uploadedFile.error && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{uploadedFile.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 