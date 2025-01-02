import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css/bundle";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaWhatsapp,
  FaStar,
  FaHome,
  FaCalendar,
  FaShare,
  FaCheck,
} from "react-icons/fa";

const Kost = () => {
  const params = useParams();
  const [kost, setKost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchKost = async () => {
      try {
        const res = await fetch(`/api/kost/get/${params.id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        setKost(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchKost();
  }, [params.id]);

  if (loading) return <p className="my-7 text-center text-2xl">Memuat...</p>;
  if (error)
    return <p className="my-7 text-center text-2xl">Terjadi kesalahan!</p>;
  if (!kost) return null;

  return (
    <main>
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
        >
          {kost.imageUrls.map((url) => (
            <SwiperSlide key={url}>
              <div
                className="h-[550px]"
                style={{
                  background: `url(${url}) center no-repeat`,
                  backgroundSize: "cover",
                }}
              ></div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="fixed right-[3%] top-[13%] z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border bg-slate-100">
          <FaShare
            className="text-slate-500"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          />
        </div>
        {copied && (
          <p className="fixed right-[5%] top-[23%] z-10 rounded-md bg-slate-600 p-2">
            Tautan disalin!
          </p>
        )}
      </div>

      <div className="mx-auto max-w-6xl p-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="mb-2 text-3xl font-bold">{kost.name}</h1>
            <div className="mb-4 flex items-center gap-2 text-gray-600">
              <FaMapMarkerAlt />
              <span>
                {kost.location}, {kost.city}
              </span>
            </div>

            <div className="mb-6">
              <span className="text-2xl font-bold text-blue-600">
                Rp {kost.price.toLocaleString()}
              </span>
              {kost.originalPrice && (
                <span className="ml-2 text-gray-400 line-through">
                  Rp {kost.originalPrice.toLocaleString()}
                </span>
              )}
              <span
                className={`ml-4 rounded-full px-4 py-1 text-sm ${
                  kost.availability
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {kost.availability ? "Tersedia" : "Tidak Tersedia"}
              </span>
            </div>

            <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Tentang</h2>
              <p className="text-gray-600">{kost.description}</p>
            </div>

            <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Fasilitas</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {kost.facilities.map((facility) => (
                  <div key={facility} className="flex items-center gap-2">
                    <FaCheck className="text-green-500" />
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Ulasan</h2>
              {kost.reviews?.length > 0 ? (
                kost.reviews.map((review, index) => (
                  <div key={index} className="mb-4 border-b pb-4 last:border-0">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={
                              i < review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">Belum ada ulasan</p>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-4 lg:h-fit">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Informasi Kontak</h2>
              <a
                href={`tel:${kost.contact.phone}`}
                className="mb-3 flex items-center gap-3 rounded-lg border p-4 transition hover:bg-gray-50"
              >
                <FaPhone className="text-blue-500" />
                <span>{kost.contact.phone}</span>
              </a>
              <a
                href={`https://wa.me/${kost.contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border p-4 transition hover:bg-gray-50"
              >
                <FaWhatsapp className="text-green-500" />
                <span>Chat di WhatsApp</span>
              </a>
            </div>

            <div className="mt-6 rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Detail Properti</h2>
              <div className="flex items-center gap-2">
                <FaHome className="text-gray-500" />
                <span>{kost.type}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <FaCalendar className="text-gray-500" />
                <span>
                  Diperbarui {new Date(kost.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Kost;
