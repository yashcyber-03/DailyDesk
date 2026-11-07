export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

export const LEGAL_UPDATED = "2 November 2026";

export const privacySummary =
  "DailyDesk is built to collect as little as possible. Files you process in the PDF and image tools stay in your browser. Text you send to the AI tools goes to Google to get a response. If you create an account, we store your account details and the things you choose to save. We do not sell your personal information.";

export const privacySections: LegalSection[] = [
  {
    heading: "1. Who we are",
    paragraphs: [
      "DailyDesk (\"we\", \"us\") is an online toolkit available at this website. You can reach us using the details on our Contact page.",
    ],
  },
  {
    heading: "2. What we handle and why",
    items: [
      "Files in the PDF and image tools: these are opened and processed inside your own browser. They are not uploaded to our servers and we do not store them.",
      "Text in the AI tools and AI Assistant: your text is sent from our server to Google's Gemini API so that a response can be created. We do not save your text or the responses in our database. Please do not enter passwords, financial details or other sensitive information.",
      "Account details: if you sign up, we store your email address, a securely hashed password (handled by our authentication provider) and an optional display name.",
      "Things you choose to save when logged in: notes, tasks, planner entries, habits, favourite tools, your theme preference, and a count of how often you use each tool and how many AI requests you made today. We use this to provide your dashboard and to enforce fair-use limits.",
      "Data on your own device: guests' tasks, notes, planner entries and habits, recently used tools, timer settings and theme choice are kept in your browser's local storage. They stay on your device unless you log in and choose to move them to your account.",
      "Technical data: when you visit, our hosting provider and service providers may process your IP address, browser type and request details in ordinary server logs to deliver the site and keep it secure. We use your IP address in temporary server memory to apply rate limits.",
    ],
  },
  {
    heading: "3. Cookies and similar technologies",
    paragraphs: [
      "We use only what is needed to run the site: a sign-in session cookie when you are logged in, and local storage in your browser for the features described above. We do not currently use advertising or analytics cookies.",
      "If we add analytics or advertising in the future, we will update this policy and ask for your consent where the law requires it.",
    ],
  },
  {
    heading: "4. Service providers",
    paragraphs: ["We rely on a small number of providers who process data on our behalf or under their own terms:"],
    items: [
      "Supabase: accounts, authentication and the database for saved items.",
      "Google (Gemini API): generating AI responses from the text you submit.",
      "Vercel: hosting and delivery of the website.",
    ],
  },
  {
    heading: "5. How long we keep data",
    paragraphs: [
      "Account data and saved items are kept until you delete them or delete your account. Deleting your account from the dashboard removes your account and the items linked to it. Daily AI usage counters older than 30 days are removed automatically. You can erase your tool-usage history at any time from the dashboard. Data stored in your browser can be removed by clearing your browser's site data.",
    ],
  },
  {
    heading: "6. Your choices and rights",
    paragraphs: [
      "You can view and edit what you saved from your dashboard and tools, change your password and display name, clear your activity history and delete your account. Depending on where you live, you may have additional rights such as access, correction, deletion, portability or objection. To make a request, contact us using the details on the Contact page.",
    ],
  },
  {
    heading: "7. Security",
    paragraphs: [
      "We use encrypted connections, database access rules that limit each account to its own data, and server-side handling of secret keys. No online service can promise perfect security, so please use a strong, unique password.",
    ],
  },
  {
    heading: "8. Children",
    paragraphs: ["DailyDesk is not directed at children under 13, and we do not knowingly collect their personal information. If you believe a child has created an account, contact us and we will delete it."],
  },
  {
    heading: "9. International processing",
    paragraphs: ["Our providers may process data in countries other than your own. Where required, they use safeguards for such transfers."],
  },
  {
    heading: "10. Changes to this policy",
    paragraphs: ["We may update this policy as the site changes. The date at the top shows when it was last updated. Significant changes will be highlighted on the site."],
  },
];

