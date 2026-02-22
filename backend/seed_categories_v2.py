"""
Seed V2 Categories with hierarchy for MegaMenu
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime, timezone
import uuid

load_dotenv(Path(__file__).parent.parent / '.env')

def uid(): 
    return str(uuid.uuid4())

async def seed_categories_v2():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    # Check if already seeded
    count = await db.categories.count_documents({"parent_id": {"$exists": True}})
    if count > 5:
        print("V2 Categories already seeded")
        return
    
    # Clear old categories
    await db.categories.delete_many({})
    
    now = datetime.now(timezone.utc).isoformat()
    
    # ROOT CATEGORIES
    smartphones = {"id": uid(), "parent_id": None, "slug": "smartphones", "name": "Смартфони", "name_uk": "Смартфони", "name_ru": "Смартфоны", "icon": "📱", "order": 10, "is_active": True, "created_at": now}
    laptops = {"id": uid(), "parent_id": None, "slug": "laptops", "name": "Ноутбуки", "name_uk": "Ноутбуки та комп'ютери", "name_ru": "Ноутбуки и компьютеры", "icon": "💻", "order": 20, "is_active": True, "created_at": now}
    tablets = {"id": uid(), "parent_id": None, "slug": "tablets", "name": "Планшети", "name_uk": "Планшети", "name_ru": "Планшеты", "icon": "📲", "order": 30, "is_active": True, "created_at": now}
    tv = {"id": uid(), "parent_id": None, "slug": "tv", "name": "Телевізори", "name_uk": "Телевізори та аудіо", "name_ru": "Телевизоры и аудио", "icon": "📺", "order": 40, "is_active": True, "created_at": now}
    audio = {"id": uid(), "parent_id": None, "slug": "audio", "name": "Аудіо", "name_uk": "Аудіо", "name_ru": "Аудио", "icon": "🎧", "order": 50, "is_active": True, "created_at": now}
    photo = {"id": uid(), "parent_id": None, "slug": "photo-video", "name": "Фото та відео", "name_uk": "Фото та відео", "name_ru": "Фото и видео", "icon": "📷", "order": 60, "is_active": True, "created_at": now}
    appliances = {"id": uid(), "parent_id": None, "slug": "appliances", "name": "Побутова техніка", "name_uk": "Побутова техніка", "name_ru": "Бытовая техника", "icon": "🏠", "order": 70, "is_active": True, "created_at": now}
    accessories = {"id": uid(), "parent_id": None, "slug": "accessories", "name": "Аксесуари", "name_uk": "Аксесуари", "name_ru": "Аксессуары", "icon": "⌚", "order": 80, "is_active": True, "created_at": now}
    gaming = {"id": uid(), "parent_id": None, "slug": "gaming", "name": "Ігри та консолі", "name_uk": "Ігри та консолі", "name_ru": "Игры и консоли", "icon": "🎮", "order": 90, "is_active": True, "created_at": now}
    smart_home = {"id": uid(), "parent_id": None, "slug": "smart-home", "name": "Розумний дім", "name_uk": "Розумний дім", "name_ru": "Умный дом", "icon": "🏡", "order": 100, "is_active": True, "created_at": now}
    
    roots = [smartphones, laptops, tablets, tv, audio, photo, appliances, accessories, gaming, smart_home]
    
    # SUBCATEGORIES
    subcats = [
        # Smartphones
        {"id": uid(), "parent_id": smartphones["id"], "slug": "iphone", "name": "iPhone", "name_uk": "iPhone", "name_ru": "iPhone", "order": 1, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": smartphones["id"], "slug": "samsung", "name": "Samsung", "name_uk": "Samsung Galaxy", "name_ru": "Samsung Galaxy", "order": 2, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": smartphones["id"], "slug": "xiaomi", "name": "Xiaomi", "name_uk": "Xiaomi", "name_ru": "Xiaomi", "order": 3, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": smartphones["id"], "slug": "google", "name": "Google Pixel", "name_uk": "Google Pixel", "name_ru": "Google Pixel", "order": 4, "is_active": True, "created_at": now},
        
        # Laptops
        {"id": uid(), "parent_id": laptops["id"], "slug": "macbook", "name": "MacBook", "name_uk": "MacBook", "name_ru": "MacBook", "order": 1, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": laptops["id"], "slug": "gaming-laptops", "name": "Ігрові", "name_uk": "Ігрові ноутбуки", "name_ru": "Игровые ноутбуки", "order": 2, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": laptops["id"], "slug": "ultrabooks", "name": "Ультрабуки", "name_uk": "Ультрабуки", "name_ru": "Ультрабуки", "order": 3, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": laptops["id"], "slug": "business", "name": "Бізнес", "name_uk": "Для бізнесу", "name_ru": "Для бизнеса", "order": 4, "is_active": True, "created_at": now},
        
        # Tablets
        {"id": uid(), "parent_id": tablets["id"], "slug": "ipad", "name": "iPad", "name_uk": "iPad", "name_ru": "iPad", "order": 1, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": tablets["id"], "slug": "samsung-tablets", "name": "Samsung Tab", "name_uk": "Samsung Galaxy Tab", "name_ru": "Samsung Galaxy Tab", "order": 2, "is_active": True, "created_at": now},
        
        # TV & Audio
        {"id": uid(), "parent_id": tv["id"], "slug": "oled-tv", "name": "OLED TV", "name_uk": "OLED телевізори", "name_ru": "OLED телевизоры", "order": 1, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": tv["id"], "slug": "qled-tv", "name": "QLED TV", "name_uk": "QLED телевізори", "name_ru": "QLED телевизоры", "order": 2, "is_active": True, "created_at": now},
        
        # Audio
        {"id": uid(), "parent_id": audio["id"], "slug": "headphones", "name": "Навушники", "name_uk": "Навушники", "name_ru": "Наушники", "order": 1, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": audio["id"], "slug": "speakers", "name": "Колонки", "name_uk": "Колонки", "name_ru": "Колонки", "order": 2, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": audio["id"], "slug": "airpods", "name": "AirPods", "name_uk": "AirPods", "name_ru": "AirPods", "order": 3, "is_active": True, "created_at": now},
        
        # Photo
        {"id": uid(), "parent_id": photo["id"], "slug": "cameras", "name": "Камери", "name_uk": "Фотоапарати", "name_ru": "Фотоаппараты", "order": 1, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": photo["id"], "slug": "drones", "name": "Дрони", "name_uk": "Дрони", "name_ru": "Дроны", "order": 2, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": photo["id"], "slug": "action-cameras", "name": "Екшн-камери", "name_uk": "Екшн-камери", "name_ru": "Экшн-камеры", "order": 3, "is_active": True, "created_at": now},
        
        # Appliances
        {"id": uid(), "parent_id": appliances["id"], "slug": "vacuum", "name": "Пилососи", "name_uk": "Пилососи", "name_ru": "Пылесосы", "order": 1, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": appliances["id"], "slug": "coffee", "name": "Кавомашини", "name_uk": "Кавомашини", "name_ru": "Кофемашины", "order": 2, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": appliances["id"], "slug": "kitchen", "name": "Кухня", "name_uk": "Для кухні", "name_ru": "Для кухни", "order": 3, "is_active": True, "created_at": now},
        
        # Accessories
        {"id": uid(), "parent_id": accessories["id"], "slug": "apple-watch", "name": "Apple Watch", "name_uk": "Apple Watch", "name_ru": "Apple Watch", "order": 1, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": accessories["id"], "slug": "samsung-watch", "name": "Samsung Watch", "name_uk": "Samsung Galaxy Watch", "name_ru": "Samsung Galaxy Watch", "order": 2, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": accessories["id"], "slug": "chargers", "name": "Зарядки", "name_uk": "Зарядні пристрої", "name_ru": "Зарядные устройства", "order": 3, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": accessories["id"], "slug": "cases", "name": "Чохли", "name_uk": "Чохли", "name_ru": "Чехлы", "order": 4, "is_active": True, "created_at": now},
        
        # Gaming
        {"id": uid(), "parent_id": gaming["id"], "slug": "playstation", "name": "PlayStation", "name_uk": "PlayStation", "name_ru": "PlayStation", "order": 1, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": gaming["id"], "slug": "xbox", "name": "Xbox", "name_uk": "Xbox", "name_ru": "Xbox", "order": 2, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": gaming["id"], "slug": "nintendo", "name": "Nintendo", "name_uk": "Nintendo", "name_ru": "Nintendo", "order": 3, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": gaming["id"], "slug": "controllers", "name": "Контролери", "name_uk": "Контролери", "name_ru": "Контроллеры", "order": 4, "is_active": True, "created_at": now},
        
        # Smart Home
        {"id": uid(), "parent_id": smart_home["id"], "slug": "homepod", "name": "HomePod", "name_uk": "HomePod", "name_ru": "HomePod", "order": 1, "is_active": True, "created_at": now},
        {"id": uid(), "parent_id": smart_home["id"], "slug": "apple-tv", "name": "Apple TV", "name_uk": "Apple TV", "name_ru": "Apple TV", "order": 2, "is_active": True, "created_at": now},
    ]
    
    all_cats = roots + subcats
    await db.categories.insert_many(all_cats)
    
    print(f"Seeded {len(all_cats)} V2 categories with hierarchy")

if __name__ == '__main__':
    asyncio.run(seed_categories_v2())
