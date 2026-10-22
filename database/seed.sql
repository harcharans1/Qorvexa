-- =====================================================
-- QORVEXA — Safe Seed Data (Development Only)
-- Run AFTER schema.sql in Supabase SQL Editor
-- Clearly labeled as sample/demo data
-- =====================================================

-- Sample courses (demo only)
INSERT INTO public.courses (id, title, description, category, is_published)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Introduction to AI Tools', 'Learn the basics of using AI for productivity. Sample course.', 'AI Basics', true),
    ('22222222-2222-2222-2222-222222222222', 'Professional Resume Writing', 'Tips and structure for strong resumes. Sample course.', 'Career', true)
ON CONFLICT DO NOTHING;

-- Sample lessons
INSERT INTO public.lessons (course_id, title, content, order_index)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'What is AI?', 'This is sample lesson content. AI helps automate tasks.', 1),
    ('11111111-1111-1111-1111-111111111111', 'Getting Started', 'Sample content: Create your first prompt carefully.', 2),
    ('22222222-2222-2222-2222-222222222222', 'Resume Structure', 'Sample: Contact info, summary, experience, education.', 1)
ON CONFLICT DO NOTHING;