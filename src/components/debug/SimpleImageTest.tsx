"use client"

import { getImageUrl } from "@/lib/utils/image"

export function SimpleImageTest() {
    const testImage = '1754252654623-779371817.png'
    const imageUrl = getImageUrl(testImage)

    return (
        <div className="p-8 space-y-6">
            <h2 className="text-xl font-bold">Simple Image Test</h2>

            <div className="space-y-4">
                <div>
                    <h3 className="font-semibold mb-2">Test Image URL:</h3>
                    <p className="text-sm bg-gray-100 p-2 rounded">{imageUrl}</p>
                </div>

                <div>
                    <h3 className="font-semibold mb-2">Direct Image (no container):</h3>
                    <img
                        src={imageUrl}
                        alt="Test"
                        className="w-32 h-32 object-cover border-2 border-gray-300"
                        onLoad={() => console.log('✅ Image loaded successfully')}
                        onError={(e) => console.error('❌ Image failed to load:', e)}
                    />
                </div>

                <div>
                    <h3 className="font-semibold mb-2">Image in Container (like original):</h3>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                        <img
                            src={imageUrl}
                            alt="Test"
                            className="w-full h-full object-cover"
                            onLoad={() => console.log('✅ Container image loaded successfully')}
                            onError={(e) => console.error('❌ Container image failed to load:', e)}
                        />
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-2">Image with Fallback:</h3>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                        {testImage ? (
                            <img
                                src={imageUrl}
                                alt="Test"
                                className="w-full h-full object-cover"
                                onLoad={() => console.log('✅ Fallback image loaded successfully')}
                                onError={(e) => console.error('❌ Fallback image failed to load:', e)}
                            />
                        ) : (
                            <div className="w-6 h-6 text-white">📦</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Debug Info:</h3>
                <div className="text-sm space-y-1">
                    <p><strong>Input:</strong> {testImage}</p>
                    <p><strong>Generated URL:</strong> {imageUrl}</p>
                    <p><strong>Backend Base URL:</strong> {process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'Not set'}</p>
                </div>
            </div>
        </div>
    )
} 