export default function BoxesLoading() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse space-y-4">
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-10 bg-muted rounded w-24" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}
