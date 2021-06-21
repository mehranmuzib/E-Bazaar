const mongoose = require("mongoose");

const orderItemSchema = mongoose.Schema({

    quantity: {
        type: Number,
    },
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }

});

exports.OrderItem = mongoose.model("OrderItem", orderItemSchema);
