import { ImageResponse } from "@vercel/og";

export const config = {
    runtime: "edge",
};

/**
 * Dinamikus Open Graph kép generátor.
 * Hívás: /api/og?title=...&subtitle=...
 * Méret: 1200x630, brand-konzisztens (BPMOVE narancs gradiens, Inter font).
 */
export default function handler(request) {
    try {
        const { searchParams } = new URL(request.url);
        const title =
            searchParams.get("title")?.slice(0, 80) || "BPMOVE";
        const subtitle =
            searchParams.get("subtitle")?.slice(0, 120) ||
            "Profi költöztetés Budapesten – fix áron, 0-24";

        return new ImageResponse(
            (
                <div
                    style={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        backgroundImage:
                            "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                        padding: "72px 80px",
                        color: "#ffffff",
                        fontFamily: "Inter, system-ui, sans-serif",
                        position: "relative",
                    }}
                >
                    {/* narancs accent sáv */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "8px",
                            backgroundImage:
                                "linear-gradient(90deg, #ea580c, #f97316)",
                            display: "flex",
                        }}
                    />

                    {/* Logo + brand */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "20px",
                        }}
                    >
                        <div
                            style={{
                                width: "72px",
                                height: "72px",
                                borderRadius: "16px",
                                backgroundImage:
                                    "linear-gradient(135deg, #ea580c, #f97316)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontSize: "40px",
                                fontWeight: 800,
                            }}
                        >
                            📦
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                lineHeight: 1.1,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: "36px",
                                    fontWeight: 800,
                                    letterSpacing: "-0.01em",
                                }}
                            >
                                BPMOVE
                            </span>
                            <span
                                style={{
                                    fontSize: "18px",
                                    color: "#cbd5e1",
                                    letterSpacing: "0.5px",
                                    marginTop: "4px",
                                }}
                            >
                                költözés egyszerűen
                            </span>
                        </div>
                    </div>

                    {/* Title + subtitle */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "20px",
                            maxWidth: "900px",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "68px",
                                fontWeight: 800,
                                lineHeight: 1.1,
                                letterSpacing: "-0.02em",
                                color: "#ffffff",
                                display: "flex",
                            }}
                        >
                            {title}
                        </div>
                        <div
                            style={{
                                fontSize: "30px",
                                color: "#fb923c",
                                fontWeight: 600,
                                lineHeight: 1.3,
                                display: "flex",
                            }}
                        >
                            {subtitle}
                        </div>
                    </div>

                    {/* Footer chip */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                background: "rgba(234, 88, 12, 0.18)",
                                color: "#fdba74",
                                padding: "10px 22px",
                                borderRadius: "999px",
                                fontSize: "20px",
                                fontWeight: 600,
                            }}
                        >
                            ⏱ 15 perc alatt árajánlat
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                color: "#cbd5e1",
                                fontSize: "20px",
                                fontWeight: 600,
                            }}
                        >
                            bpmove.hu • +36 30 155 4066
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e) {
        console.error("OG image error:", e);
        return new Response("Failed to generate OG image", { status: 500 });
    }
}
