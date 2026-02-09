import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Banner from "../models/Banner";

const getBanners = asyncHandler(async (req: Request, res: Response) => {
  const banners = await Banner.find({});
  res.json(banners);
});

const getBannerById = asyncHandler(async (req: Request, res: Response) => {
  const banner = await Banner.findById(req.params.id);

  if (banner) {
    res.json(banner);
  } else {
    res.status(404);
    throw new Error("Banner not found");
  }
});

const createBanner = asyncHandler(async (req: Request, res: Response) => {
  const { name, title, startFrom, image, bannerType } = req.body;

  const banner = new Banner({
    name,
    title,
    startFrom,
    image,
    bannerType,
  });

  const createdBanner = await banner.save();
  res.status(201).json(createdBanner);
});

const updateBanner = asyncHandler(async (req: Request, res: Response) => {
  const { name, title, startFrom, image, bannerType } = req.body;

  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    res.status(404);
    throw new Error("Banner not found");
  }

  banner.name = name || banner.name;
  banner.title = title || banner.title;
  banner.startFrom = startFrom || banner.startFrom;
  banner.bannerType = bannerType || banner.bannerType;
  banner.image = image || banner.image
  const updatedBanner = await banner.save();
  res.json(updatedBanner)
});

const deleteBanner = asyncHandler(async (req: Request, res: Response) => {
  const banner = await Banner.findById(req.params.id);

  if (banner) {
    await banner.deleteOne();
    res.json({ message: "Banner removed" });
  } else {
    res.status(404);
    throw new Error("Banner not found");
  }
});

export { getBanners, createBanner, getBannerById, updateBanner, deleteBanner };
