import axios from "axios";

const CLOUD_NAME = "snvsrrzu"; // Get from Cloudinary dashboard
const UPLOAD_PRESET = "unsigned"; // The unsigned preset you created

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

  const url = `https://api.cloudinary.com/v1_1/${snvsrrzu}/video/upload`;

  try {
    console.log("Uploading to Cloudinary...");
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
    console.error(
      "Error uploading to Cloudinary:",
      error.response?.data || error.message
    );
    return null;
  }
};
