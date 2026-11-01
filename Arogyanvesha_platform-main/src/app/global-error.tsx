"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#FAF7F2", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "24px",
        }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            background: "#FDE8E8", border: "1px solid rgba(176,32,32,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "24px",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B02020" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
          </div>

          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#2D2418", marginBottom: "8px", fontFamily: "Playfair Display, Georgia, serif" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "16px", color: "#7A6E64", maxWidth: "400px", lineHeight: 1.6, marginBottom: "32px" }}>
            An unexpected error occurred. Our team has been notified. Please try again or return to the homepage.
          </p>

          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={reset} style={{
              height: "48px", paddingInline: "28px", borderRadius: "12px",
              background: "linear-gradient(135deg, #682332 0%, #4A1520 100%)",
              color: "#fff", fontWeight: 600, fontSize: "15px", border: "none", cursor: "pointer",
            }}>
              Try again
            </button>
            <button onClick={() => (window.location.href = "/")} style={{
              height: "48px", paddingInline: "28px", borderRadius: "12px",
              background: "#fff", color: "#2D2418", fontWeight: 600, fontSize: "15px",
              border: "1px solid #E8E0D0", cursor: "pointer",
            }}>
              Go home
            </button>
          </div>

          {process.env.NODE_ENV === "development" && error.message && (
            <pre style={{
              marginTop: "32px", padding: "16px", borderRadius: "8px",
              background: "#FDE8E8", color: "#B02020", fontSize: "12px",
              maxWidth: "600px", overflowX: "auto", textAlign: "left",
            }}>
              {error.message}
            </pre>
          )}
        </div>
      </body>
    </html>
  );
}