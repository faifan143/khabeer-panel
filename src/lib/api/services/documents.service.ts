import { api } from '../axios'

export interface Document {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
  uploadedBy?: string
}

export interface UploadDocumentResponse {
  message: string
  documents: Document[]
}

export interface ProviderDocumentsResponse {
  documents: Document[]
  verificationStatus: 'pending' | 'approved' | 'rejected'
  adminNotes?: string
}

export class DocumentsService {
  static async uploadDocuments(
    files: File[]
  ): Promise<UploadDocumentResponse> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('documents', file)
    })

    const response = await api.post<UploadDocumentResponse>('/files/upload-documents-admin', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    })

    return response.data
  }

  static async getProviderDocuments(providerId: number): Promise<ProviderDocumentsResponse> {
    const response = await api.get<ProviderDocumentsResponse>(`/providers/${providerId}/documents`)
    return response.data
  }

  static async addDocumentsToProvider(providerId: number, documents: string[]): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/provider-verification/admin/${providerId}/documents`, {
      documents
    })
    return response.data
  }

  static async removeDocumentFromProvider(providerId: number, documentUrl: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/provider-verification/admin/${providerId}/documents`, {
      data: { documentUrl }
    })
    return response.data
  }

  static async approveProviderVerification(providerId: number, adminNotes?: string): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/provider-verification/admin/${providerId}/approve`, {
      adminNotes
    })
    return response.data
  }

  static async rejectProviderVerification(providerId: number, adminNotes: string): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/provider-verification/admin/${providerId}/reject`, {
      adminNotes
    })
    return response.data
  }

  static async getVerificationStats(): Promise<{
    pending: number
    approved: number
    rejected: number
    total: number
  }> {
    const response = await api.get('/provider-verification/stats')
    return response.data
  }
} 