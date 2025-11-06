'use client'
import UploadButton from '@client/components/dashboard/UploadButton'

export default function DashboardHeader() {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Videos
          </h1>
          <p className="text-gray-600">
            Manage and track your video content
          </p>
        </div>
        <div className="flex-shrink-0">
          <UploadButton />
        </div>
      </div>
    </div>
  )
}
