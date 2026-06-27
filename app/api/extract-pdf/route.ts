// app/api/extract-pdf/route.ts

import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    // Extract text from each page (pdf-lib doesn't extract text directly)
    // We'll use a different approach - read the raw text
    const buffer = Buffer.from(arrayBuffer);
    let text = buffer.toString('utf-8')
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Try to extract meaningful text
    // Remove PDF structure markers
    text = text.replace(/endobj|stream|endstream|<<|>>|\[\]|obj|xref|trailer|startxref/g, '');
    text = text.replace(/\/[A-Za-z]+/g, '');
    
    // If we got meaningful text
    if (text.length > 50) {
      return NextResponse.json({ 
        text: text,
        pageCount: pageCount,
      });
    }
    
    return NextResponse.json({ 
      error: "No text could be extracted",
      text: "",
      pageCount: pageCount,
    }, { status: 200 });
  } catch (error) {
    console.error("PDF extraction error:", error);
    return NextResponse.json({ 
      error: "Failed to process PDF",
    }, { status: 500 });
  }
}