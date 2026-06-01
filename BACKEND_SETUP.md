# Shared Backend Setup

This app uses Supabase for shared players, predictions, and match results.

## 1. Create a Supabase project

Go to https://supabase.com and create a free project.

## 2. Create the database tables

Open your Supabase project, go to SQL Editor, paste the contents of `supabase-schema.sql`, and run it.

## 3. Add your public app keys

In Supabase, go to Project Settings > API.

Copy:

- Project URL
- anon public key

Paste them into `supabase-config.js`:

```js
window.WORLD_CUP_BACKEND = {
  supabaseUrl: "https://your-project.supabase.co",
  supabaseAnonKey: "your-anon-public-key"
};
```

The anon key is safe to use in a browser app. Do not put a service role key in this file.

## 4. Publish the files

Upload these files to GitHub Pages:

- `index.html`
- `styles.css`
- `app.js`
- `fixtures.js`
- `supabase-config.js`

The site will then load shared players, predictions, and results from Supabase.

## Important security note

This is a simple shared backend for an office game. It does not yet verify email ownership or protect the admin results area.

For a stricter version, add Supabase Auth and an admin email allowlist before sharing widely.
