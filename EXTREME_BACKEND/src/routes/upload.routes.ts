import { Router } from 'express';
import { uploadFile, uploadMultipleFiles, deleteFile } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
router.use(authenticate);

router.post('/', upload.single('file'), uploadFile);
router.post('/multiple', upload.array('files', 10), uploadMultipleFiles);
router.delete('/:filename', deleteFile);

export default router;
