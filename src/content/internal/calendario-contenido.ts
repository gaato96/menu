/**
 * Calendario de contenido de VivoMenu: lo que dibuja /interno-64a0f7d0/calendario.
 *
 * Sale de marketing/contenido/reels/backlog.md (las ideas) y de marketing/notas/03-dia-por-dia.md
 * (qué día sale cada una). Cuando cambia el calendario allá, se cambia acá:
 * - `reels`: cada idea, con su gancho y su palabra; si ya tiene paquete, su número, su archivo y
 *   la primera historia de su secuencia (§7 del paquete).
 * - `publica`: qué reel sale cada día (lunes, miércoles y viernes a las 16).
 * - `produce`: qué se produce cada día (el reel del día siguiente).
 * - `extras`: lo que pasa ese día además del contenido.
 *
 * Las historias de cada día (la secuencia del reel de ayer, compartir el de hoy y el reel viejo
 * para revivir) se calculan solas en `diasCalendario()`. Es una función pura: se prueba sin red.
 */

export type Formato = "A" | "B" | "C";

export type Reel = {
  id: string;
  /** Número del paquete (marketing/contenido/reels/NN-*.md), si ya se generó. */
  numero?: string;
  archivo?: string;
  gancho: string;
  serie: string;
  formato: Formato;
  rubro: string;
  palabra: string;
  /** Lo que hace falta antes de producirlo. */
  antes?: string;
  /** La primera historia de su secuencia y su sticker, si el paquete ya existe. */
  historia1?: string;
  sticker?: string;
};

export const FORMATOS: Record<Formato, string> = {
  A: "Historia animada · 45 a 75 s con voz",
  B: "Pantalla real · 20 a 40 s",
  C: "Corto de texto · 7 a 10 s, sin voz",
};

const r = (x: Reel) => x;

export const reels: Record<string, Reel> = {
  // Publicado en agosto, antes de la pausa: sirve para revivirlo en historias.
  COMISION: r({ id: "COMISION", gancho: "Por cada venta de $10.000, −$2.500 se los lleva la app.", serie: "La cuenta (agosto)", formato: "A", rubro: "Todos", palabra: "—" }),

  V01: r({
    id: "V01",
    numero: "01",
    archivo: "01-dos-hamburgueserias-una-diferencia.md",
    gancho: "Dos hamburgueserías, misma burger. Cambia una sola cosa.",
    serie: "Dos deliverys",
    formato: "A",
    rubro: "Hamburguesería",
    palabra: "CARTA",
    antes: "Rehacerlo con las reglas de edición nuevas (PRODUCCION.md) y la voz de ElevenLabs.",
    historia1: "Viernes, 21:30. ¿Cuántos chats tenés abiertos?",
    sticker: "Encuesta «¿Cómo te entran los pedidos?»: «Por WhatsApp, a mano» / «Desde un link»",
  }),
  V02: r({ id: "V02", gancho: "Preguntaste hasta qué hora toman. Te contestaron a las 23:10.", serie: "El chat del viernes", formato: "C", rubro: "Pizzería", palabra: "BIENVENIDA" }),
  V03: r({ id: "V03", gancho: "Viernes, 21:34. Entra el pedido A-07.", serie: "Viernes 21:30", formato: "B", rubro: "Hamburguesería", palabra: "CARTA", antes: "Diez pedidos de prueba en el local de demostración y grabar el celular y la tablet." }),
  V04: r({ id: "V04", gancho: "Domino's te muestra tu pizza en el horno. ¿Para qué?", serie: "El dato", formato: "A", rubro: "Pizzería", palabra: "CARTA", antes: "Confirmar el Pizza Tracker en dos fuentes. Si no se confirma, sale V07." }),
  V05: r({ id: "V05", gancho: "Preguntaste cuánto sale el envío. Te dijeron «depende».", serie: "El chat del viernes", formato: "C", rubro: "Sushi", palabra: "BIENVENIDA" }),
  V06: r({ id: "V06", gancho: "Armé un pedido y no mandé el WhatsApp. Mirá.", serie: "¿Y si…? Probé", formato: "B", rubro: "Hamburguesería", palabra: "CARTA", antes: "Hacer la prueba en el local de demostración y grabarla." }),
  V07: r({ id: "V07", gancho: "Pediste una pizza sin cebolla. Llegó con cebolla.", serie: "Dos deliverys", formato: "A", rubro: "Pizzería", palabra: "CARTA" }),
  V08: r({ id: "V08", gancho: "Hace 50 minutos que esperás. Y nadie te dice nada.", serie: "El chat del viernes", formato: "C", rubro: "Rotisería", palabra: "RESPUESTAS" }),
  V09: r({ id: "V09", gancho: "Tu carta está en una destacada. Ahí pierde pedidos.", serie: "Tu carta de Instagram", formato: "B", rubro: "Empanadas", palabra: "CARTA", antes: "Una carta armada para el reel (o la de un fundador con permiso)." }),
  V10: r({ id: "V10", gancho: "Sacaron el signo $ de la carta. Gastaron más.", serie: "El dato", formato: "A", rubro: "Amplio", palabra: "CARTA", antes: "Confirmar el estudio de Cornell en dos fuentes." }),
  V11: r({ id: "V11", gancho: "Pediste la carta y te llegaron seis fotos.", serie: "El chat del viernes", formato: "C", rubro: "Pizzería", palabra: "CARTA" }),
  V12: r({ id: "V12", gancho: "Viernes, 22:05. Se terminó la doble.", serie: "Viernes 21:30", formato: "B", rubro: "Hamburguesería", palabra: "CARTA", antes: "Grabar en el local de demostración cómo se marca agotada." }),
  LECTURA: r({ id: "LECTURA", gancho: "El que diga la lectura del 21/12", serie: "Según la lectura", formato: "A", rubro: "—", palabra: "CARTA", antes: "Lo decide la lectura del lunes 21/12: lo que rompió la mediana ocupa dos de los tres lugares." }),
  RESUBIDA: r({ id: "RESUBIDA", gancho: "El reel con más envíos y seguidores, con otro gancho", serie: "Resubida", formato: "A", rubro: "—", palabra: "CARTA", antes: "Elegido en la lectura del 21/12. Un gancho nuevo; el video, el mismo." }),
};

