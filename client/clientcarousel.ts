import express from "express";
import { carouselImagesTable } from "../db/schema";
import { db } from "../db";
import { desc } from "drizzle-orm";

const clientCarousel = express.Router();

clientCarousel.get("/client/carousel-images", async (req: any, res: any) => {
  try {
    const images = await db
      .select()
      .from(carouselImagesTable)
      .orderBy(desc(carouselImagesTable.createdAt));
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

export default clientCarousel;
