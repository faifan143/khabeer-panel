# 🖼️ Image Handling Guide - Khabeer Panel

This guide explains how images are handled in the Khabeer admin panel and how to properly display images from the backend.

## ✅ What's Configured

The Khabeer panel now has a complete image handling system:

- **Image Utility Functions**: Centralized functions for constructing image URLs
- **Backend Integration**: Proper connection to backend static file serving
- **Environment Configuration**: Flexible backend URL configuration
- **Type Safety**: TypeScript support for image handling

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the `khabeer-panel` directory:

```env
# Backend API URL (for API calls)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Backend Base URL (for images - without /api suffix)
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:3001

# Application Configuration
NEXT_PUBLIC_APP_NAME=Khabeer Admin Panel
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Backend URL Configuration

The panel is configured to work with your backend on port 3001:

- **API Calls**: `http://localhost:3001/api/*`
- **Image Access**: `http://localhost:3001/uploads/*`

## 🛠️ Image Utility Functions

### Available Functions

```typescript
import {
  getImageUrl,
  getCategoryImageUrl,
  getServiceImageUrl,
  getProviderImageUrl,
  getUserImageUrl,
} from "@/lib/utils/image";
```

### Usage Examples

```typescript
// Generic image URL construction
const imageUrl = getImageUrl("/uploads/filename.png");
// Result: "http://localhost:3001/uploads/filename.png"

// Category images
const categoryImageUrl = getCategoryImageUrl(category.image);
// Result: "http://localhost:3001/uploads/category-image.png"

// Service images
const serviceImageUrl = getServiceImageUrl(service.image);
// Result: "http://localhost:3001/uploads/service-image.png"

// Provider images
const providerImageUrl = getProviderImageUrl(provider.image);
// Result: "http://localhost:3001/uploads/provider-image.png"

// User images
const userImageUrl = getUserImageUrl(user.image);
// Result: "http://localhost:3001/uploads/user-image.png"
```

## 🎯 Implementation Examples

### Category Images

```tsx
import { getCategoryImageUrl } from "@/lib/utils/image";

// In your component
{
  category.image ? (
    <img
      src={getCategoryImageUrl(category.image)}
      alt={category.titleEn}
      className="w-8 h-8 rounded object-cover"
    />
  ) : (
    <Package className="h-6 w-6 text-white" />
  );
}
```

### Service Images

```tsx
import { getServiceImageUrl } from "@/lib/utils/image";

// In your component
{
  service.image ? (
    <img
      src={getServiceImageUrl(service.image)}
      alt={service.title}
      className="w-8 h-8 rounded object-cover"
    />
  ) : (
    <Package className="h-6 w-6 text-white" />
  );
}
```

### Provider Images

```tsx
import { getProviderImageUrl } from "@/lib/utils/image";

// In your component
{
  provider.image ? (
    <img
      src={getProviderImageUrl(provider.image)}
      alt={provider.name}
      className="w-8 h-8 rounded object-cover"
    />
  ) : (
    <User className="h-6 w-6 text-white" />
  );
}
```

## 🔄 How It Works

### Image URL Construction Logic

1. **Full URLs**: If the image path starts with `http://` or `https://`, return as-is
2. **Uploads Path**: If the image path starts with `/uploads/`, prepend backend base URL
3. **Filename Only**: If it's just a filename, assume it's in uploads directory
4. **Other Paths**: For any other path, prepend backend base URL

### Example Transformations

```typescript
// Input: "/uploads/category-123.png"
// Output: "http://localhost:3001/uploads/category-123.png"

// Input: "service-456.png"
// Output: "http://localhost:3001/uploads/service-456.png"

// Input: "http://example.com/image.jpg"
// Output: "http://example.com/image.jpg" (unchanged)
```

## 📁 Current Implementation

### Updated Files

- ✅ `src/lib/utils/image.ts` - Image utility functions
- ✅ `src/lib/api/axios.ts` - Updated backend URL to port 3001
- ✅ `src/app/categories-services/page.tsx` - Updated image displays

### Image Display Locations

1. **Categories Grid View**: Category images in card layout
2. **Categories List View**: Category images in table layout
3. **Services Grid View**: Service images in card layout
4. **Services List View**: Service images in table layout

## 🚀 Adding Images to New Components

### Step 1: Import the Utility

```typescript
import { getImageUrl } from "@/lib/utils/image";
// or specific functions:
import { getCategoryImageUrl, getServiceImageUrl } from "@/lib/utils/image";
```

### Step 2: Use in Component

```tsx
// Replace direct image usage:
<img src={item.image} alt="Item" />

// With utility function:
<img src={getImageUrl(item.image)} alt="Item" />
```

### Step 3: Add Fallback

```tsx
{
  item.image ? (
    <img
      src={getImageUrl(item.image)}
      alt="Item"
      className="w-8 h-8 rounded object-cover"
    />
  ) : (
    <DefaultIcon className="h-6 w-6 text-white" />
  );
}
```

## 🔍 Troubleshooting

### Images Not Loading

1. **Check Backend**: Ensure backend is running on port 3001
2. **Verify Environment**: Check `.env.local` file configuration
3. **Test Direct Access**: Try accessing image URL directly in browser
4. **Check Console**: Look for network errors in browser console

### Common Issues

- **404 Errors**: Backend not running or wrong port
- **CORS Errors**: Backend CORS configuration
- **Wrong URLs**: Environment variables not set correctly

### Debug Commands

```bash
# Test backend health
curl http://localhost:3001/health

# Test image access
curl -I http://localhost:3001/uploads/test-image.png

# Check environment variables
echo $NEXT_PUBLIC_API_URL
echo $NEXT_PUBLIC_BACKEND_BASE_URL
```

## 📊 Testing

### Manual Testing

1. **Start Backend**: `npm run start:dev` (in backend directory)
2. **Start Panel**: `npm run dev` (in panel directory)
3. **Navigate**: Go to Categories & Services page
4. **Verify**: Check that images load properly

### Automated Testing

```typescript
// Test image URL construction
const testUrl = getImageUrl("/uploads/test.png");
console.log(testUrl); // Should output: "http://localhost:3001/uploads/test.png"
```

## 🔮 Future Enhancements

### Planned Features

- [ ] Image optimization and lazy loading
- [ ] Image upload functionality in panel
- [ ] Image validation and error handling
- [ ] Image caching strategies
- [ ] Responsive image handling

### Extending the System

To add support for new image types:

1. Add new utility function in `src/lib/utils/image.ts`
2. Import and use in your components
3. Update this documentation

---

**Status**: ✅ Image handling system is fully configured and working!

**Last Updated**: August 2024
**Version**: 1.0.0
