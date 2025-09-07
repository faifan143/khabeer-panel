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
import { useLanguage } from '@/lib/hooks/useLanguage'
import {
  FileText,
  Upload
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const { isRTL } = useLanguage()
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
      toast.error(t('documents.pleaseSelectFiles'))
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
      toast.success(t('documents.documentsUploadedSuccessfully'))
    } catch (error) {
      console.error(t('documents.uploadFailed'), error)
      toast.error(t('documents.failedToUploadDocuments'))
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
          <DialogTitle className={`flex items-center ${isRTL ? ' gap-2' : 'space-x-2'}`}>
            <FileText className="h-5 w-5" />
            <span>{t('documents.documentManagement')} - {provider.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              {isRTL ? (
                <>
                  <TabsTrigger value="documents">{t('documents.documents')}</TabsTrigger>
                  <TabsTrigger value="upload">{t('documents.upload')}</TabsTrigger>
                </>
              ) : (
                <>
                  <TabsTrigger value="documents">{t('documents.documents')}</TabsTrigger>
                  <TabsTrigger value="upload">{t('documents.upload')}</TabsTrigger>
                </>
              )}
            </TabsList>

            <div className="mt-4 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-4">
                {documentsLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className={`ml-2 ${isRTL ? 'mr-2 ml-0' : ''}`}>{t('documents.loadingDocuments')}</span>
                  </div>
                ) : (
                  <DocumentViewer
                    documents={documentsData?.documents || []}
                    title={t('documents.providerDocuments')}
                    onRemove={handleRemoveDocument}
                    showUploadInfo={true}
                  />
                )}
              </TabsContent>

              {/* Upload Tab */}
              <TabsContent value="upload" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className={`flex items-center ${isRTL ? 'space-x-reverse gap-2' : 'space-x-2'}`}>
                      <Upload className="h-5 w-5" />
                      <span>{t('documents.uploadNewDocuments')}</span>
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
                      <div className={`flex items-center ${isRTL ? 'justify-start space-x-reverse gap-2' : 'justify-end space-x-2'} pt-4 border-t`}>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedFiles([])}
                        >
                          {t('documents.clear')}
                        </Button>
                        <Button
                          onClick={handleUploadDocuments}
                          disabled={uploadDocumentsMutation.isPending || addDocumentsMutation.isPending}
                        >
                          {uploadDocumentsMutation.isPending || addDocumentsMutation.isPending ? (
                            <div className={`flex items-center ${isRTL ? 'space-x-reverse gap-2' : 'space-x-2'}`}>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>{t('documents.uploading')}</span>
                            </div>
                          ) : (
                            <div className={`flex items-center ${isRTL ? 'space-x-reverse gap-2' : 'space-x-2'}`}>
                              <Upload className="h-4 w-4" />
                              <span>{t('documents.uploadAndAssign')}</span>
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