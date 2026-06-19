/* eslint-disable @next/next/no-img-element */

import type { Reward, Stats } from "@/types/long";

export function RewardsView({
  rewards,
  stats,
  redeem,
}: {
  rewards: Reward[];
  stats: Stats;
  redeem: (reward: Reward) => void;
}) {
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
            <button onClick={() => redeem(reward)} className="mt-3 w-full rounded-full bg-[#C2703E] py-3 text-sm font-black text-white">
              แลกเลย
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
