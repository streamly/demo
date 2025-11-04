interface FormFieldProps {
  id: string
  name: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'url'
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  hasError?: boolean
}

export default function FormField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder,
  className = '',
  hasError = false
}: FormFieldProps) {
  const isEmpty = required && !value.trim()
  const showError = hasError || isEmpty

  return (
    <div className={className}>
      <label htmlFor={id} className={`block text-sm font-medium mb-2 ${showError ? 'text-red-700' : 'text-gray-700'}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
          showError 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
      {showError && (
        <p className="mt-1 text-sm text-red-600">
          This field is required
        </p>
      )}
    </div>
  )
}
