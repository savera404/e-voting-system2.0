"""
Factory Pattern – LocationFactory
───────────────────────────────────
Centralises creation of all location ORM objects (Province, City, District,
Constituency) so LocationRepository never calls model constructors directly.

Benefits
--------
* Validation (e.g. non-empty names, positive FK ids) lives in one place.
* Adding a new required field only touches this file, not the repository.
* Mirrors ElectionFactory and CandidateFactory for consistency.
"""

from app.models.location import Province, City, District, Constituency


class LocationFactory:

    @staticmethod
    def create_province(name: str) -> Province:
        name = name.strip()
        if not name:
            raise ValueError("Province name cannot be empty.")
        return Province(name=name)

    @staticmethod
    def create_city(name: str, province_id: int) -> City:
        name = name.strip()
        if not name:
            raise ValueError("City name cannot be empty.")
        if province_id <= 0:
            raise ValueError("province_id must be a positive integer.")
        return City(name=name, province_id=province_id)

    @staticmethod
    def create_district(name: str, city_id: int) -> District:
        name = name.strip()
        if not name:
            raise ValueError("District name cannot be empty.")
        if city_id <= 0:
            raise ValueError("city_id must be a positive integer.")
        return District(name=name, city_id=city_id)

    @staticmethod
    def create_constituency(name: str, cons_type: str, district_id: int) -> Constituency:
        name      = name.strip()
        cons_type = cons_type.strip().lower()
        if not name:
            raise ValueError("Constituency name cannot be empty.")
        if cons_type not in ("federal", "provincial"):
            raise ValueError(
                f"Invalid constituency type '{cons_type}'. Must be 'federal' or 'provincial'."
            )
        if district_id <= 0:
            raise ValueError("district_id must be a positive integer.")
        return Constituency(name=name, type=cons_type, district_id=district_id)
