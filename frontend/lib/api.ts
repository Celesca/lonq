import { DEMO_USER_ID } from "@/lib/constants";
import type { City, Reward, Stats, TravelPlace } from "@/types/long";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export const longApi = {
  createOrGetUser() {
    return request("/users", {
      method: "POST",
      body: JSON.stringify({ user_id: DEMO_USER_ID, display_name: "LONG Traveler" }),
    });
  },

  getCities() {
    return request<{ cities: City[] }>("/cities");
  },

  getPreferences() {
    return request<{ selected_cities: string[]; travel_personality?: string; preferred_tags: string[] }>(
      `/preferences?user_id=${DEMO_USER_ID}`,
    );
  },

  updatePreferences(selectedCities: string[]) {
    return request(`/preferences?user_id=${DEMO_USER_ID}`, {
      method: "PUT",
      body: JSON.stringify({ selected_cities: selectedCities }),
    });
  },

  getTinderPlaces(cities: string[]) {
    const params = new URLSearchParams({ user_id: DEMO_USER_ID });
    cities.forEach((city) => params.append("cities", city));
    return request<{ places: TravelPlace[]; total: number }>(`/tinder?${params.toString()}`);
  },

  swipe(placeId: number, direction: "left" | "right") {
    return request("/swipes", {
      method: "POST",
      body: JSON.stringify({ user_id: DEMO_USER_ID, place_id: placeId, direction }),
    });
  },

  getSavedPlaces() {
    return request<{ places: TravelPlace[]; total: number }>(`/liked?user_id=${DEMO_USER_ID}`);
  },

  removeSavedPlace(placeId: number) {
    return request(`/liked/${placeId}?user_id=${DEMO_USER_ID}`, { method: "DELETE" });
  },

  resetProgress() {
    return request(`/progress?user_id=${DEMO_USER_ID}`, { method: "DELETE" });
  },

  getStats() {
    return request<Stats>(`/stats?user_id=${DEMO_USER_ID}`);
  },

  getRewards() {
    return request<{ rewards: Reward[]; total: number }>("/rewards");
  },

  redeemReward(rewardId: number) {
    return request<{ success: boolean; message: string; coins?: number }>(
      `/rewards/${rewardId}/redeem?user_id=${DEMO_USER_ID}`,
      { method: "POST" },
    );
  },

  createRoute(input: { personality: string; duration: string; city: string }) {
    return request<{ places: TravelPlace[]; total: number }>("/route", {
      method: "POST",
      body: JSON.stringify({ user_id: DEMO_USER_ID, ...input }),
    });
  },
};
