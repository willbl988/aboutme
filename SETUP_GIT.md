# Git Configuration Setup

You need to configure your Git identity before making commits. Here's how:

## Quick Setup

Run these commands in your terminal (replace with your actual information):

```bash
# Set your name (use your real name or GitHub username)
git config --global user.name "Will Blackwell"

# Set your email (use your GitHub email or any email)
git config --global user.email "your.email@example.com"
```

## Verify Configuration

After setting, verify it worked:

```bash
git config --global user.name
git config --global user.email
```

You should see the values you just set.

## What These Settings Do

- **user.name**: Your name that appears in commit history
- **user.email**: Your email (usually matches your GitHub email)

## Options

### Global (Recommended)
The `--global` flag sets it for all Git repositories on your computer:
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### Local (This Repository Only)
If you want different settings just for this project:
```bash
git config user.name "Your Name"
git config user.email "your@email.com"
```

## Next Steps

After configuring, you can:
1. Make your first commit
2. Push to GitHub
3. Deploy to Vercel

