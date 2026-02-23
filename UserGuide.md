# User Guide: Role-Based Topic Visibility

## Feature Overview

This forum supports three role-based features for managing topic visibility and status:

1. **Instructor-only topics** — TAs and Professors can create topics visible only to instructors (TAs, Professors, Admins), hidden from students entirely
2. **Instructor-only badge & filter** — Instructor-only topics are marked with a yellow badge; TAs, Professors, and Admins see a filter button to show only instructor-only topics
3. **Resolve/Unresolve** — Admins and moderators can mark topics as resolved to indicate a question has been addressed

**Who can see what:**

| Topic Type | Students | TAs | Professors | Admins |
|-----------|----------|-----|------------|--------|
| Normal topic | Yes | Yes | Yes | Yes |
| Instructor-only topic | No | Yes | Yes | Yes |
| Resolved badge | Yes | Yes | Yes | Yes |
| Instructor-only badge & filter | No | Yes | Yes | Yes |

## How to Use

### Creating an Instructor-Only Topic

1. Log in as a TA or Professor
2. Click **New Topic** in any category
3. In the composer, use the **"Post to"** dropdown to select:
   - **All Users** (default) — all users can see the topic
   - **TAs and Professors only** — only TAs, Professors, and Admins can see it
4. Fill in the title and content, then submit
5. The topic and all its replies are now hidden from students and marked with a yellow **"Instructors only"** badge

**Note:** Students do not see this option. All replies within an instructor-only topic are automatically instructor-only. TAs and Professors also see a filter button in the category toolbar to show only instructor-only topics.

### Where Filtering Applies

Instructor-only topics are hidden from students in all views:

- **Category listing** — the topic does not appear in the list
- **Topic page** — the topic is inaccessible to students
- **Category listing teaser** — the topic teaser (preview) is hidden
- **Search results** — the topic is filtered out
- **Recent posts / profile pages** — the topic is filtered out
- **Direct API access** — the topic returns as unreadable

### Resolving and Unresolving a Topic

Admins and moderators can mark topics as "Resolved" to indicate a question or issue has been addressed.

1. Log in as an **Admin** or **Moderator**
2. Open any topic
3. Use the **"Mark Resolved"** option from the topic tools (or the resolve button in the sidebar)
4. **Expected:** The topic shows a "Resolved" badge in the category listing and topic header
5. To undo, use **"Mark Unresolved"** from the same menu

A **resolved filter** in the category toolbar lets anyone filter the listing to show only resolved topics.

**Note:** Regular users cannot resolve or unresolve topics.

## How to User Test

### Prerequisites

You need three user accounts with different roles:
- A **Student** account (member of the "Students" group)
- A **TA** account (member of the "TAs" group)
- An **Admin** account

### Test 1: Badge and Filter Visibility

1. Log in as the **TA** account and create a new topic with "TAs and Professors only" selected
2. **Expected:** The topic appears in the category listing with a yellow **"Instructors only"** badge, and a filter button is visible in the toolbar
3. Log out and log in as the **Student** account
4. **Expected:** The instructor-only topic is **not visible** in the category listing, and no filter button appears

### Test 2: Creating and Hiding a Topic

1. Log in as the **TA** account
2. Create a new topic with "TAs and Professors only" selected
3. **Expected:** The topic is visible to the TA with the "Instructors only" badge
4. Log out and log in as the **Student** account
5. Navigate to the same category
6. **Expected:** The topic is **not visible**

### Test 3: Category Listing Teaser

1. Log in as the **TA** account
2. In an instructor-only topic, post a reply (it becomes the latest post)
3. Go to the category listing page
4. **Expected:** The teaser (topic preview) on the right shows your instructor-only reply
5. Log out and log in as the **Student** account
6. Go to the same category listing page
7. **Expected:** The instructor-only topic does **not** appear in the listing at all

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
3. **Expected:** The topic is created but `targetRole` is stripped — all users can see it

### Test 5: Resolve and Unresolve a Topic

1. Log in as the **Admin** account and open any topic
2. Use **"Mark Resolved"** from the topic tools
3. **Expected:** A "Resolved" badge appears on the topic in the category listing and topic header
4. Use the resolved filter in the toolbar — **Expected:** only this topic appears
5. Use **"Mark Unresolved"** — **Expected:** the badge disappears

## Automated Tests

### Location

Automated tests are in [`test/role-visibility.js`](test/role-visibility.js), [`test/instructor-topics.js`](test/instructor-topics.js), and [`test/topics-resolution.js`](test/topics-resolution.js).

Run them with:
```bash
NODE_NO_WARNINGS=1 NODE_OPTIONS=--no-deprecation NODEBB_TEST_SILENT=1 npx mocha test/role-visibility.js test/instructor-topics.js test/topics-resolution.js
```

### Test Descriptions

#### Topic Creation — `test/role-visibility.js` (4 tests)

