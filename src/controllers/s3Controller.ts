import { Request, Response } from 'express';
import { generatePresignedPostUrl, getS3ObjectUrl } from '../services/s3Service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a presigned POST URL for direct uploads to S3
 * 
 * @param req Request containing the file info (contentType is optional)
 * @param res Response with the presigned URL data
 */
export const getPresignedPost = async (req: Request, res: Response) => {
  try {
    const { filename, contentType } = req.body;

    if (!filename) {
      return res.status(400).json({ message: 'Filename is required' });
    }

    // Generate a random UUID and append it to the original filename to avoid collisions
    const fileExtension = filename.split('.').pop();
    const uniqueFilename = `uploads/${uuidv4()}-${Date.now()}.${fileExtension}`;

    const presignedPost = await generatePresignedPostUrl({
      Fields: {
        key: uniqueFilename
      },
      contentType: contentType || 'image/jpeg', // Default to JPEG if not specified
      maxSizeInBytes: 10 * 1024 * 1024, // 10 MB limit
      expiresInSeconds: 300, // 5 minutes
    });

    // Return the presigned POST URL and its fields, along with the public URL for later reference
    res.status(200).json({
      presignedPost, 
      fileUrl: getS3ObjectUrl(uniqueFilename)
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ message: 'Error generating presigned URL', error });
  }
};
