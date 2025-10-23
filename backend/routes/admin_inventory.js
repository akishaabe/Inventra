// C:\Inventra\backend\routes\admin_inventory.js
import express from "express";
import composeDb from "../db.compose.js";

const router = express.Router();

/**
 * GET /api/inventory
 * Return joined inventory+product rows mapped to the frontend shape.
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await composeDb.query(
      `SELECT
         i.product_id AS id,
         p.product_name AS name,
         p.category AS category,
         i.quantity_available AS quantity,
         p.unit AS unit,
         p.supplier_id AS supplier_id,
         i.inventory_id AS inventory_id,
         i.last_updated AS last_updated
       FROM inventory i
       JOIN products p ON i.product_id = p.product_id
       ORDER BY i.last_updated DESC`
    );

    // Only return columns frontend expects (no placeholders)
    const mapped = rows.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      quantity: Number(r.quantity),
      unit: r.unit,
      supplier_id: r.supplier_id,
      inventory_id: r.inventory_id,
      last_updated: r.last_updated
    }));

    res.json(mapped);
  } catch (err) {
    console.error("Error fetching inventory:", err);
    res.status(500).json({ error: "Failed to fetch inventory data." });
  }
});

/**
 * GET /api/inventory/:id
 * Return single inventory row by product_id (frontend uses product_id as id).
 */
router.get("/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    const [rows] = await composeDb.query(
      `SELECT
         i.product_id AS id,
         p.product_name AS name,
         p.category AS category,
         i.quantity_available AS quantity,
         p.unit AS unit,
         p.supplier_id AS supplier_id,
         i.inventory_id AS inventory_id,
         i.last_updated AS last_updated
       FROM inventory i
       JOIN products p ON i.product_id = p.product_id
       WHERE i.product_id = ?`,
      [productId]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Item not found." });
    const r = rows[0];
    res.json({
      id: r.id,
      name: r.name,
      category: r.category,
      quantity: Number(r.quantity),
      unit: r.unit,
      supplier_id: r.supplier_id,
      inventory_id: r.inventory_id,
      last_updated: r.last_updated
    });
  } catch (err) {
    console.error("Error fetching inventory item:", err);
    res.status(500).json({ error: "Failed to fetch item." });
  }
});

/**
 * POST /api/inventory
 * Create inventory row for a product_id. Body: { product_id, quantity }
 */
router.post("/", async (req, res) => {
  const { product_id, quantity } = req.body;

  if (!product_id || quantity === undefined) {
    return res.status(400).json({ error: "Missing required fields: product_id, quantity." });
  }

  try {
    // Prevent duplicate product inventory (product_id is UNIQUE in inventory)
    const [exists] = await composeDb.query(
      "SELECT 1 FROM inventory WHERE product_id = ? LIMIT 1",
      [product_id]
    );
    if (exists.length > 0) {
      return res.status(409).json({ error: "Inventory for this product already exists." });
    }

    const [result] = await composeDb.query(
      "INSERT INTO inventory (product_id, quantity_available) VALUES (?, ?)",
      [product_id, quantity]
    );

    res.status(201).json({ message: "Inventory item added.", insertId: result.insertId });
  } catch (err) {
    console.error("Error adding inventory item:", err);
    res.status(500).json({ error: "Failed to add item." });
  }
});

/**
 * PUT /api/inventory/:id
 * Update an inventory row by product_id. Body: { quantity }
 * (If you want to update product_id itself, do that via products table.)
 */
router.put("/:id", async (req, res) => {
  const productId = req.params.id;
  const { quantity } = req.body;

  if (quantity === undefined) {
    return res.status(400).json({ error: "Missing required field: quantity." });
  }

  try {
    const [result] = await composeDb.query(
      `UPDATE inventory
       SET quantity_available = ?
       WHERE product_id = ?`,
      [quantity, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Inventory item not found." });
    }
    res.json({ message: "Inventory item updated." });
  } catch (err) {
    console.error("Error updating inventory item:", err);
    res.status(500).json({ error: "Failed to update item." });
  }
});

/**
 * DELETE /api/inventory
 * Bulk delete — body: { ids: [product_id, ...] }
 * Matches your frontend's bulk-delete behavior.
 */
router.delete("/", async (req, res) => {
  const ids = req.body?.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Provide an array of product ids in `ids`." });
  }

  try {
    const placeholders = ids.map(() => "?").join(",");
    const [result] = await composeDb.query(
      `DELETE FROM inventory WHERE product_id IN (${placeholders})`,
      ids
    );

    res.json({ message: `Deleted ${result.affectedRows} inventory item(s).` });
  } catch (err) {
    console.error("Error deleting inventory items:", err);
    res.status(500).json({ error: "Failed to delete items." });
  }
});

/**
 * DELETE /api/inventory/:id
 * Delete single inventory row by product_id
 */
router.delete("/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    const [result] = await composeDb.query(
      "DELETE FROM inventory WHERE product_id = ?",
      [productId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Item not found." });
    res.json({ message: "Inventory item deleted." });
  } catch (err) {
    console.error("Error deleting inventory item:", err);
    res.status(500).json({ error: "Failed to delete item." });
  }
});

export default router;
