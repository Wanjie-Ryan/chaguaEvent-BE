const AuthModel = require("../models/user");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const Register = async (req, res) => {
  try {
    const { username, email, role, password } = req.body;

    if (!username || !email || !role || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Please fill all the fields" });
    }

    const newUser = await AuthModel.create(req.body);

    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "User created successfully" });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Validation error: " + err.message });
    }

    // Handle duplicate key error (e.g., duplicate email)
    if (err.code && err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(StatusCodes.CONFLICT).json({
        msg: `${field} already exists, please choose a different one`,
      });
    }

    // console.error(err);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, try again later" });
  }
};

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Provide all the fields" });
    }

    const UserEmail = await AuthModel.findOne({ email });

    if (!UserEmail) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "The Email Provided cannot be found" });
    }

    const correctPassword = await UserEmail.checkpwd(password);

    if (!correctPassword) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Incorrect password" });
    }
    // console.log(UserEmail);

    const UserLogin = UserEmail.toObject();
    delete UserLogin.password;
    delete UserLogin.email;

    try {
      const token = jwt.sign({ userId: UserLogin._id }, process.env.token, {
        expiresIn: "1d",
      });

      return res
        .status(StatusCodes.OK)
        .json({ msg: `Login successful`, UserLogin, userToken: token });
    } catch (tokenError) {
      //   console.error("Token generation error:", tokenError);
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ msg: "Error generating token, please try again later" });
    }
  } catch (err) {
    // console.log(err);

    if (err.name === "ValidationError") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Validation error: " + err.message });
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, please try again later" });
  }
};

const UpdateProfile = async (req, res) => {
  try {
    const { photo, username, id } = req.body;

    if (!id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "User ID is required" });
    }

    const updateUser = await AuthModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updateUser) {
      return res.status(StatusCodes.NOT_FOUND).json({ msg: `User not found` });
    }

    // Remove sensitive fields before returning response
    const updateUserObj = updateUser.toObject();
    delete updateUserObj.email;
    delete updateUserObj.password; // Always remove the password

    return res.status(StatusCodes.OK).json({
      msg: "Your profile has been updated successfully",
      updateUserObj,
    });
  } catch (err) {
    //   console.error(err);

    // Handle validation errors from mongoose
    if (err.name === "ValidationError") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: `Validation error: ${err.message}` });
    }

    // Handle other unexpected errors
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, please try again later" });
  }
};

const GetLoggedInUser = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "No token provided" });
    }

    const actualToken = token.split(" ")[1];

    const decoded = jwt.verify(actualToken, process.env.token);

    const singleUser = await AuthModel.findById({ _id: decoded.userId });

    if (!singleUser) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "The User has not been found" });
    }

    const singleuserObj = singleUser.toObject();
    // delete singleuserObj._id;
    delete singleuserObj.email;
    delete singleuserObj.photo;
    delete singleuserObj.password;

    return res
      .status(StatusCodes.OK)
      .json({ msg: "Single user fetched successfully", singleuserObj });
  } catch (err) {
    // console.log(err);
    if (err.name === "TokenExpiredError") {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Token has expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Invalid token" });
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Something went wrong, please try again later" });
  }
};

const verifyToken = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      const token = authHeader.replace("Bearer ", "");
      const decoded = jwt.verify(token, process.env.token);
      req.token = decoded;
      res.json({ type: "success" });
      // next()
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Token is bad" });
    }
  } catch (err) {
    // res.json({ type: 'error', message: 'Please authenticate', details: err })
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Invalid token" });
  }
};

module.exports = {
  Register,
  Login,
  UpdateProfile,
  GetLoggedInUser,
  verifyToken,
};
