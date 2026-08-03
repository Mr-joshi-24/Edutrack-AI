// Put this at src/components/common/Avatar.jsx
//
// Replaces the duplicated initials-circle markup in Navbar.jsx and
// Sidebar.jsx (both currently hardcode their own gradient + sizing).
const SIZES = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg" };

export default function Avatar({ name = "?", size = "md", className = "" }) {
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-[#38BDF8] to-[#1D4ED8] text-white flex items-center justify-center font-bold shadow-[0_0_16px_rgba(56,189,248,0.5)] shrink-0 ${SIZES[size]} ${className}`}
    >
      {name.charAt(0).toUpperCase() || "?"}
    </div>
  );
}