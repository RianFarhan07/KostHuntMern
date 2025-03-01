import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaPaperPlane, FaStar, FaTimes, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import PropTypes from "prop-types";

const ReviewKostModal = ({
  isOpen,
  onClose,
  kostId,
  onReviewSubmitted,
  existingReview = null,
}) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    }
  }, [existingReview, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      Swal.fire({
        icon: "warning",
        title: "Rating Diperlukan",
        text: "Silahkan berikan rating untuk kost ini",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (comment.trim().length < 10) {
      Swal.fire({
        icon: "warning",
        title: "Ulasan Terlalu Pendek",
        text: "Silakan berikan ulasan minimal 10 karakter",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      setLoading(true);
      const endpoint = existingReview
        ? `${import.meta.env.VITE_API_URL}/api/kost/updateReview/${kostId}`
        : `${import.meta.env.VITE_API_URL}/api/kost/addReview/${kostId}`;

      const method = existingReview ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "failed to submit review");
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: existingReview
          ? "Ulasan berhasil diperbarui"
          : "Terima kasih atas ulasan Anda",
        timer: 2000,
        showConfirmButton: false,
      });

      onReviewSubmitted(data.review);
      handleClose();
    } catch (error) {
      console.error("Error submitting review:", error);
      Swal.fire({
        icon: "error",
        title: existingReview
          ? "Gagal Memperbarui Ulasan"
          : "Gagal Mengirim Ulasan",
        text: error.message || "Terjadi kesalahan saat mengirim ulasan",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await Swal.fire({
        title: "Hapus Ulasan?",
        text: "Anda yakin ingin menghapus ulasan ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/kost/deleteReview/${kostId}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error(
            (await response.json()).message || "Failed to delete review",
          );
        }

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Ulasan berhasil dihapus",
          timer: 2000,
          showConfirmButton: false,
        });

        onReviewSubmitted(null);
        handleClose();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus Ulasan",
        text: error.message || "Terjadi kesalahan saat menghapus ulasan",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed left-1/2 top-1/3 z-50 w-full max-w-md -translate-x-1/2 transform rounded-lg bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {existingReview ? "Edit Ulasan" : "Berikan Ulasan"}
              </h2>
              <button
                onClick={handleClose}
                className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Rating Anda
                </label>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <motion.button
                        key={index}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="focus:outline-none"
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                      >
                        <FaStar
                          className={`h-8 w-8 transition-colors ${
                            ratingValue <= (hover || rating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="comment"
                  className="mb-2 block text-sm font-medium text-gray-600"
                >
                  Ulasan Anda
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Bagikan pengalaman Anda..."
                />
              </div>

              <div className="flex gap-2">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.92 }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {loading ? (
                    "Mengirim..."
                  ) : (
                    <>
                      <FaPaperPlane />
                      <span>
                        {existingReview ? "Perbarui Ulasan" : "Kirim Ulasan"}
                      </span>
                    </>
                  )}
                </motion.button>

                {existingReview && (
                  <motion.button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.92 }}
                    className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-white transition-colors hover:bg-red-700 disabled:bg-red-400"
                  >
                    <FaTrash />
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
ReviewKostModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  kostId: PropTypes.string.isRequired,
  onReviewSubmitted: PropTypes.func.isRequired,
  existingReview: PropTypes.shape({
    rating: PropTypes.number,
    comment: PropTypes.string,
  }),
};

export default ReviewKostModal;
