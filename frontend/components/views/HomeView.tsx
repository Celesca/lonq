/* eslint-disable @next/next/no-img-element */

import { Action } from "@/components/ui/Action";
import { Stat } from "@/components/ui/Stat";
import { cityLabels } from "@/lib/constants";
import type { Stats, TravelPlace, View } from "@/types/long";

export function HomeView({
  featured,
  savedCount,
  stats,
  setView,
  buildRoute,
}: {
  featured: TravelPlace[];
  savedCount: number;
  stats: Stats;
  setView: (view: View) => void;
  buildRoute: () => void;
}) {
  const hero = featured[0];

  return (
    <div className="space-y-5 px-4 py-4">
      <section className="relative h-72 overflow-hidden rounded-[8px] bg-[#2D6A6A] text-white">
        {hero && <img src={hero.image} alt={hero.name} className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#F6D58B]">Travel dating, but for places</p>
          <h2 className="text-3xl font-black leading-tight">Match your next Thailand day.</h2>
          <p className="mt-2 max-w-xs text-sm text-white/80">Swipe destinations, save the sparks, and turn them into a route.</p>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2">
        <Stat label="Swipes" value={stats.total_swipes} />
        <Stat label="Saved" value={savedCount} />
        <Stat label="Coins" value={stats.total_coins} />
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Action label="Start swiping" tone="primary" onClick={() => setView("discover")} />
        <Action label="Plan from saves" tone="teal" onClick={buildRoute} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-black">Recommended</h3>
          <button onClick={() => setView("discover")} className="text-sm font-bold text-[#C2703E]">
            ดูทั้งหมด
          </button>
        </div>
        <div className="grid gap-3">
          {featured.slice(0, 3).map((place) => (
            <article key={place.id} className="flex gap-3 rounded-[8px] border border-[#E8DED2] bg-white p-2">
              <img src={place.image} alt={place.name} className="h-20 w-24 rounded-[6px] object-cover" />
              <div className="min-w-0 py-1">
                <p className="truncate text-sm font-black">{place.name}</p>
                <p className="text-xs font-semibold text-[#C2703E]">
                  {cityLabels[place.city] || place.city} · {place.rating}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-[#6B635B]">{place.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
