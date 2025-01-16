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
} from "react-icons/fa";
import KostCard from "../components/KostCard";
import { useNavigate, useLocation } from "react-router-dom";

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
};

const Search = () => {
  const [searchParams, setSearchParams] = useState({
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
  });

  const [loading, setLoading] = useState(false);
  const [kosts, setKosts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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
    };

    setSearchParams(newParams);
    fetchKosts(newParams);
  }, [location.search]);

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
      searchParams.order !== DEFAULT_SEARCH_PARAMS.order
    );
  };

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
