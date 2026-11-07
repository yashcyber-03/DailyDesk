import { ImageResponse } from "next/og";

export const alt = "DailyDesk - Everything You Need, All in One Desk.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#09090b", color: "#fafafa" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 700 }}>D</div>
          <div style={{ marginLeft: 24, fontSize: 56, fontWeight: 700 }}>DailyDesk</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>Your Everyday Digital Toolkit.</div>
        <div style={{ marginTop: 24, fontSize: 32, color: "#a1a1aa" }}>PDF, image, AI, calculators and productivity tools in one place.</div>
      </div>
    ),
    size,
  );
}
