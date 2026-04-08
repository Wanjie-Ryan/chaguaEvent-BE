const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const authSchema = new mongoose.Schema(
  {


    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],

      validate: [validator.isEmail, "Please provide a valid email"],
      lowercase: true,
    },

    role: {
      type: String,
      enum: ["admin", "provider"],
      default: "provider",
      required: [true, "Role of user is required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 5,
    },
  },
  { timestamps: true }
);

authSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

authSchema.methods.checkpwd = async function (candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model("Auth", authSchema);
