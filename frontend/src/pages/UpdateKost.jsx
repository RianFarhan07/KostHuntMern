import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../firebase/firebase.config.js";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import LocationPicker from "../components/LocationPicker.jsx";

const UpdateKost = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [imageUploadProgress, setImageUploadProgress] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    coordinates: [106.8456, -6.2088],
    city: "",
    type: "",
    price: 0,
    originalPrice: 0,
    facilities: [],
    availability: true,
    contact: {
      phone: "",
      whatsapp: "",
    },
    images: [],
    imageUrls: [],
    userRef: currentUser?._id,
  });

  useEffect(() => {
    const fetchKost = async () => {
      const kostId = params.id;
      const res = await fetch(`/api/kost/get/${kostId}`);
      const data = await res.json();
      //   console.log(data);

      setFormData(data);
      if (!data.success) {
        console.log(data.message);
      }
    };
    fetchKost();
  }, [params.id]);

  const facilityOptions = [
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

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (id.startsWith("contact.")) {
      const field = id.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value,
        },
      }));
    } else if (type === "checkbox") {
      const updatedFacilities = checked
        ? [...formData.facilities, value]
        : formData.facilities.filter((item) => item !== value);
      setFormData((prev) => ({
        ...prev,
        facilities: updatedFacilities,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: type === "number" ? Number(value) : value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: [...files],
    }));
  };

  const storeImage = async (file, index) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = `${new Date().getTime()}_${file.name}`;
      const storageRef = ref(storage, `kosts/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress((prev) =>
            prev.map((item, i) => (i === index ? { ...item, progress } : item)),
          );
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        },
      );
    });
  };

  const handleImageUpload = async () => {
    if (formData.images.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Pilih gambar terlebih dahulu",
      });
      return;
    }

    if (formData.images.length + formData.imageUrls.length > 6) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Maksimal 6 gambar",
      });
      return;
    }

    try {
      setUploading(true);
      setImageUploadProgress(
        formData.images.map((_, index) => ({ index, progress: 0 })),
      );

      const imageUrls = await Promise.all(
        formData.images.map((file, index) => storeImage(file, index)),
      );

      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...imageUrls],
        images: [],
      }));

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Gambar berhasil diunggah!",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `Gagal mengunggah gambar: ${error.message}`,
      });
    } finally {
      setUploading(false);
      setTimeout(() => {
        setImageUploadProgress([]);
      }, 500);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.imageUrls.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Upload minimal 1 gambar",
      });
      return;
    }

    try {
      // Prepare submission data
      const submissionData = {
        ...formData,
        userRef: currentUser._id,
        timestamp: new Date(),
      };

      const res = await fetch(`/api/kost/update/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message);
      }

      Swal.fire({
        title: "Berhasil!",
        text: "Kost berhasil di update.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate(`/my-kost`);
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6"
    >
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">
          {`Edit Kost ${formData.name}`}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { id: "name", label: "Nama Kost", type: "text", required: true },
              { id: "location", label: "Lokasi", type: "text", required: true },
              { id: "city", label: "Kota", type: "text", required: true },
              {
                id: "type",
                label: "Tipe Kost",
                type: "select",
                required: true,
                options: ["Putra", "Putri", "Campur"],
              },
            ].map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    id={field.id}
                    value={formData[field.id]}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 p-3"
                    required={field.required}
                  >
                    <option value="">Pilih Tipe</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    id={field.id}
                    value={formData[field.id]}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 p-3"
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Add Location Picker */}
          <div className="col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Pilih Lokasi di Peta
            </label>
            <LocationPicker
              onLocationSelect={(coordinates) => {
                setFormData((prev) => ({
                  ...prev,
                  coordinates: coordinates,
                }));
              }}
            />
          </div>

          {/* Pricing */}
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { id: "price", label: "Harga per Bulan" },
              { id: "originalPrice", label: "Harga Original (Opsional)" },
            ].map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <input
                  type="number"
                  id={field.id}
                  value={formData[field.id]}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-3"
                  required={field.id === "price"}
                />
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { id: "contact.phone", label: "Nomor Telepon" },
              { id: "contact.whatsapp", label: "WhatsApp" },
            ].map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <input
                  type="text"
                  id={field.id}
                  value={formData.contact[field.id.split(".")[1]]}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-3"
                  required
                />
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Deskripsi
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 p-3"
              required
            />
          </div>

          {/* Facilities */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">
              Fasilitas
            </label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {facilityOptions.map((facility) => (
                <label key={facility} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`facility-${facility}`}
                    value={facility}
                    checked={formData.facilities.includes(facility)}
                    onChange={handleChange}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{facility}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">
              Foto Kost (Maksimal 6)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full"
              />
              <button
                type="button"
                onClick={handleImageUpload}
                disabled={uploading}
                className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-400"
              >
                {uploading ? "Mengunggah..." : "Upload"}
              </button>
            </div>

            {/* Upload Progress */}
            {imageUploadProgress.length > 0 && (
              <div className="space-y-2">
                {imageUploadProgress.map(({ index, progress }) => (
                  <div
                    key={index}
                    className="h-2 w-full rounded-full bg-gray-200"
                  >
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Image Preview */}
            {formData.imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {formData.imageUrls.map((url, index) => (
                  <div key={url} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-32 w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-400"
          >
            Tambah Kost
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default UpdateKost;
