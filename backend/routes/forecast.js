import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  const forecast = {
    message: "Sales Forecasting Data (Dummy)",
    generatedAt: new Date(),
    data: [
      { product: "Espresso Beans", currentStock: 40, predictedSales: 55 },
      { product: "Croissant", currentStock: 120, predictedSales: 160 },
      { product: "Iced Latte", currentStock: 60, predictedSales: 75 },
    ],
  };
  res.json(forecast);
});

export default router;
