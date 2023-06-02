const { ObjectId } = require('bson');
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const cartSchema = new Schema({
   userId:{
    type:String,
    required:true
   },
   product:[
    {
        item:{
            type:ObjectId,
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        orderstatus:{
            type:String,
            required :true
        },
        deliverystatus:{
            type:String,
            required: true
        }
    }
   ]
},{
    timestamps:true
})

module.exports = mongoose.model("Cart",cartSchema)