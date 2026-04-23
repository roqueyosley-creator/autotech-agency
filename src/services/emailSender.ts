import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export const emailSender = {
  async sendReport(email: string, reportData: any, pdfBase64: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'AutoTech Pro <reports@autotech.pro>',
        to: [email],
        subject: `Reporte de Diagnóstico - ${reportData.vehicle.make} ${reportData.vehicle.model}`,
        html: `
          <h1>Tu reporte de diagnóstico está listo</h1>
          <p>Hola ${reportData.customer.name},</p>
          <p>Adjunto encontrarás el reporte detallado del diagnóstico de tu vehículo.</p>
          <br/>
          <p><strong>Resumen:</strong> ${reportData.severity.toUpperCase()}</p>
          <p><strong>Fecha:</strong> ${new Date(reportData.created_at).toLocaleDateString()}</p>
          <br/>
          <p>Gracias por confiar en ${reportData.workshop.name}.</p>
        `,
        attachments: [
          {
            filename: `Reporte_${reportData.report_number}.pdf`,
            content: pdfBase64.split('base64,')[1],
          },
        ],
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error("Email Sender Error:", err);
      return { success: false, error: err };
    }
  }
};
