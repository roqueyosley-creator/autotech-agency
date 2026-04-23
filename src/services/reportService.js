import { REPORT_TEMPLATE } from '../utils/reportTemplates';
import { calculateQuoteSummary, calculateSeverity, generateLocalId, blobToBase64 } from '../utils/quoteCalculator';

const API_BASE = window.location.origin.includes('localhost') ? 'http://localhost:3001' : '';

export const reportService = {

  async generate(reportData) {
    const workshopConfig = this.getWorkshopConfig();
    const payload = {
      workshop: workshopConfig,
      vehicle: reportData.vehicleData,
      customer: reportData.customerData || {},
      dtcs: reportData.dtcs || [],
      telemetry: reportData.telemetry || {},
      ai_diagnosis: reportData.aiDiagnosis || null,
      quote_items: reportData.quoteItems || [],
      quote_summary: calculateQuoteSummary(
        reportData.quoteItems,
        reportData.taxRate || workshopConfig.default_tax || 0,
        reportData.discount || 0,
        workshopConfig
      ),
      technician_notes: reportData.notes || '',
      report_number: this.getNextReportNumber(),
      created_at: new Date().toISOString(),
      severity: calculateSeverity(reportData.dtcs),
      report_id: generateLocalId()
    };

    // Intentar backend primero si está disponible
    try {
      const res = await fetch(`${API_BASE}/api/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        this.saveToLocalHistory(payload);
        return { 
          url: data.pdf_url,
          base64: data.base64,
          report_id: data.report_id || payload.report_id
        };
      }
    } catch (err) {
      console.warn("Backend report generation failed, using local fallback", err);
    }

    // Fallback: generar localmente
    return this.generateLocalPDF(payload);
  },

  async generateLocalPDF(payload) {
    // Nota: Requiere html2canvas y jsPDF cargados en el proyecto
    const html = REPORT_TEMPLATE(payload);
    
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '800px'; // Ancho aproximado A4 a 96dpi
    document.body.appendChild(container);
    
    try {
      // Cargamos dinámicamente si no están (en un entorno real estarían instalados via npm)
      if (!window.html2canvas || !window.jspdf) {
        throw new Error("Librerías de PDF no cargadas. Se requiere conexión para el primer reporte.");
      }

      const canvas = await window.html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      document.body.removeChild(container);
      
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Ajustar imagen al tamaño A4 (210x297mm)
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const base64 = await blobToBase64(blob);
      
      this.saveToLocalHistory(payload);

      return { url, base64, report_id: payload.report_id };
    } catch (err) {
      document.body.removeChild(container);
      throw err;
    }
  },

  saveToLocalHistory(report) {
    const history = JSON.parse(localStorage.getItem('report_history') || '[]');
    history.unshift(report);
    localStorage.setItem('report_history', JSON.stringify(history.slice(0, 50))); // Guardar últimos 50
  },

  getWorkshopConfig() {
    return JSON.parse(localStorage.getItem('workshop_config') || JSON.stringify({
      name: 'AutoTech PRO Workshop',
      address: 'Av. Principal 123, Ciudad',
      phone: '+52 555 123 4567',
      email: 'contacto@autotech.pro',
      currency: 'USD',
      default_tax: 16
    }));
  },

  getNextReportNumber() {
    const lastNum = parseInt(localStorage.getItem('last_report_num') || '1000');
    const nextNum = lastNum + 1;
    localStorage.setItem('last_report_num', nextNum.toString());
    return nextNum;
  },

  async sendWhatsApp(reportId, phone, pdfUrl) {
    const message = encodeURIComponent(
      `🔧 *Reporte de Diagnóstico AutoTech PRO*\n\n` +
      `Tu reporte está listo. Puedes visualizarlo y descargarlo aquí:\n` +
      `${pdfUrl}\n\n` +
      `_Servicio Automotriz Profesional_`
    );
    const waUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`;
    window.open(waUrl, '_blank');
  },

  async sendEmail(reportData, email) {
    const subject = encodeURIComponent(
      `Reporte de Diagnóstico - ${reportData.vehicle.make} ${reportData.vehicle.model}`
    );
    const body = encodeURIComponent(
      `Estimado(a) ${reportData.customer.name || 'cliente'},\n\n` +
      `Le adjuntamos el reporte de diagnóstico y presupuesto de su vehículo.\n\n` +
      `Resumen del estado: ${reportData.severity.toUpperCase()}\n` +
      `Códigos de falla: ${reportData.dtcs.length}\n\n` +
      `Saludos,\n${this.getWorkshopConfig().name}`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }
};
