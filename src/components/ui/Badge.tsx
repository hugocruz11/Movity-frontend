type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "muted"
  | "orange";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-sand-light text-charcoal border-sand",
  success: "bg-success/10 text-success-text border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-error/10 text-error border-error/20",
  muted: "bg-sand-light text-muted border-sand",
  orange: "bg-orange/10 text-orange border-orange/20",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
