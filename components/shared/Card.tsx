
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl shadow-lg">
      <div className="p-4 border-b border-brand-border">
        <h3 className="text-lg font-semibold text-brand-text-primary">{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default Card;
