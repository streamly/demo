export function getVideoThumbnail(videoId: string): string {
  const protocol = process.env.NEXT_PUBLIC_IMAGE_PROTOCOL
  const host = process.env.NEXT_PUBLIC_IMAGE_HOST

  return `${protocol}://${host}/${videoId}`
}
