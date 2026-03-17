import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/helpers';
import { env } from '../config/env';

/**
 * POST /api/upload
 * Upload a single file. Returns the file URL path.
 */
export const uploadFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file provided.' });
    return;
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(201).json({
    message: 'File uploaded successfully.',
    file: {
      url: fileUrl,
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimeType: req.file.mimetype,
    },
  });
});

/**
 * POST /api/upload/multiple
 * Upload multiple files (max 10).
 */
export const uploadMultipleFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No files provided.' });
    return;
  }

  const uploaded = files.map((file) => ({
    url: `/uploads/${file.filename}`,
    originalName: file.originalname,
    filename: file.filename,
    size: file.size,
    mimeType: file.mimetype,
  }));

  res.status(201).json({
    message: `${uploaded.length} file(s) uploaded.`,
    files: uploaded,
  });
});

/**
 * DELETE /api/upload/:filename
 * Delete an uploaded file.
 */
export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const filename = req.params.filename as string;
  const filePath = path.resolve(String(env.UPLOAD_DIR), String(filename));

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'File not found.' });
    return;
  }

  fs.unlinkSync(filePath);
  res.json({ message: 'File deleted.' });
});
