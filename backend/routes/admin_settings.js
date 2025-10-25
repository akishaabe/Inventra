// backend/routes/admin_settings.js
import express from "express";
import db from "../db.js";

const router = express.Router();

// 🟢 GET - All users
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT user_id, first_name, last_name, email, role, is_2fa_enabled, date_registered, last_password_change
      FROM users
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// 🟡 GET - Single user by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT user_id, first_name, last_name, email, role, is_2fa_enabled
       FROM users
       WHERE user_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// 🟠 POST - Create new user
router.post("/", async (req, res) => {
  const { first_name, last_name, email, password_hash, role } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, is_2fa_enabled, date_registered)
       VALUES (?, ?, ?, ?, ?, 0, NOW())`,
      [first_name, last_name, email, password_hash, role]
    );

    res.json({
      success: true,
      message: "User added successfully",
      data: { user_id: result.insertId },
    });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ success: false, message: "Failed to add user" });
  }
});

// 🔵 PUT - Update user (used for general users)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, role, is_2fa_enabled } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE users 
       SET first_name = ?, last_name = ?, email = ?, role = ?, is_2fa_enabled = ? 
       WHERE user_id = ?`,
      [first_name, last_name, email, role, is_2fa_enabled, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
});

// 🟢 PUT - Update admin profile info (keeps same URL pattern but doesn't restrict by role)
router.put("/admin/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, role, is_2fa_enabled } = req.body;

  try {
    // NOTE: do not restrict by role label here; update by user_id only
    const [result] = await db.query(
      `UPDATE users 
       SET first_name = ?, last_name = ?, email = ?, role = COALESCE(?, role), is_2fa_enabled = COALESCE(?, is_2fa_enabled)
       WHERE user_id = ?`,
      [first_name, last_name, email, role ?? null, (typeof is_2fa_enabled !== 'undefined' ? is_2fa_enabled : null), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.json({ success: true, message: "Admin details updated successfully" });
  } catch (err) {
    console.error("Error updating admin:", err);
    res.status(500).json({ success: false, message: "Failed to update admin" });
  }
});

// 🔴 DELETE - Remove user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM users WHERE user_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
});

export default router;
