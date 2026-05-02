from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.location_service import LocationService
from app.schemas.location_schema import (
    ProvinceCreate, CityCreate, DistrictCreate, ConstituencyCreate,
)

router = APIRouter()
service = LocationService()


# ── Provinces ──────────────────────────────────────────────────────────────

@router.get("/provinces")
def list_provinces(db: Session = Depends(get_db)):
    return service.list_provinces(db)


@router.post("/provinces")
def create_province(data: ProvinceCreate, db: Session = Depends(get_db)):
    return service.create_province(db, data)


# ── Cities ─────────────────────────────────────────────────────────────────

@router.get("/cities")
def list_cities(province_id: Optional[int] = None, db: Session = Depends(get_db)):
    return service.list_cities(db, province_id)


@router.post("/cities")
def create_city(data: CityCreate, db: Session = Depends(get_db)):
    return service.create_city(db, data)


# ── Districts ──────────────────────────────────────────────────────────────

@router.get("/districts")
def list_districts(city_id: Optional[int] = None, db: Session = Depends(get_db)):
    return service.list_districts(db, city_id)


@router.post("/districts")
def create_district(data: DistrictCreate, db: Session = Depends(get_db)):
    return service.create_district(db, data)


# ── Constituencies ─────────────────────────────────────────────────────────

@router.get("/constituencies")
def list_constituencies(
    district_id: Optional[int] = None,
    type: Optional[str] = None,
    city_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return service.list_constituencies(db, district_id, cons_type=type, city_id=city_id)


@router.post("/constituencies")
def create_constituency(data: ConstituencyCreate, db: Session = Depends(get_db)):
    return service.create_constituency(db, data)


@router.get("/constituencies/{constituency_id}")
def get_constituency(constituency_id: int, db: Session = Depends(get_db)):
    return service.get_constituency(db, constituency_id)
