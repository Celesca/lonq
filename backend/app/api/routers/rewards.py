from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.db.session import DbSession
from app.models.reward import RedeemedReward, Reward

router = APIRouter(tags=["rewards"])


@router.get("/rewards")
def get_rewards(db: DbSession) -> dict[str, object]:
    rewards = list(db.scalars(select(Reward).order_by(Reward.coin_cost)))
    return {
        "rewards": [
            {
                "id": reward.id,
                "name": reward.name,
                "description": reward.description,
                "image": reward.image,
                "coinCost": reward.coin_cost,
                "category": reward.category,
                "discountCode": reward.discount_code,
                "validUntil": reward.valid_until,
                "location": reward.location,
            }
            for reward in rewards
        ],
        "total": len(rewards),
    }


@router.post("/rewards/{reward_id}/redeem")
def redeem_reward(reward_id: int, user_id: str, db: DbSession) -> dict[str, object]:
    from app.services.users import get_or_create_user

    user = get_or_create_user(db, user_id)
    reward = db.get(Reward, reward_id)
    if reward is None:
        raise HTTPException(status_code=404, detail="reward not found")
    if user.total_coins < reward.coin_cost:
        return {"success": False, "message": "Not enough coins"}

    user.total_coins -= reward.coin_cost
    db.add(RedeemedReward(user_id=user.id, reward_id=reward.id))
    db.commit()
    return {"success": True, "message": f"Redeemed. Code: {reward.discount_code}", "coins": user.total_coins}
