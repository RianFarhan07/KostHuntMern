import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaChevronDown,
  FaChevronUp,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaCrosshairs,
  FaSearchLocation,
} from "react-icons/fa";
import KostCard from "../components/KostCard";
import { useNavigate, useLocation } from "react-router-dom";
import { Map, ZoomControl, Marker, Overlay } from "pigeon-maps";

const FACILITIES = [
  "WiFi",
  "AC",
  "Kamar Mandi Dalam",
  "Kasur",
  "Meja",
  "Lemari",
  "Dapur",
  "Parkir Motor",
  "Parkir Mobil",
  "Security",
  "CCTV",
  "TV",
  "Kulkas",
  "Laundry",
  "Dapur Bersama",
  "Ruang Tamu",
  "Air Panas",
  "Peralatan Masak",
  "Dispenser",
  "Cleaning Service",
  "Musholla",
  "Jemuran",
  "Gazebo",
  "Taman",
  "Free Maintenance",
];

// Default search parameters
const DEFAULT_SEARCH_PARAMS = {
  searchTerm: "",
  type: "all",
  availability: undefined,
  facilities: [],
  location: "",
  city: "",
  sort: "createdAt",
  order: "desc",
  page: 1,
  limit: 9,
  latitude: "",
  longitude: "",
  radius: "",
  minPrice: "",
  maxPrice: "",
};

const DEFAULT_CENTER = [-6.2088, 106.8456]; // Jakarta coordinates
const DEFAULT_ZOOM = 12;

