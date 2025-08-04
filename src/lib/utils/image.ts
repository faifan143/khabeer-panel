/**
 * Utility functions for handling images in the Khabeer panel
 */

// Get the backend base URL for images
const getBackendBaseUrl = (): string => {
    // Use dedicated environment variable for backend base URL
    const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL

    if (backendBaseUrl) {
        return backendBaseUrl
    }

    // Fallback: use API URL and remove /api suffix
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
    const baseUrl = apiUrl.replace('/api', '')

    // Ensure we're using the correct backend URL for images
    return baseUrl || 'http://localhost:3001'
}

/**
 * Constructs a full image URL by prepending the backend base URL
 * @param imagePath - The image path from the backend (e.g., "/uploads/filename.png")
 * @returns Full image URL
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) {
        return '' // Return empty string for no image
    }

    // If the image path already starts with http/https, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
    }

    // If the image path starts with /uploads, prepend the backend base URL
    if (imagePath.startsWith('/uploads/')) {
        return `${getBackendBaseUrl()}${imagePath}`
    }

    // If it's just a filename, assume it's in uploads directory
    if (!imagePath.startsWith('/')) {
        return `${getBackendBaseUrl()}/uploads/${imagePath}`
    }

    // For any other path, prepend the backend base URL
    return `${getBackendBaseUrl()}${imagePath}`
}

/**
 * Constructs a full image URL for categories
 * @param categoryImage - The category image path
 * @returns Full image URL
 */
export const getCategoryImageUrl = (categoryImage: string | null | undefined): string => {
    return getImageUrl(categoryImage)
}

/**
 * Constructs a full image URL for services
 * @param serviceImage - The service image path
 * @returns Full image URL
 */
export const getServiceImageUrl = (serviceImage: string | null | undefined): string => {
    return getImageUrl(serviceImage)
}

/**
 * Constructs a full image URL for providers
 * @param providerImage - The provider image path
 * @returns Full image URL
 */
export const getProviderImageUrl = (providerImage: string | null | undefined): string => {
    return getImageUrl(providerImage)
}

/**
 * Constructs a full image URL for users
 * @param userImage - The user image path
 * @returns Full image URL
 */
export const getUserImageUrl = (userImage: string | null | undefined): string => {
    return getImageUrl(userImage)
}

/**
 * Checks if an image URL is valid and accessible
 * @param imageUrl - The image URL to check
 * @returns Promise<boolean>
 */
export const isValidImageUrl = async (imageUrl: string): Promise<boolean> => {
    if (!imageUrl) return false

    try {
        const response = await fetch(imageUrl, { method: 'HEAD' })
        return response.ok
    } catch (error) {
        console.warn('Image validation failed:', error)
        return false
    }
} 