/** Qué reel sale cada día (a las 16). Los días que no están, no sale reel. */
export const publica: Record<string, string> = {
  "2026-11-23": "V01",
  "2026-11-25": "V02",
  "2026-11-27": "V03",
  "2026-11-30": "V04",
  "2026-12-02": "V05",
  "2026-12-04": "V06",
  "2026-12-07": "V07",
  "2026-12-09": "V08",
  "2026-12-11": "V09",
  "2026-12-14": "V10",
  "2026-12-16": "V11",
  "2026-12-18": "V12",
  "2026-12-21": "LECTURA",
  "2026-12-23": "LECTURA",
  "2026-12-28": "LECTURA",
  "2026-12-30": "RESUBIDA",
};

/** Qué se produce cada día: el reel del día siguiente. */
export const produce: Record<string, string> = {
  "2026-11-22": "V01",
  "2026-11-24": "V02",
  "2026-11-26": "V03",
  "2026-11-29": "V04",
  "2026-12-01": "V05",
  "2026-12-03": "V06",
  "2026-12-06": "V07",
  "2026-12-08": "V08",
  "2026-12-10": "V09",
  "2026-12-13": "V10",
  "2026-12-15": "V11",
  "2026-12-17": "V12",
  "2026-12-20": "LECTURA",
  "2026-12-22": "LECTURA",
  "2026-12-27": "LECTURA",
  "2026-12-29": "RESUBIDA",
};

/** Lo que pasa ese día además del contenido. */
export const extras: Record<string, string[]> = {
  "2026-11-21": [
    "Cambiar el logo del local de demostración (hoy es el de Galu)",
    "Bio, nombre del perfil y links nuevos (04-contenido §9)",
    "Abrir la cuenta de TikTok @vivomenu.app",
  ],
  "2026-11-26": ["Grabar el tablero de la demo con 10 pedidos de prueba (sirve para V03 y V12); cancelarlos después"],
  "2026-11-27": ["Informe del viernes: capturas de Estadísticas a Claude (05-medicion §4)"],
  "2026-12-04": ["Control de los 6 reels (03-dia-por-dia §4)", "Informe del viernes"],
  "2026-12-08": ["Feriado: se produce igual (el corto, 10 min)"],
  "2026-12-11": ["Informe del viernes"],
  "2026-12-18": ["Informe del viernes · los 12 reels están afuera"],
  "2026-12-19": ["Claude corre matriz-analiticas sobre @vivomenu.app (dentro del plan gratis de Apify)"],
  "2026-12-21": ["PRIMERA LECTURA de los 12 reels: tres decisiones y el calendario de enero"],
  "2026-12-24": ["Nochebuena: no se publica"],
  "2026-12-25": ["Navidad: no se publica"],
  "2026-12-31": ["No se publica"],
  "2027-01-01": ["Año nuevo: no se publica"],
  "2027-01-02": ["Claude arma el calendario de enero con la lectura"],
};

/** La secuencia de fundadores de los lunes: espera la confirmación del §8 del plan. */
export const FUNDADORES_CONFIRMADO = false;

export const DESDE = "2026-11-16";
export const HASTA = "2027-01-10";

