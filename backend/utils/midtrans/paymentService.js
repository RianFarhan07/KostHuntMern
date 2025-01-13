// utils/midtrans/paymentService.js
import midtransClient from "midtrans-client";
import dotenv from "dotenv";

dotenv.config();

// Inisialisasi konfigurasi Midtrans
const midtransConfig = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

const coreMidtrans = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export const createMidtransTransaction = async (order) => {
  console.log("=== CREATING MIDTRANS TRANSACTION ===");
  console.log("Order ID being used:", order._id);

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
    callbacks: {
      finish: `${process.env.FRONTEND_URL}/my-orders`,
      error: `${process.env.FRONTEND_URL}/my-orders`,
      pending: `${process.env.FRONTEND_URL}/my-orders`,
    },
  };

  try {
    console.log("=== MIDTRANS PARAMETER ===");
    console.log("Parameter sent to Midtrans:", parameter);

    const transaction = await midtransConfig.createTransaction(parameter);
    // Log response dari Midtrans
    console.log("=== MIDTRANS RESPONSE ===");
    console.log("Midtrans Transaction Response:", transaction);
    return transaction;
  } catch (error) {
    console.log(error.message);
    console.error("Midtrans Error:", error.message);
    throw new Error(`Midtrans Error: ${error.message}`);
  }
};

export { midtransConfig, coreMidtrans };
