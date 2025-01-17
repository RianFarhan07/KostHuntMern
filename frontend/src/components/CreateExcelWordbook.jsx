// Utility function to format date
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString();
};

const createCompleteExcelData = (stats) => {
  return {
    // Sheet 1: Basic Statistics
    "Basic Statistics": [
      ["Basic Statistics"],
      ["Total Kosts", stats.basicStats.totalKosts],
      ["Total Orders", stats.basicStats.totalOrders],
      ["Pending Payments", stats.basicStats.pendingPayments],
      ["Paid Payments", stats.basicStats.paidPayments],
      [""],
      ["Revenue Statistics"],
      ["Total Revenue", stats.basicStats.revenueStats.totalRevenue],
      ["Average Revenue", stats.basicStats.revenueStats.averageRevenue],
      ["Maximum Revenue", stats.basicStats.revenueStats.maxRevenue],
      ["Minimum Revenue", stats.basicStats.revenueStats.minRevenue],
      ["Cash Revenue", stats.basicStats.revenueStats.cashRevenue],
      ["Transfer Revenue", stats.basicStats.revenueStats.transferRevenue],
      ["Pending Revenue", stats.basicStats.revenueStats.pendingRevenue],
      ["Paid Revenue", stats.basicStats.revenueStats.paidRevenue],
    ],

    // Sheet 2: Monthly Statistics
    "Monthly Statistics": [
      [
        "Year",
        "Month",
        "Revenue",
        "Total Orders",
        "Pending Orders",
        "Paid Orders",
        "Cash Payments",
        "Transfer Payments",
        "Average Stay Duration",
        "Total Stay Duration",
      ],
      ...stats.monthlyStats.map((month) => [
        month._id.year,
        month._id.month,
        month.revenue,
        month.totalOrders,
        month.pendingOrders,
        month.paidOrders,
        month.cashPayments,
        month.transferPayments,
        month.averageStayDuration,
        month.totalStayDuration,
      ]),
    ],

    // Sheet 3: Popular Kosts
    "Popular Kosts": [
      [
        "Kost Name",
        "Location",
        "City",
        "Type",
        "Price",
        "Booking Count",
        "Total Revenue",
        "Average Stay Duration",
        "Unique Tenants Count",
      ],
      ...stats.popularKosts.map((kost) => [
        kost.kostName,
        kost.location,
        kost.city,
        kost.type,
        kost.price,
        kost.bookingCount,
        kost.totalRevenue,
        kost.averageStayDuration,
        kost.uniqueTenantsCount,
      ]),
    ],

    // Sheet 4: Tenant Statistics
    "Tenant Statistics": [
      [
        "Name",
        "Email",
        "Phone",
        "Occupation",
        "Total Bookings",
        "Total Spent",
        "Average Stay Duration",
        "Last Booking",
      ],
      ...stats.tenantStats.map((tenant) => [
        tenant.tenantName,
        tenant._id,
        tenant.phone,
        tenant.occupation,
        tenant.totalBookings,
        tenant.totalSpent,
        tenant.averageStayDuration,
        formatDate(tenant.lastBooking),
      ]),
    ],

    // Sheet 5: Duration Statistics
    "Duration Statistics": [
      ["Duration (Months)", "Count", "Average Revenue", "Total Revenue"],
      ...stats.durationStats.map((duration) => [
        duration._id,
        duration.count,
        duration.averageRevenue,
        duration.totalRevenue,
      ]),
    ],

    // Sheet 6: Payment Analytics
    "Payment Analytics": [
      ["Status", "Method", "Count", "Total Amount", "Average Amount"],
      ...stats.paymentAnalytics.map((payment) => [
        payment._id.status,
        payment._id.method,
        payment.count,
        payment.totalAmount,
        payment.averageAmount,
      ]),
    ],

    // Sheet 7: Tenant Demographics
    "Tenant Demographics": [
      [
        "Occupation",
        "Count",
        "Average Stay Duration",
        "Average Payment",
        "Total Revenue",
      ],
      ...stats.tenantDemographics.map((demo) => [
        demo._id,
        demo.count,
        demo.averageStayDuration,
        demo.averagePayment,
        demo.totalRevenue,
      ]),
    ],

    // Sheet 8: Facilities Statistics
    "Facilities Statistics": [
      ["Facility", "Count", "Percentage", "Available In"],
      ...stats.facilitiesStats.map((facility) => [
        facility.facility,
        facility.count,
        facility.percentage,
        facility.kosts.join(", "),
      ]),
    ],

    // Sheet 9: Reviews
    "Reviews Statistics": [
      [
        "Kost Name",
        "Total Reviews",
        "Average Rating",
        "Rating",
        "Comment",
        "Date",
      ],
      ...stats.reviewStats.flatMap((kost) =>
        kost.ratings.map((rating) => [
          kost.kostName,
          kost.totalReviews,
          kost.averageRating,
          rating.rating,
          rating.comment,
          formatDate(rating.date),
        ]),
      ),
    ],

    // Sheet 10: Growth & Retention
    "Growth Metrics": [
      ["Metric", "Value"],
      ["Order Growth", stats.growthMetrics.orderGrowth],
      ["Revenue Growth", stats.growthMetrics.revenueGrowth],
      ["Tenant Retention Rate", stats.tenantRetention],
      ["Currently Occupied", stats.occupancyMetrics.currentlyOccupied],
      ["Upcoming Bookings", stats.occupancyMetrics.upcomingBookings],
      ["Ending Soon", stats.occupancyMetrics.endingSoon],
    ],
  };
};

// Function to download Excel
import * as XLSX from "xlsx";
const downloadCompleteExcel = (stats) => {
  const workbook = XLSX.utils.book_new();
  const sheets = createCompleteExcelData(stats);

  // Create and append each sheet
  Object.entries(sheets).forEach(([sheetName, data]) => {
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  // Generate filename with current date
  const date = new Date().toISOString().split("T")[0];
  const filename = `complete-kost-statistics-${date}.xlsx`;

  // Write and download the file
  XLSX.writeFile(workbook, filename);
};

export { createCompleteExcelData, downloadCompleteExcel };
