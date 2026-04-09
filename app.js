const express = require("express");
const app = express();
const port = process.env.PORT || 3005;
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const cookie = require("cookie-parser");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const { StatusCodes } = require("http-status-codes");
const connectionDB = require("./connection/connection");
const seedAdmin = require("./utils/bootstrap");

const AuthRoute = require("./routes/authRoutes");
const ReceiverRoute = require("./routes/receiver");
const TransactionRoute = require("./routes/transaction");
const SummariesRoute = require("./routes/summary");
const FiltersRoute = require("./routes/filters");

app.use(helmet());
app.use(xss());
app.use(cookie());
app.use(express.json());
app.set("trust proxy", 1);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    exposedHeaders: ["ip"],
  })
);

// ROUTES
app.use("/api/auth", AuthRoute);
app.use("/api/receiver", ReceiverRoute);
app.use("/api/transaction", TransactionRoute);
app.use("/api/summary", SummariesRoute);
app.use("/api/filter", FiltersRoute);

app.get("/wake-up", (req, res) => {
  res.json({
    responseType: "success",
    message: "Server is awake",
  });
});

const DBConnection = async () => {
  try {
    await connectionDB(process.env.mongo_url);
    await seedAdmin(); // Seed the root admin if missing

    app.listen(port, () => {
      console.log(`server is running on port, ${port}`);
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

DBConnection();