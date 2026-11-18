/**
 * Prints an HTML document through a hidden, throwaway iframe. Browser-only.
 *
 * An iframe rather than window.open: a popup needs a user gesture and gets
 * blocked on the "print when a new order arrives" path, which has none. The
 * iframe is removed a minute later, long after the print dialog (or the
 * silent --kiosk-printing job) has taken the document.
 */
export function printHtml(html: string) {
  if (typeof document === "undefined") return;

  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  frame.srcdoc = html;
  frame.onload = () => {
    try {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
    } catch (error) {
      console.error("[print] failed", error);
    }
    setTimeout(() => frame.remove(), 60_000);
  };
  document.body.appendChild(frame);
}
