"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { ErrorMessage, Field, Segmented, ToolPanel } from "@/components/tools/ui";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { contrastRatio, hexToRgb } from "@/lib/color";
import { bytesToBlob, downloadBlob } from "@/lib/files";

type Ecc = "L" | "M" | "Q" | "H";
const MAX_CHARS = 1500;

function dataUrlToBlob(url: string): Blob {
  const [head, data = ""] = url.split(",");
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytesToBlob(bytes, /data:([^;]+)/.exec(head)?.[1] ?? "image/png");
}

export default function QrGenerator() {
  const [text, setText] = useState("");
  const [size, setSize] = useState("512");
  const [ecc, setEcc] = useState<Ecc>("M");
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const trimmed = text.trim();
  const lowContrast = (() => {
    const a = hexToRgb(fg);
    const b = hexToRgb(bg);
    return a && b ? contrastRatio(a, b) < 3 : false;
  })();

  useEffect(() => {
    let cancelled = false;
    if (!trimmed) {
      setDataUrl(null);
      setError(null);
      return;
    }
    if (trimmed.length > MAX_CHARS) {
      setDataUrl(null);
      setError(`Please keep the content under ${MAX_CHARS} characters.`);
      return;
    }
    (async () => {
      try {
        const QRCode = await import("qrcode");
        const url = await QRCode.toDataURL(trimmed, { width: Number(size), margin: 2, errorCorrectionLevel: ecc, color: { dark: fg, light: bg } });
        if (!cancelled) {
          setDataUrl(url);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setDataUrl(null);
          setError("This content is too long to fit in a QR code with this error-correction level. Shorten it or choose a lower level.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [trimmed, size, ecc, fg, bg]);

  async function downloadPng() {
    if (!dataUrl) return;
    downloadBlob(dataUrlToBlob(dataUrl), "qr-code.png");
  }

  async function downloadSvg() {
    const QRCode = await import("qrcode");
    const svg = await QRCode.toString(trimmed, { type: "svg", margin: 2, errorCorrectionLevel: ecc, color: { dark: fg, light: bg } });
    downloadBlob(bytesToBlob(new TextEncoder().encode(svg), "image/svg+xml"), "qr-code.svg");
  }

  return (
    <ToolPanel>
      <div className="space-y-5">
        <Field label="Text or link" htmlFor="qr-text" hint="For websites, include https:// at the start.">
          <textarea
            id="qr-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="https://example.com"
            className="flex w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
          />
        </Field>
        <Field label="Size" htmlFor="qr-size">
          <Select id="qr-size" value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="256">256 px</option>
            <option value="512">512 px</option>
            <option value="1024">1024 px</option>
          </Select>
        </Field>
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Error correction</p>
          <Segmented
            label="Error correction"
            value={ecc}
            onChange={setEcc}
            options={[
              { value: "L", label: "Low" },
              { value: "M", label: "Medium" },
              { value: "Q", label: "Quartile" },
              { value: "H", label: "High" },
            ]}
          />
          <p className="text-xs text-muted-foreground">Higher levels still scan if the code is dirty or partly covered, but need more space.</p>
        </div>
        <div className="flex gap-6">
          <Field label="Code colour" htmlFor="qr-fg">
            <input id="qr-fg" type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-10 w-20 cursor-pointer rounded-md border bg-background p-1" />
          </Field>
          <Field label="Background" htmlFor="qr-bg">
            <input id="qr-bg" type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-10 w-20 cursor-pointer rounded-md border bg-background p-1" />
          </Field>
        </div>
        {lowContrast && <p className="text-xs text-destructive">These colours have low contrast and may not scan. A dark code on a light background works best.</p>}
      </div>
      <div className="space-y-4" aria-live="polite">
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {dataUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUrl} alt="Generated QR code" className="mx-auto h-64 w-64 rounded-lg border bg-white object-contain" />
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={downloadPng}><Download className="h-4 w-4" /> Download PNG</Button>
              <Button variant="outline" onClick={downloadSvg}><Download className="h-4 w-4" /> Download SVG</Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">Test the code with your phone before printing or sharing it.</p>
          </>
        ) : (
          !error && <p className="text-sm text-muted-foreground">Type some text or a link to create your QR code.</p>
        )}
      </div>
    </ToolPanel>
  );
}
