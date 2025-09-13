import React from 'react';
import { cn } from "@/lib/utils";

type Actions = React.ReactNode;

interface PageProps {
  title?: string;
  description?: string;
  actions?: Actions;
  className?: string;
  children: React.ReactNode;
}

export function PageHeader({ title, description, actions }: Pick<PageProps, 'title' | 'description' | 'actions'>) {
  if (!title && !actions && !description) return null;
  return (
    <div className="flex justify-between items-center">
      <div>
        {title && <h1 className="text-3xl font-bold">{title}</h1>}
        {description && <p className="text-muted-foreground mt-2">{description}</p>}
      </div>
      {actions && (
        <div className="flex gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export function Page({ title, description, actions, className, children }: PageProps) {
  return (
    <div className={cn("p-6 space-y-6", className)}>
      {(title || description || actions) && (
        <PageHeader title={title} description={description} actions={actions} />
      )}
      {children}
    </div>
  );
}

export default Page;

