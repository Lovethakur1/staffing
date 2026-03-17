"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.uploadMultipleFiles = exports.uploadFile = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const helpers_1 = require("../utils/helpers");
const env_1 = require("../config/env");
/**
 * POST /api/upload
 * Upload a single file. Returns the file URL path.
 */
exports.uploadFile = (0, helpers_1.asyncHandler)(async (req, res) => {
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
exports.uploadMultipleFiles = (0, helpers_1.asyncHandler)(async (req, res) => {
    const files = req.files;
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
exports.deleteFile = (0, helpers_1.asyncHandler)(async (req, res) => {
    const filename = req.params.filename;
    const filePath = path_1.default.resolve(String(env_1.env.UPLOAD_DIR), String(filename));
    if (!fs_1.default.existsSync(filePath)) {
        res.status(404).json({ error: 'File not found.' });
        return;
    }
    fs_1.default.unlinkSync(filePath);
    res.json({ message: 'File deleted.' });
});
