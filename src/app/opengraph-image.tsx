import { ImageResponse } from "next/og";

export const alt = "Shapeshift: a text box morphing into an event card as you type";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** A static shot of the shell mid-morph: the input above, the event card growing below it. */
export default function OpengraphImage() {
  const ink = "#1a1a19";
  const muted = "#706e68";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fafaf9", gap: 36 }}>
        <div
          style={{
            width: 760,
            display: "flex",
            flexDirection: "column",
            background: "#ffffff",
            border: "2px solid #e8e7e4",
            borderRadius: 48,
            boxShadow: "0 30px 70px -20px rgba(26,26,25,0.18)",
            padding: "34px 40px",
            gap: 26,
          }}
        >
          <div style={{ fontSize: 38, color: ink, letterSpacing: -0.5, display: "flex" }}>
            dinner with priya friday 8pm on zoom<span style={{ color: "#3b5bdb" }}>|</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "#f4f4f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 30, height: 26, borderRadius: 6, border: `4px solid ${ink}` }} />
            </div>
            <div style={{ fontSize: 26, color: muted, display: "flex" }}>Event</div>
            <div style={{ marginLeft: "auto", fontSize: 22, color: muted, border: "2px solid #e8e7e4", borderRadius: 999, padding: "6px 16px", display: "flex" }}>Video call</div>
          </div>
          <div style={{ fontSize: 34, fontWeight: 600, color: ink, display: "flex" }}>Dinner</div>
          <div style={{ display: "flex", gap: 14 }}>
            {["Friday", "8 PM", "Priya"].map((c) => (
              <div key={c} style={{ fontSize: 24, color: "#57564f", background: "#f4f4f2", borderRadius: 999, padding: "8px 20px", display: "flex" }}>
                {c}
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 30, color: muted, display: "flex" }}>Shapeshift: an input that becomes what you mean</div>
      </div>
    ),
    size,
  );
}
