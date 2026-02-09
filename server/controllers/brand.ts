import type { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import Brand from "../models/Brand";

const getBrands = asyncHandler(async (req: Request, res: Response) => {
  const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
    const brands = await Brand.find({}).sort({createdAt: sortOrder})
    res.json({brands})
})

const getBrandById = asyncHandler(async (req: Request, res: Response) => {
    const {id} = req.params
    const brand = await Brand.findById(id)
    if(!brand){
        res.status(404)
        res.json({message: 'Brand not found!'})
    }
    res.json(brand)
})

const createBrand = asyncHandler(async (req: Request, res: Response) => {
    const {name, image} = req.body
    const brandExists = await Brand.findOne({name})
    if(brandExists){
        res.status(404)
        res.json({message: 'Brand already exists!'})
    }
    const brand = await Brand.create({
        name,
        image: image || ''
    })
    res.status(201).json(brand)
})

const updateBrand = asyncHandler(async (req: Request, res: Response) => {
    const {name, image} = req.body
    const brand = await Brand.findById(req.params.id)
    if(!brand){
        res.status(404)
        throw new Error('Brand not found!')
    }
    if(name) brand.name = name
    brand.image = image || brand.image
    const updatedBrand = await brand.save()
    res.json(updatedBrand)
})

const deleteBrand = asyncHandler(async (req: Request, res: Response) => {
    const brand= await Brand.findByIdAndDelete(req.params.id)
    if(!brand){
        res.status(404)
        throw new Error('Brand not found')
    }
    res.json({message: 'Brand removed'})
})

export {
    getBrands,
    createBrand,
    getBrandById,
    updateBrand,
    deleteBrand
}