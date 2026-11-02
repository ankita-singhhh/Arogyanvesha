from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from supabase import Client, create_client

from app.core.config import settings

router = APIRouter()

supabase: Client = create_client(
    settings.NEXT_PUBLIC_SUPABASE_URL,
    settings.SUPABASE_SECRET_KEY,
)


@router.get("")
def get_herbs(
    search: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    limit: int = Query(default=100, ge=1, le=200),
):
    """List herbs, optionally filtered by search/category."""
    try:
        query = supabase.table("herbs").select("*")

        if category and category.lower() != "all":
            query = query.eq("category", category)

        if search and search.strip():
            term = search.strip().replace(",", " ")
            query = query.or_(
                f"name.ilike.%{term}%,"
                f"sanskrit_name.ilike.%{term}%,"
                f"description.ilike.%{term}%"
            )

        result = query.order("name").limit(limit).execute()
        return {"herbs": result.data or []}

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not fetch herbs: {str(exc)}",
        )


@router.get("/{slug}")
def get_herb(slug: str):
    """Get one herb by slug."""
    try:
        result = (
            supabase.table("herbs")
            .select("*")
            .eq("slug", slug)
            .limit(1)
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="Herb not found")

        return {"herb": result.data[0]}

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not fetch herb: {str(exc)}",
        )
