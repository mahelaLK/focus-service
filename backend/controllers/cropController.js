import axios from 'axios';
import sharp from 'sharp';
import FormData from 'form-data';

const ORIG_PATH = 'assets/media/orig';

//  fetch original image from  source domain
const fetchImage = async (domain, filename) => {
  const url = `https://${domain}/${ORIG_PATH}/${filename}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image from ${url} - HTTP ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer)
};

// crop image in memory using sharp
const cropImage = async (imageBuffer, focusX, focusY, thumbWidth, thumbHeight) => {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const origW = metadata.width;
  const origH = metadata.height;

  //  convert percentage positions to pixels
  let left = Math.round(focusX*origW);
  let top = Math.round(focusY*origH);

  //  clamp so box never exceeds image boundaries
  left = Math.max(0, Math.min(left, Math.max(0, origW-thumbWidth)));
  top = Math.max(0, Math.min(top, Math.max(0, origH-thumbHeight)));

  const cropW = Math.min(thumbWidth, origW-left);
  const cropH = Math.min(thumbHeight, origH-top);

  return await image
    .extract({left, top, width: cropW, height: cropH})
    .resize(thumbWidth, thumbHeight, {fit: 'fill'})
    .jpeg({quality: 90})
    .toBuffer();
};

//  post cropped image buffer to callback URL
const postBack = async (buffer, callbackUrl, filename) => {
  const form = new FormData();
  form.append('image', buffer, {filename, contentType: 'image/jpeg'});

  const res = await fetch(callbackUrl, {
    method: 'POST',
    body: form,
    headers: form.getHeaders()
  });

  if (!res.ok) {
    throw new Error(`Callback failed - ${callbackUrl} responded with HTTP ${res.status}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await res.json();
  }
  return {success: true};
}

//  main controller
export const cropAndPost = async (req, res) => {
  const {domain, filename, width, height, focusX, focusY, callback} = req.body;

  //  validate
  if (!domain || !filename || !width || !height || focusX==null || focusY==null || !callback) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: domain, filename, width, height, focusX, focusY, callback'
    });
  }

  try {
    const imageBuffer = await fetchImage(domain, filename);
    const croppedBuffer = await cropImage(imageBuffer, parseFloat(focusX), parseFloat(focusY), parseInt(width), parseInt(height));
    const callbackRes = await postBack(croppedBuffer, callback, filename);

    return res.json({success: true, callbackResponse: callbackRes});
  } catch (error) {
    console.log('[cropAndPost]', error.message);
    return res.status(500).json({success: false, error: error.message})
  }
}