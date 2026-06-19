import { viewLabels } from "@/lib/constants";
import type { View } from "@/types/long";

export function AppShell({
  children,
  coins,
  status,
  view,
  setView,
}: {
  children: React.ReactNode;
  coins: number;
  status: string;
  view: View;
  setView: (view: View) => void;
}) {
  return (
    <main className="min-h-screen bg-[#F6F1EA] text-[#2D2926]">
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-[#FBF8F3] shadow-2xl shadow-black/10">
        <header className="sticky top-0 z-30 border-b border-[#E8DED2] bg-[#FBF8F3]/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between">
            <button onClick={() => setView("home")} className="text-left" aria-label="LONG home">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#C2703E]">LONG</p>
              <h1 className="text-xl font-black leading-none">Thailand Match</h1>
            </button>
            <div className="rounded-full bg-[#2D6A6A] px-3 py-1.5 text-sm font-bold text-white">
              {coins} coins
            </div>
          </div>
          {status && <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-[#6B635B]">{status}</p>}
        </header>

        <section className="flex-1 overflow-hidden">{children}</section>

        <nav className="sticky bottom-0 z-30 grid grid-cols-5 border-t border-[#E8DED2] bg-white/95 px-2 py-2 backdrop-blur">
          {(["home", "discover", "saved", "plan", "rewards"] as View[]).map((item) => (
            <button
              key={item}
              onClick={() => setView(item)}
              className={`rounded-xl px-1 py-2 text-[11px] font-bold transition ${view === item ? "bg-[#C2703E] text-white" : "text-[#8B8178]"}`}
            >
              {viewLabels[item]}
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}
