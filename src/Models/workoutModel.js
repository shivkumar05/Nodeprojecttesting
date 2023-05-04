const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema(
  {
    userId: { type: String },
    date: { type: String },
    workout: { type: Number },
    total_time: { type: String },
    minutes_batted: { type: String },
    balls_bowled: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("workout", workoutSchema);
