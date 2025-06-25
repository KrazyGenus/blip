const { GoogleGenAI } = require('@google/genai');
require('dotenv').config()
const fs = require('fs/promises');


GOOGLE_GEMENI_API_KEY = process.env.GOOGLE_GEMENI_BLIP_API_KEY;
console.log(GOOGLE_GEMENI_API_KEY);

async function googleGemeni(imagePath) {
    const googleGemeniVision = new GoogleGenAI({apiKey: GOOGLE_GEMENI_API_KEY });
    const base64ImageFile = await fs.readFile(imagePath, { encoding: 'base64' });
    const contents = [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64ImageFile,
          },
        },
        { text: "Caption this image." },
      ];
    console.log(googleGemeniVision);
    const response = await googleGemeniVision.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
      });
    console.log(response.text);
}
