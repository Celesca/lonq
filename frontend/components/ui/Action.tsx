export function Action({
  label,
  tone,
  onClick,
}: {
  label: string;
  tone: "primary" | "teal";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-[8px] px-4 py-4 text-sm font-black text-white ${tone === "primary" ? "bg-[#C2703E]" : "bg-[#2D6A6A]"}`}
    >
      {label}
    </button>
  );
}
