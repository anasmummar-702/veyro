-- Veyro course catalog: Mindset, Marketing, Editing and Coding.
-- Generated from the curriculum source files; every lesson is original Veyro text.
-- Safe to re-run: removes the old demo courses if present, and exits early if
-- the current catalog already exists.

do $seed$
declare
  v_instructor uuid;
begin
  -- Retire the original demo catalog (only if nobody is enrolled in it).
  delete from public.courses c
  where c.slug in ('neural-networks-visually', 'linear-algebra-geometrically', 'calculus-first-principles', 'study-skills-that-stick')
    and not exists (select 1 from public.enrollments e where e.course_id = c.id);
  delete from public.categories cat
  where cat.slug in ('data-ai', 'mathematics', 'learning-skills')
    and not exists (select 1 from public.courses c where c.category_slug = cat.slug);

  if exists (select 1 from public.courses where slug = 'mindset-foundations') then
    raise notice 'Course catalog already present — skipping.';
    return;
  end if;

  -- Editorial account that owns curated courses. It has no password and
  -- cannot sign in; it exists so courses have an owner.
  select id into v_instructor from auth.users where email = 'editorial@veyro.local';
  if v_instructor is null then
    v_instructor := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_instructor, 'authenticated', 'authenticated',
      'editorial@veyro.local', '', now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Veyro Editorial"}', now(), now(),
      '', '', '', ''
    );
  end if;

  update public.profiles
  set role = 'instructor',
      full_name = 'Veyro',
      headline = 'Structured courses in mindset, marketing, editing and coding'
  where id = v_instructor;

  insert into public.categories (slug, name, sort_order) values
    ('mindset', 'Mindset', 1),
    ('marketing', 'Marketing', 2),
    ('editing', 'Editing', 3),
    ('coding', 'Coding', 4)
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

  insert into public.courses
    (instructor_id, slug, title, subtitle, description, outcomes, level, category_slug, cover_motif, cover_tone, status, published_at)
  values
  (v_instructor, 'mindset-foundations',
   'Mindset: think, focus and grow on purpose',
   'Build the beliefs, habits and focus that make every other skill easier to learn.',
   'Most people try to change their results by changing their tactics. This course works one level deeper: how you think about ability, how you build habits that survive a bad week, how you protect your attention, how you bounce back from setbacks and how you set goals you actually reach. Every class is a short reading with one practical exercise, so you finish with a personal system, not just ideas. The course is original Veyro material.',
   array['Spot fixed-mindset thinking in yourself and reframe it into a next step',
         'Design habits with clear cues, small starts and tracking that keeps them going',
         'Plan focused work blocks and cut the distractions that break them',
         'Recover from setbacks with a repeatable review instead of self-criticism',
         'Turn a vague ambition into a 90-day plan with weekly actions'],
   'beginner', 'mindset', 'orbit', 'plum', 'published', now() - interval '0 minutes'),

  (v_instructor, 'marketing-essentials',
   'Marketing: from audience to first customers',
   'Understand your audience, craft a clear message and grow with content, social and email.',
   'Marketing is the work of getting the right message to the right people so they choose you. This course takes you from the fundamentals — who your audience is and what makes your offer different — through brand messaging, content and social media, to email and simple ways to measure what''s working. Each class is a short reading with a practical exercise, and by the end you''ll have a one-page marketing plan for your own product, service or personal brand. The course is original Veyro material.',
   array['Describe a target audience and its problems in specific, useful terms',
         'Write a clear value proposition and a consistent brand message',
         'Plan a month of content around content pillars and a posting rhythm',
         'Build an email list with a lead magnet and a short welcome sequence',
         'Track a handful of meaningful metrics and improve with simple tests'],
   'beginner', 'marketing', 'curve', 'rust', 'published', now() - interval '1 minutes'),

  (v_instructor, 'video-editing-essentials',
   'Editing: tell stories with video',
   'Go from raw footage to a polished video: cuts, pacing, sound, colour and export.',
   'Editing is where a video''s story is really written. This course teaches the core skills that apply in any editing app — organising footage, building a rough cut, choosing when and how to cut, pacing, sound design, colour correction, titles and exporting for each platform. The lessons are software-agnostic, so you can follow along in a free editor or a professional one. Each class is a short reading with a hands-on exercise, and you''ll finish with a complete edited video of your own. The course is original Veyro material.',
   array['Organise a project and assemble a rough cut from raw footage',
         'Choose cuts, transitions and pacing that keep viewers watching',
         'Mix dialogue, music and sound effects to clean, balanced levels',
         'Correct and grade colour so footage looks consistent and intentional',
         'Add titles and captions and export with the right settings for each platform'],
   'beginner', 'editing', 'lines', 'moss', 'published', now() - interval '2 minutes'),

  (v_instructor, 'coding-for-beginners',
   'Coding: build your first website',
   'Learn HTML, CSS and JavaScript from zero, then publish a real project with Git.',
   'This course takes you from no coding experience to a published website you built yourself. You''ll learn how the web works, structure pages with HTML, style them with CSS, add interactivity with JavaScript, and use Git to save and share your work. Every class is a short reading with code you type yourself, and the final module walks you through building and publishing a portfolio site. The course is original Veyro material.',
   array['Explain how browsers, servers, HTML, CSS and JavaScript work together',
         'Write semantic HTML pages with links, images, lists and forms',
         'Style and lay out pages with CSS, Flexbox, Grid and media queries',
         'Use JavaScript variables, functions, conditions and events to add interactivity',
         'Track your code with Git and publish a portfolio website online'],
   'beginner', 'coding', 'grid', 'ink', 'published', now() - interval '3 minutes');


  create temp table seed_modules (slug text, pos int, title text, descr text) on commit drop;
  insert into seed_modules values
    ('mindset-foundations', 0, 'The growth mindset', 'How beliefs about ability shape effort, learning and results.'),
    ('mindset-foundations', 1, 'Building habits that stick', 'Cues, small starts, tracking and how to recover when a streak breaks.'),
    ('mindset-foundations', 2, 'Focus and deep work', 'Protect your attention and get meaningful work done in less time.'),
    ('mindset-foundations', 3, 'Resilience and handling setbacks', 'Stay steady under pressure and turn setbacks into progress.'),
    ('mindset-foundations', 4, 'Goals and your personal growth plan', 'Turn ambitions into clear goals, weekly actions and regular reviews.'),
    ('marketing-essentials', 0, 'Marketing fundamentals', 'What marketing is, the customer journey and the classic 4 Ps.'),
    ('marketing-essentials', 1, 'Know your audience', 'Research your customers, build personas and find their real problems.'),
    ('marketing-essentials', 2, 'Brand and messaging', 'Positioning, value proposition, brand voice and storytelling.'),
    ('marketing-essentials', 3, 'Content and social media', 'Content pillars, social platforms, posting rhythm and basic SEO.'),
    ('marketing-essentials', 4, 'Email, growth and measuring results', 'Build an email list, run simple campaigns and track what works.'),
    ('video-editing-essentials', 0, 'Editing foundations', 'What editors do, choosing software and setting up your project.'),
    ('video-editing-essentials', 1, 'Cutting and storytelling', 'Rough cut, types of cuts, B-roll and building a story.'),
    ('video-editing-essentials', 2, 'Pacing, rhythm and motion', 'Keep viewers engaged with timing, music, speed and motion.'),
    ('video-editing-essentials', 3, 'Sound design and audio', 'Clean dialogue, music levels, sound effects and a balanced mix.'),
    ('video-editing-essentials', 4, 'Colour, titles and export', 'Colour correction and grading, text and captions, and exporting for every platform.'),
    ('coding-for-beginners', 0, 'Getting started with code', 'How the web works and setting up your coding tools.'),
    ('coding-for-beginners', 1, 'HTML: structure your pages', 'Tags, text, links, images, lists, semantic layout and forms.'),
    ('coding-for-beginners', 2, 'CSS: style and layout', 'Selectors, the box model, Flexbox, Grid and responsive design.'),
    ('coding-for-beginners', 3, 'JavaScript: make it interactive', 'Variables, functions, conditions, loops, the DOM and events.'),
    ('coding-for-beginners', 4, 'Git, projects and publishing', 'Version control with Git and GitHub, building and publishing your portfolio.');

  insert into public.modules (course_id, title, description, position)
  select c.id, m.title, m.descr, m.pos
  from seed_modules m join public.courses c on c.slug = m.slug;

  create temp table seed_lessons (
    slug text, mpos int, lpos int, title text, preview boolean, dur int, body text
  ) on commit drop;

  insert into seed_lessons values

  -- Mindset: think, focus and grow on purpose -----------------------------
  ('mindset-foundations', 0, 0, 'Welcome: how this course works', true, 300,
$md$Welcome to **Mindset**. This course is about the thinking underneath your results: what you believe about your ability, how you build habits, where your attention goes and how you respond when things go wrong.

## How the course is built

- **5 modules**, each with **4 short classes**.
- Every class is a reading of 5–10 minutes with one **Try this** exercise at the end.
- Mark each class as read when you finish. Complete every class to earn your **certificate**.

## What you need

- A notebook (paper or digital) that you'll use only for this course. We'll call it your **mindset journal**.
- Ten to twenty minutes a day. Consistency matters more than long sessions.

## A promise to make yourself

Reading about mindset changes nothing on its own. The exercises are where the change happens. If you skip one, come back to it before moving on.

## Try this

Open your journal and answer three questions in a few lines each:

1. What is one skill you want to be noticeably better at in 90 days?
2. What has stopped you from improving at it so far?
3. How will you know you've improved?

Keep this page. You'll revisit it in the final module.$md$),
  ('mindset-foundations', 0, 1, 'Fixed vs. growth mindset', true, 420,
$md$Psychologist Carol Dweck described two broad ways people think about ability.

- A **fixed mindset** treats talent and intelligence as set amounts. You either have it or you don't.
- A **growth mindset** treats ability as something built through effort, good strategies and help from others.

## Why it matters

The belief changes behaviour. If ability is fixed, every mistake is evidence that you lack it, so challenges feel threatening and effort feels pointless. If ability can grow, a mistake is information, a challenge is practice and effort is the path.

## It's not all-or-nothing

Nobody has a pure growth mindset. Most of us are growth-minded in some areas and fixed in others ("I'm just not a numbers person", "I'm not creative"). The goal is to notice the fixed areas, not to pretend they don't exist.

## A common misunderstanding

Growth mindset is **not** "just try harder" or "think positive". Effort with the same failed strategy rarely works. Growth thinking means asking: *what can I change about how I'm learning this?*

## Try this

Write down three areas of your life where you hear a fixed-mindset voice. For each, finish this sentence: *"I'm not good at ___ yet, and one thing I could try differently is ___."*$md$),
  ('mindset-foundations', 0, 2, 'Your inner voice and how to reframe it', false, 480,
$md$Everyone has an inner commentary. Under pressure, it often sounds like a fixed mindset: *"You'll embarrass yourself." "Other people find this easy." "Why bother?"*

You can't stop the voice from speaking, but you can answer it.

## The three-step reframe

1. **Notice** the thought and name it: "That's my fixed-mindset voice."
2. **Question** it: Is this a fact or a prediction? What evidence do I have?
3. **Replace** it with a statement that points to action.

| Fixed-mindset thought | Reframe |
| --- | --- |
| "I'm bad at this." | "I'm new at this. What's the smallest part I can practise?" |
| "I failed." | "That attempt didn't work. What did it teach me?" |
| "They're naturally talented." | "They've practised more. What can I learn from how they do it?" |
| "This is too hard." | "This is hard, which means I'm working at the edge of my skill." |

## Why the word "yet" works

Adding *yet* turns a verdict into a progress report. "I can't edit video" closes the door; "I can't edit video *yet*" leaves it open.

## Try this

For the next three days, each time you catch a fixed-mindset thought, write it in your journal with a reframe next to it. At the end, look for a pattern: which situations trigger the voice most?$md$),
  ('mindset-foundations', 0, 3, 'Learning from feedback and failure', false, 480,
$md$Feedback is the fastest route to improvement, and the most uncomfortable. A growth mindset doesn't make criticism painless; it changes what you do with it.

## Separate the work from the person

Feedback on your work is not a verdict on your worth. When feedback stings, say to yourself: *"This is about version one of the work, not about me."*

## Ask better questions

Vague feedback ("it's fine", "it's not quite there") is hard to use. Ask for specifics:

- "What's the one change that would improve this the most?"
- "Where did you lose interest or get confused?"
- "What would you keep exactly as it is?"

## Run a quick failure review

When something goes wrong, spend ten minutes on four questions:

1. **What happened?** Facts only.
2. **What did I expect to happen?**
3. **Why was there a gap?** Look for causes you control.
4. **What will I do differently next time?** One concrete change.

## Celebrate the attempt

People who improve fastest take more shots. Count attempts, not just successes. A month with ten attempts and three wins usually teaches more than a month with one safe attempt.

## Try this

Pick a piece of work you've done recently. Ask one person for feedback using one of the questions above. Write down what they said and the single change you'll make.$md$),
  ('mindset-foundations', 1, 0, 'How habits actually work', false, 420,
$md$A habit is a behaviour that has become automatic: it runs with very little decision-making. Researchers often describe it as a loop.

1. **Cue** — something triggers the behaviour (a time, a place, a feeling, a previous action).
2. **Routine** — the behaviour itself.
3. **Reward** — the benefit that makes your brain want to repeat it.

Repeat the loop often enough in the same context and the behaviour starts to feel like the default.

## Why motivation isn't enough

Motivation rises and falls. Habits are useful precisely because they don't depend on how you feel today. The goal is to make the right behaviour **easy and obvious**, so that it happens even on low-motivation days.

## How long does it take?

You may have heard "21 days". Studies suggest the real range is wide: simple habits can feel automatic within a few weeks, harder ones can take months. Expect it to take a while, and don't judge the habit by the first week.

## Try this

Choose one habit you want to build. In your journal, describe its loop:

- **Cue:** When and where will it happen?
- **Routine:** Exactly what will you do?
- **Reward:** What will you get from it, immediately?

If you can't name an immediate reward, add one (a tick on a tracker, a favourite drink, a short walk).$md$),
  ('mindset-foundations', 1, 1, 'Start tiny: the two-minute version', false, 360,
$md$The most common reason new habits fail is that they start too big. "Read every day for an hour" collapses the first busy evening.

## Shrink it until it's easy

Cut the habit down to a version you could do in **two minutes** on your worst day:

- "Exercise for 45 minutes" → "Put on my running shoes and step outside."
- "Study coding every day" → "Open my code editor and write one line."
- "Journal every morning" → "Write one sentence about yesterday."

The point is not that two minutes is enough. The point is that **showing up** is the habit you're building first. Once showing up is automatic, extending the session is easy.

## Anchor it to something you already do

Use a habit you already have as the cue. This is often called **habit stacking**:

> After I pour my morning coffee, I will write one sentence in my journal.

> After I close my laptop for lunch, I will walk for five minutes.

## Try this

Write your habit as a stack: *"After I ___, I will ___ (two-minute version)."* Do it every day this week. Don't extend it yet, even if you feel like doing more. You're training consistency first.$md$),
  ('mindset-foundations', 1, 2, 'Design your environment', false, 420,
$md$Your surroundings make some behaviours easy and others hard. Instead of relying on willpower, rearrange the space so the good choice is the default.

## Make good habits obvious

- Leave the book on your pillow, the guitar on its stand, the water bottle on your desk.
- Keep the app you want to use on your phone's home screen.
- Put your workout clothes next to your bed the night before.

## Make bad habits harder

Add friction: steps, distance or time between you and the habit.

- Log out of social media apps after each use, or move them into a folder on the last screen.
- Keep your phone in another room while you work.
- Don't keep snacks you're trying to avoid within reach.

Even ten extra seconds of effort can be enough to break an automatic behaviour.

## One space, one purpose

If possible, use a specific spot for focused work. When your brain links a place with a task, getting started gets easier. If you only have one room, use a signal instead: a particular lamp, playlist or notebook.

## Try this

Walk around your workspace and make **three changes today**: one that makes your new habit more obvious, and two that add friction to a distraction. Note them in your journal.$md$),
  ('mindset-foundations', 1, 3, 'Track progress and recover from a break', false, 420,
$md$What gets measured gets noticed. A simple tracker shows progress you'd otherwise forget, and the act of ticking a box is itself a small reward.

## Keep the tracker simple

- A paper calendar with an **X** for each day you did the habit.
- A note on your phone with dates.
- A habit-tracking app if you already like using one.

Track the behaviour (did I show up?), not the outcome (did I lose weight?). Outcomes are slow; behaviours are daily.

## The rule for missed days: never miss twice

Breaking a streak is normal. What matters is what happens next. One missed day is an accident; two in a row is the start of a new pattern. If you miss a day, make the next day non-negotiable, even if you only do the two-minute version.

## Review weekly

Once a week, look at your tracker and ask:

- How many days did I show up?
- What got in the way on the days I missed?
- What one change would make next week easier?

## Try this

Set up a tracker for the habit you've been building this module. At the end of the week, write a three-line review in your journal using the questions above.$md$),
  ('mindset-foundations', 2, 0, 'Why attention is your most valuable resource', false, 360,
$md$You can always earn more money, but you can't get more hours. What you *can* change is how much attention you bring to the hours you have.

## The cost of switching

Every time you switch between tasks (or check a notification), your brain needs time to fully return to the original task. Some of your attention stays stuck on the previous thing. Researcher Sophie Leroy called this **attention residue**. A day full of quick checks can leave you busy but with little finished.

## Shallow vs. deep work

- **Shallow work**: replying to messages, admin, quick tasks. Necessary, but easy to repeat and rarely what moves you forward.
- **Deep work**: focused, uninterrupted effort on something cognitively demanding — learning a new skill, writing, building, solving a hard problem.

Author Cal Newport argues that the ability to do deep work is becoming rarer and more valuable at the same time.

## Know your peak hours

Most people have a time of day when they think most clearly. Protect that window for deep work, and push shallow tasks to the edges of the day.

## Try this

For two days, note in your journal every time you switch tasks or check your phone while working. At the end, count them. Then answer: when during the day was I most focused?$md$),
  ('mindset-foundations', 2, 1, 'Plan a focus block', false, 420,
$md$A focus block is a scheduled period of deep work on one task. Planning it in advance removes the "what should I do now?" moment where distraction sneaks in.

## Before the block

1. **Pick one task** and write it as an outcome: "Draft the first two sections of the script" is better than "work on script".
2. **Gather what you need** — files, notes, tools — so you don't have to go looking.
3. **Decide the length.** Start with 25–50 minutes. You can grow it later.

## During the block

- Phone in another room or in focus mode.
- Close every tab and app you don't need.
- Keep a **distraction list** beside you. When a thought pops up ("I must reply to…"), write it down and return to the task. You'll handle the list afterwards.

## After the block

Take a real break of 5–10 minutes: stand up, move, look out of a window. Then write one line: what did I finish?

## The Pomodoro version

If long blocks feel hard, use the Pomodoro technique: 25 minutes of focus, 5 minutes of break, repeat four times, then take a longer break.

## Try this

Schedule two focus blocks in your calendar for tomorrow, each with one written outcome. After each block, note in your journal what you finished and what distracted you.$md$),
  ('mindset-foundations', 2, 2, 'Tame your phone and notifications', false, 360,
$md$Phones are designed to capture attention. You don't need to throw yours away; you need to decide when it gets your attention instead of letting it decide.

## Audit your notifications

Go to your notification settings and ask of every app: *Does this need to interrupt me right now?* For most apps the answer is no.

- Keep: calls and messages from people who matter, calendar reminders.
- Turn off: social media, news, shopping, games, most email.

## Batch your checking

Instead of checking messages whenever you remember, pick set times: for example, after each focus block and at the end of the day. People rarely need a reply within ten minutes.

## Make the phone less tempting

- Switch the screen to greyscale during work hours.
- Move distracting apps off the home screen.
- Use your phone's built-in focus or downtime mode on a schedule.

## Replace, don't just remove

If you reach for your phone when you're bored or stuck, give yourself another option: stretch, refill water, or write the stuck thought on paper.

## Try this

Do the notification audit now. Turn off every non-essential notification and set one focus mode that runs during your peak hours. Note how many notifications you turned off.$md$),
  ('mindset-foundations', 2, 3, 'Rest, energy and the focus cycle', false, 360,
$md$Focus isn't only about removing distractions. It also depends on how much energy you have, and energy comes from rest.

## Breaks make you better, not lazier

Attention naturally fades after a period of effort. Short breaks between focus blocks help you return sharper. A break works best when it's different from the work: if you've been on a screen, step away from screens.

## Sleep is part of learning

While you sleep, your brain consolidates what you practised during the day. Cutting sleep to study more often backfires. Aim for a regular sleep and wake time, even on weekends.

## Move every day

A short walk improves mood and makes it easier to think. If you're stuck on a problem, a ten-minute walk is often more useful than another ten minutes of staring at it.

## Plan for energy, not just time

Look at your week and match tasks to energy:

- **High energy:** deep work, learning new material.
- **Medium energy:** practice, review, creative tasks.
- **Low energy:** admin, organising, planning tomorrow.

## Try this

Draw a simple energy map of a typical day in your journal: mark when you usually feel high, medium and low energy. Then move one deep-work task into a high-energy slot this week.$md$),
  ('mindset-foundations', 3, 0, 'What resilience really is', false, 360,
$md$Resilience is the ability to keep going, and to recover, when things are hard. It's not about never feeling stressed or disappointed. Resilient people feel those things too; they just don't let them have the final word.

## Resilience is a skill

Like a muscle, it gets stronger through use. Each time you face a difficulty and get through it, you collect evidence that you can handle the next one.

## The three Ps

Psychologist Martin Seligman found that how people *explain* setbacks affects how quickly they recover. Watch out for three patterns:

- **Personal:** "It's all my fault." → Look for the full picture, including things outside your control.
- **Pervasive:** "This ruins everything." → Keep it contained: "This affects one project, not my whole life."
- **Permanent:** "It will always be like this." → Remind yourself that feelings and situations change.

## Control what you can

Divide any difficult situation into two lists: what you can control (your effort, your next step, how you respond) and what you can't (other people's decisions, the past, luck). Put your energy into the first list.

## Try this

Think of a recent setback. Write how you explained it to yourself, then check it against the three Ps. Rewrite the explanation so it's accurate but not personal, pervasive or permanent.$md$),
  ('mindset-foundations', 3, 1, 'Managing stress in the moment', false, 420,
$md$When stress spikes, your body reacts first: faster heartbeat, shallow breathing, tense muscles. In that state it's hard to think clearly. These tools help you calm the body so the mind can follow.

## Slow your breathing

Try **box breathing**: breathe in for 4 counts, hold for 4, breathe out for 4, hold for 4. Repeat four times. A longer out-breath than in-breath also helps calm you down.

## Name the feeling

Saying (or writing) what you feel — "I'm anxious about the presentation" — can reduce its intensity. Being specific helps: *frustrated*, *disappointed* and *overwhelmed* are different feelings with different fixes.

## Shrink the problem

Overwhelm often comes from seeing a whole mountain at once. Ask: *What's the very next step I can take in the next 15 minutes?* Then do only that.

## Talk to someone

Explaining a problem to a friend, mentor or colleague often makes it feel smaller, and they may see an option you missed.

## Know when to get help

If stress or low mood lasts for weeks, affects your sleep or daily life, or you feel unable to cope, talk to a doctor or a mental-health professional. Getting support is a strong move, not a weak one.

## Try this

Practise box breathing once today when you're calm, so it's familiar when you need it. Then write down one person you could talk to when things get hard.$md$),
  ('mindset-foundations', 3, 2, 'Turn setbacks into lessons', false, 420,
$md$A setback hurts less when it pays you back with a lesson. The key is to review it on purpose, rather than replaying it in your head.

## Wait, then review

Right after a setback, emotions are high. Give it a little time — a few hours or a day — then sit down for a structured review.

## The after-action review

Teams in many fields use a version of this:

1. **What was supposed to happen?**
2. **What actually happened?**
3. **Why was there a difference?**
4. **What will we keep doing, and what will we change?**

Write the answers down. Writing forces you to be specific.

## Look for the controllable cause

Some causes are out of your hands. Note them, then focus on the ones you could influence next time: preparation, timing, communication, practice.

## Collect your comebacks

Keep a list of difficult moments you've already got through and what helped. On a bad day, reading it is a reminder that you've been here before and come out the other side.

## Try this

Run an after-action review on one setback from the past month. Finish with one **keep** and one **change**. Start your "comebacks list" with that situation.$md$),
  ('mindset-foundations', 3, 3, 'Self-compassion and staying consistent', false, 360,
$md$Many people believe being hard on themselves keeps them motivated. Research by Kristin Neff and others suggests the opposite: treating yourself with kindness after a mistake makes you more likely to try again.

## Self-compassion is not letting yourself off the hook

It means you take responsibility *and* stay on your own side. Compare:

- Harsh: "You're useless. You always mess this up."
- Compassionate: "That didn't go well and it's frustrating. Lots of people struggle with this. What's one thing I'll do differently?"

The second version keeps you honest *and* keeps you moving.

## Talk to yourself like a good coach

A good coach is honest about mistakes, believes you can improve and gives you a clear next step. Before you criticise yourself, ask: *Would I say this to a friend I wanted to help?*

## Consistency beats intensity

Progress comes from showing up often, not from occasional heroic efforts. On a bad day, do the smallest useful version of your plan and count it as a win.

## Try this

Write a short letter to yourself about a recent mistake, in the voice of a supportive coach: name what happened, acknowledge how it felt, and end with one next step.$md$),
  ('mindset-foundations', 4, 0, 'Set clear goals', false, 420,
$md$Vague goals ("get better at marketing") are hard to act on. Clear goals tell you exactly what to do and when you've done it.

## Use the SMART check

A useful goal is:

- **Specific** — what exactly will you achieve?
- **Measurable** — how will you know you've done it?
- **Achievable** — is it realistic with your time and resources?
- **Relevant** — does it matter to you right now?
- **Time-bound** — by when?

Example: "Get better at video editing" becomes "Edit and publish four 60-second videos by the end of March."

## Outcome goals and process goals

- **Outcome goal:** the result you want (publish four videos).
- **Process goals:** the regular actions that make it likely (edit for 30 minutes on Monday, Wednesday and Friday).

You can't fully control outcomes. You *can* control process. Track both, but judge yourself on the process.

## Fewer goals, more progress

Pick one to three goals at a time. Every extra goal divides your attention.

## Try this

Go back to the question from the first class: the skill you want to improve in 90 days. Rewrite it as a SMART outcome goal, then add two process goals that you'll do every week.$md$),
  ('mindset-foundations', 4, 1, 'Build a 90-day plan', false, 480,
$md$Ninety days is long enough to make real progress and short enough to stay focused. A 90-day plan breaks one big goal into steps you can see.

## Step 1: Define "done"

Write your outcome goal at the top of the page. Be specific about what finished looks like.

## Step 2: Work backwards in months

Ask: *What needs to be true at the end of month 2 for month 3 to work?* Then the same for month 1. You'll get three milestones.

## Step 3: Turn the next month into weeks

Break **only month 1** into weekly actions. Don't plan months 2 and 3 in detail; you'll learn too much along the way.

## Step 4: Put it in your calendar

Book the focus blocks for week 1 now. A plan that isn't in your calendar is a wish.

## Step 5: Plan for obstacles

For each likely obstacle, write an **if–then** plan:

> If I get home too tired to study, then I'll do the 10-minute version.

> If I miss a session, then I'll move it to Saturday morning.

## Example

Goal: launch a simple portfolio website in 90 days.
- Month 1: learn HTML and CSS basics, sketch the layout.
- Month 2: build the pages, add three projects.
- Month 3: polish, get feedback, publish.

## Try this

Write your own 90-day plan using the five steps, and book week 1 in your calendar today.$md$),
  ('mindset-foundations', 4, 2, 'Weekly review and adjusting course', false, 420,
$md$Plans go out of date the moment life happens. A short weekly review keeps your plan alive and stops small slips from becoming big ones.

## The 20-minute weekly review

Pick a fixed time, such as Sunday evening, and go through these steps:

1. **Look back.** What did I get done? Check your tracker and calendar.
2. **Celebrate one win**, however small.
3. **Spot the blocker.** What got in the way most this week?
4. **Adjust.** What will I change next week to deal with that blocker?
5. **Plan the week.** Book next week's focus blocks and pick the one most important task.

## Keep score honestly

Rate the week from 1 to 10 for how well you stuck to your *process* goals. Over a few weeks you'll see trends that a single bad day hides.

## When to change the plan

Change the plan if you've learned something important: the goal is too easy, too hard or no longer matters. Don't change it just because one week was difficult; adjust the actions, not the destination.

## Try this

Do your first weekly review this weekend using the five steps. Put a recurring 20-minute event in your calendar so it happens every week.$md$),
  ('mindset-foundations', 4, 3, 'Your mindset toolkit and next steps', false, 360,
$md$You've covered the core of a growth-focused mindset. Here's everything in one place so you can keep using it after the course.

## Your toolkit

- **Reframe:** notice the fixed-mindset voice, question it, replace it with an action. Add *yet*.
- **Feedback:** separate work from self, ask specific questions, run a quick failure review.
- **Habits:** cue → routine → reward. Start with a two-minute version, stack it, design your environment, never miss twice.
- **Focus:** one task per block, a distraction list, notifications off, deep work in peak hours.
- **Resilience:** check the three Ps, calm the body first, run an after-action review, be your own good coach.
- **Goals:** SMART outcome goal, weekly process goals, a 90-day plan and a weekly review.

## Look back

Open the first page of your journal, where you wrote the skill you wanted to improve. What has changed since then? What would you tell yourself on day one?

## Keep going

The next courses on Veyro — **Marketing**, **Editing** and **Coding** — are perfect places to use this toolkit. Pick one, set a 90-day goal for it, and plan your first week.

## Try this

Write a one-page summary of your personal system: your main habit, your focus routine, your setback plan and your current 90-day goal. Then mark this class as read to complete the course and claim your certificate.$md$),
  -- Marketing: from audience to first customers ---------------------------
  ('marketing-essentials', 0, 0, 'Welcome: what marketing really is', true, 300,
$md$Welcome to **Marketing**. Many people think marketing means advertising or posting on social media. Those are tools. Marketing itself is broader:

> Marketing is understanding what people need and showing them, clearly and honestly, how you can help.

## How this course works

- **5 modules**, each with **4 classes**. Every class ends with a **Try this** exercise.
- Pick **one project** to use throughout: a product, a service, a small business, or your personal brand as a creator or freelancer.
- Complete every class to earn your **certificate**.

## The core idea

Good marketing starts with the customer, not with you. Instead of asking "How do I sell this?", ask "Who has a problem this solves, and how do they look for a solution?"

## Your marketing workbook

Create a document called **Marketing workbook**. Each exercise adds a section. By the final module, it becomes your one-page marketing plan.

## Try this

At the top of your workbook, write:

1. **Project:** what you're marketing, in one sentence.
2. **Goal:** what you want marketing to achieve in the next 90 days (e.g. 100 email subscribers, 10 paying clients, 1,000 followers).
3. **Why now:** why this matters to you.$md$),
  ('marketing-essentials', 0, 1, 'The customer journey', true, 420,
$md$People rarely buy the first time they hear about something. They move through stages, and your marketing should help at each one. A simple model is the **customer journey**:

1. **Awareness** — they discover you exist (a post, a search result, a recommendation).
2. **Consideration** — they compare options and learn more (your website, reviews, a free guide).
3. **Decision** — they choose and buy or sign up (pricing page, offer, checkout).
4. **Retention** — they use your product and stay happy (onboarding, support, emails).
5. **Advocacy** — they recommend you to others (reviews, referrals, sharing).

## Match your content to the stage

- Awareness: helpful, shareable content that solves a small problem.
- Consideration: comparisons, case studies, detailed guides.
- Decision: clear pricing, guarantees, answers to common objections.
- Retention and advocacy: great onboarding, thank-yous, a simple way to refer friends.

## Find the leak

If lots of people discover you but few buy, the problem is probably in consideration or decision. If people buy once but never return, focus on retention.

## Try this

In your workbook, draw the five stages for your project. Under each, write one thing you already do and one thing you could add.$md$),
  ('marketing-essentials', 0, 2, 'The 4 Ps: product, price, place, promotion', false, 420,
$md$The **marketing mix**, often called the 4 Ps, is a classic checklist for the main decisions behind any offer.

## Product

What exactly are you offering? Think beyond features to the **outcome** the customer gets. A course isn't "10 videos", it's "the confidence to edit your own videos".

## Price

What will you charge, and how will it be structured (one-off, subscription, tiers)? Price also sends a signal: very low prices can make people doubt quality. Look at what alternatives cost and what outcome you deliver.

## Place

Where and how do people get your offer? Your own website, a marketplace, a physical shop, direct messages? Be where your audience already is.

## Promotion

How will people hear about it? Content, social media, email, partnerships, ads, word of mouth. You don't need all of them; you need the few that reach your audience best.

## Use the Ps together

A premium product with a bargain price and sloppy promotion sends mixed signals. Check that all four Ps tell the same story.

## Try this

Write a short paragraph for each P for your project. Then ask: do the four paragraphs tell one consistent story? Note anything that doesn't fit.$md$),
  ('marketing-essentials', 0, 3, 'Know your competition', false, 420,
$md$Your audience always has alternatives: other businesses, free options, or simply doing nothing. Understanding them helps you stand out.

## Find your competitors

- Search for the problem your project solves and note the top results.
- Look at who your audience follows on social media.
- Ask a few potential customers: "What do you use for this now?"

## Analyse three of them

For each competitor, note:

- **Who** they target.
- **What** they promise (their main message).
- **How much** they charge.
- **Where** they promote (channels).
- **What customers praise and complain about** — read reviews and comments.

## Look for gaps

Complaints are gold. If people repeatedly say a competitor is "too complicated", "too expensive" or "slow to reply", that's an opening for you.

## Don't copy, differentiate

The goal isn't to imitate the market leader. It's to find a position they don't own: a specific audience, a simpler approach, better support, a different price point.

## Try this

Fill in the five points above for three competitors in your workbook. Finish with one sentence: *"Unlike [competitors], we [difference] for [audience]."*$md$),
  ('marketing-essentials', 1, 0, 'Choose a target audience', false, 360,
$md$"Everyone" is not an audience. When you try to speak to everyone, your message becomes so general that no one feels it's for them.

## Narrow is powerful

Compare:

- "Fitness coaching for everyone"
- "Fitness coaching for busy parents who have 20 minutes a day"

The second message instantly tells the right people "this is for you", and tells everyone else they can move on. That's a good thing.

## Ways to define an audience

- **Situation:** new freelancers, first-time founders, students starting university.
- **Goal:** want to grow on YouTube, want to change careers into tech.
- **Problem:** struggle to stay consistent, can't afford an agency.
- **Demographics** (age, location, income) — useful, but usually less important than situation and goal.

## Start small, then expand

A narrow audience is easier to reach and easier to delight. Once you own that niche, you can grow into neighbouring ones.

## Try this

Write three possible target audiences for your project. For each, rate from 1–5: how big is the problem for them, how easy are they to reach, and how much would they value a solution? Choose the one with the highest total.$md$),
  ('marketing-essentials', 1, 1, 'Customer research that actually helps', false, 480,
$md$You can guess what customers want, or you can ask. Research doesn't need to be expensive; a handful of good conversations beats a hundred assumptions.

## Talk to real people

Aim for **five short interviews** (15–20 minutes) with people in your target audience. Ask about their past behaviour, not hypotheticals:

- "Tell me about the last time you dealt with [problem]."
- "What did you try? What happened?"
- "What was the hardest part?"
- "What would make this easier?"

Avoid "Would you buy this?" People are polite and will often say yes.

## Listen where they already talk

- Comments on popular videos and posts in your niche.
- Online forums and communities.
- Reviews of competing products (especially 2- and 3-star ones).

## Collect their words

Write down the exact phrases people use. "I never know what to post" is more powerful in your marketing than "content strategy challenges".

## Look for patterns

After five conversations, list the problems and phrases that came up more than once. Those are your strongest marketing angles.

## Try this

Schedule at least two customer conversations this week, or spend 30 minutes reading forum threads and reviews. Record ten exact phrases in your workbook.$md$),
  ('marketing-essentials', 1, 2, 'Build a customer persona', false, 360,
$md$A **persona** is a short profile of a typical customer, based on your research. It helps you make decisions by asking "Would *she* care about this?" instead of guessing.

## What to include

- **Name and snapshot:** "Ana, 28, freelance graphic designer, two years in."
- **Goals:** what she's trying to achieve.
- **Problems:** what's getting in the way.
- **Where she spends time:** platforms, communities, newsletters.
- **Objections:** why she might hesitate to buy ("I've tried courses before and never finished").
- **Her words:** two or three real phrases from your research.

## Keep it real

A persona should come from research, not imagination. If you don't know something, mark it as a guess and go and find out.

## One or two is enough

If you have several very different customer types, create a persona for each, but start with your most important one.

## Use it

Pin your persona where you work. Before writing a post, an email or a sales page, read it and ask: *What does Ana need to hear?*

## Try this

Write a persona for your primary audience in your workbook, using your research from the last class. Include at least two real phrases.$md$),
  ('marketing-essentials', 1, 3, 'Jobs to be done and pain points', false, 420,
$md$People don't buy products for their own sake. They "hire" them to get a job done. This idea, known as **jobs to be done**, helps you focus on what matters.

## The job behind the purchase

Someone buying a drill doesn't really want a drill. They want a hole — or really, a shelf on the wall, or a tidy room. Ask: *What progress is the customer trying to make?*

## Three kinds of jobs

- **Functional:** the practical task ("edit my videos faster").
- **Emotional:** how they want to feel ("confident that my videos look professional").
- **Social:** how they want to be seen ("taken seriously by brands").

Great marketing speaks to all three.

## Map the pain points

List the frustrations your customer has with current options:

- Too expensive, too slow, too complicated, too generic.
- Hard to get started, easy to give up.
- Bad support or unclear results.

Each pain point is a chance to show how you're different.

## Gains

Also list the extra benefits they'd love: saving time, earning more, learning something new, feeling part of a community.

## Try this

For your persona, write the functional, emotional and social job. Then list their top three pain points and top three desired gains. Highlight the one pain point you solve best.$md$),
  ('marketing-essentials', 2, 0, 'Positioning: own a place in their mind', false, 420,
$md$**Positioning** is the place your offer holds in your customer's mind compared with the alternatives. If you don't choose a position, the market chooses one for you.

## A simple positioning statement

> For **[target audience]** who **[need or problem]**, **[your project]** is the **[category]** that **[main benefit]**. Unlike **[alternatives]**, we **[key difference]**.

Example:

> For new YouTubers who feel overwhelmed by editing software, **QuickCut Coaching** is a weekly coaching programme that gets your first ten videos published. Unlike long software tutorials, we focus on the 20% of editing skills that matter most.

## Choose what to be known for

You can't be the cheapest, the fastest and the most premium at once. Pick one or two qualities and own them consistently.

## Test it

Read your positioning statement to someone in your audience. Do they understand it immediately? Do they care? If they say "So it's like X?", that tells you how they're filing you in their mind.

## Try this

Write your positioning statement in your workbook. Use your competitor research and persona to fill each part. Then shorten it into a single sentence of 15 words or fewer.$md$),
  ('marketing-essentials', 2, 1, 'Write your value proposition', false, 420,
$md$A **value proposition** is the clear promise of value a customer gets from you. It's usually the first thing people see on your website or profile, and it needs to land in seconds.

## The three parts

1. **Headline:** the main benefit, in plain words. ("Edit YouTube videos twice as fast.")
2. **Sub-headline:** who it's for and how it works. ("Short, practical lessons for beginner creators, with templates you can reuse.")
3. **Proof or key points:** three quick reasons to believe it (features, results, testimonials).

## Benefits beat features

- Feature: "Includes 40 editing templates."
- Benefit: "Start every video from a professional-looking template."

A useful trick is the **"so that" test**: "40 editing templates, *so that* you can start every video in minutes."

## Use their words

Pull phrases from your customer research. If your audience says "I never know what to post", a headline like "Never wonder what to post again" will feel written for them.

## Keep it honest

Only promise what you can deliver. Overpromising wins one sale and loses trust.

## Try this

Write three different headline options for your value proposition, plus one sub-headline. Show them to two people in your audience and ask which one makes them most want to learn more.$md$),
  ('marketing-essentials', 2, 2, 'Brand voice and visual identity', false, 360,
$md$Your **brand** is the overall impression people have of you. Two things shape it more than anything else: how you sound and how you look.

## Brand voice

Choose three words that describe your personality, plus what each one *doesn't* mean:

| We are | But not |
| --- | --- |
| Friendly | Unprofessional |
| Direct | Harsh |
| Encouraging | Over-the-top |

Write all your content — posts, emails, website — in this voice. Consistency builds recognition and trust.

## Visual identity basics

You don't need an expensive designer to start. Decide on:

- **Colours:** one main colour, one accent, plus neutrals (white, grey, dark).
- **Fonts:** one for headings, one for body text.
- **Logo:** a simple wordmark (your name in a clean font) is enough at first.
- **Image style:** bright or moody, photos or illustrations, people or products.

## Write it down

Put your voice words, colours and fonts on one page — a mini **brand guide**. Use it every time you create something.

## Try this

Create your mini brand guide in your workbook: three voice words with "but not" partners, two colours with hex codes, two fonts and a description of your image style.$md$),
  ('marketing-essentials', 2, 3, 'Storytelling that sells', false, 420,
$md$Facts tell, stories sell. People remember stories far better than lists of features, and stories help them imagine themselves using your product.

## A simple story structure

1. **The hero** — your customer (not you).
2. **The problem** — what they were struggling with.
3. **The guide** — you, offering a plan or tool.
4. **The plan** — the steps or approach.
5. **The success** — what life looks like after.

This structure works for a sales page, a video script, a case study or even a single social post.

## Types of stories to collect

- **Customer stories:** how someone went from problem to result.
- **Origin story:** why you started this project.
- **Behind the scenes:** how you make or improve your product.
- **Lesson stories:** a mistake you made and what you learned.

## Make it specific

"I struggled with editing" is weak. "I spent six hours editing my first three-minute video and still hated it" is a story people feel.

## Try this

Write a 150-word customer story (real or from a research interview, with permission) using the five-part structure. Then turn it into a short social post.$md$),
  ('marketing-essentials', 3, 0, 'Content marketing and content pillars', false, 420,
$md$**Content marketing** means attracting customers by sharing genuinely useful material — posts, videos, articles, guides — instead of only advertising. It builds trust before you ever ask for a sale.

## Choose 3–5 content pillars

Content pillars are the main topics you'll talk about again and again. They should sit where your expertise meets your audience's problems.

Example for a video-editing coach:

1. Editing techniques (quick tips and tutorials)
2. Storytelling for video
3. Tools and workflow
4. Creator mindset and consistency
5. Behind the scenes and client results

## Mix your formats

For each pillar, use different formats:

- **Teach:** tutorials, how-tos, tips.
- **Show:** before-and-after, case studies, behind the scenes.
- **Share:** opinions, lessons, stories.
- **Sell:** occasional, clear invitations to your offer.

A common rule of thumb is to keep most content helpful, with selling as a small part of the mix.

## Repurpose

One long piece (a video or article) can become several short posts, a carousel, an email and a quote graphic.

## Try this

Define your content pillars in your workbook. Under each, brainstorm five post ideas.$md$),
  ('marketing-essentials', 3, 1, 'Choose your social platforms', false, 360,
$md$You don't need to be everywhere. Being consistent on one or two platforms beats being invisible on six.

## Pick based on your audience

Go where your persona already spends time. Some broad patterns:

- **Instagram and TikTok:** short visual content, strong for lifestyle, creative and personal brands.
- **YouTube:** longer videos and tutorials; also a search engine, so videos keep bringing views over time.
- **LinkedIn:** professional audiences, B2B services, careers.
- **X (Twitter) and Threads:** quick thoughts, conversations, news.
- **Facebook groups and online communities:** niche discussions and local audiences.

These change over time, so check where *your* audience is during your research.

## Learn the platform's language

Each platform has its own style. Watch what performs well in your niche: length, hooks, captions, posting times.

## Set up your profile like a mini landing page

- A clear photo or logo.
- A bio that states who you help and how.
- A link to your best next step (newsletter, website, offer).

## Try this

Choose one main platform and one secondary platform. Write or rewrite your bio on the main platform so it includes your audience, your benefit and a call to action.$md$),
  ('marketing-essentials', 3, 2, 'Plan a content calendar', false, 420,
$md$A content calendar turns good intentions into a reliable rhythm. It also saves you from the daily "what should I post?" panic.

## Choose a sustainable rhythm

Start with what you can keep up for three months. Three quality posts a week is better than daily posts for one week followed by silence.

## Build the calendar

Use a spreadsheet, a notes app or a simple table:

| Date | Platform | Pillar | Format | Idea | Status |
| --- | --- | --- | --- | --- | --- |
| Mon | Instagram | Editing tips | Carousel | 5 cuts every beginner should know | Draft |
| Wed | Instagram | Behind the scenes | Reel | Editing a client video in 60 seconds | Idea |
| Fri | Instagram | Mindset | Post | What I wish I knew in my first year | Idea |

## Batch your work

Create content in batches: one session to brainstorm, one to write or film, one to edit and schedule. Batching is faster than starting from zero every day.

## Hooks matter

The first line or first two seconds decide whether people stop scrolling. Strong hooks make a promise, ask a question or show a surprising result.

## Try this

Plan the next four weeks of content in a calendar, using your pillars. Write the hook for your first three posts.$md$),
  ('marketing-essentials', 3, 3, 'SEO basics: get found in search', false, 480,
$md$**Search engine optimisation (SEO)** helps your website, articles or videos appear when people search for answers. Unlike a social post, a well-ranked page can bring visitors for months or years.

## Start with keywords

A keyword is what people type into a search box. Find them by:

- Typing your topic into Google or YouTube and noting the autocomplete suggestions.
- Looking at the "People also ask" questions.
- Using a free keyword tool to compare search volume.

Look for specific phrases ("how to edit YouTube videos on a phone") rather than broad ones ("video editing"). They're easier to rank for and bring more motivated visitors.

## On-page basics

- Put the main keyword in the **title**, the **first paragraph** and a **heading**.
- Write a clear **meta description** (the snippet under the title in search results).
- Use descriptive headings and short paragraphs.
- Add **alt text** to images describing what they show.
- Link to your other related pages.

## Answer the question best

Search engines aim to show the most helpful result. The best long-term SEO strategy is to answer the searcher's question more clearly and completely than anyone else.

## Try this

Find five keyword phrases your audience searches for. Pick one and outline an article or video that answers it, with a title, three headings and a meta description.$md$),
  ('marketing-essentials', 4, 0, 'Why email still matters', false, 360,
$md$Social platforms can change their rules overnight and decide who sees your posts. Your **email list** is different: it's an audience you own, and people who sign up have actively asked to hear from you.

## What email is good for

- Building trust with regular, helpful messages.
- Announcing new products, offers and content.
- Turning followers into customers.
- Keeping customers engaged after they buy.

## The basics of permission

Only email people who have signed up, make it easy to unsubscribe, and include your contact details. Check the email marketing rules that apply where you and your subscribers live.

## Choose an email tool

Use an email marketing platform rather than your personal inbox. Most have free plans for small lists and handle sign-up forms, unsubscribes and scheduling.

## Your first welcome email

When someone joins, send a welcome email straight away:

1. Thank them and confirm what they'll get.
2. Deliver anything you promised (a guide, a template).
3. Tell them what to expect and how often.
4. Ask a simple question ("What's your biggest challenge with ___? Just hit reply.")

## Try this

Write your welcome email in your workbook using the four steps. Keep it under 200 words.$md$),
  ('marketing-essentials', 4, 1, 'Build your list with a lead magnet', false, 420,
$md$A **lead magnet** is a free, valuable resource you offer in exchange for an email address. It gives people a reason to join your list today.

## Good lead magnets are

- **Specific:** solve one clear problem.
- **Quick to use:** a checklist, template, short guide, mini-course or free workshop.
- **Connected to your offer:** someone who wants the lead magnet should be likely to want your paid product too.

Examples:

- "The 10-step checklist to edit your first YouTube video."
- "30 post ideas for new coaches."
- "A free 5-day email course: launch your portfolio website."

## Where to promote it

- Your social media bio link.
- At the end of useful posts and videos.
- A simple landing page on your website.
- Inside related articles.

## The landing page

Keep it focused: a clear headline, three bullet points on what they'll get, an image of the resource and one sign-up form. No distracting menus or links.

## Try this

Brainstorm three lead magnet ideas for your persona. Choose one and write the headline and three bullet points for its landing page.$md$),
  ('marketing-essentials', 4, 2, 'Write a simple email sequence', false, 420,
$md$An **email sequence** is a series of automated emails sent after someone joins. It introduces you, builds trust and, at the right moment, presents your offer.

## A five-email welcome sequence

1. **Day 0 — Welcome:** deliver the lead magnet and set expectations.
2. **Day 2 — Your story:** why you do this and who you help.
3. **Day 4 — Quick win:** a useful tip they can use today.
4. **Day 6 — Proof:** a customer story or case study.
5. **Day 8 — Offer:** present your product, who it's for, what they get and a clear call to action.

## Writing tips

- **Subject lines:** short, specific and curiosity-sparking. ("The 3-minute fix for shaky footage")
- **One email, one goal:** each email should have a single clear call to action.
- **Write like a person:** use "you" and "I", short paragraphs and plain language.
- **Make it scannable:** headings or bold key points for skimmers.

## After the sequence

Move subscribers into your regular newsletter, such as one helpful email a week.

## Try this

Write the subject lines for all five emails, then fully write email 3 (the quick win).$md$),
  ('marketing-essentials', 4, 3, 'Measure, test and your marketing plan', false, 480,
$md$Marketing improves when you measure what happens and make small changes. You don't need complicated dashboards; a few numbers checked regularly are enough.

## Pick a few key metrics

- **Reach:** how many people saw your content.
- **Engagement:** likes, comments, shares, saves — signs that content resonates.
- **Traffic:** visits to your website or landing page.
- **Conversion rate:** the percentage who take the action you want (sign up, buy). For example, 20 sign-ups from 400 visitors is a 5% conversion rate.
- **Email:** open rate and click rate.
- **Revenue and customers:** the result that pays the bills.

Focus on the metrics closest to your goal. Followers are nice; customers are better.

## Run simple tests

Change **one thing at a time** and compare: two headlines, two lead magnet titles, two email subject lines. Run the test long enough to get a meaningful number of visitors before you decide.

## Review monthly

Once a month, look at your numbers and ask: what worked best, what didn't, and what will I try next month?

## Your one-page marketing plan

Pull your workbook together into one page:

1. Goal and audience (persona).
2. Positioning statement and value proposition.
3. Content pillars, main platforms and posting rhythm.
4. Lead magnet and email sequence.
5. Key metrics and monthly review date.

## Try this

Write your one-page marketing plan, then mark this class as read to complete the course and claim your certificate.$md$),
  -- Editing: tell stories with video --------------------------------------
  ('video-editing-essentials', 0, 0, 'Welcome: what an editor really does', true, 300,
$md$Welcome to **Editing**. An editor does much more than cut out mistakes. Editing decides what the audience sees, in what order and for how long. It's where pacing, emotion and story come together.

## How this course works

- **5 modules**, each with **4 classes**, each ending with a **Try this** exercise.
- The skills apply in **any editing app**. We use general terms (timeline, clips, tracks) that every editor shares.
- You'll build one **course project** — a short video of 1–3 minutes — step by step.
- Complete every class to earn your **certificate**.

## What you need

- A computer, or a phone or tablet with an editing app.
- An editing app (free options are fine).
- Some footage: film a short topic you know well, a day in your life, a tutorial or a product review. Ten to twenty minutes of raw clips is plenty.

## The editor's mindset

Every decision should answer one question: **does this help the viewer understand or feel the story?** If a shot doesn't, it goes — however much you like it.

## Try this

Decide on your course project. Write one sentence describing it and who it's for, then film or gather your raw footage this week.$md$),
  ('video-editing-essentials', 0, 1, 'Choose your editing software', true, 360,
$md$The best editing app is the one you'll actually use. All the techniques in this course work in any of them.

## Common options

- **Free and beginner-friendly:** CapCut, iMovie (Mac and iPhone), Clipchamp (Windows).
- **Free and professional:** DaVinci Resolve — powerful colour and audio tools, with a steeper learning curve.
- **Paid professional:** Adobe Premiere Pro, Final Cut Pro (Mac).

## How to choose

Ask yourself:

1. **What device do I edit on?** Some apps are only on certain systems.
2. **What will I make?** Short vertical videos are easy in mobile apps; longer projects benefit from desktop editors.
3. **What can my computer handle?** Professional editors need more memory and a decent graphics processor.
4. **Do I want to grow into professional work?** Learning a professional app early can pay off later.

## Learn the interface, not every button

Every editor has the same core areas: a **media library** (your clips), a **viewer** (where you watch), a **timeline** (where you arrange clips) and **inspector or effects** panels. Learn those first.

## Try this

Install your chosen app. Find the media library, the viewer and the timeline, and import one clip. Write down the keyboard shortcuts for **play/pause**, **cut (split)** and **undo**.$md$),
  ('video-editing-essentials', 0, 2, 'Organise your footage', false, 420,
$md$Good organisation saves hours. A messy project leads to lost clips, missing files and broken edits.

## Set up a folder structure

Before importing anything, create one project folder with subfolders:

```
MyVideo/
  01_Footage
  02_Audio
  03_Music
  04_Graphics
  05_Project
  06_Exports
```

Keep everything for the video in this folder, and don't move or rename files after importing them, or the editor may lose the link to them.

## Name your clips

Rename clips with useful names before or after importing: `interview_wide_01`, `broll_kitchen_03`. Future you will be grateful.

## Watch everything once

Before you cut anything, watch all your footage. Mark the best moments (most apps let you add markers or favourites) and make quick notes:

- Strong lines of dialogue.
- Good B-roll (extra shots that illustrate what's being said).
- Mistakes to avoid.

## Back up

Keep a copy of your footage on a second drive or cloud storage. Drives fail at the worst moments.

## Try this

Create the folder structure for your course project, rename your clips and watch everything once, adding markers on your favourite moments.$md$),
  ('video-editing-essentials', 0, 3, 'The timeline and basic edits', false, 480,
$md$The **timeline** is where your video takes shape. Clips are arranged left to right in time, stacked on **tracks**: video tracks above, audio tracks below.

## Core edits every editor uses

- **Trim:** shorten the start or end of a clip by dragging its edge.
- **Split / cut (often called the razor or blade):** cut a clip into two at the playhead.
- **Delete and close the gap (ripple delete):** remove a section and pull everything after it left, so there's no empty space.
- **Move:** drag a clip to a new position.
- **Insert vs. overwrite:** insert pushes later clips along; overwrite replaces what's already there.

## Use In and Out points

Instead of dragging whole clips into the timeline, mark an **In** point and an **Out** point in the viewer to select only the part you want. It's faster and keeps the timeline tidy.

## Learn shortcuts early

Editing is thousands of small actions. Learning the shortcuts for play, split, trim and undo can double your speed.

## Save often

Turn on autosave and save versions as you go (`project_v1`, `project_v2`). If an edit goes wrong, you can always go back.

## Try this

Drag your best clips into the timeline. Practise trimming, splitting, ripple deleting and moving until each feels natural. Save the project as `project_v1`.$md$),
  ('video-editing-essentials', 1, 0, 'Find the story before you cut', false, 360,
$md$Footage doesn't come with a story; you build one. Before arranging clips, decide what the video needs to say.

## Write a one-sentence story

> This video shows **[who]** how to **[do what / understand what]** so that **[result]**.

If you can't write that sentence, the edit will wander.

## Use a simple structure

Most short videos follow three parts:

1. **Hook (first 3–10 seconds):** a question, surprising moment or promise that makes viewers stay.
2. **Body:** the main content, in a logical order — steps, examples or a story that builds.
3. **Ending:** a payoff or summary, and a call to action (subscribe, visit, comment).

## Paper edit

Write a list of your best moments (from your markers) in the order that tells the story. This **paper edit** takes ten minutes and saves hours of moving clips around.

## Kill your darlings

You'll have shots you love that don't serve the story. Cut them. A tighter video almost always beats a longer one.

## Try this

Write your one-sentence story and a paper edit for your course project: a numbered list of the moments you'll use for the hook, body and ending.$md$),
  ('video-editing-essentials', 1, 1, 'Build a rough cut', false, 420,
$md$A **rough cut** is the first full version of your edit. It's about structure, not polish: the right clips in the right order.

## Assemble first

Follow your paper edit and place clips on the timeline in order. Don't worry about exact cut points, music or colour yet.

## Cut the dead air

For talking videos, remove:

- Long pauses and "umms".
- False starts and repeated sentences.
- Tangents that don't serve the story.

This alone often cuts a video's length by a third.

## Watch it straight through

When the rough cut is assembled, watch it from start to finish without stopping. Note where:

- You got bored.
- Something was confusing.
- The energy dropped.

## Then tighten

Go back and fix those spots: trim, reorder or remove. Repeat the watch-and-tighten loop two or three times.

## Get fresh eyes

Leave the edit overnight, or show it to someone in your target audience. They'll notice problems you've stopped seeing.

## Try this

Assemble a full rough cut of your course project, cut the dead air, and do two watch-and-tighten passes. Save it as `project_v2_roughcut` and note its length.$md$),
  ('video-editing-essentials', 1, 2, 'Types of cuts and transitions', false, 480,
$md$Every cut is a choice. Knowing the main types gives you more ways to move the story forward.

## Common cuts

- **Hard cut (straight cut):** one clip ends, the next begins. The most common and usually the best default.
- **Jump cut:** a cut within the same shot that skips time. Popular in talking-head videos to remove pauses; adds energy.
- **J-cut:** the audio of the next clip starts *before* its video. You hear the next scene before you see it — smooth and natural.
- **L-cut:** the audio of the current clip continues *after* the cut to the next video. Great for showing B-roll while someone keeps talking.
- **Match cut:** connects two shots with a similar shape, movement or action (a ball thrown in one shot, caught in another place in the next).
- **Cutaway:** a quick cut to related footage, then back.

## Transitions

Dissolves, wipes and other transitions should be used **on purpose**: a dissolve can show time passing or a change of mood. Using a flashy transition on every cut looks amateur and distracts from the story.

## Cut on action

Cutting in the middle of a movement (someone turning, sitting, reaching) hides the edit, because the viewer's eye follows the action.

## Try this

In your rough cut, add at least one J-cut, one L-cut and one cut on action. Replace any decorative transitions with hard cuts and see if the video feels cleaner.$md$),
  ('video-editing-essentials', 1, 3, 'B-roll and coverage', false, 420,
$md$**A-roll** is your main footage — usually the person speaking or the main action. **B-roll** is the supporting footage that shows what's being talked about: hands at work, close-ups, locations, screen recordings, product shots.

## Why B-roll matters

- It keeps the video visually interesting.
- It shows instead of tells.
- It hides jump cuts and edits in the A-roll.
- It controls pacing: quick B-roll adds energy, slow B-roll adds calm.

## Plan your B-roll

While editing, note every moment where a visual would help: "When she mentions the old camera, show the camera." Film or find those shots.

## Shoot variety

For any action, capture a **wide** shot (context), a **medium** shot (the action) and a **close-up** (detail). Variety gives you options when editing.

## Layer it

Place B-roll on a video track above the A-roll, keeping the A-roll audio underneath. This is where L-cuts and J-cuts shine.

## Use stock footage carefully

Free stock sites can fill gaps, but check the licence and avoid overly generic clips that feel disconnected from your video.

## Try this

Add at least five B-roll shots to your course project, placed above the A-roll at moments that need a visual. Make sure at least one hides a jump cut.$md$),
  ('video-editing-essentials', 2, 0, 'Pacing and retention', false, 420,
$md$**Pacing** is how fast or slow a video feels. Good pacing keeps viewers watching; bad pacing makes them leave.

## Match pace to purpose

- **Fast:** entertainment, short social videos, hype and highlights.
- **Medium:** tutorials, explainers, vlogs.
- **Slow:** emotional moments, storytelling, calm or luxury brands.

Within one video, vary the pace. Constant speed of any kind becomes monotonous.

## Tools to control pace

- **Shot length:** shorter shots feel faster.
- **Cuts in dialogue:** removing pauses speeds things up; leaving a pause adds weight.
- **Music:** tempo strongly shapes how fast a video feels.
- **Movement:** camera moves, zooms and on-screen motion add energy.

## The first seconds

Many viewers decide whether to keep watching within the first few seconds. Start with your hook, not a long intro or logo animation.

## Use your analytics

If you publish online, check the audience retention graph. Sharp drops show exactly where viewers left. Watch those moments and ask what went wrong.

## Try this

Watch your edit and mark any moment that feels slow. Tighten each one. Check that your hook appears in the first five seconds.$md$),
  ('video-editing-essentials', 2, 1, 'Cutting to music', false, 420,
$md$Music shapes mood and pace more than almost anything else in an edit. Cutting in time with it makes a video feel polished and intentional.

## Choose music first, or early

For montages and short social videos, choose the track before you fine-tune the cuts, so the edit can follow its rhythm.

## Find the beat

Play the track and tap along. Many editors let you add **markers** while playing: tap the marker key on each beat or on important hits. Then cut your clips to land on those markers.

## Not every beat

Cutting on every single beat can feel mechanical. Cut on strong beats, at the start of musical phrases, or when the music changes. Let some shots breathe across several beats.

## Follow the structure of the song

Most tracks have quieter and bigger sections. Match them: calmer shots in the intro, your best and most energetic shots when the music builds.

## Music under speech

When someone is speaking, keep the music quiet and simple (no vocals) so it doesn't compete with the words.

## Use music legally

Only use music you have the rights to: royalty-free libraries, tracks with the right licence, or the music libraries built into platforms. Copyrighted songs can get your video muted or removed.

## Try this

Choose a licensed track for your course project. Add beat markers and recut one section (such as the intro or a montage) so the cuts land on the music.$md$),
  ('video-editing-essentials', 2, 2, 'Speed ramps, zooms and motion', false, 420,
$md$Motion effects add energy and emphasis when used with purpose.

## Speed changes

- **Slow motion** highlights a moment — an emotional reaction or a satisfying action. Footage looks smoothest when it was filmed at a higher frame rate (e.g. 60 fps or more).
- **Fast motion (time-lapse)** compresses long processes, like setting up a room or cooking a meal.
- **Speed ramps** move smoothly from normal to fast or slow within a clip, adding drama to transitions.

## Digital zooms and punch-ins

For talking videos, a quick **punch-in** (scaling the frame up by around 10–20%) on an important line adds emphasis and creates variety from a single camera angle. Zoom too far and the image gets soft.

## Keyframes

Keyframes tell the editor "at this moment, the value is X; at that moment, it's Y". The software animates between them. Use keyframes for:

- Slow zooms (a gentle push in during a story).
- Moving text or graphics.
- Panning across a photo.

## Easing

Smooth starts and stops (ease in, ease out) make motion feel natural. Linear motion often looks robotic.

## Less is more

If every clip zooms, nothing stands out. Save motion for moments that deserve it.

## Try this

Add one punch-in on a key line, one slow push-in with keyframes and one speed change to your project. Watch it back and remove any that feel unnecessary.$md$),
  ('video-editing-essentials', 2, 3, 'The fine cut', false, 360,
$md$The **fine cut** is where you polish timing frame by frame. Structure is locked; now you make every cut feel right.

## Check every cut

Play across each cut a few times. Ask:

- Does it happen at a natural moment?
- Is there a jump or flash that feels unintentional?
- Does the audio across the cut sound smooth?

## Trim tools

Most editors have trim modes:

- **Ripple trim:** changes a clip's length and shifts everything after it.
- **Roll trim:** moves the cut point between two clips without changing total length.
- **Slip:** changes which part of a clip is used, without moving it on the timeline.

These let you adjust a cut by a few frames without breaking the rest of the edit.

## Lock picture

When you're happy with the timing, consider the picture **locked**. From here, you'll work on sound, colour and graphics. Changing the cut now creates extra work later.

## Try this

Do a fine-cut pass on your course project. Use roll and slip trims on at least three cuts. When you're happy, save the project as `project_v3_locked`.$md$),
  ('video-editing-essentials', 3, 0, 'Why audio matters more than you think', false, 300,
$md$Viewers forgive slightly imperfect video much more readily than bad audio. Muffled speech, background hum or music that drowns out words makes people leave fast.

## The three layers of video sound

1. **Dialogue:** speech, voice-over, interviews. Usually the most important layer.
2. **Music:** sets mood and pace.
3. **Sound effects (SFX) and ambience:** whooshes, clicks, footsteps, room tone, nature sounds.

A good mix makes all three work together, with dialogue always clear.

## Listen properly

Edit audio with **headphones**, then check on laptop or phone speakers. Many viewers will watch on a phone.

## Organise your tracks

Put each layer on its own audio track: dialogue on tracks 1–2, music on 3, sound effects on 4–5. It makes adjusting levels much easier.

## Use waveforms

The waveform shows the volume of the audio. Large peaks are loud; flat lines are silence. Learning to read waveforms helps you spot problems and cut faster.

## Try this

Reorganise your course project's audio so dialogue, music and sound effects are each on their own tracks. Listen to the whole video once on headphones and once on a phone, and note every audio problem you hear.$md$),
  ('video-editing-essentials', 3, 1, 'Clean up dialogue', false, 420,
$md$Clear dialogue is the foundation of a good mix. Most editors include basic audio repair tools.

## Common fixes

- **Noise reduction:** reduces constant background noise like hum, fans or air conditioning. Use it gently; too much makes voices sound robotic.
- **EQ (equaliser):** adjusts frequencies. A **high-pass filter** (also called low cut) around 80–100 Hz removes rumble. A small boost around 2–5 kHz can improve clarity.
- **Compression:** reduces the gap between loud and quiet parts, so speech stays at a steady level.
- **De-essing:** softens harsh "s" sounds.

## Smooth the edits

Cutting speech can cause clicks or sudden changes in background noise. Add very short audio **crossfades** at cuts and use **room tone** (a few seconds of the quiet room recording) to fill gaps.

## Volume consistency

Adjust each clip so the voice sounds equally loud throughout. Many apps have a "normalise" or auto-volume function as a starting point.

## Prevention beats repair

Next time you film, get the microphone close to the speaker and record in a quiet, soft-furnished room. It's much easier than fixing it afterwards.

## Try this

Apply a high-pass filter and light noise reduction to your dialogue. Even out the volume across clips and add short crossfades to any cuts that click.$md$),
  ('video-editing-essentials', 3, 2, 'Music, sound effects and ambience', false, 420,
$md$Music and sound effects bring a video to life, as long as they support the dialogue instead of fighting it.

## Ducking music under speech

When someone talks, the music should drop. You can:

- Lower the music volume with keyframes wherever there's speech.
- Use your editor's auto-ducking feature, which lowers music whenever dialogue is detected.

As a rough guide, music under speech should sit well below the voice, so the words are always easy to follow.

## Sound effects add polish

Subtle sounds make edits feel professional:

- A soft **whoosh** on a quick transition or moving text.
- A **click** or **pop** when something appears on screen.
- **Ambience** (room, street, nature sounds) to make scenes feel real and smooth over cuts.

Keep them subtle. If viewers notice every effect, they're too loud.

## Silence is a tool

A moment without music can be powerful: before a big reveal, after an emotional line or to reset energy.

## Fades

Fade music in and out rather than starting or stopping abruptly, unless a hard stop is the point.

## Try this

Duck the music under all dialogue in your project. Add three subtle sound effects at moments that need emphasis, and fade the music out at the end.$md$),
  ('video-editing-essentials', 3, 3, 'Mixing and loudness', false, 360,
$md$**Mixing** is balancing all the audio so the final video sounds clear and consistent on any device.

## Mix in order

1. **Dialogue first:** set it to a clear, consistent level.
2. **Music next:** bring it up until it supports the mood without masking speech.
3. **Effects last:** add them in at a subtle level.

## Watch your meters

Your editor's audio meters show the level in **decibels (dB)**. Avoid peaks hitting 0 dB, which causes distortion (clipping). Keep loud peaks a few decibels below.

## Loudness standards

Platforms measure overall loudness in **LUFS**. Many streaming platforms normalise to roughly −14 LUFS, and broadcast standards are often around −23 or −24 LUFS. Some editors can measure and adjust this automatically. If yours can't, aim for dialogue that sounds clear and consistent and peaks that don't clip.

## Check on multiple devices

Listen on headphones, laptop speakers and a phone. If the speech is clear on all three, your mix is in good shape.

## Try this

Mix your course project in the order above. Check that nothing clips, and test it on three devices. Note one change you made after each test.$md$),
  ('video-editing-essentials', 4, 0, 'Colour correction basics', false, 420,
$md$**Colour correction** makes footage look natural and consistent. It comes before **grading**, which adds a creative look.

## Read the scopes

Most editors offer **scopes**: graphs of brightness and colour.

- **Waveform:** brightness across the frame. The bottom is black, the top is white. Keep important detail between them.
- **Vectorscope:** colour saturation and hue. Skin tones usually sit along a line between red and yellow, often called the skin-tone line.

Scopes don't lie, even when your screen does.

## The correction order

1. **Exposure:** adjust brightness so the image isn't too dark or bright.
2. **Contrast:** set the darkest blacks and brightest whites.
3. **White balance:** remove unwanted colour casts (too blue, too orange). Find something that should be white or grey and neutralise it.
4. **Saturation:** adjust overall colour intensity, gently.

## Match your shots

Clips from different cameras or times of day can look different. Correct them so they match, especially within the same scene. Many editors have a shot-matching tool.

## Try this

Colour-correct every clip in your course project using the four steps. Use the waveform to check exposure and make sure skin tones look natural.$md$),
  ('video-editing-essentials', 4, 1, 'Grading and creating a look', false, 360,
$md$Once footage is corrected, **colour grading** gives it a mood and style.

## Common looks

- **Warm:** oranges and golds, cosy and friendly.
- **Cool:** blues and teals, calm, modern or serious.
- **Teal and orange:** cool shadows and warm skin tones — popular in film and travel videos.
- **Muted or film-like:** lower saturation, softer contrast.
- **High contrast and punchy:** bold, energetic.

## How to grade

- Adjust **shadows, midtones and highlights** separately (often called lift, gamma and gain, or colour wheels).
- Use **curves** for precise control of contrast and colour.
- Try **LUTs** (look-up tables) as a starting point, then reduce their strength and fine-tune.

## Keep skin natural

Whatever the look, faces should still look healthy. If skin turns grey, green or orange, pull back.

## Consistency

Apply the same grade across the whole video, or a deliberate change for a different section. Save your grade as a preset so you can reuse it.

## Try this

Create a look that matches your video's mood. Apply it to the whole project, check skin tones with the vectorscope and save it as a preset.$md$),
  ('video-editing-essentials', 4, 2, 'Titles, text and captions', false, 420,
$md$Text on screen helps viewers follow along, especially the many who watch without sound.

## Titles and lower thirds

- **Title card:** the name of the video or section.
- **Lower third:** a name and role shown in the lower part of the frame when someone speaks.
- **Callouts and labels:** highlight steps, numbers or key words.

## Typography tips

- Use one or two fonts that match your brand.
- Make text large enough to read on a phone.
- Ensure strong contrast: light text on dark backgrounds or add a subtle shadow or box.
- Leave text on screen long enough to read twice.
- Keep it inside the **safe areas**, away from the edges where platform buttons can cover it.

## Captions

Captions make videos accessible to deaf and hard-of-hearing viewers, and help everyone who watches muted. Many editors can **auto-generate** captions; always review them for mistakes, especially names and technical words.

- Burned-in (open) captions are part of the image — common for short social videos.
- Caption files (such as SRT) can be uploaded separately and turned on or off by the viewer.

## Try this

Add a title card, one lower third and captions to your course project. Check every caption for accuracy and make sure all text is readable on a phone screen.$md$),
  ('video-editing-essentials', 4, 3, 'Export settings and publishing', false, 480,
$md$Exporting turns your project into a video file. The right settings keep quality high and file sizes manageable.

## Key settings

- **Resolution:** match your project — 1920×1080 (1080p) is a safe standard; 3840×2160 (4K) if your footage supports it.
- **Aspect ratio:** 16:9 for YouTube and websites, 9:16 for Reels, Shorts and TikTok, 1:1 or 4:5 for some feed posts.
- **Frame rate:** keep it the same as your footage (often 24, 25, 30 or 60 fps).
- **Format and codec:** an MP4 file with the H.264 codec plays almost everywhere. H.265 (HEVC) gives smaller files at similar quality but isn't supported everywhere.
- **Bitrate:** higher means better quality and bigger files. Most editors have platform presets that choose sensible values.

## Use presets, then check

Start with your editor's platform preset (for example "YouTube 1080p"), export and **watch the whole file** before uploading. Check for glitches, missing media, audio sync and caption errors.

## Before publishing

- Create a clear **thumbnail** (for YouTube and long videos).
- Write a title and description with keywords people search for.
- Upload captions if they're not burned in.

## Archive the project

Keep the project folder, including footage and the final export, so you can revisit or re-edit later.

## Try this

Export your course project with the right settings for your main platform, watch the full export, then publish or share it. Mark this class as read to complete the course and claim your certificate.$md$),
  -- Coding: build your first website --------------------------------------
  ('coding-for-beginners', 0, 0, 'Welcome: how this course works', true, 300,
$md$Welcome to **Coding**. By the end of this course you'll have built and published your own website, and you'll understand the code behind it.

## How the course is built

- **5 modules**, each with **4 classes**. Every class ends with a **Try this** exercise.
- You'll **type the code yourself**. Copying and pasting skips the part where your brain learns.
- Complete every class to earn your **certificate**.

## What you'll learn

1. How the web works and how to set up your tools.
2. **HTML** — the structure and content of a page.
3. **CSS** — colours, fonts, spacing and layout.
4. **JavaScript** — making pages interactive.
5. **Git** and publishing — saving your work and putting it online.

## What you need

- A computer (Windows, Mac or Linux). A tablet won't be enough for this course.
- A modern web browser, such as Chrome, Firefox, Edge or Safari.
- 20–30 minutes a day. Short, regular practice beats long, rare sessions.

## When you get stuck

Getting stuck is normal; it's how programmers spend much of their time. Read the error message, check for typos, and search the exact error online. Explaining the problem out loud, even to nobody, often reveals the answer.

## Try this

Write down why you want to learn to code and one website you'd love to build by the end of the course.$md$),
  ('coding-for-beginners', 0, 1, 'How the web works', true, 420,
$md$Before writing code, it helps to know what happens when you visit a website.

## Clients and servers

- Your **browser** is the **client**. It requests pages.
- A **server** is a computer that stores websites and sends them when asked.
- When you type an address, your browser sends a request over the internet, and the server responds with files.

## Addresses and DNS

A **URL** such as `https://example.com/about` is a web address. Computers find each other by numeric IP addresses, so the **Domain Name System (DNS)** translates `example.com` into the right number, like a phone book.

## HTTP and HTTPS

The browser and server talk using **HTTP**. **HTTPS** is the secure version: it encrypts the conversation, so others can't read it. Look for the padlock in the address bar.

## The three languages of a web page

- **HTML** defines the content and structure: headings, paragraphs, images, links.
- **CSS** controls presentation: colours, fonts, layout.
- **JavaScript** adds behaviour: reacting to clicks, updating content, fetching data.

Think of a house: HTML is the walls and rooms, CSS is the paint and furniture, JavaScript is the electricity.

## Try this

Open any website, right-click and choose **View page source**. Find one HTML tag you recognise (like `<h1>` or `<p>`). Then open your browser's **developer tools** (usually F12) and explore the Elements panel.$md$),
  ('coding-for-beginners', 0, 2, 'Set up your coding tools', false, 420,
$md$You only need two tools to start: a code editor and a browser.

## Install a code editor

A code editor is a text editor built for code. It colours your code, spots errors and saves time. **Visual Studio Code (VS Code)** is free, popular and works on every system. Download it from its official website.

## Useful VS Code extensions

- **Live Server:** opens your page in the browser and refreshes automatically when you save.
- **Prettier:** formats your code neatly.

## Create your project folder

Make a folder called `my-website` somewhere easy to find, such as your Documents folder. Open it in VS Code with **File → Open Folder**.

## Your first file

Create a new file called `index.html` and type:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My first page</title>
  </head>
  <body>
    <h1>Hello, world!</h1>
  </body>
</html>
```

Save it, right-click the file and choose **Open with Live Server** (or double-click the file to open it in your browser).

## Learn three shortcuts

- **Save:** Ctrl + S (Cmd + S on Mac).
- **Undo:** Ctrl + Z (Cmd + Z).
- **Comment a line:** Ctrl + / (Cmd + /).

## Try this

Set up VS Code and Live Server, create `index.html`, and change the heading text to your own name. Watch the browser update when you save.$md$),
  ('coding-for-beginners', 0, 3, 'Think like a programmer', false, 360,
$md$Programming isn't mainly about memorising syntax. It's about breaking problems into small, clear steps, and that's a skill you can practise.

## Decompose the problem

Big problems are made of small ones. "Build a website" becomes: create a page, add a heading, add a menu, style the menu, make it work on phones… Each step is manageable.

## Write it in plain words first

Before coding, describe the steps in plain language. This is called **pseudocode**:

```
when the button is clicked
  if the menu is hidden
    show the menu
  otherwise
    hide the menu
```

Translating clear steps into code is much easier than inventing both at once.

## Work in small steps

Write a little code, save, check it works, then add more. If something breaks, you'll know it was the last small change.

## Read error messages

Errors are clues, not insults. They usually tell you **what** went wrong and **where** (a line number). Start there.

## Searching is part of the job

Professional developers search for answers every day. Good sources include MDN Web Docs (developer.mozilla.org) for HTML, CSS and JavaScript reference.

## Try this

Write pseudocode for a simple everyday process, such as making tea or logging into a website. Make each step small enough that a computer could follow it literally.$md$),
  ('coding-for-beginners', 1, 0, 'HTML elements and page structure', false, 420,
$md$HTML (HyperText Markup Language) describes the content of a page using **elements**, written with **tags**.

## Anatomy of an element

```html
<p class="intro">This is a paragraph.</p>
```

- `<p>` is the **opening tag** and `</p>` the **closing tag**.
- `class="intro"` is an **attribute**: extra information about the element.
- The text between the tags is the **content**.

Some elements are empty and have no closing tag, like `<img />` and `<br />`.

## The page skeleton

Every HTML page follows the same basic structure:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page title</title>
  </head>
  <body>
    <!-- visible content goes here -->
  </body>
</html>
```

- `<head>` holds information about the page (title, settings, links to CSS).
- `<body>` holds everything the visitor sees.
- `<!-- ... -->` is a **comment**: notes for humans that the browser ignores.

## Nesting

Elements go inside other elements, like boxes in boxes. Close them in the reverse order you opened them, and indent nested elements so the structure is easy to read.

## Try this

Update your `index.html` to match the skeleton above, including the viewport meta tag. Add a comment explaining what the `<head>` section is for.$md$),
  ('coding-for-beginners', 1, 1, 'Text, links and images', false, 480,
$md$Most of the web is text, links and images. These elements cover most of what you'll write.

## Headings and paragraphs

```html
<h1>Main page title</h1>
<h2>Section heading</h2>
<h3>Sub-section heading</h3>
<p>A paragraph of text. You can make words <strong>important</strong> or add <em>emphasis</em>.</p>
```

Use **one `<h1>` per page**, then `<h2>` to `<h6>` in order. Headings describe structure, not size; you'll control size with CSS.

## Links

```html
<a href="https://developer.mozilla.org">MDN Web Docs</a>
<a href="about.html">About me</a>
<a href="#contact">Jump to contact section</a>
```

The `href` attribute is the destination: another website, another page in your project, or a section on the same page.

## Images

```html
<img src="images/photo.jpg" alt="Me hiking in the mountains" width="600" />
```

- `src` is the image file's location.
- `alt` describes the image for people using screen readers, and appears if the image fails to load. Always include it.

## Lists

```html
<ul>
  <li>HTML</li>
  <li>CSS</li>
</ul>

<ol>
  <li>Plan</li>
  <li>Build</li>
</ol>
```

`<ul>` is a bulleted list; `<ol>` is numbered.

## Try this

Add an `images` folder to your project with one photo. On your page, add an `<h2>` "About me", a short paragraph, your photo with good alt text, a list of three hobbies and a link to a website you like.$md$),
  ('coding-for-beginners', 1, 2, 'Semantic HTML and page layout', false, 420,
$md$**Semantic** elements describe what their content *means*, not just how it looks. They help search engines, screen readers and other developers understand your page.

## Layout elements

```html
<body>
  <header>
    <nav>
      <a href="#about">About</a>
      <a href="#projects">Projects</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>

  <main>
    <section id="about">
      <h2>About me</h2>
      <p>...</p>
    </section>

    <section id="projects">
      <h2>Projects</h2>
      <article>
        <h3>Project one</h3>
        <p>...</p>
      </article>
    </section>
  </main>

  <footer>
    <p>© 2026 Your Name</p>
  </footer>
</body>
```

- `<header>`: introductory content and navigation.
- `<nav>`: a group of navigation links.
- `<main>`: the main content (one per page).
- `<section>`: a thematic group of content, usually with a heading.
- `<article>`: a self-contained piece, like a blog post or project card.
- `<footer>`: closing information.

## div and span

`<div>` (block) and `<span>` (inline) are generic containers with no meaning. Use them for styling when no semantic element fits.

## Accessibility bonus

Screen-reader users can jump between landmarks like `<nav>` and `<main>`. Semantic HTML makes your site usable for more people at no extra cost.

## Try this

Restructure your page with `<header>`, `<nav>`, `<main>`, at least two `<section>` elements and a `<footer>`. Make the nav links jump to each section using `id` attributes.$md$),
  ('coding-for-beginners', 1, 3, 'Forms and inputs', false, 420,
$md$Forms let visitors send information: sign-ups, contact messages, searches.

## A simple contact form

```html
<form action="#" method="post">
  <label for="name">Name</label>
  <input id="name" name="name" type="text" required />

  <label for="email">Email</label>
  <input id="email" name="email" type="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" rows="5"></textarea>

  <button type="submit">Send</button>
</form>
```

## Important parts

- `<label>` describes each field. Its `for` attribute matches the input's `id`, so clicking the label focuses the field, and screen readers announce it.
- `type` changes the input: `text`, `email`, `password`, `number`, `date`, `checkbox`, `radio` and more. The right type gives mobile users the right keyboard.
- `name` is the key the data is sent under.
- `required` stops the form from submitting while the field is empty.

## Where does the data go?

The `action` attribute says where the form sends data. A real form needs a server or a form service to receive it. For now, `action="#"` keeps it on the page; in the final module you'll see simple ways to connect a form.

## Try this

Add a `<section id="contact">` to your page with the contact form above. Try submitting it empty, then with an invalid email, and see how the browser responds.$md$),
  ('coding-for-beginners', 2, 0, 'CSS basics: selectors and properties', false, 480,
$md$CSS (Cascading Style Sheets) controls how HTML looks.

## Connect a stylesheet

Create a file called `styles.css` and link it inside your `<head>`:

```html
<link rel="stylesheet" href="styles.css" />
```

## Anatomy of a rule

```css
h1 {
  color: #0056d2;
  font-size: 2.5rem;
}
```

- `h1` is the **selector**: which elements to style.
- `color` and `font-size` are **properties**; `#0056d2` and `2.5rem` are **values**.

## Common selectors

```css
p { }            /* every <p> element */
.card { }        /* elements with class="card" */
#about { }       /* the element with id="about" */
nav a { }        /* <a> elements inside <nav> */
a:hover { }      /* links while the mouse is over them */
```

Prefer **classes** for styling. They're reusable and easy to manage.

## Text and colour

```css
body {
  font-family: system-ui, sans-serif;
  line-height: 1.6;
  color: #1f2937;
  background-color: #ffffff;
}
```

Colours can be names (`navy`), hex codes (`#0056d2`) or `rgb(0 86 210)`.

## The cascade

When several rules target the same element, more specific selectors win, and later rules override earlier ones with equal specificity. That's the "cascading" in CSS.

## Try this

Create `styles.css`, link it, and style your `body` font, the colour of your headings, and a hover colour for links.$md$),
  ('coding-for-beginners', 2, 1, 'The box model and spacing', false, 420,
$md$Every element on a page is a rectangular **box**. Understanding the box model is the key to controlling spacing.

## The four layers

From the inside out:

1. **Content** — the text or image.
2. **Padding** — space inside the box, around the content.
3. **Border** — a line around the padding.
4. **Margin** — space outside the box, separating it from other elements.

```css
.card {
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 16px;
}
```

## Make sizing predictable

By default, padding and border are *added* to an element's width. Most developers switch this off with:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

Now `width: 300px` means the whole box is 300px, including padding and border.

## Units

- `px` — fixed pixels.
- `rem` — relative to the root font size (usually 16px); great for text and spacing.
- `%` — relative to the parent's size.
- `vw` / `vh` — a percentage of the viewport's width or height.

## Inspect it

In your browser's developer tools, select an element and look at the box-model diagram. It shows exact padding, border and margin values.

## Try this

Add the `box-sizing` rule to your stylesheet. Give your sections padding, style your project `<article>` elements as cards with a border, rounded corners and margin, and inspect one card's box model in the developer tools.$md$),
  ('coding-for-beginners', 2, 2, 'Flexbox and Grid layouts', false, 480,
$md$Modern CSS has two powerful layout systems: **Flexbox** for one direction (a row *or* a column) and **Grid** for two (rows *and* columns).

## Flexbox: a navigation bar

```css
nav {
  display: flex;
  justify-content: space-between; /* spacing along the row */
  align-items: center;            /* vertical alignment */
  gap: 16px;                      /* space between items */
}
```

Useful Flexbox properties:

- `flex-direction: row | column`
- `justify-content: flex-start | center | space-between`
- `align-items: stretch | center | flex-start`
- `flex-wrap: wrap` to let items move to a new line.

## Grid: a project gallery

```css
.projects {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
```

- `1fr` means "one fraction of the available space", so three equal columns.
- `gap` sets spacing between rows and columns.

A grid that adapts automatically:

```css
.projects {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}
```

Columns are at least 250px wide, and as many as fit are created.

## When to use which

- Flexbox: navbars, button groups, centring something, a row of items.
- Grid: page layouts, card galleries, anything with rows and columns.

## Try this

Lay out your nav links with Flexbox, and wrap your project cards in a `<div class="projects">` that uses the auto-fit Grid example. Add at least three cards.$md$),
  ('coding-for-beginners', 2, 3, 'Responsive design', false, 420,
$md$More than half of web traffic comes from phones. **Responsive design** makes your site work well on any screen size.

## Start with the viewport tag

Make sure your `<head>` contains:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

Without it, phones show a zoomed-out desktop version.

## Flexible by default

- Use relative units (`rem`, `%`) rather than fixed widths.
- Make images shrink with their container:

```css
img {
  max-width: 100%;
  height: auto;
}
```

## Media queries

Media queries apply styles only when a condition is true, such as a minimum screen width:

```css
.projects {
  display: grid;
  grid-template-columns: 1fr;          /* phones: one column */
  gap: 16px;
}

@media (min-width: 768px) {
  .projects {
    grid-template-columns: repeat(2, 1fr); /* tablets: two */
  }
}

@media (min-width: 1100px) {
  .projects {
    grid-template-columns: repeat(3, 1fr); /* desktops: three */
  }
}
```

Writing phone styles first and adding larger screens with `min-width` is called **mobile-first** design.

## Test it

Open developer tools and use **device mode** to preview your page at different sizes. Drag the window narrower and watch where the layout breaks.

## Try this

Make your page responsive: add the image rule, convert your project grid to the mobile-first example, and check it at phone, tablet and desktop sizes.$md$),
  ('coding-for-beginners', 3, 0, 'Variables, data types and the console', false, 480,
$md$JavaScript is the programming language of the web. It runs in every browser.

## Connect a script

Create `script.js` and add this just before the closing `</body>` tag:

```html
<script src="script.js"></script>
```

## The console

Open developer tools and go to the **Console** tab. It shows messages and errors. In `script.js`:

```js
console.log("Hello from JavaScript!");
```

Save and refresh; you'll see the message.

## Variables

Variables store values. Use `const` for values that won't be reassigned and `let` for ones that will:

```js
const name = "Ana";
let score = 0;
score = score + 10;
console.log(name, score); // Ana 10
```

Avoid the older `var` keyword in new code.

## Data types

```js
const text = "Hello";          // string
const age = 28;                 // number
const isLearning = true;        // boolean
const skills = ["HTML", "CSS"]; // array (a list)
const person = {                // object (named values)
  name: "Ana",
  city: "Lisbon",
};
console.log(skills[0]);    // HTML
console.log(person.city);  // Lisbon
```

## Template strings

Backticks let you insert values into text:

```js
console.log(`My name is ${name} and I'm learning ${skills.length} skills.`);
```

## Try this

Link `script.js` to your page. Create variables for your name, age and an array of three skills, then log a sentence using a template string.$md$),
  ('coding-for-beginners', 3, 1, 'Functions, conditions and loops', false, 480,
$md$These three ideas let your code make decisions and repeat work.

## Functions

A function is a reusable block of code:

```js
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet("Ana")); // Hello, Ana!
```

The same function written as an **arrow function**:

```js
const greet = (name) => `Hello, ${name}!`;
```

## Conditions

```js
const hour = new Date().getHours();

if (hour < 12) {
  console.log("Good morning");
} else if (hour < 18) {
  console.log("Good afternoon");
} else {
  console.log("Good evening");
}
```

Comparison operators: `===` (equal), `!==` (not equal), `<`, `>`, `<=`, `>=`. Combine conditions with `&&` (and) and `||` (or).

Use `===` rather than `==`; it doesn't silently convert types.

## Loops

Repeat code for each item in a list:

```js
const skills = ["HTML", "CSS", "JavaScript"];

for (const skill of skills) {
  console.log(`I'm learning ${skill}`);
}

skills.forEach((skill, index) => {
  console.log(index + 1, skill);
});
```

## Try this

Write a function `greeting()` that returns "Good morning", "Good afternoon" or "Good evening" based on the current hour. Then loop over an array of three friends' names and log a personalised greeting for each.$md$),
  ('coding-for-beginners', 3, 2, 'The DOM: change the page with code', false, 420,
$md$The **DOM (Document Object Model)** is the browser's live model of your HTML. JavaScript can read and change it, which is how pages update without reloading.

## Select elements

```js
const heading = document.querySelector("h1");        // first match
const cards = document.querySelectorAll(".card");    // all matches
const form = document.querySelector("#contact form");
```

`querySelector` uses the same selectors as CSS.

## Change content and style

```js
heading.textContent = "Welcome to my portfolio";
heading.classList.add("highlight");
heading.classList.toggle("hidden");
```

Changing classes is usually better than changing styles directly; keep the styles in your CSS.

## Create new elements

```js
const list = document.querySelector("#skills");
const item = document.createElement("li");
item.textContent = "JavaScript";
list.append(item);
```

## Build from data

```js
const skills = ["HTML", "CSS", "JavaScript", "Git"];
const list = document.querySelector("#skills");

for (const skill of skills) {
  const li = document.createElement("li");
  li.textContent = skill;
  list.append(li);
}
```

## Use textContent for text

To insert plain text, use `textContent`, not `innerHTML`. Using `innerHTML` with text from users can let them inject harmful code.

## Try this

Add an empty `<ul id="skills"></ul>` to your page. Use JavaScript to fill it from an array of skills. Then change your `<h1>` text with `textContent`.$md$),
  ('coding-for-beginners', 3, 3, 'Events and a mini project', false, 480,
$md$**Events** are things that happen on the page: clicks, key presses, form submissions. JavaScript can listen for them and respond.

## Listening for a click

```js
const button = document.querySelector("#theme-toggle");

button.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
```

And in your CSS:

```css
body.dark {
  background-color: #0b1736;
  color: #f8fafc;
}
```

## Common events

- `click` — an element was clicked.
- `input` — a field's value changed.
- `submit` — a form was submitted.
- `keydown` — a key was pressed.

## Handling a form

```js
const form = document.querySelector("#contact form");
const status = document.querySelector("#form-status");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page reloading
  const name = form.elements.name.value.trim();
  status.textContent = `Thanks, ${name}! Your message is ready to send.`;
  form.reset();
});
```

## Mini project: a mobile menu

1. Add a button with `id="menu-button"` to your header.
2. In CSS, hide the nav on small screens unless it has an `open` class.
3. In JavaScript, toggle the `open` class on the nav when the button is clicked.

## Try this

Add a dark-mode toggle button to your page, and handle your contact form's submit event to show a thank-you message in a `<p id="form-status"></p>` element.$md$),
  ('coding-for-beginners', 4, 0, 'Version control with Git', false, 480,
$md$**Git** records snapshots of your project over time. You can see what changed, undo mistakes and work with others without overwriting each other's code.

## Install and set up

Download Git from its official website and install it. Then, in a terminal (VS Code has one built in: **Terminal → New Terminal**), set your name and email:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## The basic workflow

```bash
git init                 # start tracking this folder (once)
git status               # see what has changed
git add .                # stage all changes for the next snapshot
git commit -m "Add contact form"   # save a snapshot with a message
git log --oneline        # list your snapshots
```

## Three areas

1. **Working directory:** your files as they are now.
2. **Staging area:** changes you've chosen for the next commit (`git add`).
3. **Repository:** the saved history of commits (`git commit`).

## Good commit messages

Write short messages in the present tense that say what the commit does: "Add project grid", "Fix mobile menu", "Update about section". Commit small, related changes often.

## Ignore files

Create a `.gitignore` file listing things Git shouldn't track, such as system files:

```
.DS_Store
Thumbs.db
```

## Try this

Initialise Git in your `my-website` folder, make your first commit, then make a small change and commit again. Run `git log --oneline` to see both commits.$md$),
  ('coding-for-beginners', 4, 1, 'GitHub and collaboration', false, 420,
$md$**GitHub** is a website that hosts Git repositories online. It's a backup, a portfolio that employers look at and a place to collaborate.

## Push your project to GitHub

1. Create a free GitHub account.
2. Click **New repository**, name it `my-website` and leave it empty (no README).
3. Copy the commands GitHub shows under "push an existing repository". They look like:

```bash
git remote add origin https://github.com/your-username/my-website.git
git branch -M main
git push -u origin main
```

After the first push, sending new commits is just:

```bash
git push
```

## Branches

A **branch** is a separate line of work. Use one to try a feature without affecting your main code:

```bash
git switch -c dark-mode     # create and switch to a new branch
# ...make changes and commit...
git switch main             # go back to main
git merge dark-mode         # bring the changes in
```

## Pull requests

On team projects, you push a branch to GitHub and open a **pull request**: a request for others to review your changes before they're merged.

## Write a README

A `README.md` file explains your project: what it is, how to run it and what you learned. GitHub shows it on the repository's front page.

## Try this

Push your project to GitHub. Create a `README.md` describing your site, commit it and push again. Check that it appears on your repository page.$md$),
  ('coding-for-beginners', 4, 2, 'Build your portfolio project', false, 540,
$md$Time to bring everything together into a portfolio website: a personal site that shows who you are and what you can do.

## Plan it

Sketch the page on paper first:

1. **Header** with your name and navigation.
2. **Hero** section: a one-line introduction and a call-to-action button.
3. **About** section with a photo and short bio.
4. **Projects** section with at least three cards (title, description, link).
5. **Skills** list generated with JavaScript.
6. **Contact** section with your form.
7. **Footer.**

## Build it in steps

- **HTML first:** write the full structure with real content.
- **CSS next:** colours, fonts and spacing, then layout with Flexbox and Grid, then media queries for phones.
- **JavaScript last:** dark-mode toggle, mobile menu, form message and skills list.

Commit after each step with a clear message.

## Check the details

- Every image has alt text.
- Headings are in order (one `<h1>`, then `<h2>`, `<h3>`).
- Text is readable: good contrast and a comfortable size.
- It works on a phone-sized screen.
- No errors in the browser console.

## Use real projects

If you don't have three projects yet, include the exercises from this course: your styled form, your responsive grid, your JavaScript mini project. Describe what you learned building each one.

## Try this

Build your portfolio following the plan, committing after each step. Ask a friend to try it on their phone and note any problems.$md$),
  ('coding-for-beginners', 4, 3, 'Publish your site and keep learning', false, 420,
$md$A website isn't finished until people can visit it. Static sites like yours — HTML, CSS and JavaScript — can be published for free.

## Option 1: GitHub Pages

1. Open your repository on GitHub.
2. Go to **Settings → Pages**.
3. Under "Build and deployment", choose to deploy from a branch, select `main` and the root folder, and save.
4. After a minute or two, your site will be live at `https://your-username.github.io/my-website/`.

Every time you push to `main`, the site updates.

## Option 2: Other static hosts

Services such as Netlify, Vercel and Cloudflare Pages can also host your site for free. Connect your GitHub repository, and they publish it automatically on every push.

## Connect your form

Static hosts don't run server code, so a form needs somewhere to send data. Some hosts offer built-in form handling, and there are form services you can point your form's `action` to. Read their documentation before using one.

## Custom domain (optional)

You can buy a domain name (like `yourname.com`) from a registrar and connect it in your host's settings.

## Where to go next

- **Deepen JavaScript:** arrays and objects, `fetch` for loading data, modules.
- **Accessibility:** learn to test with a keyboard and a screen reader.
- **A framework:** once you're comfortable, try React, Vue or Svelte.
- **Build more projects:** a to-do app, a quiz, a weather page using a public API.

## Try this

Publish your portfolio and share the link with someone. Add the live link to your README. Then mark this class as read to complete the course and claim your certificate.$md$);


  insert into public.lessons (module_id, course_id, title, type, position, is_preview, duration_sec)
  select mo.id, c.id, l.title, 'article'::public.lesson_type, l.lpos, l.preview, l.dur
  from seed_lessons l
  join public.courses c on c.slug = l.slug
  join public.modules mo on mo.course_id = c.id and mo.position = l.mpos;

  insert into public.lesson_contents (lesson_id, body_md)
  select le.id, l.body
  from seed_lessons l
  join public.courses c on c.slug = l.slug
  join public.modules mo on mo.course_id = c.id and mo.position = l.mpos
  join public.lessons le on le.module_id = mo.id and le.position = l.lpos;
end
$seed$;