export const termsSummary =
  "By using DailyDesk you agree to these terms. In short: use the tools lawfully and fairly, remember that results are provided as a convenience and may contain mistakes, and do not rely on them as professional advice.";

export const termsSections: LegalSection[] = [
  {
    heading: "1. Acceptance",
    paragraphs: ["By accessing or using DailyDesk you agree to these Terms and our Privacy Policy. If you do not agree, please do not use the site."],
  },
  {
    heading: "2. The service",
    paragraphs: [
      "DailyDesk provides online tools, including PDF and image tools, calculators, productivity tools and AI-powered features. We may add, change, limit or remove features at any time, and we do not guarantee that the service will always be available or error free.",
    ],
  },
  {
    heading: "3. Accounts",
    paragraphs: [
      "You can use most tools without an account. If you create one, you must give accurate information, keep your password confidential and are responsible for activity under your account. You can delete your account at any time from the dashboard.",
    ],
  },
  {
    heading: "4. Acceptable use",
    paragraphs: ["You agree not to:"],
    items: [
      "break the law or infringe anyone's rights, including by processing files or text you have no right to use;",
      "upload or generate malware, or try to disrupt, overload, probe or gain unauthorized access to the service or its systems;",
      "bypass usage limits, scrape the service in bulk, or use automated means to send requests to the AI features;",
      "use the AI features to create unlawful, harmful, deceptive or abusive content.",
    ],
  },
  {
    heading: "5. Your files and content",
    paragraphs: [
      "You keep all rights to the files and text you use with DailyDesk. PDF and image tools process files in your browser. For AI features you give us permission to send your text to our AI provider solely to produce your result. Content you save to your account is stored so that you can access it, and you are responsible for keeping your own backups.",
    ],
  },
  {
    heading: "6. AI features",
    paragraphs: [
      "AI-generated output can be inaccurate, incomplete or out of date, and similar requests may produce different results. Always review AI output before relying on it, especially for important matters. Do not enter sensitive personal information.",
    ],
  },
  {
    heading: "7. No professional advice",
    paragraphs: [
      "Calculators (such as EMI, GST, discount, age and unit conversions), the BMI calculator and all other tools provide general information and estimates only. They are not financial, tax, legal, medical or other professional advice. Check important figures with a qualified professional or the relevant official source.",
    ],
  },
  {
    heading: "8. Free use and future paid plans",
    paragraphs: [
      "The service is currently free. We may introduce paid plans or advertising in the future. Nothing can be purchased today, and if that changes, the terms of any paid plan will be shown before you buy.",
    ],
  },
  {
    heading: "9. Intellectual property",
    paragraphs: [
      "The DailyDesk name, design and software are owned by us or our licensors and are protected by law. Parts of the service use open-source software under their own licences. You may use the tools for personal or business purposes, but you may not copy or resell the service itself.",
    ],
  },
  {
    heading: "10. Third-party services",
    paragraphs: ["Some features rely on third-party services such as Google, Supabase and Vercel. Their availability and terms are outside our control."],
  },
  {
    heading: "11. Disclaimer of warranties",
    paragraphs: ["The service is provided \"as is\" and \"as available\", without warranties of any kind, to the fullest extent permitted by law."],
  },
  {
    heading: "12. Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by law, we are not liable for indirect, incidental, special or consequential damages, or for loss of data, profits or business arising from your use of, or inability to use, the service. Nothing in these terms limits liability that cannot be limited by law.",
    ],
  },
  {
    heading: "13. Suspension and termination",
    paragraphs: ["We may suspend or end access for anyone who breaks these terms or misuses the service. You may stop using DailyDesk at any time."],
  },
  {
    heading: "14. Changes to these terms",
    paragraphs: ["We may update these terms from time to time. Continuing to use the service after changes take effect means you accept the updated terms."],
  },
  {
    heading: "15. Governing law and contact",
    paragraphs: [
      "These terms are governed by the laws of the country in which the site operator is based, without regard to conflict-of-law rules. Questions about these terms can be sent using the details on our Contact page.",
    ],
  },
];
