import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    let variantStyles = 'bg-blue-600 text-white hover:bg-blue-700';
    if (variant === 'destructive') variantStyles = 'bg-red-500 text-white hover:bg-red-600';
    if (variant === 'outline') variantStyles = 'border border-gray-700 bg-transparent hover:bg-gray-800 text-white';
    if (variant === 'secondary') variantStyles = 'bg-gray-800 text-white hover:bg-gray-700';
    if (variant === 'ghost') variantStyles = 'hover:bg-gray-800 hover:text-white';
    if (variant === 'link') variantStyles = 'text-blue-500 underline-offset-4 hover:underline';
    
    let sizeStyles = 'h-10 px-4 py-2';
    if (size === 'sm') sizeStyles = 'h-9 rounded-md px-3';
    if (size === 'lg') sizeStyles = 'h-11 rounded-md px-8';
    if (size === 'icon') sizeStyles = 'h-10 w-10';
    
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
