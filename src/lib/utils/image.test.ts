/**
 * Simple test file to verify image URL construction
 * Run this in browser console or as a test
 */

import { getImageUrl, getCategoryImageUrl, getServiceImageUrl } from './image'

// Test cases
const testCases = [
    {
        input: '/uploads/category-123.png',
        expected: 'http://localhost:3001/uploads/category-123.png',
        description: 'Uploads path with leading slash'
    },
    {
        input: 'service-456.png',
        expected: 'http://localhost:3001/uploads/service-456.png',
        description: 'Filename only'
    },
    {
        input: 'http://example.com/image.jpg',
        expected: 'http://example.com/image.jpg',
        description: 'Full URL (unchanged)'
    },
    {
        input: 'https://cdn.example.com/avatar.png',
        expected: 'https://cdn.example.com/avatar.png',
        description: 'HTTPS URL (unchanged)'
    },
    {
        input: null,
        expected: '',
        description: 'Null input'
    },
    {
        input: undefined,
        expected: '',
        description: 'Undefined input'
    },
    {
        input: '',
        expected: '',
        description: 'Empty string'
    }
]

// Run tests
export function runImageTests() {
    console.log('🧪 Testing Image URL Construction...\n')

    let passed = 0
    let failed = 0

    testCases.forEach((testCase, index) => {
        const result = getImageUrl(testCase.input)
        const success = result === testCase.expected

        if (success) {
            passed++
            console.log(`✅ Test ${index + 1}: ${testCase.description}`)
        } else {
            failed++
            console.log(`❌ Test ${index + 1}: ${testCase.description}`)
            console.log(`   Expected: ${testCase.expected}`)
            console.log(`   Got:      ${result}`)
        }
    })

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`)

    if (failed === 0) {
        console.log('🎉 All tests passed! Image URL construction is working correctly.')
    } else {
        console.log('⚠️  Some tests failed. Check the implementation.')
    }

    return { passed, failed }
}

// Test specific functions
export function testSpecificFunctions() {
    console.log('\n🔧 Testing Specific Functions...\n')

    const categoryImage = '/uploads/category-test.png'
    const serviceImage = 'service-test.png'

    console.log('Category Image URL:', getCategoryImageUrl(categoryImage))
    console.log('Service Image URL:', getServiceImageUrl(serviceImage))

    console.log('\n✅ Specific function tests completed!')
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    (window as any).runImageTests = runImageTests
        (window as any).testSpecificFunctions = testSpecificFunctions
} 