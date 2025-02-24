require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 3000;

const userRoutes = require("./routes/user");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());

app.use("/api/auth", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello world");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB 연결 성공."))
  .catch((error) => console.log("MongoDB 연결 실패: ", error));

app.listen(PORT, () => {
  console.log("Server is running");
});
