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

export const getAllKost = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const startIndex = (page - 1) * limit;

    //handle availability parameter
    let availability = req.query.availability;
    if (
      availability === undefined ||
      availability === false ||
      availability === "false"
    ) {
      availability = { $in: [false, true] };
    }

    //handle type
    let type = req.query.type;
    if (type === undefined || type === "all") {
      type = { $in: ["Putra", "Putri", "Campur"] };
    }

    const facilities = req.query.facilities
      ? { $all: req.query.facilities.split(",") }
      : undefined;

    const location = req.query.location ? req.query.location : undefined;

    const searchTerm = req.query.searchTerm || "";

    const sort = req.query.sort || "createdAt";
    const order = req.query.order || "desc";

    const filters = {
      name: { $regex: searchTerm, $options: "i" },
      availability,
      type,
      ...(facilities && { facilities }),
      ...(location && { location: { $regex: location, $options: "i" } }),
    };

    const kosts = await Kost.find(filters)
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    const totalKosts = await Kost.countDocuments(filters);

    res.status(200).json({
      kosts,
      limit,
      totalKosts,
      page,
      totaPages: Math.ceil(totalKosts / limit),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
