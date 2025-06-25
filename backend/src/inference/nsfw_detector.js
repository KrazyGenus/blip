const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();



async function modelNSFWHuggingFace(imagePath) {
  const buffer = fs.readFileSync(imagePath);

  const response = await fetch(
    'https://api-inference.huggingface.co/models/Falconsai/nsfw_image_detection',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env."HUGGINGFACE_API_KEY"}`,
        'Content-Type': 'image/jpeg',
      },
      body: buffer,
    }
  );

  const result = await response.json();
  result.forEach((item) => {
    if (item.label === 'nsfw') {
      if (item.score <= 0.0001419968466507271) {
        console.log('not safe!');
      }
    }
  })
  return result;
}

modelNSFWHuggingFace('/home/krazygenus/Desktop/a.jpg')
  .then((res) => console.log(JSON.stringify(res)))
  .catch(console.error);

module.exports = { modelNSFWHuggingFace };
