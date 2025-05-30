import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseClasses = 'px-4 py-2 rounded-2xl shadow font-medium transition';
  const variants: Record<string, string> = {
    default: 'bg-blue-500 text-white hover:bg-blue-600',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  };
  const variantClasses = variants[variant] || variants.default;

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