const Search = () => {
  const [searchParams, setSearchParams] = useState(DEFAULT_SEARCH_PARAMS);
  const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [kosts, setKosts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [kostsInRadius, setKostsInRadius] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchKosts = async (params) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          if (key === "facilities" && value.length > 0) {
            queryParams.set(key, value.join(","));
          } else if (key === "availability" && typeof value === "boolean") {
            queryParams.set(key, value.toString());
          } else {
            queryParams.set(key, value);
          }
        }
      });

      const response = await fetch(
        `/api/kost/getAll?${queryParams.toString()}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch kosts");
      }

      const data = await response.json();
      setKosts(data.data);
      setPagination({
        currentPage: parseInt(params.page), // Use the params page instead of data.pagination
        totalPages: data.pagination.totalPages,
        totalItems: data.pagination.totalItems,
      });
    } catch (error) {
      console.error("Error fetching kosts:", error);
      setKosts([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const newParams = {
      searchTerm: urlParams.get("searchTerm") || "",
      type: urlParams.get("type") || "all",
      availability:
        urlParams.get("availability") === "true"
          ? true
          : urlParams.get("availability") === "false"
            ? false
            : undefined,
      facilities: urlParams.get("facilities")?.split(",").filter(Boolean) || [],
      location: urlParams.get("location") || "",
      city: urlParams.get("city") || "",
      sort: urlParams.get("sort") || "createdAt",
      order: urlParams.get("order") || "desc",
      page: parseInt(urlParams.get("page")) || 1,
      limit: parseInt(urlParams.get("limit")) || 9,
      latitude: urlParams.get("latitude") || "",
      longitude: urlParams.get("longitude") || "",
      radius: urlParams.get("radius") || "",
      minPrice: urlParams.get("minPrice") || "",
      maxPrice: urlParams.get("maxPrice") || "",
    };

    setSearchParams(newParams);
    fetchKosts(newParams);
  }, [location.search]);

  useEffect(() => {
    if (selectedLocation && searchParams.radius && kosts.length > 0) {
      const filteredKosts = kosts.filter((kost) => {
        // Check for coordinates array instead of separate lat/lng
        if (!kost.coordinates || !Array.isArray(kost.coordinates)) return false;

        const [longitude, latitude] = kost.coordinates; // Note: coordinates are [lng, lat]

        const distance = calculateDistance(
          selectedLocation[0], // latitude
          selectedLocation[1], // longitude
          latitude, // kost latitude
          longitude, // kost longitude
        );

        return distance <= parseFloat(searchParams.radius);
      });

      setKostsInRadius(filteredKosts);
    } else {
      setKostsInRadius([]);
    }
  }, [selectedLocation, searchParams.radius, kosts]);

  const getRadiusInPixels = (radiusKm, lat, zoom) => {
    const earthCircumference = 20000; // km
    const latRadians = lat * (Math.PI / 180);
    const metersPerPixel =
      (earthCircumference * 1000 * Math.cos(latRadians)) /
      Math.pow(2, zoom + 8);
    return (radiusKm * 1000) / metersPerPixel;
  };

  const handleMapClick = ({ latLng, pixel }) => {
    const [lat, lng] = latLng;
    setSelectedLocation(latLng);
    setSearchParams((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
      radius: prev.radius || "5", // Set default radius to 5km if not set
    }));
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setSelectedLocation([lat, lng]);
        setMapCenter([lat, lng]);
        setSearchParams((prev) => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString(),
          radius: prev.radius || "5",
        }));
        setLocationLoading(false);
      },
      (error) => {
        setLocationError("Unable to retrieve your location");
        setLocationLoading(false);
      },
    );
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSearchParams((prev) => {
      const updates = { ...prev };

      if (id === "sort_order") {
        const [sort, order] = value.split("_");
        updates.sort = sort;
        updates.order = order;
      } else if (id === "availability") {
        updates.availability = value === "" ? undefined : value === "true";
      } else {
        updates[id] = value;
      }

      // Reset page to 1 when changing filters
      updates.page = 1;
      return updates;
    });
  };

  const handleFacilityChange = (facility, checked) => {
    setSearchParams((prev) => ({
      ...prev,
      facilities: checked
        ? [...prev.facilities, facility]
        : prev.facilities.filter((f) => f !== facility),
      page: 1,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        if (key === "facilities" && value.length > 0) {
          urlParams.set(key, value.join(","));
        } else {
          urlParams.set(key, value);
        }
      }
    });

    navigate(`/search?${urlParams.toString()}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    // Create new URLSearchParams from current location
    const urlParams = new URLSearchParams(location.search);
    // Update page parameter
    urlParams.set("page", newPage.toString());
    // Navigate with all current parameters plus new page
    navigate(`/search?${urlParams.toString()}`);
  };

  // Generate array of page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(
      1,
      pagination.currentPage - Math.floor(maxVisiblePages / 2),
    );
    let endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1,
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) pages.push("...");
      pages.push(pagination.totalPages);
    }

    return pages;
  };

  const handleClearFilters = () => {
    setSearchParams(DEFAULT_SEARCH_PARAMS);
    navigate("/search");
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      searchParams.searchTerm !== DEFAULT_SEARCH_PARAMS.searchTerm ||
      searchParams.type !== DEFAULT_SEARCH_PARAMS.type ||
      searchParams.availability !== DEFAULT_SEARCH_PARAMS.availability ||
      searchParams.facilities.length > 0 ||
      searchParams.location !== DEFAULT_SEARCH_PARAMS.location ||
      searchParams.city !== DEFAULT_SEARCH_PARAMS.city ||
      searchParams.sort !== DEFAULT_SEARCH_PARAMS.sort ||
      searchParams.order !== DEFAULT_SEARCH_PARAMS.order ||
      searchParams.latitude !== DEFAULT_SEARCH_PARAMS.latitude ||
      searchParams.longitude !== DEFAULT_SEARCH_PARAMS.longitude ||
      searchParams.radius !== DEFAULT_SEARCH_PARAMS.radius ||
      searchParams.minPrice !== DEFAULT_SEARCH_PARAMS.minPrice ||
      searchParams.maxPrice !== DEFAULT_SEARCH_PARAMS.maxPrice
    );
  };

  const MapSearchSection = () => (
    <div className="mt-6 space-y-6 border-t border-gray-200 pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Pencarian dengan Peta
        </h3>
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 text-primary hover:text-primary/80"
        >
          <FaSearchLocation />
          <span>{showMap ? "Sembunyikan Peta" : "Tampilkan Peta"}</span>
        </button>
      </div>

      {showMap && (
        <div className="space-y-4">
          <div className="mb-4 flex gap-4">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-white transition-colors hover:bg-secondary/90"
            >
              {locationLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <FaCrosshairs />
              )}
              <span>Gunakan Lokasi Saat Ini</span>
            </button>

            <div className="flex items-center gap-2">
              <input
                type="number"
                id="radius"
                placeholder="Radius (km)"
                className="w-32 rounded-lg border border-gray-200 p-2 outline-none focus:border-primary"
                value={searchParams.radius}
                onChange={handleChange}
                min="0"
                max="50"
              />
              <span className="text-gray-600">km</span>
            </div>
          </div>
          <div className="h-[400px] w-full overflow-hidden rounded-lg border border-gray-200">
            <Map
              height={400}
              center={mapCenter}
              zoom={zoom}
              onBoundsChanged={({ center, zoom }) => {
                setMapCenter(center);
                setZoom(zoom);
              }}
              onClick={handleMapClick}
            >
              <ZoomControl />

              {/* Selected Location Marker */}
              {selectedLocation && (
                <Marker width={50} anchor={selectedLocation} color="#FF0000" />
              )}

              {kostsInRadius.map((kost) => {
                const [longitude, latitude] = kost.coordinates;

                return (
                  <Marker
                    key={kost._id}
                    width={40}
                    anchor={[latitude, longitude]}
                    color="#4CAF50"
                    onClick={() => {
                      navigate(`/kost/${kost._id}`);
                    }}
                    onMouseOver={() => setHoveredMarkerId(kost._id)}
                    onMouseOut={() => setHoveredMarkerId(null)}
                  >
                    {/* ini menbahkan hover nama kost tapi kost marker jadi hilang jika pakai overlay malah markernya di atas kiri map */}
                    {/* {hoveredMarkerId === kost._id && (
                      <div className="absolute rounded-lg bg-white px-3 py-2 shadow-lg">
                        <p className="whitespace-nowrap text-sm font-medium text-gray-800">
                          {kost.name}
                        </p>
                      </div>
                    )} */}
                  </Marker>
                );
              })}
              {hoveredMarkerId && (
                <div className="absolute bottom-0 bg-white">
                  <p className="text-sm font-medium text-gray-800">
                    {kosts.find((kost) => kost._id === hoveredMarkerId).name}
                  </p>
                </div>
              )}

              {/* Radius Circle */}
              {selectedLocation && searchParams.radius && (
                <Overlay anchor={selectedLocation} offset={[0, 0]}>
                  <div
                    style={{
                      position: "absolute",
                      transform: "translate(-50%, -50%)",
                      width: `${getRadiusInPixels(parseFloat(searchParams.radius), selectedLocation[0], zoom)}px`,
                      height: `${getRadiusInPixels(parseFloat(searchParams.radius), selectedLocation[0], zoom)}px`,
                      borderRadius: "50%",
                      border: "2px solid #FF0000",
                      backgroundColor: "rgba(255, 0, 0, 0.1)",
                      zIndex: 1, // Tambahkan z-index rendah untuk radius
                      pointerEvents: "none", // Tambahkan ini agar radius tidak menghalangi klik
                    }}
                  />
                </Overlay>
              )}
            </Map>
          </div>

          {selectedLocation && (
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Latitude:</span>{" "}
                  {selectedLocation[0].toFixed(6)}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Longitude:</span>{" "}
                  {selectedLocation[1].toFixed(6)}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Kost dalam radius:</span>{" "}
                {kostsInRadius.length} tempat
              </div>
              {/* <div>
                {hoveredMarkerId && (
                  <div className="absolute left-0 top-0 flex w-full justify-center p-2">
                    <div className="rounded-lg bg-white px-3 py-2 shadow-lg">
                      <p className="whitespace-nowrap text-sm font-medium text-gray-800">
                        {
                          kostsInRadius.find(
                            (kost) => kost._id === hoveredMarkerId,
                          ).name
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div> */}
            </div>
          )}
        </div>
      )}
    </div>
  );
  console.log(hoveredMarkerId);
  // console.log(kostsInRadius);
  // console.log(kosts);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Search Header */}
        <div className="mb-8 rounded-lg bg-primary p-6 text-onPrimary shadow-lg">
          <h1 className="mb-6 text-3xl font-bold text-white">
            Temukan Kost Impianmu
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-4">
            <div className="flex flex-1 items-center overflow-hidden rounded-lg bg-white/90 backdrop-blur-sm transition-colors focus-within:bg-white">
              <FaSearch className="ml-4 text-gray-400" />
              <input
                type="text"
                id="searchTerm"
                placeholder="Cari kost berdasarkan nama kost..."
                className="w-full bg-transparent p-4 text-gray-800 placeholder-gray-500 outline-none"
                value={searchParams.searchTerm}
                onChange={handleChange}
              />
            </div>
            <select
              id="type"
              className="rounded-lg bg-white/90 p-4 text-gray-800 outline-none backdrop-blur-sm transition-colors hover:bg-white"
              value={searchParams.type}
              onChange={handleChange}
            >
              <option value="all">Semua Tipe</option>
              <option value="Putra">Kost Putra</option>
              <option value="Putri">Kost Putri</option>
              <option value="Campur">Kost Campur</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-secondary px-8 py-4 font-semibold text-white transition-all hover:bg-secondary/90 hover:shadow-lg"
            >
              Cari Sekarang
            </button>
          </form>
        </div>

        {/* Filters Toggle with Clear Filters Button */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex flex-1 items-center justify-between rounded-xl bg-white p-4 text-gray-800 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <FaFilter className="text-primary" />
                <span className="font-semibold">Filter Pencarian</span>
              </div>
              {isFiltersOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {hasActiveFilters() && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-red-600 transition-colors hover:bg-red-100"
              >
                <FaTimes />
                <span>Hapus Filter</span>
              </button>
            )}
          </div>

          {isFiltersOpen && (
            <div className="mt-4 space-y-6 rounded-xl bg-white p-6 shadow-sm">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    id="location"
                    placeholder="Masukkan lokasi"
                    className="w-full rounded-lg border border-gray-200 p-3 outline-none focus:border-primary"
                    value={searchParams.location}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Harga Minimum
                  </label>
                  <input
                    type="number"
                    id="minPrice"
                    placeholder="Harga minimum"
                    className="w-full rounded-lg border border-gray-200 p-3 outline-none focus:border-primary"
                    value={searchParams.minPrice}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Harga Maksimum
                  </label>
                  <input
                    type="number"
                    id="maxPrice"
                    placeholder="Harga maksimum"
                    className="w-full rounded-lg border border-gray-200 p-3 outline-none focus:border-primary"
                    value={searchParams.maxPrice}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Kota
                  </label>
                  <input
                    type="text"
                    id="city"
                    placeholder="Masukkan kota"
                    className="w-full rounded-lg border border-gray-200 p-3 outline-none focus:border-primary"
                    value={searchParams.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="availability"
                    className="w-full rounded-lg border border-gray-200 p-3 outline-none focus:border-primary"
                    value={
                      searchParams.availability === undefined
                        ? ""
                        : searchParams.availability.toString()
                    }
                    onChange={handleChange}
                  >
                    <option value="">Semua</option>
                    <option value="true">Tersedia</option>
                    <option value="false">Penuh</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Urutkan
                  </label>
                  <select
                    id="sort_order"
                    className="w-full rounded-lg border border-gray-200 p-3 outline-none focus:border-primary"
                    value={`${searchParams.sort}_${searchParams.order}`}
                    onChange={handleChange}
                  >
                    <option value="createdAt_desc">Terbaru</option>
                    <option value="createdAt_asc">Terlama</option>
                    <option value="price_asc">Harga Terendah</option>
                    <option value="price_desc">Harga Tertinggi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Fasilitas
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {FACILITIES.map((facility) => (
                    <label
                      key={facility}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={searchParams.facilities.includes(facility)}
                        onChange={(e) =>
                          handleFacilityChange(facility, e.target.checked)
                        }
                      />
                      <span className="text-sm text-gray-700">{facility}</span>
                    </label>
                  ))}
                </div>
              </div>
              <MapSearchSection />
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-gray-600">Sedang mencari kost...</p>
            </div>
          </div>
        ) : kosts.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl bg-white p-8 text-center shadow-sm">
            <FaSearch className="mb-4 text-4xl text-gray-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-800">
              Tidak ada kost yang ditemukan
            </h3>
            <p className="text-gray-600">
              Coba ubah filter pencarian atau gunakan kata kunci yang berbeda
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {kosts.map((item) => (
                <KostCard key={item._id} item={item} isMyKostList={false} />
              ))}
            </div>

            {/* Pagination Navigation */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white disabled:opacity-50"
                >
                  <FaChevronLeft className="text-gray-600" />
                </button>
                {getPageNumbers().map((pageNum, index) =>
                  pageNum === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-2">
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                        pageNum === pagination.currentPage
                          ? "bg-primary text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ),
                )}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white disabled:opacity-50"
                >
                  <FaChevronRight className="text-gray-600" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
