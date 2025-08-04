/**
 * Debug script to test image URL construction
 * Run this in the browser console to verify image URLs
 */

// Test the image URL construction
function debugImageUrls() {
  console.log("🔍 Debugging Image URLs...\n");

  // Test environment variables
  console.log("Environment Variables:");
  console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
  console.log(
    "NEXT_PUBLIC_BACKEND_BASE_URL:",
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL
  );
  console.log("");

  // Test image URL construction
  const testImages = [
    "/uploads/category-123.png",
    "service-456.png",
    "http://example.com/image.jpg",
    null,
    undefined,
  ];

  console.log("Image URL Tests:");
  testImages.forEach((imagePath, index) => {
    try {
      // Simulate the getImageUrl function
      const backendBaseUrl =
        process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
        (
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        ).replace("/api", "") ||
        "http://localhost:3001";

      let result = "";
      if (imagePath) {
        if (
          imagePath.startsWith("http://") ||
          imagePath.startsWith("https://")
        ) {
          result = imagePath;
        } else if (imagePath.startsWith("/uploads/")) {
          result = `${backendBaseUrl}${imagePath}`;
        } else if (!imagePath.startsWith("/")) {
          result = `${backendBaseUrl}/uploads/${imagePath}`;
        } else {
          result = `${backendBaseUrl}${imagePath}`;
        }
      }

      console.log(`Test ${index + 1}:`);
      console.log(`  Input: ${imagePath}`);
      console.log(`  Output: ${result}`);
      console.log(`  Backend Base URL: ${backendBaseUrl}`);
      console.log("");
    } catch (error) {
      console.log(`Test ${index + 1} failed:`, error);
    }
  });

  // Test actual image access
  console.log("Testing Image Access:");
  const testImageUrl =
    "http://localhost:3001/uploads/1754252654623-779371817.png";
  console.log(`Testing: ${testImageUrl}`);

  fetch(testImageUrl, { method: "HEAD" })
    .then((response) => {
      console.log(
        `✅ Image accessible: ${response.status} ${response.statusText}`
      );
      console.log("Headers:", Object.fromEntries(response.headers.entries()));
    })
    .catch((error) => {
      console.log(`❌ Image not accessible: ${error.message}`);
    });
}

// Export for browser console
if (typeof window !== "undefined") {
  window.debugImageUrls = debugImageUrls;
  console.log("Debug function available: debugImageUrls()");
}

// Run if in Node.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = { debugImageUrls };
}
