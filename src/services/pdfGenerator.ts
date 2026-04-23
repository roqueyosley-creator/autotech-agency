import puppeteer from 'puppeteer';
import { REPORT_TEMPLATE } from '../utils/reportTemplates';
import { reportStorage } from './reportStorage';

export interface ReportPayload {
  report_id: string;
  workshop: any;
  vehicle: any;
  customer: any;
  dtcs: any[];
  telemetry: any;
  ai_diagnosis?: any;
  quote_items?: any[];
  quote_summary: any;
  technician_notes?: string;
  report_number: number;
  created_at: string;
  severity: string;
}

export async function generatePDF(payload: ReportPayload) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();
    const html = REPORT_TEMPLATE(payload);
    
    await page.setContent(html, { 
      waitUntil: 'networkidle0' 
    });
    
    await page.addStyleTag({
      content: '@page { margin: 0; size: A4; }'
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();

    // Subir a Supabase Storage
    const fileName = `public/${payload.report_id}.pdf`;
    const pdfUrl = await reportStorage.upload(fileName, Buffer.from(pdfBuffer));

    return {
      pdf_url: pdfUrl,
      base64: `data:application/pdf;base64,${Buffer.from(pdfBuffer).toString('base64')}`,
      file_size: pdfBuffer.length,
      report_id: payload.report_id
    };
  } catch (error) {
    if (browser) await browser.close();
    console.error("PDF Generation error:", error);
    throw error;
  }
}
