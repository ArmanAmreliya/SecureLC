import axios from "axios";

// Cloudinary configuration - using direct values since env vars don't work reliably in React Native
const CLOUD_NAME = "drqnxzxfk"; // Your correct Cloud Name
const API_KEY = "266768572715496"; // Your API Key
const API_SECRET = "l5VrgvvNaYW-wi9UcEMYvjntDPY"; // Your API Secret
const UPLOAD_PRESET = "snvsrrzu"; // Your correct Upload Preset name

console.log("Cloudinary Config - Cloud Name:", CLOUD_NAME);
console.log("Cloudinary Config - API Key:", API_KEY);
console.log("Cloudinary Config - Upload Preset:", UPLOAD_PRESET);

export const uploadAudioToCloudinary = async (fileUri) => {
  // Create the form data to send to the API
  const formData = new FormData();

  // The 'uri' is the local path to your audio file
  formData.append("file", {
    uri: fileUri,
    type: "audio/m4a", // Adjust the type if your recording format is different
    name: "upload.m4a",
  });

  // The upload_preset is required for unsigned uploads
  formData.append("upload_preset", UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

  try {
    console.log("Uploading to Cloudinary...");
    console.log("Upload URL:", url);
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // The secure_url is the public URL of the uploaded file
    const { secure_url } = response.data;
    console.log("Upload successful! URL:", secure_url);
    return secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:");
    console.error("Status:", error.response?.status);
    console.error("Status Text:", error.response?.statusText);
    console.error("Error Data:", error.response?.data);
    console.error("Full Error:", error.message);

    // Check for specific API key errors
    if (error.response?.status === 401) {
      console.error("❌ Authentication failed - Check your API key and secret");
    } else if (error.response?.status === 400) {
      console.error("❌ Bad request - Check upload preset and file format");
    }

    return null;
  }
};
