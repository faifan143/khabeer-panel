"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DocumentViewer } from '@/components/ui/document-viewer'
import { FileUpload } from '@/components/ui/file-upload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useAddDocumentsToProvider,
  useProviderDocuments,
  useRemoveDocumentFromProvider,
  useUploadDocuments
} from '@/lib/api/hooks/useDocuments'
import { Provider } from '@/lib/api/types'
import {
  FileText,
  Upload
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface DocumentManagementDialogProps {
  provider: Provider | null
  isOpen: boolean
  onClose: () => void
}

export function DocumentManagementDialog({
  provider,
  isOpen,
  onClose
}: DocumentManagementDialogProps) {
  const [activeTab, setActiveTab] = useState('documents')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  // Hooks
  const { data: documentsData, isLoading: documentsLoading } = useProviderDocuments(provider?.id || 0)
  const uploadDocumentsMutation = useUploadDocuments()
  const addDocumentsMutation = useAddDocumentsToProvider()
  const removeDocumentMutation = useRemoveDocumentFromProvider()

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files])
  }

  const handleFileRemove = (file: File) => {
    setSelectedFiles(prev => prev.filter(f => f !== file))
  }

  const handleUploadDocuments = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload')
      return
    }

    try {
      // Upload files
      const uploadResult = await uploadDocumentsMutation.mutateAsync({
        files: selectedFiles
      })

      // Then add them to the provider
      if (provider) {
        const documentUrls = uploadResult.documents.map(doc => doc.url)
        await addDocumentsMutation.mutateAsync({
          providerId: provider.id,
          documents: documentUrls
        })
      }

      // Clear selected files
      setSelectedFiles([])
      toast.success('Documents uploaded and assigned successfully')
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Failed to upload documents')
    }
  }

  const handleRemoveDocument = async (document: any) => {
    if (provider) {
      await removeDocumentMutation.mutateAsync({
        providerId: provider.id,
        documentUrl: document.url
      })
    }
  }



  if (!provider) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Document Management - {provider.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>

            </TabsList>

            <div className="mt-4 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-4">
                {documentsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <DocumentViewer
                    documents={documentsData?.documents || []}
                    title="Provider Documents"
                    onRemove={handleRemoveDocument}
                    showUploadInfo={true}
                  />
                )}
              </TabsContent>

              {/* Upload Tab */}
              <TabsContent value="upload" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Upload className="h-5 w-5" />
                      <span>Upload New Documents</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FileUpload
                      onFilesSelected={handleFilesSelected}
                      onFileRemove={handleFileRemove}
                      acceptedFileTypes={[
                        'image/*',
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                      ]}
                      maxFiles={5}
                      maxSize={10 * 1024 * 1024} // 10MB
                      showPreview={true}
                    />

                    {selectedFiles.length > 0 && (
                      <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedFiles([])}
                        >
                          Clear
                        </Button>
                        <Button
                          onClick={handleUploadDocuments}
                          disabled={uploadDocumentsMutation.isPending || addDocumentsMutation.isPending}
                        >
                          {uploadDocumentsMutation.isPending || addDocumentsMutation.isPending ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Uploading...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Upload className="h-4 w-4" />
                              <span>Upload & Assign</span>
                            </div>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
} 