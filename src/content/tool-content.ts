export interface ToolContent {
  about: string;
  steps: string[];
  faqs: { q: string; a: string }[];
}

export const toolContent: Record<string, ToolContent> = {
  "age-calculator": {
    about:
      "The age calculator works out your exact age in years, months and days from your date of birth, and tells you how many days you have lived and how long until your next birthday. Change the 'Age at' date to find the age on any past or future day, for example for a form or an eligibility check.",
    steps: [
      "Pick your date of birth.",
      "Leave 'Age at' empty to use today, or choose another date.",
      "Read your age in years, months and days, plus total days lived and the next birthday.",
    ],
    faqs: [
      { q: "How is the age counted?", a: "Complete years and months are counted first, and the days left over after the last full month are shown as days." },
      { q: "What if I was born on 29 February?", a: "In years that are not leap years, the next birthday is counted on 28 February." },
    ],
  },
  "percentage-calculator": {
    about:
      "Use this percentage calculator for the three most common questions: what is X% of a number, X is what percent of Y, and what is the percentage change between two values. Results update as you type.",
    steps: [
      "Choose the type of calculation.",
      "Enter the two values. The labels change to match your choice.",
      "Read the result instantly below or beside the inputs.",
    ],
    faqs: [
      { q: "How do I calculate percentage change?", a: "Subtract the old value from the new value, divide by the old value and multiply by 100. A positive result is an increase and a negative one is a decrease." },
      { q: "Why can't the starting value or the whole be zero?", a: "Dividing by zero has no defined result, so the calculator asks for a non-zero value." },
    ],
  },
  "emi-calculator": {
    about:
      "The EMI calculator shows the fixed monthly instalment for a loan, along with the total interest and total amount you will repay. It uses the standard reducing-balance formula: EMI = P x r x (1+r)^n / ((1+r)^n - 1), where P is the loan amount, r is the monthly interest rate and n is the number of months.",
    steps: [
      "Enter the loan amount and the annual interest rate.",
      "Enter the tenure and choose years or months.",
      "Read your monthly EMI, total interest and total payment.",
    ],
    faqs: [
      { q: "Does this include processing fees or insurance?", a: "No. It covers only principal and interest. Lenders may add fees, so check your loan agreement." },
      { q: "Is the result the same as my bank's?", a: "It should be very close for standard reducing-balance loans. Banks may round differently or use different day-count rules, so treat this as an estimate." },
    ],
  },
  "gst-calculator": {
    about:
      "The GST calculator adds GST to a price or removes it from a GST-inclusive price, and splits the tax into CGST and SGST. Pick a standard rate or enter a custom one, which is useful for older invoices.",
    steps: [
      "Choose 'Add GST' or 'Remove GST'.",
      "Enter the amount and select the GST rate.",
      "Read the pre-tax amount, GST split and total.",
    ],
    faqs: [
      { q: "What are the current GST rates?", a: "Since 22 September 2025 the main slabs in India are 5% and 18%, with 40% for select luxury and sin goods and 0% for nil-rated items. A few goods have special rates such as 0.25% and 3%. Always confirm the rate for your item in the official notifications." },
      { q: "Can I calculate the old 12% or 28% slabs?", a: "Yes. Choose 'Custom rate' and enter the percentage." },
      { q: "When is CGST and SGST used instead of IGST?", a: "CGST and SGST apply to supplies within one state. IGST, equal to the full GST, applies to inter-state supplies." },
    ],
  },
  "discount-calculator": {
    about:
      "Find the final price after a discount and see how much you save. If a shop offers a second discount on top of the first, enter it as the additional discount and the calculator applies it to the already reduced price.",
    steps: [
      "Enter the original price and the discount percentage.",
      "Optionally add a second discount.",
      "Read the final price, the amount saved and the effective discount.",
    ],
    faqs: [
      { q: "Why is 20% plus 10% not 30% off?", a: "The second discount applies to the reduced price, so the total saving is 28%, not 30%." },
    ],
  },
  "bmi-calculator": {
    about:
      "BMI (body mass index) compares weight to height. This calculator accepts metric or imperial units, shows the WHO adult category and the weight range that corresponds to a BMI of 18.5 to 24.9 for your height.",
    steps: [
      "Choose metric or imperial units.",
      "Enter your height and weight.",
      "Read your BMI, category and the healthy weight range.",
    ],
    faqs: [
      { q: "Is BMI accurate for everyone?", a: "No. It does not separate muscle from fat and is meant for adults. It is a screening number, not a diagnosis." },
      { q: "Can I use it for children?", a: "No. Children and teenagers are assessed with age-specific growth charts. Ask a doctor." },
    ],
  },
  "unit-converter": {
    about:
      "Convert between common units of length, weight, temperature, area, volume and speed. Volume units such as cups and gallons use US measures. Use the swap button to reverse the conversion.",
    steps: [
      "Choose a category.",
      "Enter a value and select the units to convert from and to.",
      "Read the converted value instantly.",
    ],
    faqs: [
      { q: "Are the conversions exact?", a: "They use the internationally defined conversion factors and are shown to up to 10 significant digits." },
      { q: "Are cups and gallons US or imperial?", a: "US customary. Imperial gallons and cups are different sizes." },
    ],
  },
  "merge-pdf": {
    about:
      "Merge PDF combines several PDF files into one document in the order you choose. Your files are processed inside your browser and are not uploaded to DailyDesk servers. Password-protected files must be unlocked first.",
    steps: [
      "Add two or more PDF files.",
      "Use the arrows to put them in the right order.",
      "Click Merge and download merged.pdf.",
    ],
    faqs: [
      { q: "Is there a limit on files?", a: "You can merge up to 20 PDFs at once, each up to 50 MB." },
      { q: "Will bookmarks and links be kept?", a: "Pages are copied as they are, but document-level features such as bookmarks may not carry over." },
    ],
  },
  "split-pdf": {
    about:
      "Split PDF cuts a document into smaller PDFs, either one file per page or one file per page range you define. Your files are processed inside your browser and are not uploaded to DailyDesk servers.",
    steps: [
      "Choose a PDF.",
      "Pick page ranges such as 1-3, 4, 5-8, or choose every page.",
      "Download the files one by one or all together as a ZIP.",
    ],
    faqs: [
      { q: "How do page ranges work?", a: "Each comma-separated part becomes its own PDF. 1-3, 4 creates two files: pages 1 to 3, and page 4." },
      { q: "Is there a maximum number of output files?", a: "Yes, up to 300 files per run. Use ranges for very large documents." },
    ],
  },
  "compress-pdf": {
    about:
      "Compress PDF reduces file size in two ways. Light mode rewrites the file compactly and keeps text selectable. Strong mode turns pages into images, which can shrink scanned or picture-heavy PDFs much more. Your files are processed inside your browser and are not uploaded to DailyDesk servers.",
    steps: [
      "Choose a PDF.",
      "Pick Light or Strong mode.",
      "Compress and compare the sizes before downloading.",
    ],
    faqs: [
      { q: "Why did my PDF not get smaller?", a: "Some PDFs are already well compressed. If the result is not smaller, no file is offered so you do not download a bigger one." },
      { q: "Does Strong mode lose text?", a: "Yes. Pages become pictures, so text can no longer be selected or searched. Use Light mode if you need to keep text." },
    ],
  },
  "pdf-to-images": {
    about:
      "PDF to Images turns each page of a PDF into a PNG or JPG picture at the resolution you choose. Your files are processed inside your browser and are not uploaded to DailyDesk servers.",
    steps: [
      "Choose a PDF.",
      "Select PNG or JPG and a resolution, and optionally the pages.",
      "Download single images or all pages as a ZIP.",
    ],
    faqs: [
      { q: "Which resolution should I pick?", a: "150 DPI suits screens and sharing. Use 300 DPI for printing, but expect larger files." },
      { q: "Is there a page limit?", a: "Up to 100 pages per run. Use the pages box to convert longer documents in parts." },
    ],
  },
  "images-to-pdf": {
    about:
      "Images to PDF puts your pictures into a single PDF, one image per page. Choose A4, US Letter, or pages that match each image. Your files are processed inside your browser and are not uploaded to DailyDesk servers.",
    steps: [
      "Add JPG, PNG, WebP, GIF or BMP images.",
      "Reorder them and choose a page size.",
      "Create the PDF and download it.",
    ],
    faqs: [
      { q: "Will photos from my phone be the right way up?", a: "Yes. Each image is redrawn with its rotation applied before it is placed in the PDF." },
      { q: "How many images can I add?", a: "Up to 40 images, each up to 25 MB." },
    ],
  },
  "extract-pdf-pages": {
    about:
      "Extract PDF Pages copies only the pages you choose into a new PDF. Type pages and ranges in any order, for example 5, 1-3. Your files are processed inside your browser and are not uploaded to DailyDesk servers.",
    steps: [
      "Choose a PDF.",
      "Type the pages to keep, such as 1-3, 7, 10.",
      "Extract and download the new PDF.",
    ],
    faqs: [
      { q: "Can I change the page order?", a: "Yes. Pages are placed in the order you type them, so 3, 1 puts page 3 first." },
      { q: "Does it change the original file?", a: "No. Your original file stays untouched. You download a new file." },
    ],
  },
  "rotate-pdf": {
    about:
      "Rotate PDF turns all pages, or only the pages you choose, by 90 degrees right, 180 degrees or 90 degrees left, then saves a new PDF. Your files are processed inside your browser and are not uploaded to DailyDesk servers.",
    steps: [
      "Choose a PDF.",
      "Select the rotation and which pages to turn.",
      "Rotate and download the result.",
    ],
    faqs: [
      { q: "Can I rotate only some pages?", a: "Yes. Choose Selected pages and type them, for example 2, 4-6." },
      { q: "Can I undo a rotation?", a: "Rotate again in the opposite direction, or use your original file, which is never changed." },
    ],
  },
  "image-compressor": {
    about:
      "Image Compressor shrinks JPG, PNG, WebP, GIF and BMP pictures into smaller JPEG or WebP files. Adjust quality and optionally limit the longest side. Your files are processed inside your browser and are not uploaded to DailyDesk servers.",
    steps: [
      "Choose an image.",
      "Pick a format, quality and optional maximum size.",
      "Compress and compare file sizes before downloading.",
    ],
    faqs: [
      { q: "Which format makes the smallest file?", a: "WebP is usually smaller than JPEG at similar quality." },
      { q: "Why did my file get bigger?", a: "Already optimized images can grow when re-encoded. Lower the quality or reduce the size." },
    ],
  },
  "image-resizer": {
    about:
      "Image Resizer changes an image to exact pixel dimensions or to a percentage of its size, with proportions kept if you wish. Your files are processed inside your browser and are not uploaded to DailyDesk servers.",
    steps: [
      "Choose an image.",
      "Enter a new width and height, or a percentage.",
      "Resize and download the new image.",
    ],
    faqs: [
      { q: "Will the picture be blurry if I enlarge it?", a: "Enlarging cannot add detail, so large increases look soft. Shrinking keeps images sharp." },
      { q: "What format is the result?", a: "The same as the original for JPG, PNG and WebP. GIF and BMP images are saved as PNG." },
    ],
  },
  "jpg-to-png": {
    about:
      "JPG to PNG converts a JPG picture to a lossless PNG file. Your files are processed inside your browser and are not uploaded to DailyDesk servers.",
    steps: [
      "Choose a JPG image.",
      "Click Convert.",
      "Download the PNG.",
    ],
    faqs: [
      { q: "Will quality improve?", a: "No. Converting cannot restore detail already lost in the JPG, and PNG files are usually larger." },
      { q: "Why convert to PNG?", a: "PNG is useful when you need to edit repeatedly without further quality loss, or need a format a site requires." },
    ],
  },
  "png-to-jpg": {
    about:
      "PNG to JPG converts a PNG picture to a smaller JPG file. Choose the quality and the colour that replaces transparent areas. Your files are processed inside your browser and are not uploaded to DailyDesk servers.",
    steps: [
      "Choose a PNG image.",
      "Pick the background colour and quality.",
      "Convert and download the JPG.",
    ],
    faqs: [
      { q: "What happens to transparency?", a: "JPG cannot be transparent, so transparent areas are filled with the colour you choose, white by default." },
      { q: "Is the quality reduced?", a: "JPG is lossy, but at 90% and above the difference is usually hard to see." },
    ],
  },
  "image-cropper": {
    about:
      "Image Cropper lets you drag over a picture to select the area to keep, or type exact pixel values, with optional 1:1, 4:3 and 16:9 shapes. Your files are processed inside your browser and are not uploaded to DailyDesk servers.",
    steps: [
      "Choose an image.",
      "Drag on the picture to select the area, or fine tune the numbers.",
      "Crop and download the result.",
    ],
    faqs: [
      { q: "Can I crop on a phone?", a: "Yes. Drag with your finger. You can also type exact numbers." },
      { q: "Does cropping change the quality?", a: "The kept area is copied at its original resolution." },
    ],
  },
  "qr-generator": {
    about:
      "QR Code Generator creates a QR code from any text or link, with your choice of size, colours and error correction. Download it as a PNG or a scalable SVG. The code is generated in your browser. Nothing you type is sent to our servers.",
    steps: [
      "Type or paste a link or text.",
      "Choose size, colours and error correction.",
      "Download the PNG or SVG.",
    ],
    faqs: [
      { q: "Do these QR codes expire?", a: "No. The code simply contains your text, so it works as long as the link itself does." },
      { q: "Which error-correction level should I use?", a: "Medium suits most uses. Choose High if the code may get dirty or if you place a logo over it." },
    ],
  },
  "color-palette-generator": {
    about:
      "Color Palette Generator builds matching colour schemes from a base colour: analogous, complementary, split complementary, triadic, tetradic and monochromatic. Click a swatch to copy its hex code, or copy ready-made CSS variables. Everything runs in your browser.",
    steps: [
      "Pick a base colour or type a hex code.",
      "Choose a colour scheme.",
      "Click swatches to copy hex codes, or copy the CSS variables.",
    ],
    faqs: [
      { q: "What is an analogous palette?", a: "Colours next to each other on the colour wheel. They look calm and harmonious." },
      { q: "How do I find a good base colour?", a: "Use Random base colour until something appeals, then try the different schemes." },
    ],
  },
  "todo-list": {
    about:
      "The To-Do List lets you add, edit, tick off and delete tasks, set optional due dates and filter by active or done. Tasks are saved only in this browser.",
    steps: [
      "Type a task, optionally pick a due date, and press Add.",
      "Tick the box when it is done, or use the pencil to edit it.",
      "Tasks remain in this browser and are not synced to another device.",
    ],
    faqs: [
      { q: "Where are my tasks stored?", a: "Only in this browser on this device." },
    ],
  },
  "notes-manager": {
    about:
      "The Notes Manager is a simple place to write, search and keep notes. Notes are saved only in this browser.",
    steps: [
      "Choose New note and write a title and text.",
      "Press Save. Use the search box to find notes later.",
      "Your notes stay in this browser and are not synced to another device.",
    ],
    faqs: [
      { q: "Is there a size limit?", a: "Each note can be up to 20,000 characters, and up to 1,000 notes can be stored in this browser." },
      { q: "Are my notes private?", a: "Notes stay in this browser and are not sent to DailyDesk." },
    ],
  },
  "pomodoro-timer": {
    about:
      "The Pomodoro Timer helps you work in focused sprints: 25 minutes of focus followed by a short break, and a longer break after four sessions. You can change every length. The timer keeps correct time even if the tab is in the background.",
    steps: [
      "Press Start to begin a focus session.",
      "When the time ends you will hear a short sound and the next mode is ready.",
      "Adjust the lengths under Settings. They are saved in this browser.",
    ],
    faqs: [
      { q: "What is the Pomodoro technique?", a: "Work in short, timed sessions with regular breaks to stay focused and avoid burnout. The classic length is 25 minutes." },
      { q: "Does it work if I switch tabs?", a: "Yes. It measures real elapsed time, and the remaining time is shown in the tab title while it runs. Some browsers may delay the sound in background tabs." },
    ],
  },
  "daily-planner": {
    about:
      "The Daily Planner lets you plan each day with optional times, tick items off as you go and move between days. Plans are saved only in this browser.",
    steps: [
      "Pick a day, add a plan with an optional time and press Add.",
      "Tick items when they are done. Use the arrows to move between days.",
      "Your plans stay in this browser and are not synced to another device.",
    ],
    faqs: [
      { q: "Can I plan future days?", a: "Yes. Use the next-day arrow or pick any date." },
      { q: "How many plans can I save?", a: "Up to 1,000 entries can be stored in this browser." },
    ],
  },
  "habit-tracker": {
    about:
      "The Habit Tracker helps you build routines. Add a habit, tick the days you did it, and watch your current and best streaks grow. Data is saved only in this browser.",
    steps: [
      "Add a habit you want to build.",
      "Tap each day you complete it. The last seven days are shown.",
      "Keep your streak going. Today counts only when you tick it, but a missed today does not break yesterday's streak yet.",
    ],
    faqs: [
      { q: "How is the streak counted?", a: "It counts consecutive days ending today, or ending yesterday if you have not ticked today yet." },
      { q: "How many habits can I track?", a: "Up to 1,000 habits can be stored in this browser." },
    ],
  },
  "password-generator": {
    about:
      "The Password Generator creates strong random passwords right in your browser using your device's secure random number generator. Choose the length and character types, and copy the result. Passwords are never sent anywhere or saved.",
    steps: [
      "Choose a length and the character types you want.",
      "A new password is created instantly. Press Generate another for more.",
      "Copy it and store it in a password manager.",
    ],
    faqs: [
      { q: "Is it safe to use?", a: "The password is created locally and not transmitted or stored. Still, store it somewhere safe and never reuse it on other sites." },
      { q: "How long should my password be?", a: "At least 14 to 16 characters for important accounts. Longer is stronger." },
    ],
  },
};
