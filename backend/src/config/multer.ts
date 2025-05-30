import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary';

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: () => ({
    folder: 'escalando-fronteras', 
    allowed_formats: ['jpg', 'png'],
    transformation: [{ quality: 'auto' }],
  }),
});

const upload = multer({
  storage: imageStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPG y PNG'));
    }
  },
});

export default upload;
