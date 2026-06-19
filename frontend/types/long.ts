export type View = "home" | "discover" | "saved" | "plan" | "rewards";

export type TravelPlace = {
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

export type City = {
  name: string;
  place_count: number;
};

export type Stats = {
  total_swipes: number;
  liked_places: number;
  disliked_places: number;
  total_coins: number;
};

export type Reward = {
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

export type Personality = {
  id: string;
  label: string;
  description: string;
};
