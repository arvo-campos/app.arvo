export function PageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-arvo-terracota/20 border-t-arvo-terracota" />
        <p className="text-sm text-arvo-grafite/50">Carregando...</p>
      </div>
    </div>
  );
}
