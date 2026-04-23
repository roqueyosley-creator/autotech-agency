import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  try {
    // Crear un elemento temporal para renderizar el HTML
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '800px'; // Ancho estándar A4 aprox
    container.innerHTML = REPORT_TEMPLATE(payload);
    document.body.appendChild(container);

    // Capturar el HTML como imagen
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Crear el PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    const pdfBlob = pdf.output('blob');
    document.body.removeChild(container);

    // Subir a Supabase Storage
    const fileName = `public/${payload.report_id}.pdf`;
    const pdfUrl = await reportStorage.upload(fileName, pdfBlob);

    return {
      pdf_url: pdfUrl,
      base64: await blobToBase64(pdfBlob),
      file_size: pdfBlob.size,
      report_id: payload.report_id
    };
  } catch (error) {
    console.error("PDF Generation error:", error);
    throw error;
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
