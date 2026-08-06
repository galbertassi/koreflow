import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  buttonHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  buttonText,
  buttonHref = "#",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-16 h-16 bg-[#8B5CF6]/10 rounded-2xl flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-[#8B5CF6]" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-medium text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-8">{description}</p>
      <Link href={buttonHref}>
        <Button className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white rounded-full px-6 shadow-sm">
          {buttonText}
        </Button>
      </Link>
    </div>
  );
}
