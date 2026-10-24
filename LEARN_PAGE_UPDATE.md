# Qorvexa Learn page update

Updated the Angular Learn/course-list page to a responsive, premium learning workspace.

## Included
- Learning sidebar and welcome banner
- Search across course title, description, category and difficulty
- Dynamic category filters and sort options
- Live counts from Supabase for published courses, enrollments and completed lessons
- Continue-learning panel based on the user's enrolled courses
- Per-course lesson completion progress based on `lesson_progress`
- Enroll button wired to Supabase `enrollments`
- Course cards with published thumbnails when present and category-based fallback art
- Responsive layout for desktop, tablet and mobile
- Progress and achievement indicators derived from actual course/enrollment/lesson data
- Component style warning budget adjusted to 18 kB (hard error remains 20 kB)

## Important notes
- Course cards come from published rows in the existing Supabase `courses` table; this update does not insert fake courses.
- Learning hours, video playback, downloadable certificates, and AI tutor functionality are not claimed as implemented because the current database/schema does not provide enough support for those features.
- `npm ci` timed out in the build environment, so a fresh Angular production build could not be confirmed here. Run `npm ci` and `npm run build` on your Windows machine before deploying.
