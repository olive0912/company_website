const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    fileUrl: {
      type: [String],
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    viewLogs: [
      {
        ip: String, //같은 ip로 접속하면 조회수 안오름
        userAgent: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
