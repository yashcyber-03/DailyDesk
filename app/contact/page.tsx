import type {Metadata} from "next";import Doc from "@/components/Doc";import {CONTACT_EMAIL} from "@/lib/site";
export const metadata:Metadata={title:"Contact",description:"How to contact DailyDesk.",alternates:{canonical:"/contact"}};
export default function Page(){return(<Doc title="Contact">
<p>Questions, bug reports or suggestions for new tools are welcome.</p>
{CONTACT_EMAIL?<p>Email: <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>:<p>Contact details will be added soon.</p>}
<p>When reporting a problem, please mention the tool name, your browser and device, and what you expected to happen. Do not send sensitive files.</p></Doc>);}
