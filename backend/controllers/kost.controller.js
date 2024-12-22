import Kost from "../models/kost.model.js";

export const createKost = async (req, res) => {
  try {
    const kost = await Kost.create(req.body);
    return res.status(201).json(kost);
  } catch (error) {
    console.error("Create Kost Error" + error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const deleteKost = async (req, res) => {
  const kost = await Kost.findById(req.params.id);

  if (!kost) {
    return res.status(404).json({ message: "Kost not found" });
  }

  if (req.user.id !== kost.userRef) {
    return res
      .status(403)
      .json({ message: "You an only delete your own kost" });
  }

  try {
    await Kost.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ message: "Kost deleted successfully", id: req.params.id });
  } catch (error) {
    console.error("Delete kost error" + error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getKost = async (req, res) => {
  try {
    const kost = await Kost.findById(req.params.id);
    if (!kost) {
      return res.status(404).json({ message: "Kost not found" });
    }
    res.status(200).json(kost);
  } catch (error) {
    console.error("Delete kost error" + error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
