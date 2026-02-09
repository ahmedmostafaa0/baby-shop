import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinary";

export const uploadImage = asyncHandler(async(req: Request, res: Response) => {
    if(!req.file){
        res.status(400).json({ message: "No file uploaded" });
        return
    }

    const folder = req.body.folder || 'baby-shop/test'

    const b64 = Buffer.from(req.file.buffer).toString('base64')
    const dataURI = 'data:' + req.file?.mimetype + ';base64,' + b64
    const result = await cloudinary.uploader.upload(dataURI, {
        folder
    })
    res.json({
        url: result.secure_url,
        publid_id: result.public_id
    })
});
