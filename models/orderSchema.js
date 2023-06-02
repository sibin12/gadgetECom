const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema ({
    deliveryDetails:{
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    streetAddress: { type: String, required: true },
    appartment: { type: String, required: true },
    town: { type: String, required: true },
    pin: { type: String, required: true },
    number: { type: String, required: true },
    email: { type: String, required: true },
 
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paymentMethod: { type: String, required: true },
  products: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    orderstatus : { type: String,required :true},
    deliverystatus : {type : String,required :true}
  }],
  totalAmount: { type: Number, required: true },
  paymentstatus: { type: String,  required: true },
  deliverystatus: { type: String,  required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
   