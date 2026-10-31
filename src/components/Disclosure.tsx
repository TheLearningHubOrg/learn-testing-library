import { useId, useState, type ReactNode } from 'react';

interface DisclosureProps {
  summary: string;
  children: ReactNode;
}

// A WAI-ARIA disclosure: a button that shows and hides a region.
export function Disclosure({ summary, children }: DisclosureProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div>
      <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((v) => !v)}>
        {summary}
      </button>
      <div id={panelId} role="region" aria-label={summary} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
