import type { Personality, View } from "@/types/long";

export const DEMO_USER_ID = "long-demo-traveler";

export const viewLabels: Record<View, string> = {
  home: "หน้าหลัก",
  discover: "สำรวจ",
  saved: "บันทึก",
  plan: "แผนทริป",
  rewards: "รางวัล",
};

export const cityLabels: Record<string, string> = {
  Bangkok: "กรุงเทพฯ",
  "Chiang Mai": "เชียงใหม่",
  Phuket: "ภูเก็ต",
};

export const personalities: Personality[] = [
  { id: "balanced", label: "Balanced", description: "แลนด์มาร์ก วัฒนธรรม และธรรมชาติแบบพอดี" },
  { id: "slow introvert", label: "Slow", description: "เดินช้า สงบ และเน้นพื้นที่หายใจได้" },
  { id: "food explorer", label: "Food", description: "ตลาด คาเฟ่ และรสชาติท้องถิ่นมาก่อน" },
];
