"""
V2-3: Catalog API with filters, sorting, pagination
V2-3: Categories Tree for MegaMenu
"""
from fastapi import APIRouter, Query
from typing import Optional, List
from core.db import db
import re

router = APIRouter(tags=["Catalog V2"])


# ============= CATALOG =============

@router.get("/api/v2/catalog")
async def catalog(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    brand: Optional[str] = None,
    in_stock: Optional[bool] = None,
    sort_by: str = "popular",
    page: int = 1,
    limit: int = 24
):
    """
    Catalog endpoint with filters, sorting, pagination
    """
    q = {"status": "published"}
    
    if category:
        q["$or"] = [
            {"category_name": category},
            {"category_slug": category},
            {"category_id": category}
        ]
    
    if brand:
        q["brand"] = {"$regex": brand, "$options": "i"}
    
    if in_stock is True:
        q["stock_level"] = {"$gt": 0}
    elif in_stock is False:
        q["stock_level"] = {"$lte": 0}
    
    if min_price is not None or max_price is not None:
        price_q = {}
        if min_price is not None:
            price_q["$gte"] = min_price
        if max_price is not None:
            price_q["$lte"] = max_price
        q["price"] = price_q
    
    # Sort mapping
    sort_map = {
        "popular": [("views_count", -1), ("rating", -1)],
        "price_asc": [("price", 1)],
        "price_desc": [("price", -1)],
        "new": [("created_at", -1)],
        "rating": [("rating", -1)],
        "discount": [("compare_price", -1)]
    }
    
    sort_order = sort_map.get(sort_by, sort_map["popular"])
    skip = (page - 1) * limit
    
    cursor = db.products.find(q, {"_id": 0}).sort(sort_order).skip(skip).limit(limit)
    products = await cursor.to_list(limit)
    
    total = await db.products.count_documents(q)
    
    return {
        "products": products,
        "total": total,
        "page": page,
        "pages": (total // limit) + (1 if total % limit else 0)
    }


@router.get("/api/v2/catalog/filters")
async def get_catalog_filters(category: Optional[str] = None):
    """
    Get available filter values for catalog
    """
    q = {"status": "published"}
    if category:
        q["$or"] = [
            {"category_name": category},
            {"category_slug": category}
        ]
    
    # Get distinct brands
    brands = await db.products.distinct("brand", q)
    brands = [b for b in brands if b]
    
    # Get price range
    pipeline = [
        {"$match": q},
        {"$group": {
            "_id": None,
            "min_price": {"$min": "$price"},
            "max_price": {"$max": "$price"}
        }}
    ]
    price_result = await db.products.aggregate(pipeline).to_list(1)
    price_range = price_result[0] if price_result else {"min_price": 0, "max_price": 0}
    
    return {
        "brands": sorted(brands),
        "price_range": {
            "min": price_range.get("min_price", 0),
            "max": price_range.get("max_price", 0)
        }
    }


# ============= CATEGORIES TREE =============

@router.get("/api/v2/categories/tree")
async def categories_tree():
    """
    Get categories as tree structure for MegaMenu
    """
    items = await db.categories.find({}, {"_id": 0}).sort([("order", 1)]).to_list(1000)
    
    # If no categories_v2 structure, use flat categories
    if not items:
        items = await db.categories.find({}, {"_id": 0}).to_list(1000)
    
    # Build tree
    by_parent = {}
    for c in items:
        pid = c.get("parent_id") or None
        by_parent.setdefault(pid, []).append(c)
    
    def build(pid=None):
        result = []
        for c in by_parent.get(pid, []):
            node = {**c, "children": build(c.get("id"))}
            result.append(node)
        return result
    
    return {"tree": build(None)}


# ============= SEARCH =============

POPULAR_QUERIES_UK = ["айфон", "ноутбук", "пилосос", "телевізор", "пральна машина", "павербанк", "навушники"]
POPULAR_QUERIES_RU = ["айфон", "ноутбук", "пылесос", "телевизор", "стиральная машина", "пауэрбанк", "наушники"]

@router.get("/api/v2/search/suggest")
async def search_suggest(q: str = Query("", min_length=0), limit: int = 8, lang: str = "uk"):
    """
    Live search suggestions with categories and popular queries (B11)
    """
    q = q.strip()
    popular_pool = POPULAR_QUERIES_RU if lang == "ru" else POPULAR_QUERIES_UK
    
    if not q or len(q) < 2:
        return {
            "products": [],
            "categories": [],
            "popular": popular_pool[:5]
        }
    
    rx = re.compile(re.escape(q), re.IGNORECASE)
    
    # Get categories
    categories = []
    try:
        cat_cursor = db.categories.find(
            {"$or": [
                {"name": rx},
                {"slug": rx}
            ]},
            {"_id": 0, "id": 1, "name": 1, "slug": 1, "icon": 1}
        ).limit(6)
        cat_docs = await cat_cursor.to_list(6)
        categories = [{"slug": c.get("slug"), "name": c.get("name"), "icon": c.get("icon", "Package")} for c in cat_docs]
    except Exception:
        categories = []
    
    # Get products
    cursor = db.products.find(
        {"$or": [{"title": rx}, {"brand": rx}, {"description": rx}]},
        {"_id": 0, "id": 1, "title": 1, "name": 1, "price": 1, "compare_price": 1, "images": 1, "category_name": 1, "stock_level": 1, "rating": 1, "slug": 1}
    ).limit(limit)
    
    items = await cursor.to_list(limit)
    
    # Popular queries that match
    popular = [x for x in popular_pool if q.lower() in x.lower()][:5]
    if len(popular) < 3:
        popular = (popular + popular_pool)[:5]
    
    return {
        "products": items,
        "categories": categories,
        "popular": popular
    }


@router.get("/api/v2/search")
async def search_products(
    q: str = Query("", min_length=1),
    page: int = 1,
    limit: int = 24
):
    """
    Full search with pagination
    """
    q_str = q.strip()
    if not q_str:
        return {"products": [], "total": 0, "page": page, "pages": 0}
    
    rx = re.compile(re.escape(q_str), re.IGNORECASE)
    query = {"$or": [{"title": rx}, {"brand": rx}, {"description": rx}], "status": "published"}
    
    skip = (page - 1) * limit
    cursor = db.products.find(query, {"_id": 0}).skip(skip).limit(limit)
    products = await cursor.to_list(limit)
    
    total = await db.products.count_documents(query)
    
    return {
        "products": products,
        "total": total,
        "page": page,
        "pages": (total // limit) + (1 if total % limit else 0),
        "query": q_str
    }


@router.get("/api/v2/products/search")
async def catalog_search_products(
    q: str = Query("", description="Search query"),
    category: str = Query("", description="Category slug"),
    sort: str = Query("pop", description="Sort: pop|price_asc|price_desc|rating|new"),
    min: int = Query(0, description="Min price"),
    max: int = Query(0, description="Max price"),
    in_stock: str = Query("", description="1 for in stock only"),
    rating_gte: int = Query(0, description="Min rating"),
    brands: str = Query("", description="Comma-separated brands"),
    page: int = 1,
    limit: int = 24,
    lang: str = "uk"
):
    """
    Full catalog search with filters (B10/B13)
    Returns products + meta (available brands, price range)
    """
    query = {"status": "published"}
    
    # Search query
    if q.strip():
        rx = re.compile(re.escape(q.strip()), re.IGNORECASE)
        query["$or"] = [{"title": rx}, {"brand": rx}, {"description": rx}]
    
    # Category filter
    if category:
        query["$or"] = query.get("$or", [])
        query["$and"] = query.get("$and", [])
        query["$and"].append({"$or": [
            {"category_name": re.compile(re.escape(category), re.IGNORECASE)},
            {"category_id": category},
            {"category_slug": category}
        ]})
    
    # Price filter
    if min > 0:
        query["price"] = query.get("price", {})
        query["price"]["$gte"] = min
    if max > 0:
        query["price"] = query.get("price", {})
        query["price"]["$lte"] = max
    
    # In stock filter
    if in_stock == "1":
        query["stock_level"] = {"$gt": 0}
    
    # Rating filter
    if rating_gte > 0:
        query["rating"] = {"$gte": rating_gte}
    
    # Brands filter
    if brands:
        brand_list = [b.strip() for b in brands.split(",") if b.strip()]
        if brand_list:
            query["brand"] = {"$in": brand_list}
    
    # Clean up query
    if "$and" in query and not query["$and"]:
        del query["$and"]
    
    # Sort
    sort_map = {
        "pop": [("popularity", -1), ("rating", -1)],
        "price_asc": [("price", 1)],
        "price_desc": [("price", -1)],
        "rating": [("rating", -1)],
        "new": [("created_at", -1)]
    }
    sort_order = sort_map.get(sort, sort_map["pop"])
    
    skip = (page - 1) * limit
    
    cursor = db.products.find(query, {"_id": 0}).sort(sort_order).skip(skip).limit(limit)
    products = await cursor.to_list(limit)
    
    total = await db.products.count_documents(query)
    pages = max(1, (total + limit - 1) // limit)
    
    # Get meta for filters (available brands, price range)
    all_brands = []
    price_min = 0
    price_max = 0
    try:
        brands_cursor = db.products.distinct("brand", {"status": "published"})
        all_brands = [b for b in brands_cursor if b][:30]
        
        price_agg = await db.products.aggregate([
            {"$match": {"status": "published", "price": {"$gt": 0}}},
            {"$group": {"_id": None, "min": {"$min": "$price"}, "max": {"$max": "$price"}}}
        ]).to_list(1)
        if price_agg:
            price_min = price_agg[0].get("min", 0)
            price_max = price_agg[0].get("max", 0)
    except Exception:
        pass
    
    return {
        "items": products,
        "total": total,
        "page": page,
        "pages": pages,
        "meta": {
            "brands": all_brands,
            "price": {"min": price_min, "max": price_max}
        }
    }


# ============= PRODUCT V2 ENDPOINTS =============

@router.get("/api/v2/products/{product_id}/related")
async def related_products(product_id: str, limit: int = 10):
    """
    Get related products by category
    """
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        return {"products": []}
    
    category = product.get("category_name") or product.get("category_id")
    
    q = {"id": {"$ne": product_id}, "status": "published"}
    if category:
        q["$or"] = [{"category_name": category}, {"category_id": category}]
    
    cursor = db.products.find(q, {"_id": 0}).limit(limit * 2)
    items = await cursor.to_list(limit * 2)
    
    # Shuffle and return
    import random
    random.shuffle(items)
    
    return {"products": items[:limit]}


@router.get("/api/v2/products/{product_id}/bundles")
async def product_bundles(product_id: str, limit: int = 6):
    """
    Get 'buy together' products (cross-sell)
    """
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        return {"products": []}
    
    # Check for manual bundle links
    also_buy = product.get("buy_with") or []
    if also_buy:
        items = await db.products.find({"id": {"$in": also_buy}}, {"_id": 0}).to_list(20)
    else:
        # Fallback: accessories + same category
        q = {
            "id": {"$ne": product_id},
            "status": "published",
            "$or": [
                {"category_name": "accessories"},
                {"category_name": "aksesuary"},
                {"category_name": product.get("category_name")}
            ]
        }
        items = await db.products.find(q, {"_id": 0}).limit(limit * 3).to_list(limit * 3)
    
    import random
    random.shuffle(items)
    
    return {"products": items[:limit]}
