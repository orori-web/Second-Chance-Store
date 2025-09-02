const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.uploader.upload('test-image.jpg', { folder: 'second-chance-products' })
  .then(result => console.log('Upload successful:', result))
  .catch(err => console.error('Upload failed:', err));
