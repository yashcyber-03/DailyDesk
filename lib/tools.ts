export type Category="PDF & Documents"|"Image Tools"|"AI & Writing"|"Calculators"|"Productivity";
export interface Tool{slug:string;name:string;desc:string;category:Category;keywords:string;live:boolean;faq:[string,string]}
const t=(slug:string,name:string,desc:string,category:Category,keywords:string,live=false,faq:[string,string]=["Is it free?","Yes, and it runs in your browser; nothing is uploaded."]):Tool=>({slug,name,desc,category,keywords,live,faq});
export const tools:Tool[]=[
t("merge-pdf","Merge PDF","Combine several PDFs into one file.","PDF & Documents","join combine pdf"),
t("pdf-to-images","PDF to Images","Turn PDF pages into images.","PDF & Documents","pdf jpg png"),
t("images-to-pdf","Images to PDF","Build a PDF from images.","PDF & Documents","jpg to pdf"),
t("extract-pdf-pages","Extract PDF Pages","Pull selected pages out of a PDF.","PDF & Documents","split pdf"),
t("pdf-info","PDF Page Information","See page count and metadata.","PDF & Documents","pdf details"),
t("image-compressor","Image Compressor","Reduce photo file size.","Image Tools","reduce photo size shrink compress"),
t("image-resizer","Image Resizer","Change image dimensions.","Image Tools","resize scale"),
t("png-to-jpg","PNG to JPG","Convert PNG images to JPG.","Image Tools","convert"),
t("jpg-to-png","JPG to PNG","Convert JPG images to PNG.","Image Tools","convert"),
t("image-converter","Image Format Converter","Convert between image formats.","Image Tools","webp convert"),
t("color-picker","Color Picker","Pick colors and copy codes.","Image Tools","hex rgb"),
t("qr-generator","QR Code Generator","Create QR codes from text or links.","Image Tools","qr barcode"),
t("ai-writer","AI Writer","AI writing assistance.","AI & Writing","ai writing"),
t("word-counter","Word Counter","Count words, characters and reading time.","AI & Writing","count words essay",true,["How are words counted?","Words are runs of characters separated by whitespace."]),
t("character-counter","Character Counter","Count characters with and without spaces.","AI & Writing","characters length",true),
t("case-converter","Case Converter","UPPER, lower, Title and Sentence case.","AI & Writing","uppercase lowercase capitalize",true),
t("remove-extra-spaces","Remove Extra Spaces","Clean up repeated spaces and blank lines.","AI & Writing","whitespace trim",true),
t("text-reverser","Text Reverser","Reverse text or word order.","AI & Writing","reverse",true),
t("text-to-speech","Text to Speech","Read text aloud.","AI & Writing","speak voice"),
t("speech-to-text","Speech to Text","Dictate text.","AI & Writing","dictation"),
t("age-calculator","Age Calculator","Exact age in years, months and days.","Calculators","birthday date of birth",true,["Which date is used as today?","Your device's current date."]),
t("percentage-calculator","Percentage Calculator","Percent of a number, and percent change.","Calculators","percent increase",true),
t("emi-calculator","EMI Calculator","Monthly loan payment from amount, rate and term.","Calculators","monthly loan payment mortgage",true,["What formula is used?","EMI = P·r·(1+r)^n / ((1+r)^n − 1), r = monthly rate."]),
t("gst-calculator","GST Calculator","Add or remove GST from a price.","Calculators","tax vat",true),
t("discount-calculator","Discount Calculator","Final price after a discount.","Calculators","sale off",true),
t("bmi-calculator","BMI Calculator","Body mass index from height and weight.","Calculators","weight height",true,["Is this a diagnosis?","No. BMI is a general screening number, not medical advice."]),
t("unit-converter","Unit Converter","Convert length, weight and temperature.","Calculators","metric imperial"),
t("todo-list","To-do List","Track tasks, saved locally.","Productivity","tasks"),
t("notes","Notes","Quick notes saved locally.","Productivity","notepad"),
t("pomodoro-timer","Pomodoro Timer","Focus in timed sessions.","Productivity","focus"),
t("stopwatch","Stopwatch","Time anything.","Productivity","timer"),
t("countdown-timer","Countdown Timer","Count down from a set time.","Productivity","timer"),
t("password-generator","Password Generator","Generate strong random passwords.","Productivity","secure random",true),
];
export const categories:Category[]=["PDF & Documents","Image Tools","AI & Writing","Calculators","Productivity"];
export const popular=["merge-pdf","image-compressor","qr-generator","percentage-calculator","age-calculator","word-counter"];
export const bySlug=(s:string)=>tools.find(x=>x.slug===s);
export const search=(q:string)=>{const w=q.toLowerCase().split(/\s+/).filter(Boolean);return w.length?tools.filter(x=>w.every(k=>(x.name+" "+x.desc+" "+x.keywords+" "+x.category).toLowerCase().includes(k))):tools;};

const LIVE=["merge-pdf","pdf-to-images","images-to-pdf","extract-pdf-pages","pdf-info","unit-converter","text-to-speech","speech-to-text","todo-list","notes","pomodoro-timer","countdown-timer","stopwatch","color-picker","qr-generator","image-compressor","image-resizer","png-to-jpg","jpg-to-png","image-converter"];
tools.forEach(x=>{if(LIVE.includes(x.slug))x.live=true;});
