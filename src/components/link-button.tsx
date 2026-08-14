import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArrowUpRightIcon } from "@/components/icons";

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: "action" | "light" | "outline" | "ink";
  external?: boolean;
};

const variants = {
  action:
    "bg-cla-action text-white hover:bg-cla-action-deep focus-visible:outline-white",
  light:
    "bg-white text-cla-ink hover:bg-cla-surface focus-visible:outline-white",
  outline:
    "border border-white/70 text-white hover:border-white hover:bg-white hover:text-cla-primary-deep focus-visible:outline-white",
  ink: "bg-cla-ink text-white hover:bg-cla-primary-deep focus-visible:outline-cla-ink",
};

export function LinkButton({
  children,
  className,
  variant = "action",
  external = false,
  ...props
}: LinkButtonProps) {
  return (
    <a
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-3",
        variants[variant],
        className,
      )}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      {...props}
    >
      <span>{children}</span>
      {external ? <ArrowUpRightIcon className="size-4" /> : null}
    </a>
  );
}
