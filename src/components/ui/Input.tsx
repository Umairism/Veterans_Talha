import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-gray-800 text-base ${className} ${
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-gray-800 text-base ${className} ${
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
  children?: React.ReactNode;
}

export function Select({ label, error, options, children, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-gray-800 text-base bg-white ${className} ${
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''
        }`}
        {...props}
      >
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
