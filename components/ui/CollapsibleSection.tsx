export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group mb-4 rounded-lg border border-arvo-grafite/10"
    >
      <summary className="cursor-pointer list-none rounded-lg px-4 py-3 text-sm font-semibold text-arvo-grafite select-none hover:bg-arvo-bg">
        <span className="mr-2 inline-block transition-transform group-open:rotate-90">
          ▸
        </span>
        {title}
      </summary>
      <div className="border-t border-arvo-grafite/10 px-4 py-4">{children}</div>
    </details>
  );
}
