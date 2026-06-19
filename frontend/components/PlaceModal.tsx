/* eslint-disable @next/next/no-img-element */

import { cityLabels } from "@/lib/constants";
import type { TravelPlace } from "@/types/long";

export function PlaceModal({ place, close }: { place: TravelPlace; close: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3" onClick={close}>
      <article
        className="max-h-[88vh] w-full max-w-[480px] overflow-auto rounded-[8px] bg-white"
        onClick={(event) => event.stopPropagation()}
      >
        <img src={place.image} alt={place.name} className="h-64 w-full object-cover" />
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">{place.name}</h2>
              <p className="text-sm font-bold text-[#C2703E]">
                {cityLabels[place.city] || place.city} · {place.rating} · {place.distance}
              </p>
            </div>
            <button onClick={close} className="h-9 w-9 rounded-full bg-[#F6F1EA] font-black">
              ×
            </button>
          </div>
          <p className="text-sm leading-6 text-[#6B635B]">{place.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {place.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-[#F6F1EA] px-2 py-1 text-xs font-bold text-[#6B635B]">
                {tag}
              </span>
            ))}
          </div>
          <a
            href={`https://www.google.com/maps?q=${place.lat},${place.long}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 block rounded-full bg-[#2D6A6A] py-3 text-center text-sm font-black text-white"
          >
            เปิดแผนที่
          </a>
        </div>
      </article>
    </div>
  );
}
