-- V5: sample article drafts so the CMS is demonstrable out of the box.
-- These are SAMPLES only (DRAFT status, never published). Authorship of real
-- articles is still undecided — replace these via the admin CMS (/admin/articles).

INSERT INTO articles (slug, title, excerpt, content, author, status, tags, meta_title, meta_description)
VALUES
(
    'sample-why-position-sizing-beats-stock-picking',
    '[SAMPLE] Why Position Sizing Beats Stock Picking',
    'Most traders obsess over entries. The math says the size of the bet matters more than the pick itself.',
    E'# Why Position Sizing Beats Stock Picking\n\n**This is a sample draft.** Replace it with real editorial content via the admin CMS.\n\nMost traders spend 90% of their energy hunting for the perfect entry and 10% thinking about how much to risk. The math of compounding says it should be the other way around.\n\n## The uncomfortable arithmetic\n\n- A trader who risks 1% per trade can survive **50 losing trades in a row** and still have capital left.\n- A trader who risks 10% per trade is effectively ruined after **10 losses** — and ruined long before that, psychologically.\n\n## A rule you can use tomorrow\n\n> Never risk more than 1–2% of your account on a single idea, no matter how certain it feels.\n\nCertainty is a feeling. Position size is a decision. Only one of them is under your control.\n\n## What to track\n\nIn your journal, log the **planned risk** vs the **actual risk** for every trade. If they differ more than 10% of the time, your edge is leaking through execution — not strategy.',
    'Tradexa Editorial',
    'DRAFT',
    'risk,discipline',
    '[SAMPLE] Why Position Sizing Beats Stock Picking | Tradexa GPT',
    'Sample draft: why how much you risk matters more than what you pick.'
),
(
    'sample-the-journal-habit-that-fixes-revenge-trading',
    '[SAMPLE] The Journal Habit That Fixes Revenge Trading',
    'Revenge trading is not a strategy problem. It is a data problem — and a 60-second journal habit fixes it.',
    E'# The Journal Habit That Fixes Revenge Trading\n\n**This is a sample draft.** Replace it with real editorial content via the admin CMS.\n\nRevenge trading — doubling down right after a loss to "make it back" — is the most expensive habit in retail trading. It is not a strategy problem. It is an emotional data problem.\n\n## The 60-second rule\n\nAfter every losing trade, before you touch the order button again:\n\n1. Write the loss amount.\n2. Write one sentence: *what was I feeling?*\n3. Set a 15-minute timer. No new positions until it rings.\n\n## Why it works\n\nThe journal turns a vague urge ("I need to win it back") into a visible pattern. After 20 logged revenge urges, most traders discover the urge itself was the signal to stop — not to trade.\n\n## Measure it\n\nTrack your **revenge-trade rate**: revenge trades divided by total trades, per week. If it trends down, the habit is working. If it does not, your cool-down period is too short.',
    'Tradexa Editorial',
    'DRAFT',
    'psychology,discipline',
    '[SAMPLE] The Journal Habit That Fixes Revenge Trading | Tradexa GPT',
    'Sample draft: a 60-second journal habit that breaks the revenge-trading loop.'
),
(
    'sample-risk-reward-is-not-a-magic-ratio',
    '[SAMPLE] Risk-Reward Is Not a Magic Ratio',
    'A 1:3 risk-reward means nothing without win rate. Here is the expectancy math every trader should do once.',
    E'# Risk-Reward Is Not a Magic Ratio\n\n**This is a sample draft.** Replace it with real editorial content via the admin CMS.\n\n"Always take 1:3 risk-reward" is the most repeated — and most misunderstood — advice in trading. A ratio means nothing without the win rate attached to it.\n\n## The only formula that matters\n\n**Expectancy = (win rate × average win) − (loss rate × average loss)**\n\n- 30% win rate at 1:3 → positive expectancy. The math works.\n- 30% win rate at 1:1 → you are donating money to the market.\n\n## Do this once\n\nPull your last 50 trades from your journal. Compute your actual win rate and your actual average win vs average loss. That single number — expectancy per trade — tells you more than any indicator.\n\n## The Tradexa angle\n\nThis is exactly what the Edge Validator on this site computes from your journal: your real expectancy, not the ratio you hoped for.',
    'Tradexa Editorial',
    'DRAFT',
    'risk,math',
    '[SAMPLE] Risk-Reward Is Not a Magic Ratio | Tradexa GPT',
    'Sample draft: expectancy math — why risk-reward ratios mean nothing without win rate.'
);
