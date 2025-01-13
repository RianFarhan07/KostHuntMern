import React, { useEffect, useRef, useState } from "react";
import {
  BsCreditCard2Front,
  BsCash,
  BsCheckCircleFill,
  BsPerson,
  BsHouseDoor,
} from "react-icons/bs";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase/firebase.config";

const CheckoutPage = () => {
  // 1. State Hooks
  const [paymentMethod, setPaymentMethod] = useState("");
  const [kosts, setKosts] = useState([]);
  const [durations, setDurations] = useState({});
  const [startDates, setStartDates] = useState({});
  const [endDates, setEndDates] = useState({});
  const [owners, setOwners] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [filePerc, setFilePerc] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Hooks lainnya
  const { currentUser } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const params = useParams();
  const navigate = useNavigate();

  const [tenantForm, setTenantForm] = useState({
    name: currentUser.username,
    email: currentUser.email,
    phone: "",
    identityNumber: "",
    identityImage: "",
    occupation: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
  });

  // 2. Effect Hooks
  // Memuat script Midtrans saat komponen dimount
  useEffect(() => {
    const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    const myMidtransClientKey = import.meta.env.MIDTRANS_CLIENT_KEY;

    let scriptTag = document.createElement("script");
    scriptTag.src = midtransScriptUrl;
    scriptTag.setAttribute("data-client-key", myMidtransClientKey);

    document.body.appendChild(scriptTag);
    return () => {
      document.body.removeChild(scriptTag);
    };
  }, []);

  // Memperbarui tanggal berakhir saat durasi atau tanggal mulai berubah
  useEffect(() => {
    const newEndDate = new Date(startDates);
    newEndDate.setMonth(newEndDate.getMonth() + durations);
    setEndDates(newEndDate);
  }, [durations, startDates]);

  // Mengambil data kost dan pemilik
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mengambil ID kost dari parameter URL
        const kostIds = params.id.split(",");
        const kostPromises = kostIds.map((id) =>
          fetch(`/api/kost/get/${id}`).then((res) => res.json()),
        );

        const kostsData = await Promise.all(kostPromises);
        setKosts(kostsData);

        // Inisialisasi data untuk setiap kost
        const initialDurations = {};
        const initialStartDates = {};
        const initialEndDates = {};
        const ownerPromises = {};

        kostsData.forEach((kost) => {
          // Set durasi awal
          initialDurations[kost._id] = 1;

          // Set tanggal mulai awal
          const startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          initialStartDates[kost._id] = startDate;

          // Hitung tanggal berakhir awal
          initialEndDates[kost._id] = calculateEndDate(startDate, 1);

          // Siapkan promise untuk mengambil data pemilik
          if (kost.userRef) {
            ownerPromises[kost._id] = fetch(`/api/user/${kost.userRef}`)
              .then((res) => res.json())
              .then((data) => {
                console.log(`Owner data for kost ${kost._id}:`, data); // Add this log
                return data;
              })
              .catch((error) => {
                console.error(
                  `Error fetching owner for kost ${kost._id}:`,
                  error,
                );
                return null;
              });
          }
        });

        // Set state awal
        setDurations(initialDurations);
        setStartDates(initialStartDates);
        setEndDates(initialEndDates);

        // Ambil semua data pemilik
        const ownersData = {};
        await Promise.all(
          Object.entries(ownerPromises).map(async ([kostId, promise]) => {
            const ownerData = await promise;
            if (ownerData) {
              ownersData[kostId] = ownerData;
            }
          }),
        );
        setOwners(ownersData);
        console.log("Owner data received:", ownersData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // 3. Fungsi Helper

  // Menghitung total pembayaran untuk semua kost
  const calculateTotalAmount = () => {
    return kosts.reduce((total, kost) => {
      return total + kost.price * (durations[kost._id] || 1);
    }, 0);
  };

  // Menghitung tanggal berakhir berdasarkan tanggal mulai dan durasi
  const calculateEndDate = (startDate, months) => {
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);
    return endDate;
  };

  // Memformat tanggal untuk input field (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    try {
      if (!(date instanceof Date) || isNaN(date)) {
        date = new Date();
      }
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Date formatting error:", error);
      return new Date().toISOString().split("T")[0];
    }
  };

  // Memformat tanggal untuk ditampilkan (contoh: "1 Januari 2025")
  const formatDateForDisplay = (date) => {
    try {
      if (!(date instanceof Date) || isNaN(date)) {
        date = new Date();
      }
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      console.error("Date display formatting error:", error);
      return new Date().toLocaleDateString("id-ID");
    }
  };

  // 4. Fungsi Handler

  // Menangani perubahan durasi untuk kost tertentu
  const handleDurationChange = (kostId, months) => {
    setDurations((prev) => ({
      ...prev,
      [kostId]: months,
    }));

    const currentStartDate = startDates[kostId] || new Date();
    const newEndDate = new Date(currentStartDate);
    newEndDate.setMonth(newEndDate.getMonth() + months);
    setEndDates((prev) => ({
      ...prev,
      [kostId]: newEndDate,
    }));
  };

  // Menangani perubahan tanggal mulai untuk kost tertentu
  const handleStartDateChange = (kostId, date) => {
    const newStartDate = new Date(date);
    setStartDates((prev) => ({
      ...prev,
      [kostId]: newStartDate,
    }));

    const currentDuration = durations[kostId] || 1;
    const newEndDate = new Date(newStartDate);
    newEndDate.setMonth(newEndDate.getMonth() + currentDuration);
    setEndDates((prev) => ({
      ...prev,
      [kostId]: newEndDate,
    }));
  };

  // Menangani upload foto KTP ke Firebase
  const handleKTPUpload = (file) => {
    setIsUploading(true);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
        setIsUploading(false);
        Swal.fire({
          icon: "error",
          title: "Upload Gagal",
          text: "Gagal mengunggah foto KTP. Silakan coba lagi.",
          confirmButtonColor: "#2563eb",
        });
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setTenantForm({ ...tenantForm, identityImage: downloadURL });
          setIsUploading(false);
          if (filePerc === 100) {
            Swal.fire({
              icon: "success",
              title: "Berhasil",
              text: "Foto KTP berhasil diunggah",
              confirmButtonColor: "#2563eb",
            });
          }
        });
      },
    );
  };

  // Menangani pemilihan file KTP dan validasi
  const handleKTPSelect = (e) => {
    const file = e.target.files[0];
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    if (file) {
      if (file.size > maxSize) {
        Swal.fire({
          icon: "error",
          title: "Ukuran File Terlalu Besar",
          text: "Maksimum ukuran file adalah 2MB",
          confirmButtonColor: "#2563eb",
        });
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Tipe File Tidak Didukung",
          text: "Hanya mendukung JPEG, PNG, dan GIF",
          confirmButtonColor: "#2563eb",
        });
        return;
      }

      handleKTPUpload(file);
    }
  };

  // 5. Fungsi Validasi

  // Memvalidasi data form sebelum submit
  const validateForm = () => {
    if (!tenantForm.name.trim()) {
      Swal.fire({
        icon: "error",
        title: "Data Tidak Lengkap",
        text: "Mohon isi nama lengkap Anda",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    if (!tenantForm.phone.trim()) {
      Swal.fire({
        icon: "error",
        title: "Data Tidak Lengkap",
        text: "Mohon isi nomor telepon Anda",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    if (!tenantForm.identityNumber.trim()) {
      Swal.fire({
        icon: "error",
        title: "Data Tidak Lengkap",
        text: "Mohon isi nomor identitas (KTP) Anda",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    if (!tenantForm.identityImage) {
      Swal.fire({
        icon: "error",
        title: "Data Tidak Lengkap",
        text: "Mohon unggah foto KTP Anda",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    if (!paymentMethod) {
      Swal.fire({
        icon: "error",
        title: "Metode Pembayaran",
        text: "Mohon pilih metode pembayaran",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    if (!tenantForm.emergencyContact.name.trim()) {
      Swal.fire({
        icon: "error",
        title: "Data Tidak Lengkap",
        text: "Mohon isi nama kontak darurat",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    if (!tenantForm.emergencyContact.phone.trim()) {
      Swal.fire({
        icon: "error",
        title: "Data Tidak Lengkap",
        text: "Mohon isi nomor telepon kontak darurat",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    const phonePattern = /^[0-9]{10,12}$/;
    if (!phonePattern.test(tenantForm.emergencyContact.phone)) {
      Swal.fire({
        icon: "error",
        title: "Nomor Telepon Tidak Valid",
        text: "Mohon isi nomor telepon yang valid untuk kontak darurat",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    if (!tenantForm.emergencyContact.relationship.trim()) {
      Swal.fire({
        icon: "error",
        title: "Data Tidak Lengkap",
        text: "Mohon isi hubungan dengan kontak darurat",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    if (!paymentMethod) {
      Swal.fire({
        icon: "error",
        title: "Metode Pembayaran",
        text: "Mohon pilih metode pembayaran",
        confirmButtonColor: "#2563eb",
      });
      return false;
    }

    return true;
  };

  // 6. Fungsi Pembayaran

  // Membuat order di database
  const createOrder = async (kostId, paymentDetails) => {
    const response = await fetch("/api/orders/cash", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        duration: durations[kostId],
        paymentMethod: paymentDetails.paymentMethod,
        tenant: tenantForm,
        kostId: kostId,
        ownerId: owners[kostId]?._id,
        amount: kosts.find((k) => k._id === kostId).price * durations[kostId],
        startDate: startDates[kostId],
        endDate: endDates[kostId],
        payment: {
          status: paymentDetails.status,
          ...paymentDetails,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  // Menangani proses checkout
  const handleCheckout = async () => {
    if (!validateForm()) return;

    try {
      if (paymentMethod === "midtrans") {
        for (const kost of kosts) {
          try {
            const response = await fetch("/api/orders/midtrans", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                duration: durations[kost._id],
                paymentMethod: "midtrans",
                tenant: tenantForm,
                kostId: kost._id,
                ownerId: owners[kost._id]?._id,
                amount:
                  kosts.find((k) => k._id === kost._id).price *
                  durations[kost._id],
                startDate: startDates[kost._id],
                endDate: endDates[kost._id],
                payment: {
                  status: "pending",
                  paymentMethod: "midtrans",
                },
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message || "Failed to initiate payment.");
            }

            const { order, paymentToken } = data;

            // Store orderId for status checking
            const orderId = order._id;

            window.snap.pay(paymentToken, {
              onSuccess: async () => {
                try {
                  // Check payment status after successful payment
                  const statusResponse = await fetch(
                    `/api/orders/check-status/${orderId}`,
                  );
                  const statusData = await statusResponse.json();
                  console.log("Status from API:", data);
                  if (
                    statusData.success &&
                    statusData.order.payment.status === "paid"
                  ) {
                    Swal.fire({
                      icon: "success",
                      title: "Pembayaran Berhasil",
                      text: "Pesanan Anda telah dikonfirmasi",
                      confirmButtonColor: "#2563eb",
                    });
                  } else {
                    // If status is still pending, inform user to wait
                    Swal.fire({
                      icon: "info",
                      title: "Memproses Pembayaran",
                      text: "Pembayaran Anda sedang diproses. Silakan cek status pesanan secara berkala.",
                      confirmButtonColor: "#2563eb",
                    });
                  }
                } catch (error) {
                  console.error("Error verifying payment:", error);
                  Swal.fire({
                    icon: "warning",
                    title: "Status Pembayaran",
                    text: "Silakan cek status pesanan Anda di halaman pesanan",
                    confirmButtonColor: "#2563eb",
                  });
                }
                navigate("/my-orders");
              },
              onPending: () => {
                Swal.fire({
                  icon: "info",
                  title: "Pembayaran Pending",
                  text: "Silakan selesaikan pembayaran Anda",
                  confirmButtonColor: "#2563eb",
                });
                navigate("/my-orders");
              },
              onError: () => {
                Swal.fire({
                  icon: "error",
                  title: "Pembayaran Gagal",
                  text: "Silakan coba lagi",
                  confirmButtonColor: "#2563eb",
                });
                navigate("/my-orders");
              },
              onClose: () => {
                Swal.fire({
                  icon: "warning",
                  title: "Pembayaran Dibatalkan",
                  text: "Popup pembayaran ditutup",
                  confirmButtonColor: "#2563eb",
                });
              },
            });
          } catch (error) {
            console.error("Payment error:", error);
            Swal.fire({
              icon: "error",
              title: "Terjadi Kesalahan",
              text: error.message || "Mohon coba lagi nanti",
              confirmButtonColor: "#2563eb",
            });
          }
        }
      } else if (paymentMethod === "cash") {
        // Process cash payments for each kost
        for (const kost of kosts) {
          await createOrder(kost._id, {
            status: "pending",
            paymentMethod: "cash",
          });
        }

        Swal.fire({
          icon: "success",
          title: "Order Berhasil!",
          text: "Silakan hubungi pemilik kost untuk pembayaran",
          confirmButtonColor: "#2563eb",
        }).then(() => navigate("/my-orders"));
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: error.message || "Mohon coba lagi nanti",
      });
    }
  };

  // 7. Render
  if (loading) return <p className="my-7 text-center text-2xl">Memuat...</p>;
  if (error)
    return <p className="my-7 text-center text-2xl">Terjadi kesalahan!</p>;
  if (!kosts) return null;

  return (
    // Kontainer utama dengan latar belakang dan padding
    <div className="min-h-screen bg-surface p-6">
      {/* Pembungkus konten dengan lebar maksimum dan spasi antar bagian */}
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-onsurface">Checkout</h1>

        {/* Kartu Informasi Kost - Ditampilkan untuk setiap kost */}
        {kosts.map((kost) => (
          <div
            key={kost._id}
            className="rounded-xl bg-background p-6 shadow-lg"
          >
            {/* Header Kost dengan Nama dan Lokasi */}
            <div className="mb-6 border-b pb-4">
              <div className="flex items-center gap-3">
                <BsHouseDoor className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">
                  {kost.name || "Nama Kost Tidak Diketahui"}
                </h2>
              </div>
              <p className="mt-2 text-gray-600">
                {kost.location || "Lokasi Tidak Diketahui"}
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                {/* Informasi Harga */}
                <div>
                  <p className="text-sm text-gray-500">Harga per Bulan</p>
                  <p className="text-lg font-semibold text-primary">
                    Rp {kost.price?.toLocaleString("id-ID") || "N/A"}
                  </p>
                </div>
                {/* Menampilkan harga asli jika ada diskon */}
                {kost.originalPrice > kost.price && kost.originalPrice && (
                  <div>
                    <p className="text-sm text-gray-500">Harga Normal</p>
                    <p className="text-lg text-gray-400 line-through">
                      Rp {kost.originalPrice.toLocaleString("id-ID")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pilihan Durasi untuk setiap kost */}
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[1, 3, 6, 12].map((months) => (
                <button
                  key={`${kost._id}-${months}`}
                  onClick={() => handleDurationChange(kost._id, months)}
                  className={`rounded-lg border-2 p-4 text-center transition-all ${
                    durations[kost._id] === months
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-gray-200 hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium">{months} Bulan</div>
                  <div className="mt-1 text-sm text-gray-500">
                    Rp {(kost.price * months)?.toLocaleString("id-ID") || "N/A"}
                  </div>
                </button>
              ))}
            </div>

            {/* Pemilihan Tanggal untuk setiap kost */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                {/* Input Tanggal Mulai */}
                <label className="mb-1 block text-sm font-medium">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={formatDateForInput(startDates[kost._id])}
                  onChange={(e) =>
                    handleStartDateChange(kost._id, e.target.value)
                  }
                  min={formatDateForInput(new Date())}
                  className="w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formatDateForDisplay(startDates[kost._id])}
                </p>
              </div>
              {/* Tampilan Tanggal Berakhir (hanya baca) */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Tanggal Berakhir
                </label>
                <input
                  type="date"
                  value={formatDateForInput(
                    endDates[kost._id] ||
                      calculateEndDate(
                        startDates[kost._id],
                        durations[kost._id] || 1,
                      ),
                  )}
                  disabled
                  className="w-full rounded-lg border bg-gray-50 p-2"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {formatDateForDisplay(
                    endDates[kost._id] ||
                      calculateEndDate(
                        startDates[kost._id],
                        durations[kost._id] || 1,
                      ),
                  )}
                </p>
              </div>
            </div>

            {/* Informasi Pemilik */}
            {owners[kost._id] && (
              <div className="mt-6 flex items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <BsPerson className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Pemilik Kost</h3>
                  </div>
                  <p className="mt-1">
                    {owners[kost._id].username || "Nama Tidak Diketahui"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {owners[kost._id].email || "Email Tidak Tersedia"}
                  </p>
                  {kost.contact?.phone && (
                    <p className="text-sm text-gray-500">
                      Telepon: {kost.contact.phone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Formulir Informasi Penyewa */}
        <div className="rounded-xl bg-background p-6 shadow-lg">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Informasi Pribadi</h2>
          </div>
          {/* Grid dua kolom untuk field formulir */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Kolom Kiri */}
            <div className="space-y-4">
              {/* Input Nama */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-primary"
                  value={tenantForm.name}
                  onChange={(e) =>
                    setTenantForm({ ...tenantForm, name: e.target.value })
                  }
                />
              </div>
              {/* Input Email (Dinonaktifkan) */}
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-primary"
                  value={tenantForm.email}
                  disabled
                />
              </div>
              {/* Input Pekerjaan */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Pekerjaan
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-primary"
                  value={tenantForm.occupation}
                  onChange={(e) =>
                    setTenantForm({ ...tenantForm, occupation: e.target.value })
                  }
                />
              </div>
            </div>
            {/* Kolom Kanan */}
            <div className="space-y-4">
              {/* Input Nomor Telepon */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  className="w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-primary"
                  value={tenantForm.phone}
                  onChange={(e) =>
                    setTenantForm({ ...tenantForm, phone: e.target.value })
                  }
                />
              </div>
              {/* Input Nomor Identitas (KTP) */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nomor Identitas (KTP)
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-primary"
                  value={tenantForm.identityNumber}
                  onChange={(e) =>
                    setTenantForm({
                      ...tenantForm,
                      identityNumber: e.target.value,
                    })
                  }
                />
              </div>
              {/* Unggah Foto KTP */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Foto KTP
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleKTPSelect}
                    ref={fileRef}
                    className="w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-primary"
                  />
                  {/* Indikator Progres Upload */}
                  {filePerc > 0 && filePerc < 100 && (
                    <div className="text-sm text-gray-500">
                      Sedang mengunggah... {filePerc}%
                    </div>
                  )}
                  {/* Pesan Error */}
                  {fileUploadError && (
                    <div className="text-sm text-red-500">
                      Error: Gagal mengunggah gambar
                    </div>
                  )}
                  {/* Pratinjau Gambar */}
                  {tenantForm.identityImage && (
                    <div className="relative h-40 w-full">
                      <img
                        src={tenantForm.identityImage}
                        alt="KTP Preview"
                        className="h-40 w-full rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bagian Kontak Darurat */}
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-medium">Kontak Darurat</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Nama Kontak Darurat */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nama Kontak Darurat
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-primary"
                  value={tenantForm.emergencyContact.name}
                  onChange={(e) =>
                    setTenantForm({
                      ...tenantForm,
                      emergencyContact: {
                        ...tenantForm.emergencyContact,
                        name: e.target.value,
                      },
                    })
                  }
                />
              </div>
              {/* Nomor Telepon Darurat */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nomor Telepon Darurat
                </label>
                <input
                  type="tel"
                  className="w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-primary"
                  value={tenantForm.emergencyContact.phone}
                  onChange={(e) =>
                    setTenantForm({
                      ...tenantForm,
                      emergencyContact: {
                        ...tenantForm.emergencyContact,
                        phone: e.target.value,
                      },
                    })
                  }
                />
              </div>
              {/* Hubungan */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Hubungan
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border p-2 outline-none focus:ring-2 focus:ring-primary"
                  value={tenantForm.emergencyContact.relationship}
                  onChange={(e) =>
                    setTenantForm({
                      ...tenantForm,
                      emergencyContact: {
                        ...tenantForm.emergencyContact,
                        relationship: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metode Pembayaran */}
        <div className="rounded-xl bg-background p-6 shadow-lg">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Metode Pembayaran</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Opsi Pembayaran Midtrans */}
            <button
              onClick={() => setPaymentMethod("midtrans")}
              className={`flex items-center rounded-lg border-2 p-4 transition-all ${
                paymentMethod === "midtrans"
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 hover:border-primary/50"
              }`}
            >
              <BsCreditCard2Front className="mr-3 h-6 w-6 text-primary" />
              <div className="text-left">
                <div className="font-medium">Pembayaran Midtrans</div>
                <div className="text-sm text-gray-500">
                  Bayar dengan berbagai metode
                </div>
              </div>
              {paymentMethod === "midtrans" && (
                <BsCheckCircleFill className="ml-auto text-primary" />
              )}
            </button>
            {/* Opsi Pembayaran Tunai */}
            <button
              onClick={() => setPaymentMethod("cash")}
              className={`flex items-center rounded-lg border-2 p-4 transition-all ${
                paymentMethod === "cash"
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 hover:border-primary/50"
              }`}
            >
              <BsCash className="mr-3 h-6 w-6 text-primary" />
              <div className="text-left">
                <div className="font-medium">Pembayaran Tunai</div>
                <div className="text-sm text-gray-500">
                  Bayar langsung ke pemilik
                </div>
              </div>
              {paymentMethod === "cash" && (
                <BsCheckCircleFill className="ml-auto text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Ringkasan dan Tombol Checkout */}
        <div className="flex flex-col items-center justify-between rounded-xl bg-background p-6 shadow-lg sm:flex-row">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-lg font-medium">Total Pembayaran</h3>
            {kosts.map((kost) => (
              <p key={kost._id} className="mt-1 text-sm text-gray-500">
                {kost.name}: Rp {kost.price.toLocaleString("id-ID")} ×{" "}
                {durations[kost._id]} bulan = Rp{" "}
                {(kost.price * durations[kost._id]).toLocaleString("id-ID")}
              </p>
            ))}
            <p className="mt-2 text-2xl font-bold text-primary">
              Total: Rp {calculateTotalAmount().toLocaleString("id-ID")}
            </p>
          </div>
          <button
            className="w-full rounded-lg bg-primary px-8 py-3 text-lg font-medium text-onPrimary transition-colors hover:bg-primaryVariant sm:w-auto"
            onClick={handleCheckout}
            disabled={isUploading}
          >
            {isUploading
              ? "Menunggu Upload Selesai..."
              : "Lanjut ke Pembayaran"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
