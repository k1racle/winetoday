import Image from "next/image";
import Link from "next/link";

import type { SocialLinksBlock } from "@/lib/strapi";

type SocialLinksProps = {
  widget?: SocialLinksBlock | null;
  fallbackWidget?: SocialLinksBlock | null;
  className?: string;
  titleClassName?: string;
  listClassName?: string;
  itemClassName?: string;
  iconClassName?: string;
  labelClassName?: string;
  showLabels?: boolean;
  external?: boolean;
};

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function DefaultSocialIcon({ label }: { label: string }) {
  return (
    <span
      className="font-menu inline-flex h-full w-full items-center justify-center rounded-full border border-current/15 text-[10px] font-semibold uppercase tracking-[0.14em]"
      aria-hidden="true"
    >
      {label.slice(0, 2)}
    </span>
  );
}

export function SocialLinks({
  widget,
  fallbackWidget,
  className,
  titleClassName,
  listClassName,
  itemClassName,
  iconClassName,
  labelClassName,
  showLabels = false,
  external = true,
}: SocialLinksProps) {
  const resolvedWidget = widget?.links?.length ? widget : fallbackWidget?.links?.length ? fallbackWidget : null;

  if (!resolvedWidget?.links?.length) {
    return null;
  }

  return (
    <section className={className}>
      {resolvedWidget.title ? <p className={joinClasses("type-caption opacity-70", titleClassName)}>{resolvedWidget.title}</p> : null}
      <div className={joinClasses("mt-3 flex flex-wrap items-center gap-3", listClassName)}>
        {resolvedWidget.links.map((item, index) => {
          if (!item.href || !item.label) {
            return null;
          }

          const isExternal = external && /^https?:\/\//i.test(item.href);

          return (
            <Link
              key={`${item.label}-${item.href}-${index}`}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer noopener" : undefined}
              className={joinClasses(
                "inline-flex items-center gap-2 transition-opacity hover:opacity-100",
                !showLabels && "rounded-full",
                itemClassName,
              )}
            >
              <span className={joinClasses("relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden", iconClassName)}>
                {item.icon?.url ? (
                  <Image
                    src={item.icon.url}
                    alt={item.icon.alternativeText ?? item.label}
                    fill
                    sizes="40px"
                    className="object-contain"
                  />
                ) : (
                  <DefaultSocialIcon label={item.label} />
                )}
              </span>
              {showLabels ? <span className={joinClasses("type-small", labelClassName)}>{item.label}</span> : <span className="sr-only">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
