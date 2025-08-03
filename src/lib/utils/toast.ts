import toast from 'react-hot-toast'

// Success toast
export const showSuccess = (message: string, title?: string) => {
  toast.success(title ? `${title}\n${message}` : message, {
    duration: 4000,
  })
}

// Error toast
export const showError = (message: string, title?: string) => {
  toast.error(title ? `${title}\n${message}` : message, {
    duration: 5000,
  })
}

// Info toast
export const showInfo = (message: string, title?: string) => {
  toast(title ? `${title}\n${message}` : message, {
    duration: 4000,
    icon: 'ℹ️',
  })
}

// Warning toast
export const showWarning = (message: string, title?: string) => {
  toast(title ? `${title}\n${message}` : message, {
    duration: 4000,
    icon: '⚠️',
  })
}

// Loading toast
export const showLoading = (message: string) => {
  return toast.loading(message, {
    duration: Infinity,
  })
}

// Dismiss toast
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId)
}

// Promise toast
export const showPromise = <T>(
  promise: Promise<T>,
  {
    loading = 'Loading...',
    success = 'Success!',
    error = 'Error occurred',
  }: {
    loading?: string
    success?: string
    error?: string
  } = {}
) => {
  return toast.promise(promise, {
    loading,
    success,
    error,
  })
}

// Custom toast with custom styling
export const showCustom = (
  message: string,
  options?: {
    icon?: string
    duration?: number
    style?: React.CSSProperties
  }
) => {
  return toast(message, {
    duration: options?.duration || 4000,
    icon: options?.icon,
    style: options?.style,
  })
}

// Toast for form validation errors
export const showValidationError = (errors: Record<string, any>) => {
  const errorMessages = Object.values(errors)
    .filter(Boolean)
    .map((error: any) => error.message || error)
    .join('\n')
  
  if (errorMessages) {
    showError(errorMessages, 'Validation Error')
  }
}

// Toast for API errors
export const showApiError = (error: any) => {
  const message = error?.message || error?.error || 'An unexpected error occurred'
  showError(message, 'API Error')
}

// Toast for network errors
export const showNetworkError = () => {
  showError('Please check your internet connection and try again', 'Network Error')
}

// Toast for authentication errors
export const showAuthError = (message?: string) => {
  showError(message || 'Authentication failed. Please try again.', 'Authentication Error')
}

// Toast for permission errors
export const showPermissionError = () => {
  showError('You do not have permission to perform this action.', 'Permission Denied')
} 