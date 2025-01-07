// services/paymentService.js
import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export const createMidtransTransaction = async (order) => {
  const parameter = {
    transaction_details: {
      order_id: order._id.toString(),
      gross_amount: order.payment.amount,
    },
    customer_details: {
      first_name: order.tenant.name,
      email: order.tenant.email,
      phone: order.tenant.phone,
    },
    item_details: [
      {
        id: order.kostId.toString(),
        price: order.payment.amount,
        quantity: 1,
        name: `Sewa Kost - ${order.duration} bulan`,
      },
    ],
    credit_card: {
      secure: true,
    },
  };

  return await snap.createTransaction(parameter);
};

export const getTransactionStatus = async (orderId) => {
  return await snap.transaction.status(orderId);
};
