from sqlalchemy import select

from app.db.session import Base, SessionLocal, engine
from app.models import Place, Reward


PLACES = [
    ("cm_1", "วัดอุโมงค์", 18.783636, 98.953588, "https://www.pattayafans.de/chiangmai/bilder/wat-umong-4.jpg", "วัดป่าที่สงบเงียบ มีอุโมงค์โบราณ สวนร่มรื่น และบรรยากาศเหมาะกับการพักใจจากเมือง", "Chiang Mai", 4.6, "~3.2 กม.", ["วัฒนธรรม", "ธรรมชาติ", "อากาศดี"]),
    ("cm_2", "อ่างแก้ว", 18.8020, 98.9446, "https://img.wongnai.com/p/400x0/2018/10/20/05895251d10049ffb2af523f5ac289f9.jpg", "อ่างเก็บน้ำในมหาวิทยาลัยเชียงใหม่ มีทางเดิน วิวภูเขา และสนามหญ้าสำหรับปิกนิกยามเย็น", "Chiang Mai", 4.7, "~3.4 กม.", ["ธรรมชาติ", "อากาศดี"]),
    ("cm_3", "หอคำหลวง", 18.752879, 98.922341, "https://img.freepik.com/free-photo/ho-kham-luang-northern-thai-style-building-thailand_100801-487.jpg?size=626&ext=jpg", "สถาปัตยกรรมล้านนาอันงดงามท่ามกลางสวนใหญ่ เหมาะกับการเดินช้า ๆ และถ่ายภาพ", "Chiang Mai", 4.7, "~10.7 กม.", ["วัฒนธรรม", "ธรรมชาติ"]),
    ("cm_4", "วัดโลกโมฬี", 18.7962, 98.9826, "https://ik.imagekit.io/tvlk/blog/2020/07/shutterstock_1219520572.jpg?tr=dpr-2,w-675", "วัดเก่าแก่ใกล้คูเมือง มีเจดีย์อิฐและรายละเอียดล้านนาที่งดงามแต่ไม่พลุกพล่าน", "Chiang Mai", 4.8, "~1.5 กม.", ["วัฒนธรรม"]),
    ("cm_5", "บ้านข้างวัด", 18.7892, 98.9538, "https://tluxe-aws.hmgcdn.com/public/article/2017/atl_20230621172059_166.jpg", "ชุมชนศิลปิน คาเฟ่ และเวิร์กช็อปงานคราฟต์ในบรรยากาศอบอุ่นแบบเชียงใหม่", "Chiang Mai", 4.5, "~4 กม.", ["วัฒนธรรม", "คาเฟ่", "ตลาด"]),
    ("cm_6", "แม่กำปอง", 18.8655, 99.3510, "https://royalvacationdmc.com/wp-content/uploads/2023/11/Mae-kampong.jpg", "หมู่บ้านบนภูเขาที่มีโฮมสเตย์ กาแฟ ลำธาร และอากาศเย็น เหมาะกับทริปชาร์จพลัง", "Chiang Mai", 4.7, "~50 กม.", ["ธรรมชาติ", "อากาศดี", "วัฒนธรรม"]),
    ("bkk_1", "วัดอรุณราชวราราม", 13.7437, 100.4888, "https://lp-cms-production.s3.amazonaws.com/public/2021-06/shutterstockRF_517093306.jpg", "วัดริมเจ้าพระยาที่โดดเด่นด้วยพระปรางค์ประดับกระเบื้อง งดงามมากช่วงเย็น", "Bangkok", 4.8, "~5 กม.", ["วัฒนธรรม", "แลนด์มาร์ก"]),
    ("bkk_2", "ตลาดน้อย", 13.7333, 100.5139, "https://d1ef7ke0x2i9g8.cloudfront.net/hong-kong/_1200x630_fit_center-center_82_none/20230111-Talat-Noi-PIC02.png?mtime=1724145861", "ย่านสร้างสรรค์เก่าแก่ มีสตรีทอาร์ต คาเฟ่ โกดังเก่า และเสน่ห์จีน-ไทยริมแม่น้ำ", "Bangkok", 4.6, "~3 กม.", ["วัฒนธรรม", "คาเฟ่", "ตลาด"]),
    ("bkk_3", "บางกะเจ้า", 13.6850, 100.5550, "https://www.thelostpassport.com/wp-content/uploads/2016/06/Bangkok-treehouse-Bang-Krachao.jpg", "พื้นที่สีเขียวขนาดใหญ่ใกล้กรุงเทพฯ ปั่นจักรยานผ่านสวน ตลาดน้ำ และทางเดินไม้", "Bangkok", 4.7, "~12 กม.", ["ธรรมชาติ", "อากาศดี"]),
    ("bkk_4", "มิวเซียมสยาม", 13.7441, 100.4936, "https://www.museumsiam.org/upload/cover/20190227_1551256248.jpg", "พิพิธภัณฑ์ร่วมสมัยที่เล่าเรื่องความเป็นไทยผ่านนิทรรศการอินเตอร์แอกทีฟ", "Bangkok", 4.5, "~4 กม.", ["วัฒนธรรม", "ในร่ม"]),
    ("bkk_5", "สวนเบญจกิติ", 13.7304, 100.5601, "https://static.bangkokpost.com/media/content/20220203/c1_2258143_700.jpg", "สวนใจกลางเมืองที่มีบึงใหญ่ สกายวอล์ก และเส้นทางวิ่งเดินท่ามกลางวิวเมือง", "Bangkok", 4.7, "~6 กม.", ["ธรรมชาติ", "อากาศดี"]),
    ("bkk_6", "คลองโอ่งอ่าง", 13.7468, 100.5022, "https://www.bangkokriver.com/wp-content/uploads/2021/02/Ong-Ang-Walking-Street.jpg", "ทางเดินริมคลองที่มีสตรีทอาร์ต อาหาร และบรรยากาศเมืองเก่าหลังปรับปรุง", "Bangkok", 4.3, "~3.5 กม.", ["ตลาด", "วัฒนธรรม", "อาหาร"]),
    ("ph_1", "ย่านเมืองเก่าภูเก็ต", 7.8840, 98.3873, "https://a.cdn-hotels.com/gdcs/production93/d1258/89b39278-d604-4d43-b6db-df330fccdbf6.jpg", "อาคารชิโนโปรตุกีสสีสด คาเฟ่ ร้านท้องถิ่น และสตรีทอาร์ตที่เหมาะกับการเดินสำรวจ", "Phuket", 4.7, "~1 กม.", ["วัฒนธรรม", "คาเฟ่", "ตลาด"]),
    ("ph_2", "แหลมพรหมเทพ", 7.7614, 98.3050, "https://www.phuket.net/wp-content/uploads/2018/10/promthep-cape-sunset-phuket.jpg", "จุดชมพระอาทิตย์ตกชื่อดังของภูเก็ต มองเห็นทะเลอันดามันและแนวหน้าผาสวยงาม", "Phuket", 4.6, "~18 กม.", ["ธรรมชาติ", "แลนด์มาร์ก"]),
    ("ph_3", "หาดยะนุ้ย", 7.7662, 98.3066, "https://www.hotelscombined.com/rimg/dimg/4b/53/1694f32e-city-23911-17c15eecf7c.jpg", "หาดเล็กน้ำใสใกล้แหลมพรหมเทพ เหมาะกับพายคายัค ดำน้ำตื้น และพักริมทะเล", "Phuket", 4.5, "~17 กม.", ["ธรรมชาติ", "ทะเล"]),
    ("ph_4", "พระใหญ่ภูเก็ต", 7.8276, 98.3128, "https://www.agoda.com/wp-content/uploads/2024/03/Big-Buddha-Phuket-Thailand.jpg", "พระพุทธรูปขนาดใหญ่บนเขานาคเกิด พร้อมวิวเมืองและชายฝั่งแบบพาโนรามา", "Phuket", 4.6, "~12 กม.", ["วัฒนธรรม", "แลนด์มาร์ก"]),
    ("ph_5", "หาดในหาน", 7.7792, 98.3069, "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/33/fc/f0/nai-harn-beach.jpg?w=1200&h=-1&s=1", "หาดโค้งสวย น้ำใส บรรยากาศสงบกว่าหาดหลัก เหมาะกับว่ายน้ำและนอนอ่านหนังสือ", "Phuket", 4.7, "~16 กม.", ["ธรรมชาติ", "ทะเล"]),
    ("ph_6", "ตลาดชิลล์วา", 7.9031, 98.3802, "https://www.phuket101.net/wp-content/uploads/20181029_202553.jpg", "ตลาดกลางคืนสไตล์คอนเทนเนอร์ มีอาหาร เสื้อผ้า งานคราฟต์ และดนตรีสด", "Phuket", 4.4, "~4 กม.", ["ตลาด", "อาหาร"]),
]

