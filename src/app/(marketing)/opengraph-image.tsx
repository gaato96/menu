import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1f4a38",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 88, fontWeight: 800, color: "#ffffff" }}>
          VivoMenu
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 32, color: "#dfe9e2" }}>
          Menú, pedidos y comandas en tiempo real — sin comisión
        </div>
      </div>
    ),
    size,
  );
}
