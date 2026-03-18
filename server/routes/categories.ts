import { Router } from 'express';
import { supabase } from '../index';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Get all categories for current user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ categories: data || [] });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create category
router.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { name, subcategories } = req.body;

    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name,
        subcategories: subcategories || [],
        user_id: userId,
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ category: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update category
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { name, subcategories } = req.body;

    const { data, error } = await supabase
      .from('categories')
      .update({
        name,
        subcategories,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ category: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete category
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
