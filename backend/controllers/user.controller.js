import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import bcrypt from "bcrypt";
// import { auth } from "../utils/firebaseAdmin.js";

export const deleteUser = async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(401).json({
      success: false,
      message: "You can only delete your own account",
    });
  }

  try {
    // Cari pengguna terlebih dahulu
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    // // Hapus dari Firebase Auth menggunakan UID Firebase, bukan Google ID
    // if (userToDelete.firebaseUid) {
    //   await auth.deleteUser(userToDelete.firebaseUid);
    // }

    // Hapus dari MongoDB
    await User.findByIdAndDelete(req.params.id);

    res
      .clearCookie("access_token")
      .status(200)
      .json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
