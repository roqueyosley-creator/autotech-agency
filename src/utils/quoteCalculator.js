/**
 * Calcula el resumen de una cotización basándose en items, impuestos y descuentos.
 */
export function calculateQuoteSummary(items, taxRate = 16, discount = 0, workshopConfig = {}) {
    const subtotal = items
      .filter(i => i.included !== false)
      .reduce((sum, i) => sum + (parseFloat(i.labor) || 0) + (parseFloat(i.parts) || 0), 0);
  
    const tax = subtotal * (parseFloat(taxRate) / 100);
    
    let discountAmount = 0;
    if (typeof discount === 'string' && discount.endsWith('%')) {
      discountAmount = subtotal * (parseFloat(discount) / 100);
    } else {
      discountAmount = parseFloat(discount) || 0;
    }
  
    const total = subtotal + tax - discountAmount;
  
    return {
      subtotal,
      tax,
      tax_rate: taxRate,
      discount: discountAmount,
      total,
      currency: workshopConfig.currency || 'USD'
    };
  }
  
  /**
   * Determina la severidad general de un conjunto de DTCs.
   */
  export function calculateSeverity(dtcs) {
    if (!dtcs || dtcs.length === 0) return 'ok';
    if (dtcs.some(d => d.severity === 'critical')) return 'critical';
    if (dtcs.some(d => d.severity === 'warning')) return 'warning';
    return 'info';
  }
  
  /**
   * Genera un ID local único para reportes offline.
   */
  export function generateLocalId() {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Convierte un Blob a Base64 string.
   */
  export function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
