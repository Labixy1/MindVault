import { Router } from 'express';
import { supabase } from '../index.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// Get all prompts for current user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ prompts: data || [] });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single prompt
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Increment view count
    await supabase
      .from('prompts')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', id);

    res.json({ prompt: { ...data, view_count: (data.view_count || 0) + 1 } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create prompt
router.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { title, description, original_prompt, fields, tags } = req.body;

    const { data, error } = await supabase
      .from('prompts')
      .insert([{
        title,
        description,
        original_prompt,
        fields: fields || [],
        tags: tags || [],
        view_count: 0,
        user_id: userId,
      }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ prompt: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update prompt
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { title, description, original_prompt, fields, tags } = req.body;

    const { data, error } = await supabase
      .from('prompts')
      .update({
        title,
        description,
        original_prompt,
        fields,
        tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ prompt: data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete prompt
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const { error } = await supabase
      .from('prompts')
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
