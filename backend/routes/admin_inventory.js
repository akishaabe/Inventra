import express from "express";
import composeDb from "../db.js";


const router = express.Router();

// ✅ GET all inventory items
router.get("/", async (req, res) => {
  try {
    const [rows] = await composeDb.query(`
      SELECT 
        p.product_id AS id,
        p.product_name AS name,
        p.category,
        i.quantity_available AS quantity,
        p.unit,
        p.has_expiry AS expiry,
        p.supplier_id AS supplier
      FROM products p
      LEFT JOIN inventory i ON p.product_id = i.product_id
      ORDER BY p.product_id ASC
    `);
    res.json(rows);
  } catch (err) {
  console.error("🔥 Error adding product:");
  console.error(err.stack || err);
  res.status(500).json({
    error: err.message || "Failed to add product",
    details: err
  });
}

});

// ✅ GET next auto-increment product ID
router.get("/next-id", async (req, res) => {
  try {
    const [rows] = await composeDb.query(`SELECT AUTO_INCREMENT AS nextId FROM information_schema.TABLES WHERE TABLE_NAME='products' AND TABLE_SCHEMA='inventra'`);
    res.json({ nextId: rows[0]?.nextId || 1 });
  } catch (err) {
    console.error("Error fetching next product ID:", err);
    res.status(500).json({ error: "Failed to get next product ID" });
  }
});

// ✅ ADD new product (with supplier existence check)
router.post("/", async (req, res) => {
  const { name, category, unit, supplier_id, quantity, expiry } = req.body;

  if (!name) return res.status(400).json({ error: "Missing product name" });

  try {
    // 🧩 Check if supplier exists before insert
    const supplierId = await (async () => {
      if (!supplier_id || isNaN(Number(supplier_id))) return null;
      const [rows] = await composeDb.query(
        "SELECT supplier_id FROM suppliers WHERE supplier_id = ?",
        [Number(supplier_id)]
      );
      return rows.length > 0 ? Number(supplier_id) : null;
    })();

    // 1️⃣ Insert into products table
    const [productResult] = await composeDb.query(
      `INSERT INTO products (product_name, category, unit, supplier_id, reorder_level, cost_per_unit, has_expiry)
       VALUES (?, ?, ?, ?, 0, 0.00, ?)`,
      [name, category || null, unit || "pcs", supplierId, expiry ? 1 : 0]
    );

    const newProductId = productResult.insertId;

    // 2️⃣ Insert into inventory table
    await composeDb.query(
      `INSERT INTO inventory (product_id, quantity_available)
       VALUES (?, ?)`,
      [newProductId, quantity || 0]
    );

    res.status(201).json({ message: "Product added successfully", id: newProductId });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
});



// ✅ UPDATE quantity only
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    await composeDb.query(
      `UPDATE inventory SET quantity_available = ? WHERE product_id = ?`,
      [quantity ?? 0, id]
    );
    res.json({ message: "Quantity updated successfully" });
  } catch (err) {
    console.error("Error updating inventory:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// ✅ DELETE multiple products
router.delete("/", async (req, res) => {
  const { ids } = req.body;
  if (!ids?.length) return res.status(400).json({ error: "No IDs provided" });

  try {
    await composeDb.query(`DELETE FROM inventory WHERE product_id IN (?)`, [ids]);
    await composeDb.query(`DELETE FROM products WHERE product_id IN (?)`, [ids]);
    res.json({ message: "Products deleted successfully" });
  } catch (err) {
    console.error("Error deleting products:", err);
    res.status(500).json({ error: "Failed to delete products" });
  }
});

export default router;
