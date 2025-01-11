import Order from "../models/order.model.js";
import Kost from "../models/kost.model.js";

export const getStatsForOwner = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Basic Statistics
    const totalOrders = await Order.countDocuments({ ownerId });
    const totalKosts = await Kost.countDocuments({ ownerId });
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
        $match: { ownerId },
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
                { $eq: ["$payment.method", "transfer"] },
                "$payment.amount",
                0,
              ],
            },
          },
        },
      },
    ]);

    // Monthly Statistics with Year-over-Year Comparison
    const monthlyStats = await Order.aggregate([
      {
        $match: { ownerId },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
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
            $sum: { $cond: [{ $eq: ["$payment.method", "transfer"] }, 1, 0] },
          },
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
          averageStayDuration: { $avg: "$duration" },
          totalStayDuration: { $sum: "$duration" },
          uniqueTenants: { $addToSet: "$tenant.email" },
          occupations: { $addToSet: "$tenant.occupation" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    // Popular Kosts with Detailed Metrics
    const popularKosts = await Order.aggregate([
      {
        $match: { ownerId },
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
          occupancyRate: {
            $multiply: [
              {
                $divide: [
                  "$bookingCount",
                  { $add: [1, "$kostDetails.totalRooms"] },
                ],
              },
              100,
            ],
          },
        },
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
    ]);

    // Tenant Analysis
    const tenantStats = await Order.aggregate([
      {
        $match: { ownerId },
      },
      {
        $group: {
          _id: "$tenant.email",
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: "$payment.amount" },
          averageStayDuration: { $avg: "$duration" },
          lastBooking: { $max: "$createdAt" },
          occupations: { $addToSet: "$tenant.occupation" },
        },
      },
      {
        $sort: { totalBookings: -1 },
      },
      { $limit: 10 },
    ]);

    // Room Duration Analysis
    const durationStats = await Order.aggregate([
      {
        $match: { ownerId },
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

    // Payment Analytics
    const paymentAnalytics = await Order.aggregate([
      {
        $match: { ownerId },
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
    const currentDate = new Date();
    const occupancyMetrics = await Promise.all([
      // Currently occupied rooms
      Order.countDocuments({
        ownerId,
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
        orderStatus: { $eq: "ordered" }, // Menambahkan validasi eksplisit
      }),
      // Upcoming bookings (next 30 days)
      Order.countDocuments({
        ownerId,
        startDate: {
          $gte: currentDate,
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        orderStatus: { $eq: "ordered" },
      }),
      // Contracts ending soon (next 30 days)
      Order.countDocuments({
        ownerId,
        endDate: {
          $gte: currentDate,
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        orderStatus: { $eq: "ordered" },
      }),
    ]);

    // Seasonal Analysis
    const seasonalAnalysis = await Order.aggregate([
      {
        $match: { ownerId },
      },
      {
        $group: {
          _id: {
            year: { $year: "$startDate" },
            month: { $month: "$startDate" },
          },
          bookings: { $sum: 1 },
          revenue: { $sum: "$payment.amount" },
          averageDuration: { $avg: "$duration" },
        },
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 },
      },
    ]);

    // Tenant Demographics
    const tenantDemographics = await Order.aggregate([
      {
        $match: { ownerId },
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

    // Return all statistics
    res.status(200).json({
      basicStats: {
        totalOrders,
        totalKosts,
        revenueStats: revenueStats[0] || {
          totalRevenue: 0,
          averageRevenue: 0,
          maxRevenue: 0,
          minRevenue: 0,
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
      seasonalAnalysis,
      tenantDemographics,
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
