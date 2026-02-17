# User Guide: Role-Based Post Visibility

## Feature Overview

TAs and Professors can mark posts as "Instructors only" so that students cannot see them. This allows private instructor discussions within the same topic threads that students use.

**Who can see what:**

| Post Type | Students | TAs | Professors | Admins |
|-----------|----------|-----|------------|--------|
| Normal post (Everyone) | Yes | Yes | Yes | Yes |
| Instructors only post | No | Yes | Yes | Yes |

## How to Use

### Creating an Instructor-Only Post

1. Log in as a TA or Professor
2. Navigate to any topic
3. In the **quick reply** box at the bottom of the topic, you will see a dropdown next to the "Quick reply" button with two options:
   - **Everyone** (default) — all users can see the post
   - **Instructors only** — only TAs, Professors, and Admins can see it
4. Select "Instructors only", type your message, and click "Quick reply"
5. The post is now hidden from students

**Note:** Students do not see this dropdown at all.

### Where Filtering Applies

Instructor-only posts are hidden from students in all views:

- **Topic page** — the post does not appear in the thread
- **Category listing** — the post teaser (preview) is hidden
- **Search results** — the post is filtered out
- **Recent posts / profile pages** — the post is filtered out
- **Direct API access** — the post returns as unreadable

## How to User Test

### Prerequisites

You need three user accounts with different roles:
- A **Student** account (member of the "Students" group)
- A **TA** account (member of the "TAs" group)
- An **Admin** account

### Test 1: Dropdown Visibility

1. Log in as the **TA** account
2. Open any topic
3. **Expected:** A dropdown ("Everyone" / "Instructors only") appears next to the Quick Reply button
4. Log out and log in as the **Student** account
5. Open the same topic
6. **Expected:** No dropdown appears — just the normal Quick Reply button

### Test 2: Creating and Hiding a Post

1. Log in as the **TA** account
2. Open a topic and select "Instructors only" from the dropdown
3. Type a message (e.g., "This is for TAs only") and submit
4. **Expected:** The post appears in the thread (you are a TA)
5. Log out and log in as the **Student** account
6. Open the same topic
7. **Expected:** The "This is for TAs only" post is **not visible**

### Test 3: Category Listing Teaser

1. Log in as the **TA** account
2. In a topic, create an instructor-only reply (it becomes the latest post)
3. Go to the category listing page
4. **Expected:** The teaser (post preview) on the right shows your instructor-only reply
5. Log out and log in as the **Student** account
6. Go to the same category listing page
7. **Expected:** The teaser does **not** show the instructor-only reply

### Test 4: Student Cannot Set targetRole

1. Log in as the **Student** account
2. Open the browser console (F12) and run:
   ```js
   fetch('/api/v3/topics/1', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'x-csrf-token': config.csrf_token
     },
     body: JSON.stringify({ content: 'Trying to hide this', targetRole: 'ta' })
   }).then(r => r.json()).then(d => console.log(d));
   ```
3. **Expected:** The post is created but `targetRole` is stripped — all users can see it

## Automated Tests

### Location

All automated tests are in [`test/role-visibility.js`](test/role-visibility.js).

Run them with:
```bash
NODE_NO_WARNINGS=1 NODE_OPTIONS=--no-deprecation NODEBB_TEST_SILENT=1 npx mocha test/role-visibility.js
```

### Test Descriptions

#### Post Creation (3 tests)

| Test | What It Verifies |
|------|-----------------|
| `should persist targetRole when created by an instructor` | When a Professor creates a post with `targetRole: 'ta'`, the field is saved to the database |
| `should strip targetRole when a student tries to set it via API` | When a Student sends `targetRole` in the API payload, the server strips it — the post has no `targetRole` |
| `should allow admin to set targetRole via API` | Admins can also set `targetRole`, not just TAs/Professors |

#### Topic Page Filtering (5 tests)

| Test | What It Verifies |
|------|-----------------|
| `should hide targetRole posts from students on topic page` | `getTopicPosts()` does not return restricted posts for a student uid |
| `should show targetRole posts to TAs on topic page` | `getTopicPosts()` returns restricted posts for a TA uid |
| `should show targetRole posts to Professors on topic page` | `getTopicPosts()` returns restricted posts for a Professor uid |
| `should show targetRole posts to admins on topic page` | `getTopicPosts()` returns restricted posts for an admin uid |
| `should show posts without targetRole to everyone` | Normal posts (no `targetRole`) remain visible to students |

#### Privilege Filter (2 tests)

| Test | What It Verifies |
|------|-----------------|
| `should filter targetRole posts from students via privileges.posts.filter` | The privilege system's `filter()` method (used by search, recent posts, profiles) excludes restricted posts for students |
| `should not filter targetRole posts from TAs via privileges.posts.filter` | The same `filter()` method includes restricted posts for TAs |

#### Category Teaser Filtering (2 tests)

| Test | What It Verifies |
|------|-----------------|
| `should not show targetRole post as teaser for students` | `getTeasersByTids()` does not return an instructor-only post as the teaser for students |
| `should show targetRole post as teaser for instructors` | `getTeasersByTids()` returns the instructor-only post as the teaser for TAs |

### Why These Tests Are Sufficient

The tests cover **every code path** where restricted posts could leak to students:

1. **Authorization guard** — Tests 1-3 verify that only authorized users (TA, Professor, Admin) can create restricted posts, and the server strips `targetRole` from unauthorized users.

2. **Topic page** (`src/topics/posts.js`) — Tests 4-8 verify the primary viewing path. This was the critical bug discovered during development: the topic page loads posts via `getTopicPosts()` which is a separate path from the privilege filter.

3. **Privilege filter** (`src/privileges/posts.js`) — Tests 9-10 verify the filter used by search, recent posts, and profile pages.

4. **Category teasers** (`src/topics/teaser.js`) — Tests 11-12 verify that post previews on category listing pages don't leak restricted content.

Together these tests ensure that an instructor-only post cannot be seen by a student through **any** view in the application.
