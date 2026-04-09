const AuthModel = require("../models/user");

const seedAdmin = async () => {
  try {
    const adminExists = await AuthModel.findOne({ role: "admin" });

    if (!adminExists) {
      console.log("Seeding initial root admin...");
      await AuthModel.create({
        email: process.env.ROOT_ADMIN_EMAIL,
        password: process.env.ROOT_ADMIN_PASSWORD,
        role: "admin",
        isVerified: true,
      });
      console.log("Root Admin created successfully.");
    }
  } catch (err) {
    console.error("Error seeding admin:", err);
  }
};

module.exports = seedAdmin;
