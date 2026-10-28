// QR codes for gear boxes. The code holds only a link with the box id — no contents and no personal data —
// and opens the box on the scanning device, from that device's own gear store.
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export const boxUrl = (id: string) => `${location.origin}${location.pathname}#/box/${encodeURIComponent(id)}`;

export function QrImage({ text, size = 160, label }: { text: string; size?: number; label: string }) {
  const [svg, setSvg] = useState('');
  useEffect(() => { QRCode.toString(text, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' }).then(setSvg, () => setSvg('')); }, [text]);
  return <div role="img" aria-label={label} style={{ width: size, height: size }} className="bg-white p-1" dangerouslySetInnerHTML={{ __html: svg }} />;
}
