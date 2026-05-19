type CodeLogoProps = {
  variant?: "global" | "rd";
  compact?: boolean;
};

export function CodeLogo({ variant = "global", compact = false }: CodeLogoProps) {
  const isRD = variant === "rd";
  const accent = isRD ? "text-accent-rd" : "text-accent-global";
  const bracket = isRD ? "text-accent-rd" : "text-accent-global";

  return (
    <div className="group flex min-w-0 items-center gap-2 font-mono leading-none" aria-label={isRD ? "GetUpSoft RD" : "GetUpSoft"}>
      <span className={`text-base font-semibold ${bracket} transition group-hover:text-text-main`}>&lt;</span>
      <span className="flex items-baseline whitespace-nowrap text-[18px] font-semibold tracking-normal text-text-main">
        <span>Get</span>
        <span className={accent}>Up</span>
        <span>Soft</span>
        {isRD ? <span className="ml-2 text-[11px] font-bold uppercase tracking-[0.18em] text-accent-rd">RD</span> : null}
      </span>
      <span className={`text-base font-semibold ${bracket} transition group-hover:text-text-main`}>/&gt;</span>
      {!compact ? (
        <span className="hidden h-4 w-px bg-border-subtle sm:block" aria-hidden="true" />
      ) : null}
    </div>
  );
}
