// src/Logo.jsx  — LaunchMate logo · Space Grotesk glass pill
// Usage:
//   <Logo />                  dark glass (for dark backgrounds)
//   <Logo variant="light" />  light frosted glass (for light/hero backgrounds)
//   <Logo variant="nav" />    inline no-pill (for dark navbars)
//   <Logo variant="nav-light" /> inline no-pill (for light navbars)
//   <Logo size={38} />        custom font-size (pill scales proportionally)

const SG = "'Space Grotesk', sans-serif";

export default function Logo({ size = 28, variant = "dark", style = {} }) {
    const dot = Math.max(3, Math.round(size * 0.14));
    const dotMb = Math.max(2, Math.round(size * 0.12));
    const dotMx = Math.max(5, Math.round(size * 0.26));
    const px = Math.round(size * 0.7);
    const py = Math.round(size * 0.32);

    if (variant === "nav") {
        return (
            <div style={{
                display: "inline-flex", alignItems: "center", fontFamily: SG,
                fontWeight: 700, fontSize: size, letterSpacing: "-0.03em", lineHeight: 1,
                whiteSpace: "nowrap", userSelect: "none", ...style
            }}>
                <span style={{ color: "#fff" }}>launch</span>
                <span style={{
                    width: dot, height: dot, borderRadius: "50%",
                    background: "rgba(255,255,255,0.28)", flexShrink: 0,
                    margin: `0 ${dotMx}px ${dotMb}px`
                }} />
                <span style={{ color: "rgba(255,255,255,0.28)" }}>mate</span>
            </div>
        );
    }

    if (variant === "nav-light") {
        return (
            <div style={{
                display: "inline-flex", alignItems: "center", fontFamily: SG,
                fontWeight: 700, fontSize: size, letterSpacing: "-0.03em", lineHeight: 1,
                whiteSpace: "nowrap", userSelect: "none", ...style
            }}>
                <span style={{ color: "#0a0a0a" }}>launch</span>
                <span style={{
                    width: dot, height: dot, borderRadius: "50%",
                    background: "rgba(0,0,0,0.22)", flexShrink: 0,
                    margin: `0 ${dotMx}px ${dotMb}px`
                }} />
                <span style={{ color: "rgba(0,0,0,0.22)" }}>mate</span>
            </div>
        );
    }

    if (variant === "light") {
        return (
            <div style={{
                display: "inline-flex", alignItems: "center",
                background: "rgba(255,255,255,0.52)",
                backdropFilter: "blur(28px) saturate(190%)",
                WebkitBackdropFilter: "blur(28px) saturate(190%)",
                border: "1px solid rgba(255,255,255,0.75)",
                borderTopColor: "rgba(255,255,255,0.92)",
                borderRadius: 100, padding: `${py}px ${px}px`,
                boxShadow: "0 6px 32px rgba(0,0,0,0.09),0 1px 2px rgba(0,0,0,0.05),inset 0 1px 0 rgba(255,255,255,1),inset 0 -1px 0 rgba(0,0,0,0.04)",
                whiteSpace: "nowrap", userSelect: "none",
                fontFamily: SG, fontWeight: 700, fontSize: size, letterSpacing: "-0.03em", lineHeight: 1,
                ...style
            }}>
                <span style={{ color: "#0a0a0a" }}>launch</span>
                <span style={{
                    width: dot, height: dot, borderRadius: "50%",
                    background: "rgba(0,0,0,0.2)", flexShrink: 0,
                    margin: `0 ${dotMx}px ${dotMb}px`
                }} />
                <span style={{ color: "rgba(0,0,0,0.22)" }}>mate</span>
            </div>
        );
    }

    // default: dark glass
    return (
        <div style={{
            display: "inline-flex", alignItems: "center",
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(28px) saturate(160%)",
            WebkitBackdropFilter: "blur(28px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.13)",
            borderTopColor: "rgba(255,255,255,0.22)",
            borderRadius: 100, padding: `${py}px ${px}px`,
            boxShadow: "0 8px 40px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.12),inset 0 -1px 0 rgba(0,0,0,0.2)",
            whiteSpace: "nowrap", userSelect: "none",
            fontFamily: SG, fontWeight: 700, fontSize: size, letterSpacing: "-0.03em", lineHeight: 1,
            ...style
        }}>
            <span style={{ color: "#fff" }}>launch</span>
            <span style={{
                width: dot, height: dot, borderRadius: "50%",
                background: "rgba(255,255,255,0.26)", flexShrink: 0,
                margin: `0 ${dotMx}px ${dotMb}px`
            }} />
            <span style={{ color: "rgba(255,255,255,0.28)" }}>mate</span>
        </div>
    );
}