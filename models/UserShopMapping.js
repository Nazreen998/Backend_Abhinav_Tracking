const mongoose = require("mongoose");

const UserShopMappingSchema = new mongoose.Schema({
    userId: String,
    shopId: String
});

module.exports = mongoose.model("UserShopMapping", UserShopMappingSchema);
