import { cityLabels, personalities } from "@/lib/constants";
import type { City, TravelPlace } from "@/types/long";

export function PlanView({
  route,
  cities,
  routeCity,
  setRouteCity,
  personality,
  setPersonality,
  duration,
  setDuration,
  buildRoute,
  openPlace,
}: {
  route: TravelPlace[];
  cities: City[];
  routeCity: string;
  setRouteCity: (city: string) => void;
  personality: string;
  setPersonality: (personality: string) => void;
  duration: string;
  setDuration: (duration: string) => void;
  buildRoute: () => void;
  openPlace: (place: TravelPlace) => void;
}) {
  return (
    <div className="space-y-4 px-4 py-4">
      <section>
        <h2 className="text-xl font-black">สร้าง Route</h2>
        <p className="text-sm text-[#6B635B]">เลือก mood แล้วให้ LONG เรียงจุดหมายจากที่คุณบันทึก</p>
      </section>

      <section className="rounded-[8px] border border-[#E8DED2] bg-white p-3">
        <div className="mb-3 grid grid-cols-2 gap-2">
          <select value={routeCity} onChange={(event) => setRouteCity(event.target.value)} className="rounded-[8px] border border-[#E8DED2] bg-[#FBF8F3] px-3 py-3 text-sm font-bold">
            <option value="all">ทุกเมือง</option>
            {cities.map((city) => (
              <option key={city.name} value={city.name}>
                {cityLabels[city.name] || city.name}
              </option>
            ))}
          </select>
          <select value={duration} onChange={(event) => setDuration(event.target.value)} className="rounded-[8px] border border-[#E8DED2] bg-[#FBF8F3] px-3 py-3 text-sm font-bold">
            <option>1 วัน ไม่ค้างคืน</option>
            <option>2 วัน 1 คืน</option>
          </select>
        </div>
        <div className="grid gap-2">
          {personalities.map((item) => (
            <button key={item.id} onClick={() => setPersonality(item.id)} className={`rounded-[8px] border p-3 text-left ${personality === item.id ? "border-[#2D6A6A] bg-[#EAF3EF]" : "border-[#E8DED2] bg-white"}`}>
              <p className="text-sm font-black">{item.label}</p>
              <p className="text-xs text-[#6B635B]">{item.description}</p>
            </button>
          ))}
        </div>
        <button onClick={buildRoute} className="mt-3 w-full rounded-full bg-[#2D6A6A] py-3 text-sm font-black text-white">
          Generate route
        </button>
      </section>

      <section className="grid gap-3">
        {route.map((place, index) => (
          <article key={place.id} onClick={() => openPlace(place)} className="grid grid-cols-[44px_1fr] gap-3 rounded-[8px] border border-[#E8DED2] bg-white p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C2703E] text-lg font-black text-white">{index + 1}</div>
            <div className="min-w-0">
              <h3 className="truncate font-black">{place.name}</h3>
              <p className="text-xs font-bold text-[#2D6A6A]">
                {cityLabels[place.city] || place.city} · {place.distance}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-[#6B635B]">{place.description}</p>
            </div>
          </article>
        ))}
        {route.length === 0 && <p className="rounded-[8px] bg-white p-5 text-center text-sm text-[#6B635B]">กด Generate route เพื่อเริ่มจัดเส้นทาง</p>}
      </section>
    </div>
  );
}
