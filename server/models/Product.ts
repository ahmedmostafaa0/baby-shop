import mongoose from "mongoose";
import { IProduct } from "../types/product";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 99
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    ratings: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now()
        }
    }],
    averageRating: {
        type: Number,
        default: 0
    },
    image: {
        type: [String],
        set: (val: string | string[]) => Array.isArray(val) ? val : [val], 
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },

}, {timestamps: true})

productSchema.pre('save', function(this: IProduct) {
    if(this.ratings && this.ratings.length > 0){
        const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0)
        this.averageRating  = sum / this.ratings.length
    }
})

const Product = mongoose.model('Product', productSchema)
export default Product;
