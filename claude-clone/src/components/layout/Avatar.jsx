export default function Avatar({ initials = "U", size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg, #f59e0b, #d97706)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontSize: size * 0.4, fontWeight: 600, userSelect: "none",
    }}>
      {initials}
    </div>
  );
}
