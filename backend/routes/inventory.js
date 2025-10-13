import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM inventory');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/', async (req, res) => {
  const { id, name, category, quantity, unit, expiry, supplier } = req.body;
  try {
    await db.query(
      'INSERT INTO inventory (id, name, category, quantity, unit, expiry, supplier) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, category, quantity, unit, expiry, supplier]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, quantity, unit, expiry, supplier } = req.body;
  try {
    await db.query(
      'UPDATE inventory SET name=?, category=?, quantity=?, unit=?, expiry=?, supplier=? WHERE id=?',
      [name, category, quantity, unit, expiry, supplier, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/', async (req, res) => {
  const { ids } = req.body;
  try {
    await db.query(`DELETE FROM inventory WHERE id IN (${ids.map(() => '?').join(',')})`, ids);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete products' });
  }
});

export default router;
