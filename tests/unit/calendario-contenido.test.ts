import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CalendarioContenido } from "@/app/interno-64a0f7d0/calendario/calendario-contenido";
import { diasCalendario, publica, reels, revivir } from "@/content/internal/calendario-contenido";

const dias = diasCalendario();
const dia = (iso: string) => dias.find((d) => d.iso === iso)!;

describe("calendario de contenido", () => {
  it("covers the six weeks without gaps", () => {
    expect(dias[0].iso).toBe("2026-11-16");
    for (let i = 1; i < dias.length; i++) {
      const prev = new Date(`${dias[i - 1].iso}T12:00:00Z`).getTime();
      const cur = new Date(`${dias[i].iso}T12:00:00Z`).getTime();
      expect(cur - prev).toBe(86_400_000);
    }
  });

  it("publishes the reels on Monday, Wednesday and Friday only", () => {
    for (const iso of Object.keys(publica)) {
      expect(["lunes", "miércoles", "viernes"]).toContain(dia(iso).diaSemana);
    }
    expect(dia("2026-11-23").reel?.id).toBe("V01");
    expect(dia("2026-11-24").reel).toBeUndefined();
  });

  it("puts yesterday's story sequence the day after each reel", () => {
    const martes = dia("2026-11-24");
    const secuencia = martes.historias.find((h) => h.clase === "secuencia");
    expect(secuencia?.reel?.id).toBe("V01");
    expect(secuencia?.detalle).toContain("Viernes, 21:30");
  });

  it("produces each reel the day before it goes out", () => {
    expect(dia("2026-11-22").produce?.id).toBe("V01");
    expect(dia("2026-11-26").produce?.id).toBe("V03");
  });

  it("keeps the founders sequence on hold until §8 is confirmed", () => {
    const lunes = dia("2026-11-23").historias.find((h) => h.clase === "fundadores");
    expect(lunes?.detalle).toContain("§8");
    expect(dia("2026-11-25").historias.some((h) => h.clase === "estado")).toBe(false);
  });

  it("revives an old reel only on days without a new one, never a placeholder", () => {
    expect(dia("2026-11-23").historias.some((h) => h.clase === "revivir")).toBe(false);
    expect(dia("2026-11-24").historias.some((h) => h.clase === "revivir")).toBe(true);
    for (const d of dias) {
      const r = d.historias.find((h) => h.clase === "revivir")?.reel;
      if (r) expect(["LECTURA", "RESUBIDA"]).not.toContain(r.id);
    }
    // A reel published a week ago can come back; one from yesterday cannot.
    expect(revivir("2026-12-01", ["V05"])).toBeDefined();
    expect(revivir("2026-11-24", [])?.id).toBe(reels.COMISION.id);
  });

  it("renders on the server with today selected", () => {
    const html = renderToString(createElement(CalendarioContenido, { dias, hoy: "2026-11-24" }));
    expect(html).toContain("Calendario de contenido");
    expect(html).toContain("martes 24 de noviembre");
    expect(html).toContain("Secuencia del reel 01");
  });
});
