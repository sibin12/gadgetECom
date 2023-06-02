const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true
    },
    storage: {
        type: String,
        required: true
    },
    mrp: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    offer: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: [
        {
            type: String
        }
    ],
    stockQuantity: {
        type: Number,
        required: true
    },
    deleted: {
        type: String,
        deafult: false
    }

}, {
    timestamps: true
})

module.exports = mongoose.model('Product', productSchema)