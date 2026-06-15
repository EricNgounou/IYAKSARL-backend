function extractPublicId(url) {
  try {
    // 1. Remove the domain part of the URL
    const baseUrlParts = url.split("/upload/");
    if (baseUrlParts.length < 2) return null;

    // 2. Get everything after '/upload/' (e.g., 'v1620000/my_folder/image.jpg')
    const pathAfterUpload = baseUrlParts[1];

    // 3. Remove the version string if it exists (e.g., 'v12345678/')
    const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, "");

    // 4. Remove the file extension at the very end (e.g., '.jpg', '.png')
    const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (error) {
    return null;
  }
}

module.exports = {
  extractPublicId,
};
