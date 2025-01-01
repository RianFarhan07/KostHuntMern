import Kost from "../models/kost.model.js";
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

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return res.status(401).json({
      success: false,
      message: "You can only delete your own account",
    });
  }

  try {
    if (req.body.password) {
      req.body.password = bcrypt.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    console.log("Update User Error", error);
    return res.status(401).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json("User not found");
    const { password: pass, ...rest } = user._doc;
    res.status(200).json(rest); // Remove the nested "rest" object
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getUserKost = async (req, res) => {
  if (req.user.id === req.params.id) {
    try {
      const page = parseInt(req.query.page) || 1; // Default to page 1 if no page is provided
      const limit = parseInt(req.query.limit) || 9; // Default to 9 items per page if no limit is provided
      const skip = (page - 1) * limit;

      // Find kost data with pagination
      const kost = await Kost.find({ userRef: req.params.id })
        .skip(skip) // Skip the first N records
        .limit(limit); // Limit the number of records per page

      // Count total items for pagination
      const totalKost = await Kost.countDocuments({ userRef: req.params.id });

      // Calculate total pages
      const totalPages = Math.ceil(totalKost / limit);

      res.status(200).json({
        data: kost, // The kost data for the current page
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalKost,
        },
      });
    } catch (error) {
      console.error("Error fetching user kost:", error);
      res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message,
      });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
