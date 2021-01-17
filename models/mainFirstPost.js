const mongoose = require("mongoose");

const mainSchema = mongoose.Schema({
  link: { type: String },
  category: { type: String },
  publishedAt: { type: String },
  title: { type: String },
  article: { type: String },
  img: { type: String },
});

const Main = mongoose.model("firstpost", mainSchema);
const Mcontrol = mongoose.model("moneycontrol", mainSchema);
const Iexpress = mongoose.model("indianexpress", mainSchema);
const Itimes = mongoose.model("indiatimes", mainSchema);
module.exports = { Main, Mcontrol, Iexpress, Itimes };
