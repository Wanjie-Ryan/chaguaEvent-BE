const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      maxlength: 50,
      unique: true,

    },
    photo: {
      type: String,
      default: "default-avatar.png",
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    location: {
      type: String,
    },
    // Future expansion: provider specific fields can go here or in a separate collection
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
