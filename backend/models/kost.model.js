import mongoose from "mongoose";

const kostSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: false,
    },
    facilities: {
      type: Array,
      required: true,
    },
    type: {
      type: String,
      enum: ["Putra", "Putri", "Campur"],
      required: true,
    },
    availability: {
      type: Boolean,
      required: false,
    },
    contact: {
      phone: {
        type: String,
        required: true,
      },
      whatsapp: {
        type: String,
        required: true,
      },
    },
    imageUrls: {
      type: Array,
      required: true,
    },
    userRef: {
      type: String,
      required: true,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: Number,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Kost = mongoose.model("Kost", kostSchema);

export default Kost;
