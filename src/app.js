require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(path.join(__dirname, "public")));

const healthRouter = require("./routes/health");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const financeRouter = require("./routes/finance");
const transactionRouter = require("./routes/transaction");
const otherRouter = require("./routes/other");

app.use("/api", healthRouter);
app.use("/api", authRouter);
app.use("/api", profileRouter);
app.use("/api", financeRouter);
app.use("/api", transactionRouter);
app.use("/api", otherRouter);

app.use((req, res) => {
  return res.status(404).json({
    status: 404,
    message: "Not Found",
    data: null,
  });
});

const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
