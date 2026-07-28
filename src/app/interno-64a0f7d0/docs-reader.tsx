"use client";

import { useState } from "react";

type Doc = {
  key: string;
  label: string;
  html: string;
};

export function DocsReader({ docs }: { docs: Doc[] }) {
  const [active, setActive] = useState(docs[0]?.key ?? "");
  const current = docs.find((d) => d.key === active) ?? docs[0];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
      <nav className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-ink-200 bg-ink-50/95 px-3 py-2 backdrop-blur">
        {docs.map((doc) => (
          <button
            key={doc.key}
            type="button"
            onClick={() => setActive(doc.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium tracking-tight transition-colors ${
              doc.key === active
                ? "bg-ink-900 text-white"
                : "bg-ink-100 text-ink-700 hover:bg-ink-200"
            }`}
          >
            {doc.label}
          </button>
        ))}
      </nav>
      <article
        className="doc-content px-4 py-6 sm:px-6"
        dangerouslySetInnerHTML={{ __html: current?.html ?? "" }}
      />
    </div>
  );
}
