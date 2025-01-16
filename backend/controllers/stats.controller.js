import Order from "../models/order.model.js";
import Kost from "../models/kost.model.js";
import mongoose from "mongoose";

export const getStatsForOwner = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const currentDate = new Date();
    const lastMonth = new Date(
      currentDate.setMonth(currentDate.getMonth() - 1)
    );
    // Basic Statistics with Growth Rates
    const [currentStats, previousStats] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            ownerId: new mongoose.Types.ObjectId(ownerId),
            createdAt: { $gte: lastMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$payment.amount" },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            ownerId: new mongoose.Types.ObjectId(ownerId),
            createdAt: {
              $gte: new Date(lastMonth.setMonth(lastMonth.getMonth() - 1)),
              $lt: lastMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$payment.amount" },
          },
        },
      ]),
    ]);

    // Calculate growth rates
    const calculateGrowth = (current, previous) => {
      if (!previous || previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    const growthRates = {
      orderGrowth: calculateGrowth(
        currentStats[0]?.totalOrders || 0,
        previousStats[0]?.totalOrders || 0
      ),
      revenueGrowth: calculateGrowth(
        currentStats[0]?.totalRevenue || 0,
        previousStats[0]?.totalRevenue || 0
      ),
    };

    // Basic Statistics
    const totalOrders = await Order.countDocuments({ ownerId });
    const totalKosts = await Kost.countDocuments({ userRef: ownerId });
    const pendingPayments = await Order.countDocuments({
      ownerId,
      "payment.status": "pending",
    });
    const paidPayments = await Order.countDocuments({
      ownerId,
      "payment.status": "paid",
    });

    // Revenue Statistics
    const revenueStats = await Order.aggregate([
      {
        $match: { ownerId: new mongoose.Types.ObjectId(ownerId) },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$payment.amount" },
          averageRevenue: { $avg: "$payment.amount" },
          maxRevenue: { $max: "$payment.amount" },
          minRevenue: { $min: "$payment.amount" },
          pendingRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$payment.status", "pending"] },
                "$payment.amount",
                0,
              ],
            },
          },
          paidRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$payment.status", "paid"] },
                "$payment.amount",
                0,
              ],
            },
          },
          cashRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$payment.method", "cash"] },
                "$payment.amount",
                0,
              ],
            },
          },
          transferRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$payment.method", "midtrans"] },
                "$payment.amount",
                0,
              ],
            },
          },
        },
      },
    ]);

    // Monthly Statistics
    const monthlyStats = await Order.aggregate([
      {
        $match: { ownerId: new mongoose.Types.ObjectId(ownerId) },
      },
      {
        $group: {
          _id: {
            year: { $year: "$startDate" },
            month: { $month: "$startDate" },
          },
          revenue: { $sum: "$payment.amount" },
          totalOrders: { $sum: 1 },
          pendingOrders: {
            $sum: {
              $cond: [{ $eq: ["$payment.status", "pending"] }, 1, 0],
            },
          },
          paidOrders: {
            $sum: {
              $cond: [{ $eq: ["$payment.status", "paid"] }, 1, 0],
            },
          },
          cashPayments: {
            $sum: { $cond: [{ $eq: ["$payment.method", "cash"] }, 1, 0] },
          },
          transferPayments: {
            $sum: { $cond: [{ $eq: ["$payment.method", "midtrans"] }, 1, 0] },
          },
          averageStayDuration: { $avg: "$duration" },
          totalStayDuration: { $sum: "$duration" },
          uniqueTenants: { $addToSet: "$tenant.email" },
          occupations: { $addToSet: "$tenant.occupation" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    // Popular Kosts
    const popularKosts = await Order.aggregate([
      {
        $match: { ownerId: new mongoose.Types.ObjectId(ownerId) },
      },
      {
        $group: {
          _id: "$kostId",
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: "$payment.amount" },
          averageStayDuration: { $avg: "$duration" },
          uniqueTenants: { $addToSet: "$tenant.email" },
        },
      },
      {
        $lookup: {
          from: "kosts",
          localField: "_id",
          foreignField: "_id",
          as: "kostDetails",
        },
      },
      {
        $unwind: "$kostDetails",
      },
      {
        $project: {
          kostName: "$kostDetails.name",
          bookingCount: 1,
          totalRevenue: 1,
          averageStayDuration: 1,
          uniqueTenantsCount: { $size: "$uniqueTenants" },
          location: "$kostDetails.location",
          city: "$kostDetails.city",
          type: "$kostDetails.type",
          price: "$kostDetails.price",
        },
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
    ]);

    // Tenant Analysis
    const tenantStats = await Order.aggregate([
      {
        $match: { ownerId: new mongoose.Types.ObjectId(ownerId) },
      },
      {
        $group: {
          _id: "$tenant.email",
          tenantName: { $first: "$tenant.name" },
          phone: { $first: "$tenant.phone" },
          occupation: { $first: "$tenant.occupation" },
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: "$payment.amount" },
          averageStayDuration: { $avg: "$duration" },
          lastBooking: { $max: "$startDate" },
        },
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 },
    ]);

    // Duration Analysis
    const durationStats = await Order.aggregate([
      {
        $match: { ownerId: new mongoose.Types.ObjectId(ownerId) },
      },
      {
        $group: {
          _id: "$duration",
          count: { $sum: 1 },
          averageRevenue: { $avg: "$payment.amount" },
          totalRevenue: { $sum: "$payment.amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Payment Analysis
    const paymentAnalytics = await Order.aggregate([
      {
        $match: { ownerId: new mongoose.Types.ObjectId(ownerId) },
      },
      {
        $group: {
          _id: {
            status: "$payment.status",
            method: "$payment.method",
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$payment.amount" },
          averageAmount: { $avg: "$payment.amount" },
        },
      },
    ]);

    // Occupancy Metrics
    const occupancyMetrics = await Promise.all([
      // Currently occupied rooms
      Order.countDocuments({
        ownerId,
        endDate: { $gte: currentDate },
        orderStatus: "ordered",
      }),
      // Upcoming bookings (next 30 days)
      Order.countDocuments({
        ownerId,
        startDate: {
          $gte: currentDate,
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        orderStatus: "ordered",
      }),
      // Contracts ending soon (next 30 days)
      Order.countDocuments({
        ownerId,
        endDate: {
          $gte: currentDate,
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        orderStatus: "ordered",
      }),
    ]);

    // Tenant Demographics
    const tenantDemographics = await Order.aggregate([
      {
        $match: { ownerId: new mongoose.Types.ObjectId(ownerId) },
      },
      {
        $group: {
          _id: "$tenant.occupation",
          count: { $sum: 1 },
          averageStayDuration: { $avg: "$duration" },
          averagePayment: { $avg: "$payment.amount" },
          totalRevenue: { $sum: "$payment.amount" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const reviewStats = await Kost.aggregate([
      {
        $match: { userRef: ownerId },
      },
      {
        $unwind: "$reviews",
      },
      {
        $group: {
          _id: "$_id",
          kostName: { $first: "$name" },
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$reviews.rating" },
          ratings: {
            $push: {
              rating: "$reviews.rating",
              comment: "$reviews.comment",
              date: "$reviews.createdAt",
            },
          },
        },
      },
      {
        $project: {
          kostName: 1,
          totalReviews: 1,
          averageRating: { $round: ["$averageRating", 1] },
          ratings: 1,
        },
      },
      { $sort: { totalReviews: -1 } },
    ]);

    // Facilities Analysis
    const facilitiesStats = await Kost.aggregate([
      {
        $match: { userRef: ownerId },
      },
      {
        $unwind: "$facilities",
      },
      {
        $group: {
          _id: "$facilities",
          count: { $sum: 1 },
          kosts: { $push: "$name" },
        },
      },
      {
        $project: {
          facility: "$_id",
          count: 1,
          kosts: 1,
          percentage: {
            $multiply: [{ $divide: ["$count", { $size: "$kosts" }] }, 100],
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const tenantRetentionRate = await Order.aggregate([
      {
        $match: { ownerId: new mongoose.Types.ObjectId(ownerId) },
      },
      {
        $group: {
          _id: "$tenant.email",
          bookingCount: { $sum: 1 },
          firstBooking: { $min: "$startDate" },
          lastBooking: { $max: "$startDate" },
        },
      },
      {
        $project: {
          isReturning: {
            $cond: [{ $gt: ["$bookingCount", 1] }, 1, 0],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalTenants: { $sum: 1 },
          returningTenants: { $sum: "$isReturning" },
        },
      },
      {
        $project: {
          retentionRate: {
            $multiply: [
              { $divide: ["$returningTenants", "$totalTenants"] },
              100,
            ],
          },
        },
      },
    ]);

    res.status(200).json({
      basicStats: {
        totalOrders,
        totalKosts,
        pendingPayments,
        paidPayments,
        revenueStats: revenueStats[0] || {
          totalRevenue: 0,
          averageRevenue: 0,
          maxRevenue: 0,
          minRevenue: 0,
          pendingRevenue: 0,
          paidRevenue: 0,
          cashRevenue: 0,
          transferRevenue: 0,
        },
      },
      monthlyStats,
      popularKosts,
      tenantStats,
      durationStats,
      paymentAnalytics,
      occupancyMetrics: {
        currentlyOccupied: occupancyMetrics[0],
        upcomingBookings: occupancyMetrics[1],
        endingSoon: occupancyMetrics[2],
      },
      tenantDemographics,
      facilitiesStats,
      reviewStats,
      growthMetrics: growthRates,
      tenantRetention: tenantRetentionRate[0]?.retentionRate || 0,
    });
  } catch (error) {
    console.error("Error fetching owner dashboard data:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export default getStatsForOwner;
