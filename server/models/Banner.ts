import mongoose, { Model } from "mongoose";
import { IBanner } from '../types/banner';

const bannerSchema = new mongoose.Schema<IBanner>({
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    startFrom: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    bannerType: {
        type: String,
        required: true
    }
}, {timestamps: true})

const Banner: Model<IBanner> = mongoose.model<IBanner>('Banner', bannerSchema)

export default Banner;
