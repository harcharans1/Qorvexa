-- Optional sample content for a new Qorvexa database.
-- Run after database/schema.sql in the Supabase SQL editor.
-- Safe to re-run: courses and lessons are inserted only when their titles are absent.

insert into public.courses (title, description, category, difficulty, is_published)
select seed.title, seed.description, seed.category, seed.difficulty, true
from (values
  ('Resume Essentials', 'Learn how to organize your experience, write clear achievement statements, and tailor a resume to a role.', 'Career', 'beginner'),
  ('Social Content Foundations', 'Plan useful social content, choose a tone, and write concise captions for different platforms.', 'Marketing', 'beginner'),
  ('Practical AI Skills', 'Learn responsible ways to use AI tools for brainstorming, drafting, and reviewing your work.', 'AI', 'beginner')
) as seed(title, description, category, difficulty)
where not exists (
  select 1 from public.courses existing where existing.title = seed.title
);

with course_lessons as (
  select c.id as course_id, c.title as course_title, lesson.title as lesson_title,
         lesson.content, lesson.order_index
  from public.courses c
  join (values
    ('Resume Essentials', 'Choose a clear target role', 'Identify the role and audience before editing your resume.', 1),
    ('Resume Essentials', 'Write achievement-focused bullets', 'Describe the action you took and the result you can truthfully support.', 2),
    ('Resume Essentials', 'Review and tailor your resume', 'Compare the resume with a job description and make only accurate changes.', 3),
    ('Social Content Foundations', 'Define your audience', 'Write down who the post is for and what they should take away.', 1),
    ('Social Content Foundations', 'Choose a platform and tone', 'Adapt length, tone, and formatting to the audience and platform.', 2),
    ('Social Content Foundations', 'Edit before publishing', 'Check accuracy, accessibility, links, and brand voice before posting.', 3),
    ('Practical AI Skills', 'Give AI useful context', 'State the task, audience, constraints, and desired format clearly.', 1),
    ('Practical AI Skills', 'Verify AI-generated content', 'Check facts, protect sensitive data, and rewrite outputs in your own voice.', 2),
    ('Practical AI Skills', 'Build a repeatable workflow', 'Save useful prompts and review outputs against a consistent checklist.', 3)
  ) as lesson(course_title, title, content, order_index) on lesson.course_title = c.title
)
insert into public.lessons (course_id, title, content, order_index)
select cl.course_id, cl.lesson_title, cl.content, cl.order_index
from course_lessons cl
where not exists (
  select 1 from public.lessons existing
  where existing.course_id = cl.course_id and existing.title = cl.lesson_title
);
