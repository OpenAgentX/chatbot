import { Download } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { UIArtifact } from "./artifact";

import { marked } from "marked";


export function ArtifactExportMenu({
  artifact,
  content,
}: {
  artifact: UIArtifact;
  content: string;
}) {
  const handleExportMarkdown = () => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${artifact.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to Markdown");
  };

  const handleExportWord = async () => {
    toast.info("Generating Word document...");
    try {
      const { asBlob } = await import("html-docx-js-typescript");
      const htmlContent = await marked.parse(content);
      const documentHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${artifact.title}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            h1, h2, h3, h4, h5, h6 { color: #111; margin-top: 1.5em; margin-bottom: 0.5em; }
            p { margin-bottom: 1em; }
            code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
            pre { background-color: #f4f4f4; padding: 1em; border-radius: 4px; overflow-x: auto; }
            blockquote { border-left: 4px solid #ccc; margin-left: 0; padding-left: 1em; color: #666; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
        </html>
      `;
      const blob = await asBlob(documentHtml);
      const url = URL.createObjectURL(blob as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${artifact.title}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported to Word successfully!");
    } catch (error) {
      console.error("Export to Word failed:", error);
      toast.error("Failed to export Word document.");
    }
  };

  const handleExportPDF = async () => {
    toast.info("Preparing PDF document...");
    try {
      const htmlContent = await marked.parse(content);
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${artifact.title}</title>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; padding: 20px; max-width: 800px; margin: 0 auto; }
                h1, h2, h3, h4, h5, h6 { color: #111; margin-top: 1.5em; margin-bottom: 0.5em; }
                p { margin-bottom: 1em; }
                code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
                pre { background-color: #f4f4f4; padding: 1em; border-radius: 4px; overflow-x: auto; }
                blockquote { border-left: 4px solid #ccc; margin-left: 0; padding-left: 1em; color: #666; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                @media print {
                  body { padding: 0; max-width: none; }
                }
              </style>
            </head>
            <body>
              ${htmlContent}
              <script>
                window.onload = () => {
                  setTimeout(() => {
                    window.print();
                    window.close();
                  }, 200);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        toast.success("Ready to print or save PDF!");
      } else {
        toast.error("Failed to open print window. Please allow popups.");
      }
    } catch (error) {
      console.error("Export to PDF failed:", error);
      toast.error("Failed to export PDF document.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" title="Export">
          <Download size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportMarkdown}>
          Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportWord}>
          Export as Word
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