| Test | What It Verifies |
|------|-----------------|
| `should persist targetRole when created by an instructor` | When a Professor creates a topic with `targetRole: 'ta'`, the field is saved to the database |
| `should strip targetRole when a student tries to set it via API` | When a Student sends `targetRole` in the API payload, the server strips it — the topic has no `targetRole` |
| `should allow admin to set targetRole via API` | Admins can also set `targetRole`, not just TAs/Professors |
| `should persist targetRole on first post when creating topic via API` | When a Professor creates a new topic via API with `targetRole: 'ta'`, the field is stored on the first post |

#### Topic Page Filtering — `test/role-visibility.js` (5 tests)

| Test | What It Verifies |
|------|-----------------|
| `should hide targetRole posts from students on topic page` | `getTopicPosts()` does not return restricted posts for a student uid |
| `should show targetRole posts to TAs on topic page` | `getTopicPosts()` returns restricted posts for a TA uid |
| `should show targetRole posts to Professors on topic page` | `getTopicPosts()` returns restricted posts for a Professor uid |
| `should show targetRole posts to admins on topic page` | `getTopicPosts()` returns restricted posts for an admin uid |
| `should show posts without targetRole to everyone` | Normal topics (no `targetRole`) remain visible to students |

#### Privilege Filter — `test/role-visibility.js` (2 tests)

| Test | What It Verifies |
|------|-----------------|
| `should filter targetRole posts from students via privileges.posts.filter` | The privilege system's `filter()` method (used by search, recent topics, profiles) excludes restricted topics for students |
| `should not filter targetRole posts from TAs via privileges.posts.filter` | The same `filter()` method includes restricted topics for TAs |

#### Category Teaser Filtering — `test/role-visibility.js` (2 tests)

| Test | What It Verifies |
|------|-----------------|
| `should not show targetRole post as teaser for students` | `getTeasersByTids()` does not return an instructor-only topic as the teaser for students |
| `should show targetRole post as teaser for instructors` | `getTeasersByTids()` returns the instructor-only topic as the teaser for TAs |

#### Topic List Visibility — `test/instructor-topics.js` (11 tests)

| Test | What It Verifies |
|------|-----------------|
| `should store targetRole on the topic hash` | `targetRole` is persisted in the database when an instructor creates a restricted topic |
| `should add the tid to cid:X:tids:instructor sorted set` | The topic is added to the instructor sorted set, enabling the filter |
| `should NOT add normal topic tid to cid:X:tids:instructor sorted set` | Normal topics are not added to the instructor set |
| `should hide instructor-only topics from students` | `getCategoryTopics()` excludes instructor-only topics for students |
| `should show instructor-only topics to TAs` | `getCategoryTopics()` includes instructor-only topics for TAs |
| `should show instructor-only topics to professors` | `getCategoryTopics()` includes instructor-only topics for professors |
| `should show instructor-only topics to admins` | `getCategoryTopics()` includes instructor-only topics for admins |
| `should include targetRole field on topics returned to instructors` | `targetRole` is present on the topic object so the badge renders correctly |
| `should return only instructor topics when instructor=1 filter is applied` | The filter correctly returns only instructor-only topics |
| `should return all topics when no instructor filter is applied` | Without the filter, all topics appear |
| `should strip targetRole when a student creates a topic via API` | `apiTopics.create()` strips `targetRole` for non-instructors |

#### Topic Resolution — `test/topics-resolution.js` (3 tests)

| Test | What It Verifies |
|------|-----------------|
| `should reject resolve when caller is not admin or mod` | Non-admin/mod users cannot resolve topics — the API throws `no-privileges` |
| `should add tid to cid:X:tids:resolved when topic is resolved` | Resolving a topic adds its tid to the `cid:X:tids:resolved` sorted set in the database |
| `should return only resolved topics when category filter resolved=1` | The resolved filter correctly returns only resolved topics and excludes unresolved ones |

### Why These Tests Are Sufficient

The tests cover **every code path** where restricted topics could leak to students or features could be misused:

1. **Authorization guard** — Tests verify that only authorized users (TA, Professor, Admin) can create restricted topics, and the server strips `targetRole` from unauthorized users — both for replies and new topics.

2. **Topic list visibility** (`src/categories/topics.js`) — All four viewer roles are tested against `getCategoryTopics()`, the primary path that populates the category page.

3. **Topic page** (`src/topics/posts.js`) — Tests in `role-visibility.js` verify the primary viewing path. This was the critical bug discovered during development: the topic page loads posts via `getTopicPosts()` which is a separate path from the privilege filter.

4. **Privilege filter** (`src/privileges/posts.js`) — Tests in `role-visibility.js` verify the filter used by search, recent topics, and profile pages.

5. **Category teasers** (`src/topics/teaser.js`) — Tests in `role-visibility.js` verify that topic previews on category listing pages don't leak restricted content.

6. **Resolution authorization** (`src/topics/tools.js`) — Tests that only admins/mods can resolve, and that the resolved sorted set is updated correctly.

7. **Resolution filter** (`src/categories/topics.js`) — Tests that the `resolved=1` filter returns only the correct topics.

Together these tests ensure that an instructor-only topic cannot be seen by a student through **any** view in the application, and that the resolve/unresolve feature is correctly gated and stored.
