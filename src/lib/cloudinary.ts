/**
 * Cloudinary Upload Utility
 * Handles image uploads to Cloudinary cloud storage
 */

import imageCompression from 'browser-image-compression';

const CLOUD_NAME = "dw1ancaye";
const UPLOAD_PRESET = "banhchi_uploads"; // You'll need to create this in Cloudinary dashboard

/**
 * Upload an image file to Cloudinary with aggressive compression
 * @param file - The file to upload
 * @param folder - Optional folder name in Cloudinary
 * @param type - Type of image to determine compression level
 * @returns Promise with the uploaded image URL
 */
export const uploadToCloudinary = async (
  file: File,
  folder: string = "banhchi",
  type: 'banner' | 'thumbnail' | 'gallery' = 'gallery'
): Promise<string> => {
  try {
    // 1. Determine compression options based on type
    let maxSizeMB = 0.5;
    let maxWidthOrHeight = 1200;

    if (type === 'banner') {
      maxSizeMB = 0.8;
      maxWidthOrHeight = 1600;
    } else if (type === 'thumbnail') {
      maxSizeMB = 0.15;
      maxWidthOrHeight = 400;
    } else if (type === 'gallery') {
      maxSizeMB = 0.4;
      maxWidthOrHeight = 1000;
    }

    const options = {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.75
    };
    
    const compressedFile = await imageCompression(file, options);
    
    // 2. Prepare Form Data
    const formData = new FormData();
    formData.append("file", compressedFile);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", folder);
    formData.append("cloud_name", CLOUD_NAME);

    // 3. Perform Upload
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || response.statusText;
      console.error("Cloudinary detailed error:", errorData);
      throw new Error(`Cloudinary upload failed: ${errorMessage}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    throw new Error(error.message || "Failed to upload image to Cloudinary");
  }
};

/**
 * Upload multiple images to Cloudinary sequentially to avoid network congestion
 * @param files - Array of files to upload
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise with array of uploaded image URLs
 */
export const uploadMultipleToCloudinary = async (
  files: File[],
  folder: string = "banhchi"
): Promise<string[]> => {
  const results: string[] = [];
  
  // Process sequentially to be gentle on browser memory and network
  for (const file of files) {
    const url = await uploadToCloudinary(file, folder, 'gallery');
    results.push(url);
  }
  
  return results;
};

/**
 * Get optimized Cloudinary URL with transformations
 * @param url - Original Cloudinary URL
 * @param width - Desired width
 * @param height - Desired height
 * @param quality - Image quality (auto, best, good, eco, low)
 * @returns Transformed URL
 */
export const getOptimizedCloudinaryUrl = (
  url: string,
  width?: number,
  height?: number,
  quality: string = "auto"
): string => {
  if (!url || !url.includes("cloudinary.com")) return url;

  const transformations= [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  
  // Use auto format and specific quality
  // auto:eco is more aggressive compression
  const q = quality === 'auto' ? 'auto:eco' : quality;
  transformations.push(`q_${q}`, "f_auto");

  const transformString = transformations.join(",");
  return url.replace("/upload/", `/upload/${transformString}/`);
};

/**
 * Quick helper for standard compressed image
 */
export const compressImage = (url: string, size: 'thumbnail' | 'large' | 'banner' = 'large'): string => {
   if (!url) return "";
   switch (size) {
      case 'thumbnail': return getOptimizedCloudinaryUrl(url, 400, 300, 'auto:eco');
      case 'banner': return getOptimizedCloudinaryUrl(url, 1200, 600, 'auto:eco');
      default: return getOptimizedCloudinaryUrl(url, 800, 0, 'auto:eco');
   }
};
