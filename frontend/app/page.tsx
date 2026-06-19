"use client";
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useMemo, useState } from "react";

type View = "home" | "discover" | "saved" | "plan" | "rewards";

type TravelPlace = {
  id: string;
  backendId: number;
  name: string;
  lat: number;
  long: number;
  image: string;
  description: string;
  city: string;
  country: string;
  rating: number;
  distance: string;
  tags: string[];
};

type City = { name: string; place_count: number };
type Stats = {
  total_swipes: number;
  liked_places: number;
  disliked_places: number;
  total_coins: number;
};
type Reward = {
  id: number;
  name: string;
  description: string;
  image: string;
  coinCost: number;
  category: string;
  discountCode: string;
  validUntil: string;
  location: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const USER_ID = "long-demo-traveler";

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

const viewLabels: Record<View, string> = {
  home: "หน้าหลัก",
  discover: "สำรวจ",
  saved: "บันทึก",
  plan: "แผนทริป",
  rewards: "รางวัล",
};

const cityLabels: Record<string, string> = {
  Bangkok: "กรุงเทพฯ",
  "Chiang Mai": "เชียงใหม่",
  Phuket: "ภูเก็ต",
};

const personalities = [
  { id: "balanced", label: "Balanced", description: "แลนด์มาร์ก วัฒนธรรม และธรรมชาติแบบพอดี" },
  { id: "slow introvert", label: "Slow", description: "เดินช้า สงบ และเน้นพื้นที่หายใจได้" },
  { id: "food explorer", label: "Food", description: "ตลาด คาเฟ่ และรสชาติท้องถิ่นมาก่อน" },
];

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [deck, setDeck] = useState<TravelPlace[]>([]);
  const [saved, setSaved] = useState<TravelPlace[]>([]);
  const [route, setRoute] = useState<TravelPlace[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [stats, setStats] = useState<Stats>({ total_swipes: 0, liked_places: 0, disliked_places: 0, total_coins: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState<TravelPlace | null>(null);
  const [personality, setPersonality] = useState("balanced");
  const [duration, setDuration] = useState("1 วัน ไม่ค้างคืน");
  const [routeCity, setRouteCity] = useState("all");
  const [status, setStatus] = useState("กำลังเตรียมทริปของคุณ...");

  const activePlace = deck[activeIndex];
  const featured = useMemo(() => [...deck, ...saved, ...route].slice(0, 5), [deck, route, saved]);

  async function boot() {
    setStatus("กำลังเชื่อมต่อ LONG API...");
    await api("/users", {
      method: "POST",
      body: JSON.stringify({ user_id: USER_ID, display_name: "LONG Traveler" }),
    });
    const [cityData, prefData, savedData, statsData, rewardsData] = await Promise.all([
      api<{ cities: City[] }>("/cities"),
      api<{ selected_cities: string[] }>("/preferences?user_id=" + USER_ID),
      api<{ places: TravelPlace[] }>("/liked?user_id=" + USER_ID),
      api<Stats>("/stats?user_id=" + USER_ID),
      api<{ rewards: Reward[] }>("/rewards"),
    ]);
    const defaultCities = prefData.selected_cities.length ? prefData.selected_cities : ["Chiang Mai"];
    setCities(cityData.cities);
    setSelectedCities(defaultCities);
    setSaved(savedData.places);
    setStats(statsData);
    setRewards(rewardsData.rewards);
    await loadDeck(defaultCities);
    setStatus("");
  }

  async function loadDeck(nextCities = selectedCities) {
    const params = new URLSearchParams({ user_id: USER_ID });
    nextCities.forEach((city) => params.append("cities", city));
    const data = await api<{ places: TravelPlace[] }>(`/tinder?${params.toString()}`);
    setDeck(data.places);
    setActiveIndex(0);
  }

  async function refreshSaved() {
    const [savedData, statsData] = await Promise.all([
      api<{ places: TravelPlace[] }>("/liked?user_id=" + USER_ID),
      api<Stats>("/stats?user_id=" + USER_ID),
    ]);
    setSaved(savedData.places);
    setStats(statsData);
  }

  useEffect(() => {
    // The boot sequence intentionally hydrates client state from the API once.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    boot().catch((error) => setStatus(`API unavailable: ${error.message}`));
  }, []);

  async function chooseCity(city: string) {
    const next = selectedCities.includes(city)
      ? selectedCities.filter((item) => item !== city)
      : [...selectedCities, city];
    const normalized = next.length ? next : [city];
    setSelectedCities(normalized);
    await api(`/preferences?user_id=${USER_ID}`, {
      method: "PUT",
      body: JSON.stringify({ selected_cities: normalized }),
    });
    await loadDeck(normalized);
  }

  async function swipe(direction: "left" | "right") {
    if (!activePlace) return;
    await api("/swipes", {
      method: "POST",
      body: JSON.stringify({ user_id: USER_ID, place_id: activePlace.backendId, direction }),
    });
    setActiveIndex((index) => index + 1);
    await refreshSaved();
  }

  async function resetDiscovery() {
    await api(`/progress?user_id=${USER_ID}`, { method: "DELETE" });
    setSaved([]);
    setRoute([]);
    await loadDeck();
    await refreshSaved();
  }

  async function removeSaved(place: TravelPlace) {
    await api(`/liked/${place.backendId}?user_id=${USER_ID}`, { method: "DELETE" });
    setSaved((items) => items.filter((item) => item.id !== place.id));
    await refreshSaved();
  }

  async function buildRoute() {
    const data = await api<{ places: TravelPlace[] }>("/route", {
      method: "POST",
      body: JSON.stringify({ user_id: USER_ID, personality, duration, city: routeCity }),
    });
    setRoute(data.places);
    setView("plan");
  }

  async function redeem(reward: Reward) {
    const data = await api<{ success: boolean; message: string; coins?: number }>(
      `/rewards/${reward.id}/redeem?user_id=${USER_ID}`,
      { method: "POST" },
    );
    setStatus(data.message);
    await refreshSaved();
  }

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
              {stats.total_coins} coins
            </div>
          </div>
          {status && <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-[#6B635B]">{status}</p>}
        </header>

        <section className="flex-1 overflow-hidden">
          {view === "home" && (
            <HomeView
              featured={featured}
              savedCount={saved.length}
              stats={stats}
              setView={setView}
              buildRoute={buildRoute}
            />
          )}

          {view === "discover" && (
            <DiscoverView
              cities={cities}
              selectedCities={selectedCities}
              activePlace={activePlace}
              activeIndex={activeIndex}
              total={deck.length}
              chooseCity={chooseCity}
              swipe={swipe}
              resetDiscovery={resetDiscovery}
              openPlace={setSelectedPlace}
            />
          )}

          {view === "saved" && (
            <SavedView
              saved={saved}
              openPlace={setSelectedPlace}
              removeSaved={removeSaved}
              setView={setView}
              buildRoute={buildRoute}
            />
          )}

          {view === "plan" && (
            <PlanView
              route={route}
              cities={cities}
              routeCity={routeCity}
              setRouteCity={setRouteCity}
              personality={personality}
              setPersonality={setPersonality}
              duration={duration}
              setDuration={setDuration}
              buildRoute={buildRoute}
              openPlace={setSelectedPlace}
            />
          )}

          {view === "rewards" && (
            <RewardsView rewards={rewards} stats={stats} redeem={redeem} />
          )}
        </section>

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

      {selectedPlace && <PlaceModal place={selectedPlace} close={() => setSelectedPlace(null)} />}
    </main>
  );
}

function HomeView({
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
          <button onClick={() => setView("discover")} className="text-sm font-bold text-[#C2703E]">ดูทั้งหมด</button>
        </div>
        <div className="grid gap-3">
          {featured.slice(0, 3).map((place) => (
            <article key={place.id} className="flex gap-3 rounded-[8px] border border-[#E8DED2] bg-white p-2">
              <img src={place.image} alt={place.name} className="h-20 w-24 rounded-[6px] object-cover" />
              <div className="min-w-0 py-1">
                <p className="truncate text-sm font-black">{place.name}</p>
                <p className="text-xs font-semibold text-[#C2703E]">{cityLabels[place.city] || place.city} · {place.rating}</p>
                <p className="mt-1 line-clamp-2 text-xs text-[#6B635B]">{place.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function DiscoverView({
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
              <span key={tag} className="rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-[#2D2926]">{tag}</span>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-md bg-[#D4A853] px-2 py-1 text-xs font-black">{activePlace.rating}</span>
              <span className="text-sm font-semibold text-white/75">{cityLabels[activePlace.city] || activePlace.city} · {activePlace.distance}</span>
            </div>
            <h2 className="text-3xl font-black">{activePlace.name}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/80">{activePlace.description}</p>
            <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <button onClick={() => swipe("left")} className="h-14 rounded-full border border-white/30 bg-white/15 text-xl font-black backdrop-blur">×</button>
              <button onClick={() => openPlace(activePlace)} className="h-11 w-11 rounded-full bg-[#2D6A6A] text-sm font-black">i</button>
              <button onClick={() => swipe("right")} className="h-14 rounded-full bg-[#C2703E] text-xl font-black">♥</button>
            </div>
          </div>
        </article>
      ) : (
        <div className="flex min-h-[520px] flex-1 flex-col items-center justify-center rounded-[8px] border border-[#E8DED2] bg-white p-8 text-center">
          <h2 className="text-2xl font-black">ดูครบแล้ว</h2>
          <p className="mt-2 text-sm text-[#6B635B]">ลองเปลี่ยนเมืองหรือรีเซ็ตเพื่อเริ่มจับคู่ใหม่</p>
          <button onClick={resetDiscovery} className="mt-5 rounded-full bg-[#2D6A6A] px-5 py-3 text-sm font-bold text-white">เริ่มใหม่</button>
        </div>
      )}
    </div>
  );
}

function SavedView({
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
        <button onClick={buildRoute} className="rounded-full bg-[#C2703E] px-4 py-2 text-sm font-bold text-white">วางแผน</button>
      </div>
      {saved.length === 0 ? (
        <div className="rounded-[8px] border border-[#E8DED2] bg-white p-8 text-center">
          <h3 className="font-black">ยังไม่มีสถานที่ที่บันทึก</h3>
          <p className="mt-2 text-sm text-[#6B635B]">เริ่มสำรวจเพื่อสร้างคอลเลกชันทริปในฝัน</p>
          <button onClick={() => setView("discover")} className="mt-4 rounded-full bg-[#C2703E] px-5 py-3 text-sm font-bold text-white">ไปสำรวจ</button>
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
                    <p className="text-xs font-bold text-[#C2703E]">{cityLabels[place.city] || place.city} · {place.rating}</p>
                  </div>
                  <button onClick={(event) => { event.stopPropagation(); removeSaved(place); }} className="h-8 w-8 rounded-full bg-[#F6F1EA] font-black text-[#8B8178]">×</button>
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

function PlanView({
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
            {cities.map((city) => <option key={city.name} value={city.name}>{cityLabels[city.name] || city.name}</option>)}
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
        <button onClick={buildRoute} className="mt-3 w-full rounded-full bg-[#2D6A6A] py-3 text-sm font-black text-white">Generate route</button>
      </section>

      <section className="grid gap-3">
        {route.map((place, index) => (
          <article key={place.id} onClick={() => openPlace(place)} className="grid grid-cols-[44px_1fr] gap-3 rounded-[8px] border border-[#E8DED2] bg-white p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#C2703E] text-lg font-black text-white">{index + 1}</div>
            <div className="min-w-0">
              <h3 className="truncate font-black">{place.name}</h3>
              <p className="text-xs font-bold text-[#2D6A6A]">{cityLabels[place.city] || place.city} · {place.distance}</p>
              <p className="mt-1 line-clamp-2 text-sm text-[#6B635B]">{place.description}</p>
            </div>
          </article>
        ))}
        {route.length === 0 && <p className="rounded-[8px] bg-white p-5 text-center text-sm text-[#6B635B]">กด Generate route เพื่อเริ่มจัดเส้นทาง</p>}
      </section>
    </div>
  );
}

function RewardsView({ rewards, stats, redeem }: { rewards: Reward[]; stats: Stats; redeem: (reward: Reward) => void }) {
  return (
    <div className="space-y-3 px-4 py-4">
      <div className="rounded-[8px] bg-[#2D6A6A] p-5 text-white">
        <p className="text-sm text-white/70">LONG coins</p>
        <h2 className="text-4xl font-black">{stats.total_coins}</h2>
      </div>
      {rewards.map((reward) => (
        <article key={reward.id} className="overflow-hidden rounded-[8px] border border-[#E8DED2] bg-white">
          <img src={reward.image} alt={reward.name} className="h-32 w-full object-cover" />
          <div className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black">{reward.name}</h3>
                <p className="text-sm text-[#6B635B]">{reward.description}</p>
              </div>
              <p className="rounded-full bg-[#F6F1EA] px-3 py-1 text-sm font-black text-[#C2703E]">{reward.coinCost}</p>
            </div>
            <button onClick={() => redeem(reward)} className="mt-3 w-full rounded-full bg-[#C2703E] py-3 text-sm font-black text-white">แลกเลย</button>
          </div>
        </article>
      ))}
    </div>
  );
}

function PlaceModal({ place, close }: { place: TravelPlace; close: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3" onClick={close}>
      <article className="max-h-[88vh] w-full max-w-[480px] overflow-auto rounded-[8px] bg-white" onClick={(event) => event.stopPropagation()}>
        <img src={place.image} alt={place.name} className="h-64 w-full object-cover" />
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">{place.name}</h2>
              <p className="text-sm font-bold text-[#C2703E]">{cityLabels[place.city] || place.city} · {place.rating} · {place.distance}</p>
            </div>
            <button onClick={close} className="h-9 w-9 rounded-full bg-[#F6F1EA] font-black">×</button>
          </div>
          <p className="text-sm leading-6 text-[#6B635B]">{place.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {place.tags.map((tag) => <span key={tag} className="rounded-md bg-[#F6F1EA] px-2 py-1 text-xs font-bold text-[#6B635B]">{tag}</span>)}
          </div>
          <a href={`https://www.google.com/maps?q=${place.lat},${place.long}`} target="_blank" rel="noreferrer" className="mt-4 block rounded-full bg-[#2D6A6A] py-3 text-center text-sm font-black text-white">เปิดแผนที่</a>
        </div>
      </article>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] border border-[#E8DED2] bg-white p-3 text-center">
      <p className="text-2xl font-black text-[#2D6A6A]">{value}</p>
      <p className="text-xs font-bold text-[#8B8178]">{label}</p>
    </div>
  );
}

function Action({ label, tone, onClick }: { label: string; tone: "primary" | "teal"; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`rounded-[8px] px-4 py-4 text-sm font-black text-white ${tone === "primary" ? "bg-[#C2703E]" : "bg-[#2D6A6A]"}`}>
      {label}
    </button>
  );
}
