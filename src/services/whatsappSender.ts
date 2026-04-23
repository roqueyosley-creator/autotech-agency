/**
 * Servicio de envío por WhatsApp
 */
export const whatsappSender = {
  
    /**
     * Genera un enlace wa.me para que el usuario lo abra en el navegador
     */
    generateLink(phone: string, pdfUrl: string, customerName: string) {
      const message = encodeURIComponent(
        `🔧 *Reporte de Diagnóstico AutoTech PRO*\n\n` +
        `Hola ${customerName || 'Cliente'},\n\n` +
        `Tu reporte de diagnóstico vehicular ya está disponible. Puedes visualizarlo y descargarlo en el siguiente enlace:\n` +
        `${pdfUrl}\n\n` +
        `_AutoTech PRO Service_`
      );
      return `https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`;
    },
  
    /**
     * Integración con WhatsApp Business API (Graph API)
     */
    async sendViaAPI(phone: string, pdfUrl: string, reportId: string) {
      const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
      const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
  
      if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
        console.warn("WhatsApp API credentials not configured.");
        return { success: false, error: "CREDENTIALS_MISSING" };
      }
  
      try {
        const response = await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: phone.replace(/\D/g, ''),
            type: "template",
            template: {
              name: "diagnostic_report",
              language: { code: "es" },
              components: [
                {
                  type: "header",
                  parameters: [
                    { type: "document", document: { link: pdfUrl, filename: `Reporte_${reportId}.pdf` } }
                  ]
                }
              ]
            }
          })
        });
  
        const data = await response.json();
        return { success: response.ok, data };
      } catch (err) {
        console.error("WhatsApp API Error:", err);
        return { success: false, error: err };
      }
    }
  };
