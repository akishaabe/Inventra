import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  db.query("SELECT * FROM audit_logs ORDER BY date DESC", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

export default router;
