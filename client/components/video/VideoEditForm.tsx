'use client'
import Button from '@client/components/ui/Button'
import { InputField } from '@client/components/ui/FormField'
import TagInput from '@client/components/ui/TagInput'

interface VideoFormData {
  title: string
  description: string
  types: string[]
  topics: string[]
  tags: string[]
  companies: string[]
  people: string[]
  audiences: string[]
}

interface VideoEditFormProps {
  formData: VideoFormData
  isSubmitting: boolean
  onInputChange: (field: keyof VideoFormData, value: string) => void
  onArrayChange: (field: keyof VideoFormData, value: string[]) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export default function VideoEditForm({
  formData,
  isSubmitting,
  onInputChange,
  onArrayChange,
  onSubmit,
  onCancel
}: VideoEditFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <InputField
        label="Title"
        type="text"
        value={formData.title}
        onChange={(e) => onInputChange('title', e.target.value)}
        placeholder="Enter video title"
        required
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Enter video description"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <TagInput
        label="Types"
        value={formData.types}
        onChange={(value) => onArrayChange('types', value)}
        placeholder="Add video types (e.g., Corporate, Investor, Event)..."
      />

      <TagInput
        label="Topics"
        value={formData.topics}
        onChange={(value) => onArrayChange('topics', value)}
        placeholder="Add topics (e.g., Electric Vehicles, AI, Technology)..."
      />

      <TagInput
        label="Tags"
        value={formData.tags}
        onChange={(value) => onArrayChange('tags', value)}
        placeholder="Add tags for better searchability..."
      />

      <TagInput
        label="Companies"
        value={formData.companies}
        onChange={(value) => onArrayChange('companies', value)}
        placeholder="Add related companies (e.g., Tesla, Apple, Microsoft)..."
      />

      <TagInput
        label="People"
        value={formData.people}
        onChange={(value) => onArrayChange('people', value)}
        placeholder="Add people featured or mentioned..."
      />

      <TagInput
        label="Audiences"
        value={formData.audiences}
        onChange={(value) => onArrayChange('audiences', value)}
        placeholder="Add target audiences (e.g., Investors, Professionals)..."
      />

      <div className="flex justify-end space-x-3 pt-4 border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Update Video'}
        </Button>
      </div>
    </form>
  )
}

export type { VideoFormData }
