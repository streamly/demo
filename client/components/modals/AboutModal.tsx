'use client'
import Image from 'next/image'
import Modal from '@client/components/ui/Modal'
import Button from '@client/components/ui/Button'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      maxWidth="md"
      showCloseButton={false}
    >
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Bizilla Videos"
            width={64}
            height={64}
            className="w-16 h-16"
          />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Bizilla Videos
        </h2>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          Stream free live events and on-demand videos from leading companies, 
          thought leaders, and business experts. Discover launch stories, 
          investor updates, and product explainers from innovative companies 
          in the Bizilla network.
        </p>
        
        <Button onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  )
}
