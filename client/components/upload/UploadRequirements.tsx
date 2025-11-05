'use client'

export default function UploadRequirements() {
  return (
    <div className="p-6 bg-gray-50 border-t border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h4>
      <ul className="text-sm text-gray-600 space-y-1">
        <li>• MP4 format only</li>
        <li>• 16:9 aspect ratio</li>
        <li>• Minimum 60 seconds duration</li>
        <li>• Maximum 1.65 GB file size</li>
        <li>• Business-related content only</li>
      </ul>
    </div>
  )
}
