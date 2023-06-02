const mongoose = require('mongoose')
const Schema = mongoose.Schema

const offerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    category : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    percentage : {
        type : String,
        required : true
    },
    image: {
        type:String,
        required : true
    }

}, {
    timestamps: true
})

module.exports = mongoose.model('Offer', offerSchema)
