/* eslint-disable @next/next/no-img-element */

import { cityLabels } from "@/lib/constants";
import type { City, TravelPlace } from "@/types/long";

export function DiscoverView({
  cities,
  selectedCities,
  activePlace,
  activeIndex,
  total,
  chooseCity,
  swipe,
  resetDiscovery,
  openPlace,
}: {
  cities: City[];
  selectedCities: string[];
  activePlace?: TravelPlace;
  activeIndex: number;
  total: number;
  chooseCity: (city: string) => void;
  swipe: (direction: "left" | "right") => void;
  resetDiscovery: () => void;
  openPlace: (place: TravelPlace) => void;
}) {
  return (
    <div className="flex h-full flex-col px-4 py-3">
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {cities.map((city) => (
          <button
            key={city.name}
            onClick={() => chooseCity(city.name)}
            className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold ${selectedCities.includes(city.name) ? "border-[#C2703E] bg-[#C2703E] text-white" : "border-[#E8DED2] bg-white text-[#6B635B]"}`}
          >
            {cityLabels[city.name] || city.name} · {city.place_count}
          </button>
        ))}
      </div>

      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[#E8DED2]">
        <div className="h-full rounded-full bg-[#C2703E]" style={{ width: total ? `${Math.min(((activeIndex + 1) / total) * 100, 100)}%` : "0%" }} />
      </div>

      {activePlace ? (
        <article className="relative min-h-[520px] flex-1 overflow-hidden rounded-[8px] bg-white shadow-xl shadow-black/10">
          <img src={activePlace.image} alt={activePlace.name} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <div className="absolute left-4 top-4 flex gap-2">
            {activePlace.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-[#2D2926]">
                {tag}
              </span>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-md bg-[#D4A853] px-2 py-1 text-xs font-black">{activePlace.rating}</span>
              <span className="text-sm font-semibold text-white/75">
                {cityLabels[activePlace.city] || activePlace.city} · {activePlace.distance}
              </span>
            </div>
            <h2 className="text-3xl font-black">{activePlace.name}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/80">{activePlace.description}</p>
            <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <button onClick={() => swipe("left")} className="h-14 rounded-full border border-white/30 bg-white/15 text-xl font-black backdrop-blur">
                ×
              </button>
              <button onClick={() => openPlace(activePlace)} className="h-11 w-11 rounded-full bg-[#2D6A6A] text-sm font-black">
                i
              </button>
              <button onClick={() => swipe("right")} className="h-14 rounded-full bg-[#C2703E] text-xl font-black">
                ♥
              </button>
            </div>
          </div>
        </article>
      ) : (
        <div className="flex min-h-[520px] flex-1 flex-col items-center justify-center rounded-[8px] border border-[#E8DED2] bg-white p-8 text-center">
          <h2 className="text-2xl font-black">ดูครบแล้ว</h2>
          <p className="mt-2 text-sm text-[#6B635B]">ลองเปลี่ยนเมืองหรือรีเซ็ตเพื่อเริ่มจับคู่ใหม่</p>
          <button onClick={resetDiscovery} className="mt-5 rounded-full bg-[#2D6A6A] px-5 py-3 text-sm font-bold text-white">
            เริ่มใหม่
          </button>
        </div>
      )}
    </div>
  );
}
