export function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] border border-[#E8DED2] bg-white p-3 text-center">
      <p className="text-2xl font-black text-[#2D6A6A]">{value}</p>
      <p className="text-xs font-bold text-[#8B8178]">{label}</p>
    </div>
  );
}
