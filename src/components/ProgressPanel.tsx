type Props = {
  label: string;
  detail?: string | undefined;
  value: number;
  total: number;
};


export function ProgressPanel({ label, detail, value, total }: Props) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="surface-card space-y-3 p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-semibold">{label}</h3>
        {total > 0 && (
          <span className="text-sm tabular-nums text-muted-foreground">
            {value} / {total}
          </span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="btn-accent h-full rounded-full transition-[width] duration-300"
          style={{ width: `${total > 0 ? pct : 100}%` }}
        />
      </div>
      {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
    </div>
  );
}
