import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DocumentsService, Document, ProviderDocumentsResponse } from '../services/documents.service'
import toast from 'react-hot-toast'

export const useProviderDocuments = (providerId: number) => {
  return useQuery({
    queryKey: ['provider-documents', providerId],
    queryFn: () => DocumentsService.getProviderDocuments(providerId),
    enabled: !!providerId,
  })
}

export const useUploadDocuments = () => {
  return useMutation({
    mutationFn: ({ files, onProgress }: { files: File[], onProgress?: (progress: { [key: string]: number }) => void }) =>
      DocumentsService.uploadDocuments(files, onProgress),
    onSuccess: () => {
      toast.success('Documents uploaded successfully')
    },
    onError: (error) => {
      console.error('Upload error:', error)
      toast.error('Failed to upload documents')
    }
  })
}

export const useAddDocumentsToProvider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ providerId, documents }: { providerId: number; documents: string[] }) =>
      DocumentsService.addDocumentsToProvider(providerId, documents),
    onSuccess: (data, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: ['provider-documents', providerId] })
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      toast.success('Documents added successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add documents')
    },
  })
}

export const useRemoveDocumentFromProvider = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ providerId, documentUrl }: { providerId: number; documentUrl: string }) =>
      DocumentsService.removeDocumentFromProvider(providerId, documentUrl),
    onSuccess: (data, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: ['provider-documents', providerId] })
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      toast.success('Document removed successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove document')
    },
  })
}

export const useApproveProviderVerification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ providerId, adminNotes }: { providerId: number; adminNotes?: string }) =>
      DocumentsService.approveProviderVerification(providerId, adminNotes),
    onSuccess: (data, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: ['provider-documents', providerId] })
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      queryClient.invalidateQueries({ queryKey: ['provider-stats'] })
      toast.success('Provider verification approved')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve verification')
    },
  })
}

export const useRejectProviderVerification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ providerId, adminNotes }: { providerId: number; adminNotes: string }) =>
      DocumentsService.rejectProviderVerification(providerId, adminNotes),
    onSuccess: (data, { providerId }) => {
      queryClient.invalidateQueries({ queryKey: ['provider-documents', providerId] })
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      queryClient.invalidateQueries({ queryKey: ['provider-stats'] })
      toast.success('Provider verification rejected')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject verification')
    },
  })
}

export const useVerificationStats = () => {
  return useQuery({
    queryKey: ['verification-stats'],
    queryFn: () => DocumentsService.getVerificationStats(),
  })
} 