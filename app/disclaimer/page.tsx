import type {Metadata} from "next";import Doc from "@/components/Doc";
export const metadata:Metadata={title:"Disclaimer",description:"Important notes about DailyDesk results.",alternates:{canonical:"/disclaimer"}};
export default function Page(){return(<Doc title="Disclaimer">
<h2>General information only</h2><p>DailyDesk tools give general-purpose results for convenience. They are not professional advice.</p>
<h2>Calculators</h2><p>The EMI, GST, discount, percentage, age and unit calculators use standard formulas, but real-world figures (for example a lender’s actual EMI, which may include fees, or tax rules that change) can differ. Confirm important numbers with the relevant provider or a qualified professional.</p>
<h2>BMI</h2><p>BMI is a general screening number. It is not a medical diagnosis and does not account for muscle mass, age or other factors. Talk to a healthcare professional about your health.</p>
<h2>Files and conversions</h2><p>PDF and image processing happens in your browser. Results can vary by file and browser, and some files (such as password-protected or damaged PDFs) cannot be processed. Always keep your originals.</p>
<h2>Security tools</h2><p>The password generator creates random passwords in your browser. Store passwords safely, ideally in a reputable password manager.</p></Doc>);}
