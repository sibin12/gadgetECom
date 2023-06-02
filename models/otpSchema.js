const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userOtpSchema = new Schema({
    user: String,
    otp: Number
},{
    timestamps:true
})

module.exports = mongoose.model("OTP",userOtpSchema)
