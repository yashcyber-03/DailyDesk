export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

export const LEGAL_UPDATED = "7 November 2026";

export const privacySummary =
  "DailyDesk is a static website. Its tools process files in your browser, and productivity data and preferences are stored locally on your device. There are no user accounts or paid plans.";

export const privacySections: LegalSection[] = [
  {
    heading: "1. Who we are",
    paragraphs: ["DailyDesk (\"we\", \"us\") is an online toolkit available at this website. You can reach us using the details on our Contact page."],
  },
  {
    heading: "2. What we handle and why",
    items: [
      "Files in the PDF and image tools are opened and processed inside your browser. The tools do not upload them to DailyDesk.",
      "Notes, tasks, planner entries, habits, favourites, recently used tools, timer settings and theme preferences are stored in your browser's local storage. They are not synced to an account or another device. Clearing browser site data removes them.",
      "The site does not provide sign-in, user accounts, AI services or server APIs.",
      "The static hosting provider may process ordinary request data, such as IP address, browser type and requested page, to deliver and secure the website. Check the hosting provider's privacy information for details.",
    ],
  },
  {
    heading: "3. Cookies and similar technologies",
    paragraphs: ["DailyDesk does not use account cookies, advertising cookies or analytics cookies. Browser local storage is used for the features described above."],
  },
  {
    heading: "4. Service providers",
    items: ["The website's hosting provider delivers the static website and may process basic request logs."],
  },
  {
    heading: "5. Your choices and rights",
    paragraphs: [
      "You can edit or delete locally saved items in the relevant tools, or remove all locally stored data by clearing this website's browser storage. Depending on where you live, you may have additional rights. To make a request, contact us using the details on the Contact page.",
    ],
  },
  {
    heading: "6. Security",
    paragraphs: ["We design the tools to process your files in your browser and do not send them to DailyDesk. No online service or device can promise perfect security."],
  },
  {
    heading: "7. Children",
    paragraphs: ["DailyDesk is not directed at children under 13, and we do not knowingly collect their personal information."],
  },
  {
    heading: "8. Changes to this policy",
    paragraphs: ["We may update this policy as the site changes. The date at the top shows when it was last updated."],
  },
];

export const termsSummary =
  "By using DailyDesk you agree to these terms. Use the tools lawfully and fairly, remember that results are provided as a convenience and may contain mistakes, and do not rely on them as professional advice.";

export const termsSections: LegalSection[] = [
  {
    heading: "1. Acceptance",
    paragraphs: ["By accessing or using DailyDesk you agree to these Terms and our Privacy Policy. If you do not agree, please do not use the site."],
  },
  {
    heading: "2. The service",
    paragraphs: [
      "DailyDesk provides free browser-based PDF, image, calculator and productivity tools. There are no user accounts or paid plans. We may add, change or remove features at any time and do not guarantee that the website will always be available or error free.",
    ],
  },
  {
    heading: "3. Acceptable use",
    paragraphs: ["You agree not to:"],
    items: [
      "break the law or infringe anyone's rights, including by processing files you have no right to use;",
      "try to disrupt, overload, probe or gain unauthorized access to the website or its hosting systems;",
      "scrape the website in bulk or misuse its resources.",
    ],
  },
  {
    heading: "4. Your files and content",
    paragraphs: [
      "You keep all rights to the files and data you use with DailyDesk. Files are processed in your browser. Productivity data is kept in your browser storage, so you are responsible for keeping your own backups and for anyone else who can access your device.",
    ],
  },
  {
    heading: "5. No professional advice",
    paragraphs: [
      "Calculators, the BMI calculator and all other tools provide general information and estimates only. They are not financial, tax, legal, medical or other professional advice. Check important figures with a qualified professional or the relevant official source.",
    ],
  },
  {
    heading: "6. Intellectual property",
    paragraphs: [
      "The DailyDesk name, design and software are owned by us or our licensors and are protected by law. Parts of the service use open-source software under their own licences. You may use the tools for personal or business purposes, but you may not copy or resell the service itself.",
    ],
  },
  {
    heading: "7. Third-party services",
    paragraphs: ["The static hosting provider delivers this website. Its availability and terms are outside our control."],
  },
  {
    heading: "8. Disclaimer of warranties",
    paragraphs: ["The service is provided \"as is\" and \"as available\", without warranties of any kind, to the fullest extent permitted by law."],
  },
  {
    heading: "9. Limitation of liability",
    paragraphs: [
      "To the fullest extent permitted by law, we are not liable for indirect, incidental, special or consequential damages, or for loss of data, profits or business arising from your use of, or inability to use, the service. Nothing in these terms limits liability that cannot be limited by law.",
    ],
  },
  {
    heading: "10. Changes to these terms",
    paragraphs: ["We may update these terms from time to time. Continuing to use the service after changes take effect means you accept the updated terms."],
  },
  {
    heading: "11. Governing law and contact",
    paragraphs: [
      "These terms are governed by the laws of the country in which the site operator is based, without regard to conflict-of-law rules. Questions about these terms can be sent using the details on our Contact page.",
    ],
  },
];
