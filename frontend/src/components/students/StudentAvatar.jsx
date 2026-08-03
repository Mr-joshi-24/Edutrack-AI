export default function StudentAvatar({ name, photoUrl, size = 40 }) {
  const initials = (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover ring-2 ring-white/60 shadow-sm"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-gradient-to-br from-[#38BDF8] to-[#1D4ED8] text-white flex items-center justify-center font-semibold shadow-[0_0_12px_rgba(37,99,235,0.25)]"
    >
      {initials}
    </div>
  );
}