import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="border-b bg-card p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl font-headline">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-base text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </div>
  );
}
