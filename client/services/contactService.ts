import { apiClient } from '@client/services/apiClient'

export interface ContactFormData {
  name: string
  email: string
  company: string
  message: string
  videoTitle?: string
  videoId?: string
}

export interface ContactResponse {
  success: boolean
  message?: string
}

class ContactService {
  async submitContactForm(data: ContactFormData): Promise<ContactResponse> {
    try {
      const response = await apiClient.post<ContactResponse>('/api/contact', data)
      return response
    } catch (error) {
      console.error('Failed to submit contact form:', error)
      throw error
    }
  }

  validateContactForm(data: ContactFormData): string[] {
    const errors: string[] = []

    if (!data.name?.trim()) {
      errors.push('Name is required')
    }

    if (!data.email?.trim()) {
      errors.push('Email is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Please enter a valid email address')
    }

    if (!data.company?.trim()) {
      errors.push('Company is required')
    }

    if (!data.message?.trim()) {
      errors.push('Message is required')
    }

    return errors
  }

  isContactFormValid(data: ContactFormData): boolean {
    return this.validateContactForm(data).length === 0
  }
}

export const contactService = new ContactService()
