"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FileUpload } from '@/components/ui/file-upload'
import { DocumentViewer } from '@/components/ui/document-viewer'
import {
  useProviderDocuments,
  useUploadDocuments,
  useAddDocumentsToProvider,
  useRemoveDocumentFromProvider,
  useApproveProviderVerification,
  useRejectProviderVerification
} from '@/lib/api/hooks/useDocuments'
import { Provider } from '@/lib/api/types'
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  ShieldCheck,
  ShieldX
} from 'lucide-react'
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
  const [adminNotes, setAdminNotes] = useState('')

  // Hooks
  const { data: documentsData, isLoading: documentsLoading } = useProviderDocuments(provider?.id || 0)
  const uploadDocumentsMutation = useUploadDocuments()
  const addDocumentsMutation = useAddDocumentsToProvider()
  const removeDocumentMutation = useRemoveDocumentFromProvider()
  const approveVerificationMutation = useApproveProviderVerification()
  const rejectVerificationMutation = useRejectProviderVerification()

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
      // First upload the files
      const uploadResult = await uploadDocumentsMutation.mutateAsync(selectedFiles)

      // Then add them to the provider
      if (provider) {
        const documentUrls = uploadResult.documents.map(doc => doc.url)
        await addDocumentsMutation.mutateAsync({
          providerId: provider.id,
          documents: documentUrls
        })
      }

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

  const handleApproveVerification = async () => {
    if (provider) {
      await approveVerificationMutation.mutateAsync({
        providerId: provider.id,
        adminNotes: adminNotes || undefined
      })
      setAdminNotes('')
      onClose()
    }
  }

  const handleRejectVerification = async () => {
    if (!adminNotes.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    if (provider) {
      await rejectVerificationMutation.mutateAsync({
        providerId: provider.id,
        adminNotes: adminNotes
      })
      setAdminNotes('')
      onClose()
    }
  }

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getVerificationStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <ShieldCheck className="h-4 w-4" />
      case 'rejected':
        return <ShieldX className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
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

              {/* Verification Tab */}
              <TabsContent value="verification" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Verification Management</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Current Status */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Current Verification Status</Label>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={getVerificationStatusColor(documentsData?.verificationStatus || 'pending')}
                        >
                          {getVerificationStatusIcon(documentsData?.verificationStatus || 'pending')}
                          <span className="ml-1 capitalize">
                            {documentsData?.verificationStatus || 'pending'}
                          </span>
                        </Badge>
                      </div>
                      {documentsData?.adminNotes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <strong>Admin Notes:</strong> {documentsData.adminNotes}
                        </div>
                      )}
                    </div>

                    {/* Admin Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="adminNotes" className="text-sm font-medium">
                        Admin Notes {documentsData?.verificationStatus === 'pending' && '(Optional)'}
                      </Label>
                      <Textarea
                        id="adminNotes"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder={
                          documentsData?.verificationStatus === 'pending'
                            ? "Add notes about the verification decision..."
                            : "Provide a reason for rejection..."
                        }
                        rows={3}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                      {documentsData?.verificationStatus === 'pending' ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setAdminNotes('')}
                          >
                            Clear
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleRejectVerification}
                            disabled={rejectVerificationMutation.isPending}
                          >
                            {rejectVerificationMutation.isPending ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Rejecting...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <XCircle className="h-4 w-4" />
                                <span>Reject Verification</span>
                              </div>
                            )}
                          </Button>
                          <Button
                            onClick={handleApproveVerification}
                            disabled={approveVerificationMutation.isPending}
                          >
                            {approveVerificationMutation.isPending ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Approving...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4" />
                                <span>Approve Verification</span>
                              </div>
                            )}
                          </Button>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Verification has already been {documentsData?.verificationStatus}
                        </div>
                      )}
                    </div>
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