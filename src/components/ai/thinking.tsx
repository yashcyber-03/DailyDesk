export function Thinking({ label = "Thinking" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="flex gap-1" aria-hidden="true">
        {[0, 150, 300].map((delay) => (
          <span key={delay} className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </span>
      {label}...
    </div>
  );
}
