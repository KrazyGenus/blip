const fs = require('fs').promises;


/**
 * Reads an image file from a path and converts it into a Gemini API inlineData part.
 * @param {string} filePath - The path to the image file.
 * @returns {Promise<Object>} The Gemini API Part object.
 */
async function fileToGenerativePart(filePath) {
    // Determine the file type. Required by Gemeni when constructing the header
    const mimeType = 'image/jpg';

    // Read the file content
    const imageBuffer = await fs.readFile(filePath);

    // convert the binary data into Base64 for Gemeni requires this
    const base64Data = imageBuffer.toString('base64');

    // Return the structured Part object
    return {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };
}

module.exports = { fileToGenerativePart };