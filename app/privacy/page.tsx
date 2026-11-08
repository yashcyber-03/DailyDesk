import type {Metadata} from "next";import Doc from "@/components/Doc";
export const metadata:Metadata={title:"Privacy Policy",description:"How DailyDesk handles your files and data.",alternates:{canonical:"/privacy"}};
export default function Page(){return(<Doc title="Privacy Policy">
<p>DailyDesk is a set of free tools that run in your web browser. This page explains what happens to your data.</p>
<h2>Your files and text</h2><p>Files you select (PDFs, images) and text you type into tools are processed on your own device by your browser. DailyDesk does not upload them to its own servers and does not store them.</p>
<h2>Accounts</h2><p>DailyDesk has no accounts, logins or user profiles.</p>
<h2>Data saved in your browser</h2><p>Some tools save data in your browser’s local storage so it is still there next time: your theme choice, to-do items and notes. This data stays on your device. It is not synced and can be lost if you clear your browser data or switch devices. Each tool that saves data has a “Delete saved data” button.</p>
<h2>Speech features</h2><p>Text to Speech uses your browser’s built-in speech engine. Speech to Text uses your browser’s speech recognition, which in some browsers (such as Chrome) sends audio to the browser vendor’s service. That is controlled by your browser, not by DailyDesk, and you should check your browser’s privacy terms.</p>
<h2>Hosting and logs</h2><p>The site is delivered by a hosting provider, which may keep standard technical logs such as IP address, browser type and pages requested, for security and operation. DailyDesk uses Vercel Web Analytics to count visits and page views. It does not use cookies and does not track you across other websites. It may record anonymous details such as the page visited, where you came from, your country, browser and device type. DailyDesk does not use advertising scripts.</p>
<h2>Children</h2><p>DailyDesk is a general-purpose site and is not directed at children.</p>
<h2>Changes and contact</h2><p>We may update this policy and will change the date above when we do. See the <a className="underline" href="/contact">Contact page</a> for how to reach us.</p></Doc>);}
