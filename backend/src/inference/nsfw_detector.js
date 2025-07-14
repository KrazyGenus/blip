const fs = require('fs');
const fetch = require('node-fetch');
const env = require('../../env-loader');

const HUGGINGFACE_NSFW_KEY = env.HUGGINGFACE_API_KEY
async function modelNSFWHuggingFace(frameObject) {
  console.log('In hugging face NSFW MODEL', frameObject);
  const buffer = fs.readFileSync(frameObject.framePath);

  const response = await fetch(
    'https://router.huggingface.co/hf-inference/models/Freepik/nsfw_image_detector',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ HUGGINGFACE_NSFW_KEY }`,
        'Content-Type': 'image/jpeg',
      },
      body: buffer,
    }
  );

  const result = await response.json();
  console.log('in inference ', result);
  return;
}
module.exports = { modelNSFWHuggingFace };