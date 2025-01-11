import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaWhatsapp,
  FaStar,
  FaHome,
  FaCalendar,
  FaShare,
  FaCheck,
  FaComments,
  FaShoppingCart,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaUser,
} from "react-icons/fa";
import "swiper/css/bundle";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { autoLogout } from "../redux/user/userSlice";
import ModernToggleForKostPage from "../components/ModernToggleForKostPage";

const KostDetail = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { id } = useParams();
  const [kost, setKost] = useState(null);
  const [owner, setOwner] = useState(null);
  const [reviewUsers, setReviewUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const kostRes = await fetch(`/api/kost/get/${id}`);
        const kostData = await kostRes.json();
        setKost(kostData);

        if (kostData.userRef) {
          const ownerRes = await fetch(`/api/user/${kostData.userRef}`);
          const ownerData = await ownerRes.json();
          setOwner(ownerData);
        }

        if (kostData.reviews?.length > 0) {
          const userIds = kostData.reviews.map((review) => review.user);
          const uniqueUserIds = [...new Set(userIds)];

          const reviewerData = {};
          await Promise.all(
            uniqueUserIds.map(async (userId) => {
              try {
                const userRes = await fetch(`/api/user/${userId}`);
                const userData = await userRes.json();
                reviewerData[userId] = userData;
              } catch (error) {
                console.error(`Error fetching user ${userId}:`, error);
                reviewerData[userId] = { username: "Unknown User" };
              }
            }),
          );
          setReviewUsers(reviewerData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAvailabilityToggle = async (checked) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/kost/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          availability: checked,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update availability");
      }

      setKost((prev) => ({
        ...prev,
        availability: checked,
      }));

      showToast(
        "success",
        `Kost telah ${checked ? "diaktifkan" : "dinonaktifkan"}`,
      );
    } catch (error) {
      console.error("Error updating availability:", error);
      showToast("error", "Gagal memperbarui status");

      setKost((prev) => ({
        ...prev,
        availability: !checked,
      }));

      if (
        error.message?.includes("unauthorized") ||
        error.message?.includes("session")
      ) {
        dispatch(autoLogout());
        navigate("/sign-in");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await Swal.fire({
        title: "Apakah anda yakin?",
        text: "Data kost yang dihapus tidak dapat dikembalikan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: "Menghapus...",
          text: "Mohon tunggu sebentar",
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await fetch(`/api/kost/delete/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete kost");
        }

        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data kost telah dihapus",
          timer: 2000,
          showConfirmButton: false,
        });

        navigate("/my-kost");
      }
    } catch (error) {
      console.error("Error deleting kost:", error);

      await Swal.fire({
        icon: "error",
        title: "Gagal menghapus kost",
        text: error.message || "Terjadi kesalahan saat menghapus data kost",
      });

      if (
        error.message?.includes("unauthorized") ||
        error.message?.includes("session")
      ) {
        dispatch(autoLogout());
        navigate("/sign-in");
      }
    }
  };

  const showToast = (icon, title) => {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
    Toast.fire({
      icon,
      title,
    });
  };

  const showLoginAlert = () => {
    Swal.fire({
      title: "Login Diperlukan",
      text: "Silakan login terlebih dahulu untuk melanjutkan",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Login",
      cancelButtonText: "Batal",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/sign-in", { state: { from: `/kost/${id}` } });
      }
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBooking = () => {
    if (!currentUser) {
      showLoginAlert();
      return;
    }
    if (!kost.availability) {
      Swal.fire({
        icon: "error",
        title: "Kost Tidak Tersedia",
        text: "kost yang dipilih sudah tidak tersedia. Silakan pilih kost lain.",
      });
      return;
    }
    navigate(`/checkout/${kost._id}`);
  };

  const formatPhoneNumber = (phoneNumber) => {
    // Pastikan nomor dimulai dengan kode negara
    if (!phoneNumber.startsWith("+")) {
      // Contoh untuk Indonesia, tambahkan "+62" jika nomor lokal
      return `+62${phoneNumber.substring(1)}`;
    }
    return phoneNumber;
  };

  const handleWhatsAppChat = () => {
    if (!currentUser) {
      showLoginAlert();
      return;
    }
    // Tambahkan encodeURIComponent untuk semua bagian pesan yang berisi data dinamis
    const message = encodeURIComponent(
      `Halo, saya tertarik dengan kost "${kost.name}" yang berlokasi di ${kost.location}. Boleh tanya-tanya?`,
    );

    // Pastikan nomor WhatsApp sudah diformat dengan benar
    const formattedPhone = formatPhoneNumber(kost.contact?.whatsapp);

    // Gunakan URL yang sudah di-encode dengan benar
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;

    // Buka di tab baru
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  if (loading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-2xl text-gray-500">Memuat...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-2xl text-red-500">Terjadi kesalahan!</p>
      </div>
    );

  if (!kost) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          className="h-[550px]"
        >
          {kost.imageUrls.map((url, index) => (
            <SwiperSlide key={index}>
              <div
                className="h-full w-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${url})` }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          onClick={handleShare}
          className="fixed right-8 top-24 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-gray-100"
        >
          <FaShare className="text-gray-600" />
        </button>
        {copied && (
          <div className="fixed right-8 top-40 z-10 rounded-md bg-gray-800 px-4 py-2 text-white">
            Tautan berhasil disalin!
          </div>
        )}
      </div>

      <div className="mx-auto max-w-6xl p-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h1 className="mb-2 text-3xl font-bold">{kost.name}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <FaMapMarkerAlt className="text-lg" />
                <span>
                  {kost.location}, {kost.city}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-blue-600">
                Rp {kost.price.toLocaleString()}
              </span>
              {kost.originalPrice && (
                <span className="text-gray-400 line-through">
                  Rp {kost.originalPrice.toLocaleString()}
                </span>
              )}
              <span
                className={`rounded-full px-4 py-1 text-sm ${
                  kost.availability
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {kost.availability ? "Tersedia" : "Tidak Tersedia"}
              </span>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Tentang</h2>
              <p className="text-gray-600">{kost.description}</p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Fasilitas</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {kost.facilities.map((facility, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FaCheck className="text-green-500" />
                    <span className="text-gray-700">{facility}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <FaComments />
                Ulasan
              </h2>
              {kost.reviews?.length > 0 ? (
                <div className="space-y-4">
                  {kost.reviews.map((review, index) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-gray-400" />
                          <span className="font-medium">
                            {reviewUsers[review.user]?.username ||
                              "Unknown User"}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mb-2 flex">
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
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">Belum ada ulasan</p>
              )}
            </div>
          </div>
          <div className="space-y-6 lg:sticky lg:top-4">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">
                {kost.userRef === currentUser?._id
                  ? "Pengaturan Kost"
                  : "Informasi Kontak"}
              </h2>
              <div className="space-y-3">
                {kost.userRef === currentUser?._id ? (
                  <>
                    <div className="mb-4">
                      <ModernToggleForKostPage
                        checked={kost.availability}
                        onChange={handleAvailabilityToggle}
                        label={
                          kost.availability ? "Tersedia" : "Tidak Tersedia"
                        }
                        size="default"
                        disabled={isUpdating}
                      />
                    </div>
                    <Link to={`/update-kost/${id}`}>
                      <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500 px-4 py-3 text-white transition-colors hover:bg-yellow-600">
                        <FaEdit />
                        <span>Edit Kost</span>
                      </button>
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-3 text-white transition-colors hover:bg-red-600"
                    >
                      <FaTrash />
                      <span>Hapus Kost</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleWhatsAppChat}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-white transition-colors hover:bg-green-600"
                    >
                      <FaWhatsapp className="text-xl" />
                      <span>Chat WhatsApp</span>
                    </button>
                    <a
                      href={`tel:${formatPhoneNumber(kost.contact?.phone)}`}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700"
                    >
                      <FaPhone />
                      <span>Telepon Pemilik</span>
                    </a>
                    <button
                      onClick={handleBooking}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 text-white transition-colors hover:bg-orange-600"
                    >
                      <FaShoppingCart />
                      <span>Pesan Sekarang</span>
                    </button>
                  </>
                )}
              </div>
              {kost.userRef !== currentUser?._id ? (
                <div className="mt-4 text-sm text-gray-500">
                  <p className="flex items-center gap-1">
                    <FaWhatsapp className="text-green-500" />
                    Waktu respon: ± 15 menit
                  </p>
                  {owner && (
                    <p className="flex items-center gap-1">
                      <FaUser className="text-primary" />
                      {`Pemilik: ${owner.username}`}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-4 text-sm text-gray-500">
                  {owner && (
                    <p className="flex items-center gap-1">
                      <FaUser className="text-primary" />
                      {`Pemilik: Anda`}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold">Detail Properti</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaHome />
                  <span>{kost.type}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaCalendar />
                  <span>
                    Diperbarui {new Date(kost.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default KostDetail;