// ─────────────────────────────────────────────────────────────

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const aFecha = (iso: string) => {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d));
};
const aIso = (f: Date) => f.toISOString().slice(0, 10);
export const sumarDias = (iso: string, dias: number) => {
  const f = aFecha(iso);
  f.setUTCDate(f.getUTCDate() + dias);
  return aIso(f);
};

export type Historia = {
  clase: "secuencia" | "fundadores" | "revivir" | "compartir" | "estado";
  titulo: string;
  detalle?: string;
  reel?: Reel;
};

export type Dia = {
  iso: string;
  diaSemana: string;
  /** "viernes 20 de noviembre" */
  largo: string;
  numero: number;
  mes: number;
  anio: number;
  reel?: Reel;
  historias: Historia[];
  produce?: Reel;
  extras: string[];
};

const ESTADOS: Record<number, string> = { 1: "E1", 3: "E2", 5: "E3" };
// Los que no son un reel de verdad no se reviven.
const NO_REVIVIR = new Set(["LECTURA", "RESUBIDA"]);

/** El reel viejo para revivir: uno publicado hace 7 días o más (o el de agosto), rotando. */
export function revivir(iso: string, excluir: string[]): Reel | undefined {
  const tope = sumarDias(iso, -7);
  const pool = [
    reels.COMISION,
    ...Object.entries(publica)
      .filter(([f, id]) => f <= tope && !excluir.includes(id) && !NO_REVIVIR.has(id))
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([, id]) => reels[id]),
  ];
  const indice = Math.round(aFecha(iso).getTime() / 86_400_000);
  return pool[indice % pool.length];
}

export function diasCalendario(desde = DESDE, hasta = HASTA): Dia[] {
  const dias: Dia[] = [];
  for (let iso = desde; iso <= hasta; iso = sumarDias(iso, 1)) {
    const f = aFecha(iso);
    const dow = f.getUTCDay();
    const reel = publica[iso] ? reels[publica[iso]] : undefined;
    const ayerId = publica[sumarDias(iso, -1)];
    const ayer = ayerId ? reels[ayerId] : undefined;
    const historias: Historia[] = [];

    if (dow === 1) {
      historias.push({
        clase: "fundadores",
        titulo: "Secuencia de fundadores",
        detalle: FUNDADORES_CONFIRMADO
          ? "La que toca esta semana (A → B → C), en contenido/historias/README.md §5 a §7."
          : "Todavía no: espera que confirmes el §8 del plan (precio, fundadores, IVA y cobro).",
      });
    }
    if (ayer && !NO_REVIVIR.has(ayer.id)) {
      historias.push({
        clase: "secuencia",
        titulo: `Secuencia del reel ${ayer.numero ?? ayer.id}, el de ayer`,
        detalle: ayer.historia1
          ? `Historia 1: «${ayer.historia1}» · ${ayer.sticker}. Las tres, en el §7 del paquete. De 12 a 13.`
          : "Las tres historias están en el §7 de su paquete. De 12 a 13.",
        reel: ayer,
      });
    }
    if (reel) {
      historias.push({
        clase: "compartir",
        titulo: "Compartí el reel de hoy",
        detalle: "Cuando sale (16:00): avión de papel → Agregar a tu historia. Su secuencia de tres historias va mañana.",
        reel,
      });
    }
    const viejo = revivir(iso, [publica[iso], ayerId].filter(Boolean) as string[]);
    if (viejo && !reel) {
      historias.push({
        clase: "revivir",
        titulo: `Reviví un reel viejo: ${viejo.numero ? `el ${viejo.numero}` : viejo.serie}`,
        detalle: `Compartilo en historias con «¿Te lo perdiste? 👇»${viejo.palabra !== "—" ? ` y abajo «Comentá ${viejo.palabra} en el reel»` : ""}. A la noche, antes de las 23.`,
        reel: viejo,
      });
    }
    if (ESTADOS[dow] && FUNDADORES_CONFIRMADO) {
      historias.push({ clase: "estado", titulo: `Estado de WhatsApp ${ESTADOS[dow]}`, detalle: "Texto e imagen en contenido/historias/README.md §8." });
    }

    dias.push({
      iso,
      diaSemana: DIAS[dow],
      largo: `${DIAS[dow]} ${f.getUTCDate()} de ${MESES[f.getUTCMonth()]}`,
      numero: f.getUTCDate(),
      mes: f.getUTCMonth(),
      anio: f.getUTCFullYear(),
      reel,
      historias,
      produce: produce[iso] ? reels[produce[iso]] : undefined,
      extras: extras[iso] ?? [],
    });
  }
  return dias;
}

export const NOMBRE_MES = (mes: number) => MESES[mes];
