require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("hello");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB 연결 성공"))
  .catch((error) => console.log("MongoDB 연결 실패: ", error));

app.listen(PORT, () => {
  console.log("server is running");
});
