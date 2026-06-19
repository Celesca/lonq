/* eslint-disable @next/next/no-img-element */

import { cityLabels } from "@/lib/constants";
import type { TravelPlace, View } from "@/types/long";

export function SavedView({
  saved,
  openPlace,
  removeSaved,
  setView,
  buildRoute,
}: {
  saved: TravelPlace[];
  openPlace: (place: TravelPlace) => void;
  removeSaved: (place: TravelPlace) => void;
  setView: (view: View) => void;
  buildRoute: () => void;
}) {
  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black">ที่บันทึกของฉัน</h2>
          <p className="text-sm text-[#6B635B]">{saved.length} places matched</p>
        </div>
        <button onClick={buildRoute} className="rounded-full bg-[#C2703E] px-4 py-2 text-sm font-bold text-white">
          วางแผน
        </button>
      </div>
      {saved.length === 0 ? (
        <div className="rounded-[8px] border border-[#E8DED2] bg-white p-8 text-center">
          <h3 className="font-black">ยังไม่มีสถานที่ที่บันทึก</h3>
          <p className="mt-2 text-sm text-[#6B635B]">เริ่มสำรวจเพื่อสร้างคอลเลกชันทริปในฝัน</p>
          <button onClick={() => setView("discover")} className="mt-4 rounded-full bg-[#C2703E] px-5 py-3 text-sm font-bold text-white">
            ไปสำรวจ
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {saved.map((place) => (
            <article key={place.id} onClick={() => openPlace(place)} className="overflow-hidden rounded-[8px] border border-[#E8DED2] bg-white">
              <img src={place.image} alt={place.name} className="h-40 w-full object-cover" />
              <div className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black">{place.name}</h3>
                    <p className="text-xs font-bold text-[#C2703E]">
                      {cityLabels[place.city] || place.city} · {place.rating}
                    </p>
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      removeSaved(place);
                    }}
                    className="h-8 w-8 rounded-full bg-[#F6F1EA] font-black text-[#8B8178]"
                  >
                    ×
                  </button>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-[#6B635B]">{place.description}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
