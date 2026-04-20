const db = require('../models/database');

const getResources = async (req, res) => {
  try {
    const result = await db.getAllResources();
    res.json({
      resources: result.rows
    });
  } catch (err) {
    console.error('Error fetching resources:', err);
    res.status(500).json({ error: 'Server error fetching resources' });
  }
};

module.exports = { getResources };