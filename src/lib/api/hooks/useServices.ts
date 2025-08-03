import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ServicesService } from '../services/services.service'
import { 
  Service, 
  CreateServiceDto, 
  UpdateServiceDto, 
  Category, 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  PaginatedResponse 
} from '../types'

// Services hooks
export const useServices = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['services', page, limit],
    queryFn: () => ServicesService.getAllServices(page, limit),
  })
}

export const useService = (id: number) => {
  return useQuery({
    queryKey: ['services', id],
    queryFn: () => ServicesService.getServiceById(id),
    enabled: !!id,
  })
}

export const useCreateService = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (serviceData: CreateServiceDto) => ServicesService.createService(serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })
}

export const useUpdateService = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, serviceData }: { id: number; serviceData: UpdateServiceDto }) => 
      ServicesService.updateService(id, serviceData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      queryClient.invalidateQueries({ queryKey: ['services', id] })
    },
  })
}

export const useDeleteService = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => ServicesService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })
}

export const useServicesByCategory = (categoryId: number, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['services', 'category', categoryId, page, limit],
    queryFn: () => ServicesService.getServicesByCategory(categoryId, page, limit),
    enabled: !!categoryId,
  })
}

export const useSearchServices = (query: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['services', 'search', query, page, limit],
    queryFn: () => ServicesService.searchServices(query, page, limit),
    enabled: !!query,
  })
}

export const useTopServices = (limit: number = 5) => {
  return useQuery({
    queryKey: ['services', 'top', limit],
    queryFn: () => ServicesService.getTopServices(limit),
  })
}

// Categories hooks
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => ServicesService.getAllCategories(),
  })
}

export const useCategory = (id: number) => {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => ServicesService.getCategoryById(id),
    enabled: !!id,
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (categoryData: CreateCategoryDto) => ServicesService.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, categoryData }: { id: number; categoryData: UpdateCategoryDto }) => 
      ServicesService.updateCategory(id, categoryData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories', id] })
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => ServicesService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useSearchCategories = (query: string) => {
  return useQuery({
    queryKey: ['categories', 'search', query],
    queryFn: () => ServicesService.searchCategories(query),
    enabled: !!query,
  })
}