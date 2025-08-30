import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface Option {
  value: string | number;
  label: string;
}

interface SearchableDropdownProps {
  id?: string;
  name?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  className?: string;
  allowCustom?: boolean;
  onCustomValue?: (value: string) => void;
}

export function SearchableDropdown({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  required = false,
  className = "",
  allowCustom = false,
  onCustomValue
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Always compute display value from current value and options
  const getDisplayValue = () => {
    const option = options.find(opt => opt.value === value);
    if (option) {
      return option.label;
    } else if (value) {
      return String(value);
    }
    return '';
  };

  const displayValue = getDisplayValue();

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    if (allowCustom && onCustomValue) {
      onCustomValue(newValue);
    }
    
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleOptionSelect = (option: Option) => {
    onChange(option.value);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setSearchTerm(displayValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions.length === 1) {
        handleOptionSelect(filteredOptions[0]);
      } else if (allowCustom && searchTerm && onCustomValue) {
        onCustomValue(searchTerm);
        setIsOpen(false);
      }
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={isOpen ? searchTerm : displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className={`stocky-input pr-10 ${className}`}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 flex items-center pr-3"
        >
          {isOpen ? (
            <ChevronUpIcon className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionSelect(option)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500">
              {allowCustom && searchTerm ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onCustomValue) {
                      onCustomValue(searchTerm);
                      setIsOpen(false);
                    }
                  }}
                  className="w-full text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  Use "{searchTerm}"
                </button>
              ) : (
                'No options found'
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
