"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useMemo, useState } from "react";
import { longApi } from "@/lib/api";
import type { City, Reward, Stats, TravelPlace, View } from "@/types/long";

const initialStats: Stats = {
  total_swipes: 0,
  liked_places: 0,
  disliked_places: 0,
  total_coins: 0,
};

export function useLongApp() {
  const [view, setView] = useState<View>("home");
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [deck, setDeck] = useState<TravelPlace[]>([]);
  const [saved, setSaved] = useState<TravelPlace[]>([]);
  const [route, setRoute] = useState<TravelPlace[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState<TravelPlace | null>(null);
  const [personality, setPersonality] = useState("balanced");
  const [duration, setDuration] = useState("1 วัน ไม่ค้างคืน");
  const [routeCity, setRouteCity] = useState("all");
  const [status, setStatus] = useState("กำลังเตรียมทริปของคุณ...");

  const activePlace = deck[activeIndex];
  const featured = useMemo(() => [...deck, ...saved, ...route].slice(0, 5), [deck, route, saved]);

  async function loadDeck(nextCities = selectedCities) {
    const data = await longApi.getTinderPlaces(nextCities);
    setDeck(data.places);
    setActiveIndex(0);
  }

  async function refreshSaved() {
    const [savedData, statsData] = await Promise.all([longApi.getSavedPlaces(), longApi.getStats()]);
    setSaved(savedData.places);
    setStats(statsData);
  }

  async function boot() {
    setStatus("กำลังเชื่อมต่อ LONG API...");
    await longApi.createOrGetUser();
    const [cityData, prefData, savedData, statsData, rewardsData] = await Promise.all([
      longApi.getCities(),
      longApi.getPreferences(),
      longApi.getSavedPlaces(),
      longApi.getStats(),
      longApi.getRewards(),
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
    await longApi.updatePreferences(normalized);
    await loadDeck(normalized);
  }

  async function swipe(direction: "left" | "right") {
    if (!activePlace) return;
    await longApi.swipe(activePlace.backendId, direction);
    setActiveIndex((index) => index + 1);
    await refreshSaved();
  }

  async function resetDiscovery() {
    await longApi.resetProgress();
    setSaved([]);
    setRoute([]);
    await loadDeck();
    await refreshSaved();
  }

  async function removeSaved(place: TravelPlace) {
    await longApi.removeSavedPlace(place.backendId);
    setSaved((items) => items.filter((item) => item.id !== place.id));
    await refreshSaved();
  }

  async function buildRoute() {
    const data = await longApi.createRoute({ personality, duration, city: routeCity });
    setRoute(data.places);
    setView("plan");
  }

  async function redeem(reward: Reward) {
    const data = await longApi.redeemReward(reward.id);
    setStatus(data.message);
    await refreshSaved();
  }

  return {
    activeIndex,
    activePlace,
    buildRoute,
    chooseCity,
    cities,
    deck,
    duration,
    featured,
    personality,
    redeem,
    removeSaved,
    resetDiscovery,
    rewards,
    route,
    routeCity,
    saved,
    selectedCities,
    selectedPlace,
    setDuration,
    setPersonality,
    setRouteCity,
    setSelectedPlace,
    setView,
    stats,
    status,
    swipe,
    view,
  };
}
