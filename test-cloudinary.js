// Test Cloudinary Configuration
// Run this in your browser console or as a separate test

const testCloudinaryConfig = () => {
  const cloudinaryUrl =
    "cloudinary://266768572715496:l5VrgvvNaYW-wi9UcEMYvjntDPY@drqnxzxfk";
  const urlParts = cloudinaryUrl.match(/cloudinary:\/\/(\d+):([^@]+)@([^\/]+)/);

  console.log("🔧 Cloudinary Configuration Test:");
  console.log("Cloud Name:", urlParts ? urlParts[3] : "❌ Not found");
  console.log("API Key:", urlParts ? urlParts[1] : "❌ Not found");
  console.log("API Secret:", urlParts ? urlParts[2] : "❌ Not found");

  // Test API endpoint
  const testUrl = `https://api.cloudinary.com/v1_1/${urlParts[3]}/image/upload`;
  console.log("API Endpoint:", testUrl);
};

// Uncomment to test:
// testCloudinaryConfig();
