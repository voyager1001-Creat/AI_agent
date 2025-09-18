import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = ''
}: CardProps) => {
  const classes = `bg-white rounded-lg shadow-sm border border-gray-200 ${className}`;

  return (
    <div className={classes}>
      {children}
    </div>
  );
};