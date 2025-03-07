// components/PDFViewer/PDFViewer.tsx
"use client";

export function PDFViewer({ fileUrl }: { fileUrl: string }) {
  return (
    <iframe
      src={fileUrl}
      width="100%"
      height="600px"
      className="border rounded-lg"
      title="PDF Viewer"
    />
  );
}