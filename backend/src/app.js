const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const { attachUser } = require("./middleware/authMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const eventRequestRoutes = require("./routes/eventRequestRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(attachUser);

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/event-requests", eventRequestRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/resume", resumeRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
