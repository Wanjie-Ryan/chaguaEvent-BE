const AuthModel = require("../models/user");
const ProfileModel = require("../models/profile");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

// 1. CLIENT REGISTER
const ClientRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Provide all fields" });
    }

    // SURGICAL: Clients are auto-verified for frictionless signup
    const user = await AuthModel.create({
      email,
      password,
      role: "client",
      isVerified: true
    });

    await ProfileModel.create({ userId: user._id, username });

    return res.status(StatusCodes.CREATED).json({ msg: "Client registered and verified successfully" });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((item) => item.message).join(", ");
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: message });
    }
    if (err.code === 11000) {
      return res.status(StatusCodes.CONFLICT).json({ msg: "Email or Username already exists" });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Registration failed" });
  }
};

// 2. SHARED LOGIN (Enforces Provider Verification)
const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Provide email and password" });
    }

    const user = await AuthModel.findOne({ email });
    if (!user || !(await user.checkpwd(password))) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Invalid credentials" });
    }

    // SURGICAL: Check verification status
    if (!user.isVerified) {
      if (user.role === "provider") {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Your account is pending admin approval." });
      }
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Please verify your account." });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.token, { expiresIn: "1d" });
    const profile = await ProfileModel.findOne({ userId: user._id });

    return res.status(StatusCodes.OK).json({
      user: { userId: user._id, role: user.role, username: profile?.username },
      token,
    });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Login error" });
  }
};

// 3. ADMIN LOGIN
const AdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await AuthModel.findOne({ email });

    if (!user || user.role !== "admin" || !(await user.checkpwd(password))) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Admin access only / Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.token, { expiresIn: "1d" });
    return res.status(StatusCodes.OK).json({ user: { userId: user._id, role: user.role }, token });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Admin login error" });
  }
};

// 4. ADMIN CREATE PROVIDER
const AdminCreateProvider = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Provide all fields" });
    }

    // Providers stay unverified (false) until Admin approves
    console.log("AdminCreateProvider: Creating user...");
    const user = await AuthModel.create({ email, password, role: "provider", isVerified: false });
    console.log("AdminCreateProvider: Creating profile...");
    await ProfileModel.create({ userId: user._id, username });

    console.log("AdminCreateProvider: Success");
    return res.status(StatusCodes.CREATED).json({ msg: "Provider created. Pending manual approval." });
  } catch (err) {
    console.log("AdminCreateProvider: Error", err);
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((item) => item.message).join(", ");
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: message });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Provider creation failed" });
  }
};

// 5. ADMIN TOGGLE PROVIDER (Activate / Deactivate)
const AdminToggleProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await AuthModel.findById(id);

    if (!user || user.role !== "provider") {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: "Service Provider not found" });
    }

    user.isVerified = !user.isVerified;
    await user.save();

    res.status(StatusCodes.OK).json({ msg: user.isVerified ? "Provider activated." : "Provider deactivated.", isVerified: user.isVerified });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Verification failed" });
  }
};

// 5B. GET ALL PROVIDERS
const GetAllProviders = async (req, res) => {
  try {
    const providers = await AuthModel.find({ role: "provider" }).select("-password");
    const profiles = await ProfileModel.find({ userId: { $in: providers.map(p => p._id) } });

    const data = providers.map(p => {
      const profile = profiles.find(pr => pr.userId.toString() === p._id.toString());
      return { ...p.toObject(), profile };
    });

    return res.status(StatusCodes.OK).json({ count: data.length, data });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Fetch failed" });
  }
};

// 5C. GET ALL CLIENTS
const GetAllClients = async (req, res) => {
  try {
    const clients = await AuthModel.find({ role: "client" }).select("-password");
    const profiles = await ProfileModel.find({ userId: { $in: clients.map(c => c._id) } });

    const data = clients.map(c => {
      const profile = profiles.find(pr => pr.userId.toString() === c._id.toString());
      return { ...c.toObject(), profile };
    });

    return res.status(StatusCodes.OK).json({ count: data.length, data });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Fetch failed" });
  }
};

// 6. UPDATE PROFILE
const UpdateProfile = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(StatusCodes.FORBIDDEN).json({ msg: "Admins do not have profiles" });
    }

    const profile = await ProfileModel.findOneAndUpdate(
      { userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    return res.status(StatusCodes.OK).json({ msg: "Profile updated", profile });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((item) => item.message).join(", ");
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: message });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Update failed" });
  }
};

// 7. UPDATE PASSWORD
const UpdatePassword = async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(StatusCodes.FORBIDDEN).json({ msg: "Restricted to Service Providers only" });
    }
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Provide both passwords" });
    }

    const user = await AuthModel.findById(req.user.userId);
    if (!(await user.checkpwd(oldPassword))) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Invalid old password" });
    }

    user.password = newPassword;
    await user.save();

    res.status(StatusCodes.OK).json({ msg: "Password updated!" });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((item) => item.message).join(", ");
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: message });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Update failed" });
  }
};

// 8. UPDATE USERNAME
const UpdateUsername = async (req, res) => {
  try {
    if (req.user.role !== "provider") {
      return res.status(StatusCodes.FORBIDDEN).json({ msg: "Restricted to Service Providers only" });
    }
    const { newUsername } = req.body;
    if (!newUsername) return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Provide a new username" });

    const profile = await ProfileModel.findOneAndUpdate(
      { userId: req.user.userId },
      { username: newUsername },
      { new: true, runValidators: true }
    );

    res.status(StatusCodes.OK).json({ msg: "Username updated!", username: profile.username });
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((item) => item.message).join(", ");
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: message });
    }
    if (err.code === 11000) return res.status(StatusCodes.CONFLICT).json({ msg: "Username already exists" });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Update failed" });
  }
};

// 9. GET LOGGED IN USER
const GetLoggedInUser = async (req, res) => {
  try {
    console.log("GetLoggedInUser: Fetching user...", req.user.userId);
    const user = await AuthModel.findById(req.user.userId).select("-password");
    console.log("GetLoggedInUser: Fetching profile...");
    const profile = await ProfileModel.findOne({ userId: req.user.userId });
    console.log("GetLoggedInUser: Success");
    return res.status(StatusCodes.OK).json({ user, profile });
  } catch (err) {
    console.log("GetLoggedInUser: Error", err.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Fetch failed" });
  }
};

module.exports = {
  ClientRegister,
  Login,
  AdminLogin,
  AdminCreateProvider,
  AdminToggleProvider,
  GetAllProviders,
  GetAllClients,
  UpdateProfile,
  UpdatePassword,
  UpdateUsername,
  GetLoggedInUser,
};
