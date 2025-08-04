"use client"

import { getCategoryImageUrl, getServiceImageUrl } from "@/lib/utils/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ImageTest() {
    // Test image paths
    const testImages = [
        '/uploads/1754252654623-779371817.png',
        '1754252654623-779371817.png',
        '1754234785341-217718138.png',
        '1754234787168-351214059.png',
        'http://localhost:3001/uploads/1754252654623-779371817.png',
        null,
        undefined
    ]

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>🖼️ Image Loading Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testImages.map((imagePath, index) => {
                        const categoryUrl = getCategoryImageUrl(imagePath)
                        const serviceUrl = getServiceImageUrl(imagePath)

                        return (
                            <Card key={index} className="p-4">
                                <h4 className="font-semibold mb-2">Test {index + 1}</h4>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Input:</strong> {imagePath || 'null/undefined'}</p>
                                    <p><strong>Category URL:</strong> {categoryUrl}</p>
                                    <p><strong>Service URL:</strong> {serviceUrl}</p>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs">Category:</span>
                                        <div className="w-8 h-8 bg-blue-500 rounded overflow-hidden">
                                            {imagePath ? (
                                                <img
                                                    src={categoryUrl}
                                                    alt="Test"
                                                    className="w-full h-full object-cover"
                                                    onLoad={() => console.log(`✅ Category image ${index + 1} loaded:`, categoryUrl)}
                                                    onError={(e) => console.error(`❌ Category image ${index + 1} failed:`, categoryUrl, e)}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white text-xs">N/A</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs">Service:</span>
                                        <div className="w-8 h-8 bg-green-500 rounded overflow-hidden">
                                            {imagePath ? (
                                                <img
                                                    src={serviceUrl}
                                                    alt="Test"
                                                    className="w-full h-full object-cover"
                                                    onLoad={() => console.log(`✅ Service image ${index + 1} loaded:`, serviceUrl)}
                                                    onError={(e) => console.error(`❌ Service image ${index + 1} failed:`, serviceUrl, e)}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white text-xs">N/A</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">🔍 Debug Information</h4>
                    <div className="text-sm space-y-1">
                        <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
                        <p><strong>NEXT_PUBLIC_BACKEND_BASE_URL:</strong> {process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'Not set'}</p>
                        <p><strong>Backend Base URL (calculated):</strong> {
                            process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
                            (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace('/api', '') ||
                            'http://localhost:3001'
                        }</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 