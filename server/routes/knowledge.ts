import { Router } from 'express';
import { supabase } from '../index';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Get all knowledge blocks for current user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const { data, error } = await supabase
      .from('knowledge_blocks')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ blocks: data || [] });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single knowledge block
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const { data, error } = await supabase
      .from('knowledge_blocks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Knowledge block not found' });
    }

    // Increment view count
    await supabase
      .from('knowledge_blocks')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', id);

    res.json({ block: { ...data, view_count: (data.view_count || 0) + 1 } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create knowledge block
router.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { title, content, remarks, category, subcategory } = req.body;

    const { data, error } = await supabase
      .from('knowledge_blocks')
      .insert([{
        title,
        content,
        remarks: remarks || '',
        category,
        subcategory,
        view_count: 0,
        user_id: userId,
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ block: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update knowledge block
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { title, content, remarks, category, subcategory } = req.body;

    const { data, error } = await supabase
      .from('knowledge_blocks')
      .update({
        title,
        content,
        remarks,
        category,
        subcategory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ block: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete knowledge block(s)
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const { error } = await supabase
      .from('knowledge_blocks')
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

// Delete multiple knowledge blocks
router.post('/batch-delete', authenticateUser, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { ids } = req.body;

    const { error } = await supabase
      .from('knowledge_blocks')
      .delete()
      .in('id', ids)
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
