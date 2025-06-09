import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import * as dotenv from 'dotenv';

dotenv.config();

// Get AWS credentials from environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// S3 bucket name from environment variable
const bucketName = process.env.S3_BUCKET_NAME || '';

// Custom options interface for our function
interface CustomPresignedPostOptions {
  Fields: {
    key: string;
    [key: string]: string;
  };
  contentType?: string;
  maxSizeInBytes?: number;
  expiresInSeconds?: number;
}

/**
 * Generate a presigned POST URL for direct upload to S3
 * @param options Configuration for the presigned URL
 * @returns The presigned POST URL and fields needed for the upload
 */
export const generatePresignedPostUrl = async (options: CustomPresignedPostOptions) => {
  const { 
    Fields: {
      'key': key
    }, 
    contentType = 'image/jpeg',
    maxSizeInBytes = 10485760, // 10MB default limit
    expiresInSeconds = 300 // 5 minutes default expiration
  } = options;

  try {
    // Check if key is provided
    if (!key) {
      throw new Error('File key is required');
    }

    // Create the presigned POST URL
    const presignedPost = await createPresignedPost(s3Client, {
      Bucket: bucketName,
      Key: key,
      Fields: {
        // Additional fields can be added here if needed
      },
      Conditions: [
        // Content length restrictions
        ['content-length-range', 0, maxSizeInBytes],
        // Content type restriction if provided
        contentType ? ['eq', '$Content-Type', contentType] : undefined,
      ].filter(Boolean) as any[],
      Expires: expiresInSeconds,
    });

    return {
      url: presignedPost.url,
      fields: presignedPost.fields,
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error(`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generate the full S3 object URL after successful upload
 * @param key The object key (file path) in the S3 bucket
 * @returns The complete S3 object URL
 */
export const getS3ObjectUrl = (key: string): string => {
  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};