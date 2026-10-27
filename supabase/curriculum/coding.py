COURSE = {
    "slug": "coding-for-beginners",
    "title": "Coding: build your first website",
    "subtitle": "Learn HTML, CSS and JavaScript from zero, then publish a real project with Git.",
    "description": (
        "This course takes you from no coding experience to a published website you built yourself. You'll "
        "learn how the web works, structure pages with HTML, style them with CSS, add interactivity with "
        "JavaScript, and use Git to save and share your work. Every class is a short reading with code you "
        "type yourself, and the final module walks you through building and publishing a portfolio site. "
        "The course is original Veyro material."
    ),
    "outcomes": [
        "Explain how browsers, servers, HTML, CSS and JavaScript work together",
        "Write semantic HTML pages with links, images, lists and forms",
        "Style and lay out pages with CSS, Flexbox, Grid and media queries",
        "Use JavaScript variables, functions, conditions and events to add interactivity",
        "Track your code with Git and publish a portfolio website online",
    ],
    "level": "beginner",
    "category": "coding",
    "motif": "grid",
    "tone": "ink",
    "modules": [
        {
            "title": "Getting started with code",
            "description": "How the web works and setting up your coding tools.",
            "lessons": [
                ("Welcome: how this course works", 5, """Welcome to **Coding**. By the end of this course you'll have built and published your own website, and you'll understand the code behind it.

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

Write down why you want to learn to code and one website you'd love to build by the end of the course."""),
                ("How the web works", 7, """Before writing code, it helps to know what happens when you visit a website.

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

Open any website, right-click and choose **View page source**. Find one HTML tag you recognise (like `<h1>` or `<p>`). Then open your browser's **developer tools** (usually F12) and explore the Elements panel."""),
                ("Set up your coding tools", 7, """You only need two tools to start: a code editor and a browser.

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

Set up VS Code and Live Server, create `index.html`, and change the heading text to your own name. Watch the browser update when you save."""),
                ("Think like a programmer", 6, """Programming isn't mainly about memorising syntax. It's about breaking problems into small, clear steps, and that's a skill you can practise.

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

Write pseudocode for a simple everyday process, such as making tea or logging into a website. Make each step small enough that a computer could follow it literally."""),
            ],
        },
        {
            "title": "HTML: structure your pages",
            "description": "Tags, text, links, images, lists, semantic layout and forms.",
            "lessons": [
                ("HTML elements and page structure", 7, """HTML (HyperText Markup Language) describes the content of a page using **elements**, written with **tags**.

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

Update your `index.html` to match the skeleton above, including the viewport meta tag. Add a comment explaining what the `<head>` section is for."""),
                ("Text, links and images", 8, """Most of the web is text, links and images. These elements cover most of what you'll write.

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

Add an `images` folder to your project with one photo. On your page, add an `<h2>` "About me", a short paragraph, your photo with good alt text, a list of three hobbies and a link to a website you like."""),
                ("Semantic HTML and page layout", 7, """**Semantic** elements describe what their content *means*, not just how it looks. They help search engines, screen readers and other developers understand your page.

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

Restructure your page with `<header>`, `<nav>`, `<main>`, at least two `<section>` elements and a `<footer>`. Make the nav links jump to each section using `id` attributes."""),
                ("Forms and inputs", 7, """Forms let visitors send information: sign-ups, contact messages, searches.

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

Add a `<section id="contact">` to your page with the contact form above. Try submitting it empty, then with an invalid email, and see how the browser responds."""),
            ],
        },
        {
            "title": "CSS: style and layout",
            "description": "Selectors, the box model, Flexbox, Grid and responsive design.",
            "lessons": [
                ("CSS basics: selectors and properties", 8, """CSS (Cascading Style Sheets) controls how HTML looks.

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

Create `styles.css`, link it, and style your `body` font, the colour of your headings, and a hover colour for links."""),
                ("The box model and spacing", 7, """Every element on a page is a rectangular **box**. Understanding the box model is the key to controlling spacing.

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

Add the `box-sizing` rule to your stylesheet. Give your sections padding, style your project `<article>` elements as cards with a border, rounded corners and margin, and inspect one card's box model in the developer tools."""),
                ("Flexbox and Grid layouts", 8, """Modern CSS has two powerful layout systems: **Flexbox** for one direction (a row *or* a column) and **Grid** for two (rows *and* columns).

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

Lay out your nav links with Flexbox, and wrap your project cards in a `<div class="projects">` that uses the auto-fit Grid example. Add at least three cards."""),
                ("Responsive design", 7, """More than half of web traffic comes from phones. **Responsive design** makes your site work well on any screen size.

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

Make your page responsive: add the image rule, convert your project grid to the mobile-first example, and check it at phone, tablet and desktop sizes."""),
            ],
        },
        {
            "title": "JavaScript: make it interactive",
            "description": "Variables, functions, conditions, loops, the DOM and events.",
            "lessons": [
                ("Variables, data types and the console", 8, """JavaScript is the programming language of the web. It runs in every browser.

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

Link `script.js` to your page. Create variables for your name, age and an array of three skills, then log a sentence using a template string."""),
                ("Functions, conditions and loops", 8, """These three ideas let your code make decisions and repeat work.

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

Write a function `greeting()` that returns "Good morning", "Good afternoon" or "Good evening" based on the current hour. Then loop over an array of three friends' names and log a personalised greeting for each."""),
                ("The DOM: change the page with code", 7, """The **DOM (Document Object Model)** is the browser's live model of your HTML. JavaScript can read and change it, which is how pages update without reloading.

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

Add an empty `<ul id="skills"></ul>` to your page. Use JavaScript to fill it from an array of skills. Then change your `<h1>` text with `textContent`."""),
                ("Events and a mini project", 8, """**Events** are things that happen on the page: clicks, key presses, form submissions. JavaScript can listen for them and respond.

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

Add a dark-mode toggle button to your page, and handle your contact form's submit event to show a thank-you message in a `<p id="form-status"></p>` element."""),
            ],
        },
        {
            "title": "Git, projects and publishing",
            "description": "Version control with Git and GitHub, building and publishing your portfolio.",
            "lessons": [
                ("Version control with Git", 8, """**Git** records snapshots of your project over time. You can see what changed, undo mistakes and work with others without overwriting each other's code.

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

Initialise Git in your `my-website` folder, make your first commit, then make a small change and commit again. Run `git log --oneline` to see both commits."""),
                ("GitHub and collaboration", 7, """**GitHub** is a website that hosts Git repositories online. It's a backup, a portfolio that employers look at and a place to collaborate.

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

Push your project to GitHub. Create a `README.md` describing your site, commit it and push again. Check that it appears on your repository page."""),
                ("Build your portfolio project", 9, """Time to bring everything together into a portfolio website: a personal site that shows who you are and what you can do.

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

Build your portfolio following the plan, committing after each step. Ask a friend to try it on their phone and note any problems."""),
                ("Publish your site and keep learning", 7, """A website isn't finished until people can visit it. Static sites like yours — HTML, CSS and JavaScript — can be published for free.

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

Publish your portfolio and share the link with someone. Add the live link to your README. Then mark this class as read to complete the course and claim your certificate."""),
            ],
        },
    ],
}
