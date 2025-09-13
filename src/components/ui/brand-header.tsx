import { cn } from "@/lib/utils";

interface BrandHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

export function BrandHeader({ title, subtitle, className, children }: BrandHeaderProps) {
  return (
    <div className={cn("border-b bg-gradient-to-r from-background to-muted/20", className)}>
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <div className="h-4 w-4 rounded-sm bg-primary"></div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            </div>
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl">{subtitle}</p>
            )}
          </div>
          {children && (
            <div className="flex items-center gap-4">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}