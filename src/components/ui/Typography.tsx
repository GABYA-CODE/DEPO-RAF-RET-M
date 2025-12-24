import React from 'react';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'title' | 'paragraph' | 'small';
  center?: boolean;
  className?: string;
}

export default function Typography({
  children,
  variant = 'paragraph',
  center = false,
  className = '',
}: TypographyProps) {
  const baseStyles = center ? 'text-center' : '';

  const variants = {
    title:
      'text-4xl font-bold leading-tight text-black dark:text-white',
    paragraph:
      'text-base leading-relaxed text-gray-700 dark:text-gray-300',
    small:
      'text-sm leading-normal text-gray-600 dark:text-gray-400',
  };

  const Element = variant === 'title' ? 'h1' : variant === 'paragraph' ? 'p' : 'small';

  return (
    <Element
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </Element>
  );
}
