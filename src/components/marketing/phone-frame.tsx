import { cn } from "@/lib/utils";

/**
 * A phone shell for the product shots. Deliberately not an iframe of the real
 * menu: /m/[slug] is a full app surface with its own scroll containers and a
 * sticky cart bar, and squeezing it into a 300px box renders a broken-looking
 * version of a page that is fine on a real phone. Real screenshots of real
 * data, framed, beat a live embed that misrepresents the product.
 */
export function PhoneFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-[2.25rem] border-[6px] border-night-900 bg-night-900 shadow-2xl",
        className,
      )}
    >
      <div className="absolute top-2 left-1/2 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-night-700" />
      <div className="aspect-[9/19] overflow-hidden rounded-[1.75rem] bg-ink-50">{children}</div>
    </div>
  );
}