REWARDS = [
    ("ส่วนลดกาแฟท้องถิ่น", "ลด 20% ที่คาเฟ่พาร์ตเนอร์ในเชียงใหม่ กรุงเทพฯ และภูเก็ต", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80", 60, "food", "LONGCAFE20", "31 Dec 2026", "Partner cafes"),
    ("โปสการ์ด LONG", "แลกโปสการ์ดลายเมืองไทยสำหรับส่งให้เพื่อนร่วมทริป", "https://images.unsplash.com/photo-1516542076529-1ea3854896f2?auto=format&fit=crop&w=900&q=80", 40, "souvenir", "LONGPOST", "31 Dec 2026", "LONG pop-up"),
    ("Mini walking tour", "รับส่วนลดทัวร์เดินย่านสร้างสรรค์กับไกด์ท้องถิ่น", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80", 120, "experience", "LONGWALK", "31 Dec 2026", "Bangkok / Chiang Mai / Phuket"),
]


def seed_database() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if db.scalar(select(Place.id).limit(1)) is None:
            for external_id, name, lat, long, image, description, city, rating, distance, tags in PLACES:
                db.add(
                    Place(
                        external_id=external_id,
                        name=name,
                        latitude=lat,
                        longitude=long,
                        image_url=image,
                        description=description,
                        city=city,
                        rating=rating,
                        distance=distance,
                        tags=tags,
                    )
                )

        if db.scalar(select(Reward.id).limit(1)) is None:
            for name, description, image, cost, category, code, valid_until, location in REWARDS:
                db.add(
                    Reward(
                        name=name,
                        description=description,
                        image=image,
                        coin_cost=cost,
                        category=category,
                        discount_code=code,
                        valid_until=valid_until,
                        location=location,
                    )
                )

        db.commit()
