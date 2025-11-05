import { sendContactForm, validateEmail } from './api'

export interface ContactFormData {
  name: string
  email: string
  company: string
  message: string
  videoTitle?: string
  videoId?: string
}

// Simple contact functions
export async function submitContactForm(formData: ContactFormData) {
  // Basic validation
  const missing = validateContactForm(formData)
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }
  
  if (!validateEmail(formData.email)) {
    throw new Error('Invalid email format')
  }

  return sendContactForm(formData)
}

export function validateContactForm(data: ContactFormData): string[] {
  const required: (keyof ContactFormData)[] = ['name', 'email', 'company', 'message']
  return required.filter(field => !data[field]?.trim())
}

