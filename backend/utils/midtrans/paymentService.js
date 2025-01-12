// utils/midtrans/paymentService.js
import midtransClient from "midtrans-client";

// Inisialisasi konfigurasi Midtrans
const midtransConfig = new midtransClient.Snap({
  isProduction: false,
  serverKey: "SB-Mid-server-TmytAEJBQHROTmfilSQ3JPXR",
  clientKey: "SB-Mid-client-yXBU6RXfgiTqgpp6",
});

export const createMidtransTransaction = async (order) => {
  const parameter = {
    transaction_details: {
      order_id: order._id,
      gross_amount: order.payment.amount,
    },
    customer_details: {
      first_name: order.tenant.name,
      email: order.tenant.email,
      phone: order.tenant.phone,
    },
    item_details: [
      {
        id: order.kostId,
        price: order.payment.amount,
        quantity: 1,
        name: `Sewa Kost - ${order.duration} bulan`,
      },
    ],
    // callbacks: {
    //   finish: `${process.env.FRONTEND_URL}/payment/finish`,
    //   error: `${process.env.FRONTEND_URL}/payment/error`,
    //   pending: `${process.env.FRONTEND_URL}/payment/pending`,
    // },
  };

  try {
    const transaction = await midtransConfig.createTransaction(parameter);
    return transaction;
  } catch (error) {
    console.log(error.message);
    console.error("Midtrans Error:", error.message);
    throw new Error(`Midtrans Error: ${error.message}`);
  }
};
