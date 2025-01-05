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

export const updateKost = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      location,
      city,
      price,
      originalPrice,
      facilities,
      type,
      availability,
      contact,
      imageUrls,
    } = req.body;

    const kost = await Kost.findById(id);

    if (!kost) {
      return res.status(404).json({ message: "Kost not found" });
    }

    if (req.user.id != kost.userRef) {
      return res
        .status(403)
        .json({ message: "You can only update your own kost" });
    }

    if (name !== undefined) kost.name = name;
    if (description !== undefined) kost.description = description;
    if (location !== undefined) kost.location = location;
    if (city !== undefined) kost.city = city;
    if (price !== undefined) kost.price = price;
    if (originalPrice !== undefined) kost.originalPrice = originalPrice;
    if (facilities !== undefined) kost.facilities = facilities;
    if (type !== undefined) kost.type = type;
    if (availability !== undefined) kost.availability = availability;
    if (contact?.phone !== undefined) kost.contact.phone = contact.phone;
    if (contact?.whatsapp !== undefined)
      kost.contact.whatsapp = contact.whatsapp;
    if (imageUrls !== undefined) kost.imageUrls = imageUrls;

    const updatedKost = await kost.save();

    res.status(200).json({
      message: "Kost updated successfully",
      kost: updatedKost,
    });
  } catch (error) {
    console.error("Update kost error" + error);
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
    console.error("Get kost error" + error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getAllKost = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 9; // Default to 9 items per page
    const skip = (page - 1) * limit;

    // Handle availability parameter
    let availability = req.query.availability;
    if (
      availability === undefined ||
      availability === false ||
      availability === "false"
    ) {
      availability = { $in: [false, true] };
    }

    // Handle type
    let type = req.query.type;
    if (type === undefined || type === "all") {
      type = { $in: ["Putra", "Putri", "Campur"] };
    }

    const facilities = req.query.facilities
      ? { $all: req.query.facilities.split(",") }
      : undefined;

    const location = req.query.location ? req.query.location : undefined;
    const city = req.query.city ? req.query.city : undefined;

    const searchTerm = req.query.searchTerm || "";

    const sort = req.query.sort || "createdAt";
    const order = req.query.order || "desc";

    const filters = {
      name: { $regex: searchTerm, $options: "i" },
      availability,
      type,
      ...(facilities && { facilities }),
      ...(location && { location: { $regex: location, $options: "i" } }),
      ...(city && { city: { $regex: city, $options: "i" } }),
    };

    // Find kost data with pagination
    const kosts = await Kost.find(filters)
      .sort({ [sort]: order })
      .skip(skip)
      .limit(limit);

    // Count total items for pagination
    const totalKosts = await Kost.countDocuments(filters);

    // Calculate total pages
    const totalPages = Math.ceil(totalKosts / limit);

    res.status(200).json({
      data: kosts, // The kost data for the current page
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalKosts,
      },
    });
  } catch (error) {
    console.error("Error fetching kost data:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getRandomKost = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 9; // Default to 4 random kosts

    // Get total count of available kosts
    const totalKosts = await Kost.countDocuments({ availability: true });

    // If no kosts are available, return empty array
    if (totalKosts === 0) {
      return res.status(200).json({
        success: true,
        kosts: [],
        message: "No available kosts found",
      });
    }

    // Get random kosts using aggregation pipeline
    const randomKosts = await Kost.aggregate([
      // Match only available kosts
      { $match: { availability: true } },
      // Get random documents
      { $sample: { size: limit } },
      // Optionally project only needed fields
      {
        $project: {
          name: 1,
          location: 1,
          city: 1,
          price: 1,
          originalPrice: 1,
          facilities: 1,
          type: 1,
          imageUrls: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      kosts: randomKosts,
      count: randomKosts.length,
    });
  } catch (error) {
    console.error("Get random kost error: " + error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
