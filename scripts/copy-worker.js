const fs=require("fs"),p=require("path");
const src=p.join(__dirname,"..","node_modules","pdfjs-dist","build","pdf.worker.min.js");
try{fs.copyFileSync(src,p.join(__dirname,"..","public","pdf.worker.min.js"));}catch(e){console.warn("pdf worker copy skipped:",e.message);}
