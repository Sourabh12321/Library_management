const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  borrowDetails: [
    {
      book: { type: mongoose.Schema.Types.ObjectId, ref: 'book' },
      returnDate: Date,
    },
  ],
});

const userModel = new mongoose.model("user", userSchema);

module.exports = { userModel };
