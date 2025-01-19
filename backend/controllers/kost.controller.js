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
      coordinates,
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
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      kost.coordinates = coordinates;
    }
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

    const { latitude, longitude, radius } = req.query;

    let geoFilter = {};
    if (longitude && latitude && radius) {
      // Convert radius from kilometers to radians (Earth's radius is approximately 6371 km)
      const radiusInRadians = parseFloat(radius) / 6371;

      geoFilter = {
        coordinates: {
          $geoWithin: {
            $centerSphere: [
              [parseFloat(longitude), parseFloat(latitude)],
              radiusInRadians,
            ],
          },
        },
      };
    }

    // Handle availability parameter
    let availability;
    if (req.query.availability === "false") {
      availability = false;
    } else if (req.query.availability === "true") {
      availability = true;
    } else {
      availability = { $in: [false, true] };
    }

    // Handle type
    let type = req.query.type;
    if (type === undefined || type === "all") {
      type = { $in: ["Putra", "Putri", "Campur"] };
    }

    //filter price
    let priceFilter = {};
    const minPrice = req.query.minPrice
      ? parseInt(req.query.minPrice)
      : undefined;
    const maxPrice = req.query.maxPrice
      ? parseInt(req.query.maxPrice)
      : undefined;

    if (minPrice !== undefined && maxPrice !== undefined) {
      priceFilter = { price: { $gte: minPrice, $lte: maxPrice } };
    } else if (minPrice !== undefined) {
      priceFilter = { price: { $gte: minPrice } };
    } else if (maxPrice !== undefined) {
      priceFilter = { price: { $lte: maxPrice } };
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
      ...geoFilter,
      ...priceFilter,
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
          availability: 1,
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

export const addReview = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { id: kostId } = req.params;
    const { rating, comment } = req.body;

    const kost = await Kost.findById(kostId);

    if (!kost) {
      return res.status(404).json({ messsage: "Kost not found" });
    }

    if (!rating || !comment) {
      return res
        .status(400)
        .json({ message: "Rating and comment are required" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    if (userId === kost.userRef) {
      return res
        .status(403)
        .josn({ message: "You can't give review to your own kost" });
    }

    const existingReview = kost.reviews.find(
      (review) => review.user.toString() === userId
    );

    if (existingReview) {
      return res
        .status(403)
        .json({ message: "You have already reviewed this kost" });
    }

    const newReview = {
      user: userId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    kost.reviews.push(newReview);

    await kost.save();

    return res
      .status(201)
      .json({ message: "Review added successfully", review: newReview });
  } catch (error) {
    console.error("Error adding review:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { id: kostId } = req.params;
    const { rating, comment } = req.body;

    const kost = await Kost.findById(kostId);

    if (!kost) {
      return res.status(404).json({ message: "Kost not found" });
    }

    if (!rating || !comment) {
      return res
        .status(400)
        .json({ message: "Rating and comment are required" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const reviewIndex = kost.reviews.findIndex(
      (review) => review.user.toString() === userId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Preserve existing review data while updating
    const existingReview = kost.reviews[reviewIndex];
    kost.reviews[reviewIndex] = {
      ...existingReview,
      rating,
      comment,
      updatedAt: new Date().toISOString(),
      user: existingReview.user, // Ensure user reference is preserved
    };

    await kost.save();

    return res.status(200).json({
      message: "Review updated successfully",
      review: kost.reviews[reviewIndex],
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { id: kostId } = req.params;

    const kost = await Kost.findById(kostId);

    if (!kost) {
      return res.status(404).json({ message: "Kost not found" });
    }

    // Find the review index
    const reviewIndex = kost.reviews.findIndex(
      (review) => review.user.toString() === userId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found" });
    }

    kost.reviews.splice(reviewIndex, 1);
    await kost.save();

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
