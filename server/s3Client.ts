import { AbortMultipartUploadCommand, CompletedPart, CompleteMultipartUploadCommand, CreateMultipartUploadCommand, DeleteObjectCommand, ListPartsCommand, ListPartsCommandOutput, PutObjectCommand, S3Client, UploadPartCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      },
      apiVersion: 'latest',
      forcePathStyle: true,
      endpoint: process.env.AWS_ENDPOINT!
    })
  }
  return s3Client
}

function getVideoBucket(): string {
  return process.env.AWS_VIDEOS_BUCKET!
}

function getImageBucket(): string {
  return process.env.AWS_IMAGES_BUCKET!
}

// ---------- Single upload ----------

export async function generateVideoUploadUrl(
  filename: string,
  contentType: string,
  userId: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: getVideoBucket(),
    Key: filename,
    ContentType: contentType,
    Metadata: { userId }
  })

  return getSignedUrl(getS3Client(), command, { expiresIn })
}

// ---------- Multipart upload ----------

export async function createMultipartUpload(
  filename: string,
  contentType: string,
  userId: string
): Promise<{ uploadId: string; key: string }> {
  const command = new CreateMultipartUploadCommand({
    Bucket: getVideoBucket(),
    Key: filename,
    ContentType: contentType,
    Metadata: { userId }
  })

  const result = await getS3Client().send(command)

  if (!result.UploadId) {
    throw new Error('Multipart upload creation failed: no UploadId returned')
  }

  return { uploadId: result.UploadId, key: filename }
}

export async function generatePartUploadUrl(
  key: string,
  uploadId: string,
  partNumber: number,
  expiresIn = 3600
): Promise<string> {
  const command = new UploadPartCommand({
    Bucket: getVideoBucket(),
    Key: key,
    UploadId: uploadId,
    PartNumber: partNumber
  })

  return getSignedUrl(getS3Client(), command, { expiresIn })
}

export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: CompletedPart[]
): Promise<{ location?: string; key: string }> {
  const command = new CompleteMultipartUploadCommand({
    Bucket: getVideoBucket(),
    Key: key,
    UploadId: uploadId,
    MultipartUpload: { Parts: parts }
  })

  const result = await getS3Client().send(command)
  return { location: result.Location, key }
}

export async function listParts(
  key: string,
  uploadId: string
): Promise<CompletedPart[]> {
  const command = new ListPartsCommand({
    Bucket: getVideoBucket(),
    Key: key,
    UploadId: uploadId
  })

  const result: ListPartsCommandOutput = await getS3Client().send(command)

  return (result.Parts || []).map((part) => ({
    PartNumber: part.PartNumber!,
    ETag: part.ETag!,
  }))
}

export async function abortMultipartUpload(
  key: string,
  uploadId: string
): Promise<void> {
  const command = new AbortMultipartUploadCommand({
    Bucket: getVideoBucket(),
    Key: key,
    UploadId: uploadId
  })
  await getS3Client().send(command)
}

// ---------- Thumbnails ----------

export async function uploadThumbnail(
  videoId: string,
  buffer: Buffer
): Promise<boolean> {
  try {
    const command = new PutObjectCommand({
      Bucket: getImageBucket(),
      Key: videoId,
      Body: buffer,
      ContentType: 'image/jpeg',
    })

    await getS3Client().send(command)
    return true
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw error
  }
}

export async function deleteThumbnail(videoId: string): Promise<void> {
  const deleteCommand = new DeleteObjectCommand({
    Bucket: getImageBucket(),
    Key: videoId,
  })
  await getS3Client().send(deleteCommand)
}

export async function deleteVideo(videoKey: string): Promise<void> {
  const deleteCommand = new DeleteObjectCommand({
    Bucket: getVideoBucket(),
    Key: videoKey,
  })
  await getS3Client().send(deleteCommand)
}
