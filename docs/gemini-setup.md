# Gemini (AI features) setup

1. Open Google AI Studio (https://aistudio.google.com), sign in, and choose **Get API key** > **Create API key**.
2. Put the key in `.env.local` (and later in Vercel) as `GEMINI_API_KEY=your-key`. Never add `NEXT_PUBLIC_` in front of it, never commit it and never paste it into chats or screenshots.
3. Restart `npm run dev`. Open `/tools/ai-summarizer`, paste some text and press **Summarize**.

## Model name
The default is `gemini-flash-latest`, which should point to Google's newest Flash model. Google renames and retires models over time. If AI requests fail with "The AI service is not available right now", open Google's model list, pick a current Flash model id and set `GEMINI_MODEL=that-id`.

## Limits and cost
- Visitors: 8 requests per minute and 60 per day per IP address (best effort, per server instance).
- Signed-in users: 100 requests per day per account, counted in the database (`ai_usage`, run the second migration).
- Input is limited to 8,000 characters for tools and 4,000 per chat message.
- Check your Google AI Studio usage page regularly. Set a budget alert if you use a paid tier.

## Privacy
Text typed into AI tools is sent to Google. Read Google's current terms for how your API tier handles that data, and keep the notices on the AI pages.

## Troubleshooting
| What you see | Likely cause |
|---|---|
| "AI features are not set up yet" | `GEMINI_API_KEY` is missing in this environment. Add it and restart or redeploy. |
| "The AI service is not available right now" | Wrong or expired key, model name retired, or Google outage. Check `GEMINI_MODEL` and your key. |
| "The AI service is busy right now" | Google rate limit reached. Wait a minute. |
| "You have reached the usage limit" | Your own limits above. They reset every minute or day. |
