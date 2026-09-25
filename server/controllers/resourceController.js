const pool = require('../db');

exports.listResources = async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM resources';
    const params = [];
    
    if (category) {
      params.push(category);
      query += ' WHERE category = $1';
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error listing resources:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createResource = async (req, res) => {
  try {
    const { title, description, category, image_url, external_url, tags } = req.body;
    
    const query = `
      INSERT INTO resources (title, description, category, image_url, external_url, tags)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [title, description, category, image_url, external_url, tags]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, image_url, external_url, tags } = req.body;
    
    const query = `
      UPDATE resources 
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        image_url = COALESCE($4, image_url),
        external_url = COALESCE($5, external_url),
        tags = COALESCE($6, tags)
      WHERE id = $7
      RETURNING *
    `;
    
    const result = await pool.query(query, [title, description, category, image_url, external_url, tags, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM resources WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
