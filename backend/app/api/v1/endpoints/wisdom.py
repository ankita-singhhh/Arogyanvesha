from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from supabase import Client, create_client

from app.core.config import settings

router = APIRouter()

supabase: Client = create_client(
    settings.NEXT_PUBLIC_SUPABASE_URL,
    settings.SUPABASE_SECRET_KEY,
)


@router.get("/articles")
def get_articles(
    search: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    limit: int = Query(default=100, ge=1, le=200),
):
    """List published wisdom articles, optionally filtered by search/category."""
    try:
        query = (
            supabase.table("wisdom_articles")
            .select(
                "id,slug,title,excerpt,category,read_time_minutes,"
                "is_featured,is_published"
            )
            .eq("is_published", True)
        )

        if category and category.lower() != "all":
            query = query.eq("category", category)

        if search and search.strip():
            term = search.strip().replace(",", " ")
            query = query.or_(
                f"title.ilike.%{term}%,"
                f"excerpt.ilike.%{term}%,"
                f"content.ilike.%{term}%"
            )

        result = (
            query.order("is_featured", desc=True)
            .order("title")
            .limit(limit)
            .execute()
        )

        return {"articles": result.data or []}

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not fetch wisdom articles: {str(exc)}",
        )


@router.get("/articles/{slug}")
def get_article(slug: str):
    """Get one published article by slug."""
    try:
        result = (
            supabase.table("wisdom_articles")
            .select("*")
            .eq("slug", slug)
            .eq("is_published", True)
            .limit(1)
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="Article not found")

        return {"article": result.data[0]}

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not fetch article: {str(exc)}",
        )
