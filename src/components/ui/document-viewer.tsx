"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  File,
  FileText,
  Image,
  X,
  Download,
  Calendar,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Document {
  id?: string
  name: string
  url: string
  type: string
  size?: number
  uploadedAt?: string
  uploadedBy?: string
}

interface DocumentViewerProps {
  documents: Document[]
  title?: string
  onRemove?: (document: Document) => void
  className?: string
  showUploadInfo?: boolean
}

export function DocumentViewer({
  documents,
  title = "Documents",
  onRemove,
  className,
  showUploadInfo = true
}: DocumentViewerProps) {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const getFileTypeColor = (type: string) => {
    if (type.startsWith('image/')) return 'bg-blue-100 text-blue-800'
    if (type === 'application/pdf') return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getFileTypeLabel = (type: string) => {
    if (type.startsWith('image/')) return 'Image'
    if (type === 'application/pdf') return 'PDF'
    if (type === 'application/msword') return 'DOC'
    if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX'
    return 'Document'
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const downloadDocument = (document: Document) => {
    // Fix the URL to point to the documents subdirectory for all provider files
    const backendUrl = 'http://localhost:3001'
    let fullUrl = document.url.startsWith('http')
      ? document.url
      : `${backendUrl}${document.url}`

    // All provider files should be in the documents subdirectory
    if (!fullUrl.includes('/documents/')) {
      // Replace /uploads/ with /uploads/documents/ for all provider files
      fullUrl = fullUrl.replace('/uploads/', '/uploads/documents/')
    }

    // Simple approach: open in new tab, browser will handle download
    window.open(fullUrl, '_blank')
  }

  if (documents.length === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="p-8 text-center">
          <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
          <p className="text-gray-500">No documents have been uploaded yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <Badge variant="secondary">{documents.length} document{documents.length !== 1 ? 's' : ''}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((document, index) => (
          <Card key={index} className="group hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  getFileTypeColor(document.type)
                )}>
                  {getFileIcon(document.type)}
                </div>
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(document)}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-gray-900 text-sm truncate" title={document.name}>
                    {document.name}
                  </h4>
                  <Badge variant="outline" className="text-xs mt-1">
                    {getFileTypeLabel(document.type)}
                  </Badge>
                </div>

                {showUploadInfo && (document.size || document.uploadedAt || document.uploadedBy) && (
                  <div className="space-y-1 text-xs text-gray-500">
                    {document.size && (
                      <div className="flex items-center space-x-1">
                        <span>Size: {formatFileSize(document.size)}</span>
                      </div>
                    )}
                    {document.uploadedAt && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(document.uploadedAt)}</span>
                      </div>
                    )}
                    {document.uploadedBy && (
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{document.uploadedBy}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadDocument(document)}
                    className="w-full h-8 text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 