import type {Metadata} from "next";import Doc from "@/components/Doc";
export const metadata:Metadata={title:"Terms of Service",description:"Terms for using DailyDesk.",alternates:{canonical:"/terms"}};
export default function Page(){return(<Doc title="Terms of Service">
<p>By using DailyDesk you agree to these terms. If you do not agree, please do not use the site.</p>
<h2>Use of the tools</h2><p>The tools are provided free for personal and general use. You agree not to misuse the site, attempt to disrupt it, or use it for unlawful purposes. Only process files and content you have the right to use.</p>
<h2>No warranty</h2><p>The tools are provided “as is” and “as available”, without warranties of any kind. We do not guarantee that results are accurate, complete or error-free, or that the site will always be available or work in every browser.</p>
<h2>Your responsibility</h2><p>Keep your own copies of important files. Check results before relying on them, especially for financial, legal or official purposes.</p>
<h2>Limitation of liability</h2><p>To the extent permitted by law, DailyDesk is not liable for any loss or damage arising from use of the site or its tools, including lost or corrupted files.</p>
<h2>Changes</h2><p>We may change the tools or these terms at any time. Continued use after a change means you accept the updated terms.</p></Doc>);}
