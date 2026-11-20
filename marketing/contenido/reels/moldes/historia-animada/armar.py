"""Arma los tiempos del molde "historia animada" de VivoMenu a partir de la voz.

Uso (desde esta carpeta):
    npx hyperframes transcribe voz.mp3 --model small --language es
    python armar.py voz.mp3

Lee:
  - guion.txt: el texto de la voz, un párrafo por tramo (los mismos párrafos que el
    bloque de §1 del paquete). El tramo N es la escena compositions/tNN.html.
  - transcript.json: lo que escribió `hyperframes transcribe` (o `init --audio`).

Escribe:
  - index.html: el data-start y el data-duration de cada escena (t01…), el audio y el
    largo total.
  - compositions/subtitulos.html: los subtítulos palabra por palabra, con el texto del
    guion (bien escrito) y los tiempos de la transcripción.
  - tiempos.json: el comienzo de cada tramo y de cada palabra, por si hace falta.

El texto de los subtítulos sale del guion, no de la transcripción: Whisper escribe
"21 a 30" donde la voz dice "veintiuna treinta" y pierde los acentos. Los tiempos sí
salen de la transcripción, alineando palabra por palabra.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path

AQUI = Path(__file__).parent

# Palabras que van en ember y un 20 % más grandes (una por bloque como máximo).
# Se cambian para cada reel: son las de la lista del prompt de edición.
CLAVE_ARCHIVO = AQUI / "claves.txt"


def norm(w: str) -> str:
    w = unicodedata.normalize("NFKD", w.lower())
    w = "".join(c for c in w if c.isalnum())
    return w


def palabras_transcripcion(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8", errors="replace"))
    if isinstance(data, list):  # formato de `hyperframes transcribe`
        return [{"text": w["text"], "start": w["start"], "end": w["end"]} for w in data]
    words: list[dict] = []
    for seg in data["transcription"]:
        for tok in seg["tokens"]:
            text = tok["text"]
            if text.startswith("[_") or not text.strip():
                continue
            start = tok["offsets"]["from"] / 1000
            end = tok["offsets"]["to"] / 1000
            if text.startswith(" ") or not words:
                words.append({"text": text.strip(), "start": start, "end": end})
            else:
                words[-1]["text"] += text
                words[-1]["end"] = end
    return [w for w in words if norm(w["text"])]


def alinear(guion: list[str], trans: list[dict]) -> list[tuple[float, float]]:
    """Programación dinámica: cada palabra del guion con una de la transcripción
    parecida, o sin pareja (y su tiempo se interpola)."""
    a = [norm(w) for w in guion]
    b = [norm(w["text"]) for w in trans]
    n, m = len(a), len(b)
    inf = float("inf")
    cost = [[inf] * (m + 1) for _ in range(n + 1)]
    back = [[None] * (m + 1) for _ in range(n + 1)]
    cost[0][0] = 0
    for i in range(n + 1):
        for j in range(m + 1):
            c = cost[i][j]
            if c == inf:
                continue
            if i < n and j < m:
                sim = SequenceMatcher(None, a[i], b[j]).ratio()
                step = 0 if sim >= 0.75 else (0.6 if sim >= 0.5 else 1.4)
                if c + step < cost[i + 1][j + 1]:
                    cost[i + 1][j + 1] = c + step
                    back[i + 1][j + 1] = (i, j, "m" if sim >= 0.5 else "x")
            if i < n and c + 1 < cost[i + 1][j]:
                cost[i + 1][j] = c + 1
                back[i + 1][j] = (i, j, "g")
            if j < m and c + 1 < cost[i][j + 1]:
                cost[i][j + 1] = c + 1
                back[i][j + 1] = (i, j, "t")
    pares: dict[int, int] = {}
    i, j = n, m
    while (i, j) != (0, 0):
        pi, pj, kind = back[i][j]
        if kind in ("m", "x"):
            pares[pi] = pj
        i, j = pi, pj
    tiempos: list[tuple[float, float] | None] = [
        (trans[pares[k]]["start"], trans[pares[k]]["end"]) if k in pares else None for k in range(n)
    ]
    # Interpolar las que quedaron sin pareja.
    k = 0
    while k < n:
        if tiempos[k] is not None:
            k += 1
            continue
        s = k
        while k < n and tiempos[k] is None:
            k += 1
        prev_end = tiempos[s - 1][1] if s > 0 else 0.0
        next_start = tiempos[k][0] if k < n else prev_end + 0.4 * (k - s)
        paso = (next_start - prev_end) / (k - s)
        for q in range(s, k):
            tiempos[q] = (prev_end + paso * (q - s), prev_end + paso * (q - s + 1))
    return tiempos  # type: ignore[return-value]


def duracion_audio(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(out.stdout.strip())


def grupos(tokens: list[dict]) -> list[list[dict]]:
    """Bloques de 1 a 3 palabras, cortando en puntuación o en una pausa de 150 ms."""
    out: list[list[dict]] = []
    cur: list[dict] = []
    for idx, t in enumerate(tokens):
        cur.append(t)
        sig = tokens[idx + 1] if idx + 1 < len(tokens) else None
        corta = (
            len(cur) == 3
            or re.search(r"[.,;:?!…]$", t["raw"]) is not None
            or (sig is not None and sig["start"] - t["end"] >= 0.15)
            or sig is None
            or (sig is not None and sig["tramo"] != t["tramo"])
        )
        if corta:
            out.append(cur)
            cur = []
    return out


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    audio = Path(sys.argv[1]) if len(sys.argv) > 1 else AQUI / "voz.mp3"
    guion_txt = (AQUI / "guion.txt").read_text(encoding="utf-8").strip()
    tramos = [p.strip() for p in re.split(r"\n\s*\n", guion_txt) if p.strip()]
    claves = set()
    if CLAVE_ARCHIVO.exists():
        claves = {norm(w) for w in CLAVE_ARCHIVO.read_text(encoding="utf-8").split()}

    raw: list[tuple[str, int]] = []
    for ti, p in enumerate(tramos):
        for w in p.split():
            raw.append((w, ti))
    trans = palabras_transcripcion(AQUI / "transcript.json")
    tiempos = alinear([w for w, _ in raw], trans)
    total = round(duracion_audio(audio) + 0.6, 2)

    tokens = [
        {"raw": w, "tramo": ti, "start": round(s, 3), "end": round(e, 3)}
        for (w, ti), (s, e) in zip(raw, tiempos)
    ]
    inicios = []
    for ti in range(len(tramos)):
        primera = next(t for t in tokens if t["tramo"] == ti)
        inicios.append(0.0 if ti == 0 else round(max(primera["start"] - 0.15, 0), 2))
    fines = inicios[1:] + [total]

    # index.html: escenas, audio y largo total.
    index = (AQUI / "index.html").read_text(encoding="utf-8")
    for ti, (s, f) in enumerate(zip(inicios, fines)):
        host = f"t{ti + 1:02d}"
        index = re.sub(
            rf'(<div\s+id="{host}"[^>]*?)data-start="[^"]*"\s+data-duration="[^"]*"',
            rf'\1data-start="{s}" data-duration="{round(f - s, 2)}"',
            index,
            flags=re.S,
        )
    index = re.sub(r'(id="root"[^>]*?data-duration=")[^"]*(")', rf"\g<1>{total}\2", index, flags=re.S)
    index = re.sub(r'(id="subtitulos"[^>]*?data-duration=")[^"]*(")', rf"\g<1>{total}\2", index, flags=re.S)
    index = re.sub(r'(<audio\s+id="voz"[^>]*?src=")[^"]*(")', rf"\g<1>{audio.name}\2", index, flags=re.S)
    index = re.sub(r'(<audio\s+id="voz"[^>]*?data-duration=")[^"]*(")', rf"\g<1>{round(total - 0.6, 2)}\2", index, flags=re.S)
    (AQUI / "index.html").write_text(index, encoding="utf-8")

    # Subtítulos.
    gs = grupos(tokens)
    html_grupos, js = [], []
    for gi, g in enumerate(gs):
        gid = f"sub-g{gi}"
        spans = []
        usada = False
        for wi, t in enumerate(g):
            limpio = re.sub(r"^[¿¡\"'«]+|[\"'».,;:?!…]+$", "", t["raw"])
            es_clave = (not usada) and norm(limpio) in claves
            usada = usada or es_clave
            cls = "w clave" if es_clave else "w"
            spans.append(f'<span id="{gid}-w{wi}" class="{cls}">{limpio.upper()}</span>')
        html_grupos.append(f'      <div id="{gid}" class="grupo">{" ".join(spans)}</div>')
        g_start = max(g[0]["start"] - 0.05, 0.1)
        g_end = g[-1]["end"] + 0.12
        if gi + 1 < len(gs):
            g_end = min(g_end, gs[gi + 1][0]["start"] - 0.05)
        js.append(f'    tl.set("#{gid}", {{ opacity: 1, visibility: "visible" }}, {g_start:.3f});')
        for wi, t in enumerate(g):
            js.append(
                f'    tl.fromTo("#{gid}-w{wi}", {{ scale: 0.85, opacity: 0 }}, '
                f'{{ scale: 1, opacity: 1, duration: 0.2, ease: "back.out(3)" }}, {max(t["start"], g_start):.3f});'
            )
        js.append(f'    tl.set("#{gid}", {{ opacity: 0, visibility: "hidden" }}, {g_end:.3f});')

    plantilla = (AQUI / "compositions" / "subtitulos.plantilla.html").read_text(encoding="utf-8")
    plantilla = plantilla.replace("<!-- GRUPOS -->", "\n".join(html_grupos))
    plantilla = plantilla.replace("// TIEMPOS", "\n".join(js))
    (AQUI / "compositions" / "subtitulos.html").write_text(plantilla, encoding="utf-8")

    (AQUI / "tiempos.json").write_text(
        json.dumps({"total": total, "tramos": inicios, "palabras": tokens}, ensure_ascii=False, indent=1),
        encoding="utf-8",
    )
    print(f"{len(tramos)} tramos, {len(tokens)} palabras, {len(gs)} bloques, {total} s")
    for ti, (s, f) in enumerate(zip(inicios, fines)):
        print(f"  t{ti + 1:02d}  {s:6.2f} -> {f:6.2f}  ({f - s:.2f} s)  {tramos[ti][:50]}")


if __name__ == "__main__":
    main()
