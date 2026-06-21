export default function BoxLoading() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded w-1/3" />
      <div className="h-4 bg-muted rounded w-2/3" />
      <div className="h-32 bg-muted rounded" />
    </div>
  );
}
