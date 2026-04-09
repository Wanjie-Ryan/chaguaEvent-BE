const AuthModel = require("../models/user");
const ProfileModel = require("../models/profile");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

// 1. CLIENT REGISTER (Implicitly sets 'client' role)
const ClientRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log("Client Register Attempt:", email, username);

    if (!username || !email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Please provide username, email, and password" });
    }

    // Hash is handled by UserSchema.pre('save')
    const user = await AuthModel.create({
      email,
      password,
      role: "client",
    });

    // Create Profile
    await ProfileModel.create({
      userId: user._id,
      username,
    });

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "Client registered successfully", data: { email: user.email } });
  } catch (err) {
    console.log("Register error:", err);
    if (err.code === 11000) {
      return res.status(StatusCodes.CONFLICT).json({ msg: "Email or Username already exists" });
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Registration failed" });
  }
};

// 2. ADMIN & PROVIDER LOGIN (Shared for multi-portal access)
const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", email);

    if (!email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Please provide email and password" });
    }

    const user = await AuthModel.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Invalid email or password" });
    }

    const isMatch = await user.checkpwd(password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.token,
      { expiresIn: "1d" }
    );

    const profile = await ProfileModel.findOne({ userId: user._id });

    return res.status(StatusCodes.OK).json({
      msg: "Login successful",
      user: {
        userId: user._id,
        role: user.role,
        username: profile ? profile.username : null,
      },
      token,
    });
  } catch (err) {
    console.log("Login error:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Something went wrong" });
  }
};

// 3. ADMIN ONLY LOGIN (Strict check for Admin portal)
const AdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Admin Login attempt:", email);

    const user = await AuthModel.findOne({ email });
    if (!user || user.role !== "admin") {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Unauthorized: Admin access only" });
    }

    const isMatch = await user.checkpwd(password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.token,
      { expiresIn: "1d" }
    );

    return res.status(StatusCodes.OK).json({
      msg: "Admin authorized",
      user: { userId: user._id, role: user.role },
      token,
    });
  } catch (err) {
    console.log("Admin login error:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Server error" });
  }
};

// 4. ADMIN CREATE PROVIDER (The surgical addition)
const AdminCreateProvider = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log("Admin creating provider:", email);

    if (!username || !email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Provide all fields" });
    }

    const user = await AuthModel.create({
      email,
      password,
      role: "provider",
    });

    await ProfileModel.create({
      userId: user._id,
      username,
    });

    return res.status(StatusCodes.CREATED).json({ msg: "Service Provider created successfully" });
  } catch (err) {
    console.log("Provider creation error:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Creation failed" });
  }
};

// 5. UPDATE PROFILE (Clients/Providers only)
const UpdateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Reject Admin profile updates as Admins don't have profiles in our design
    if (userRole === "admin") {
      return res.status(StatusCodes.FORBIDDEN).json({ msg: "Admins do not have updateable profiles" });
    }

    const profile = await ProfileModel.findOneAndUpdate(
      { userId },
      req.body,
      { new: true, runValidators: true }
    );

    return res.status(StatusCodes.OK).json({ msg: "Profile updated", profile });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Update failed" });
  }
};

// NEW: UPDATE PASSWORD
const UpdatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!oldPassword || !newPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Please provide both passwords" });
    }

    const user = await AuthModel.findById(userId);
    const isPasswordCorrect = await user.checkpwd(oldPassword);

    if (!isPasswordCorrect) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Invalid old password" });
    }

    user.password = newPassword;
    await user.save(); // pre-save hook will hash it

    res.status(StatusCodes.OK).json({ msg: "Password updated successfully!" });
  } catch (err) {
    console.log("Update password error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Update failed" });
  }
};

// NEW: UPDATE USERNAME (Specific Profile field)
const UpdateUsername = async (req, res) => {
  try {
    const { newUsername } = req.body;
    const userId = req.user.userId;

    if (!newUsername) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Please provide a new username" });
    }

    const profile = await ProfileModel.findOneAndUpdate(
      { userId },
      { username: newUsername },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "Profile not found" });
    }

    res.status(StatusCodes.OK).json({ msg: "Username updated successfully", username: profile.username });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(StatusCodes.CONFLICT).json({ msg: "Username already exists" });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Update failed" });
  }
};

// 7. GET CURRENT USER (Surgical Select)
const GetLoggedInUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    // .select("-password") ensures the hashed password never travels to the client
    const user = await AuthModel.findById(userId).select("-password");
    const profile = await ProfileModel.findOne({ userId });

    return res.status(StatusCodes.OK).json({ user, profile });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Fetch failed" });
  }
};

module.exports = {
  ClientRegister,
  Login,
  AdminLogin,
  AdminCreateProvider,
  UpdateProfile,
  UpdatePassword,
  UpdateUsername,
  GetLoggedInUser,
};
