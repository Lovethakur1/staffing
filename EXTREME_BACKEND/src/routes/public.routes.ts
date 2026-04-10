import { Router } from 'express';
import { listPublicJobs, getPublicJob, submitPublicApplication } from '../controllers/public.controller';
import { upload } from '../middleware/upload';

const router = Router();

// No authentication middleware — these are public endpoints
router.get('/jobs', listPublicJobs);
router.get('/jobs/:id', getPublicJob);
router.post('/jobs/:id/apply', submitPublicApplication);

// Public resume upload (restricted to PDF/DOC only, 5MB max)
router.post('/upload-resume', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file provided.' });
    return;
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({
    url: fileUrl,
    originalName: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
  });
});

export default router;
