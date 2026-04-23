export const REPORT_TEMPLATE = (data) => `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');

  :root {
    --primary: #0066FF;
    --danger: #FF3B3B;
    --warning: #FF8C00;
    --success: #00C853;
    --dark: #0A0A0F;
    --gray: #6B7280;
    --light: #F9FAFB;
    --border: #E5E7EB;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    font-family: 'Inter', sans-serif;
    color: var(--dark);
    background: white;
    font-size: 11px;
    line-height: 1.5;
    padding: 0;
    margin: 0;
  }

  /* MARCA DE AGUA */
  body::before {
    content: 'AUTOTECH PRO';
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 80px;
    font-weight: 900;
    color: rgba(0, 102, 255, 0.04);
    white-space: nowrap;
    z-index: 0;
    pointer-events: none;
  }

  /* HEADER DEL TALLER */
  .header {
    background: linear-gradient(135deg, var(--dark) 0%, #1a1a2e 100%);
    color: white;
    padding: 32px 40px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .workshop-name {
    font-size: 24px;
    font-weight: 900;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
  }

  .workshop-tagline {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: var(--primary);
    font-weight: 700;
  }

  .workshop-contact {
    text-align: right;
    font-size: 10px;
    color: rgba(255,255,255,0.6);
    line-height: 1.8;
  }

  .report-badge {
    display: inline-block;
    background: var(--primary);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-top: 8px;
  }

  /* BANNER DE SEVERIDAD */
  .severity-banner {
    padding: 12px 40px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .severity-critical { background: #FEF2F2; color: var(--danger); border-bottom: 2px solid var(--danger); }
  .severity-warning { background: #FFFBEB; color: var(--warning); border-bottom: 2px solid var(--warning); }
  .severity-ok { background: #F0FDF4; color: var(--success); border-bottom: 2px solid var(--success); }

  /* SECCIÓN DE VEHÍCULO */
  .section {
    padding: 24px 40px;
    border-bottom: 1px solid var(--border);
    position: relative;
    z-index: 1;
  }

  .section-title {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: var(--gray);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .vehicle-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  .vehicle-field label {
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--gray);
    display: block;
    margin-bottom: 2px;
  }

  .vehicle-field .value {
    font-size: 13px;
    font-weight: 700;
    color: var(--dark);
  }

  .vin-code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    background: var(--light);
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid var(--border);
    letter-spacing: 2px;
    margin-top: 16px;
    display: inline-block;
  }

  /* TABLA DE DTCs */
  .dtc-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
  }

  .dtc-table th {
    background: var(--light);
    padding: 10px 12px;
    text-align: left;
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--gray);
    border-bottom: 2px solid var(--border);
  }

  .dtc-table td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    vertical-align: top;
  }

  .dtc-code {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-size: 12px;
  }

  .severity-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .badge-critical { background: #FEE2E2; color: var(--danger); }
  .badge-warning  { background: #FEF3C7; color: var(--warning); }
  .badge-info     { background: #DBEAFE; color: var(--primary); }

  /* TELEMETRÍA */
  .telemetry-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-top: 8px;
  }

  .telemetry-item {
    background: var(--light);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px;
    text-align: center;
  }

  .telemetry-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 20px;
    font-weight: 700;
    color: var(--primary);
    line-height: 1;
    margin-bottom: 4px;
  }

  .telemetry-unit {
    font-size: 8px;
    color: var(--gray);
    text-transform: uppercase;
    font-weight: 700;
  }

  .telemetry-label {
    font-size: 9px;
    color: var(--dark);
    font-weight: 600;
    margin-top: 4px;
  }

  /* DIAGNÓSTICO IA */
  .ai-diagnosis {
    background: linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%);
    border: 1px solid #BFDBFE;
    border-radius: 12px;
    padding: 20px;
    margin-top: 8px;
  }

  .ai-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--primary);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
  }

  .ai-summary {
    font-size: 13px;
    font-weight: 700;
    color: var(--dark);
    margin-bottom: 8px;
  }

  .probability-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .prob-bar {
    flex: 1;
    height: 6px;
    background: var(--border);
    border-radius: 3px;
    overflow: hidden;
  }

  .prob-fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, var(--primary), #00D4FF);
  }

  /* TABLA DE COTIZACIÓN */
  .quote-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
  }

  .quote-table th {
    background: var(--dark);
    color: white;
    padding: 10px 12px;
    text-align: left;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .quote-table td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
  }

  .quote-table tr:nth-child(even) td { background: var(--light); }

  /* TOTALES */
  .totals-section {
    margin-left: auto;
    width: 280px;
    margin-top: 16px;
  }

  .total-line {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px solid var(--border);
    font-size: 11px;
  }

  .total-final {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    font-size: 18px;
    font-weight: 900;
    color: var(--primary);
  }

  /* FOOTER */
  .footer {
    background: var(--light);
    border-top: 2px solid var(--border);
    padding: 20px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
  }

  .footer-text {
    font-size: 9px;
    color: var(--gray);
    line-height: 2;
  }

  .qr-placeholder {
    width: 60px;
    height: 60px;
    background: var(--dark);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 7px;
    font-weight: 700;
    text-align: center;
  }

  .page-number {
    font-size: 9px;
    color: var(--gray);
    text-align: center;
    margin-top: 4px;
  }

  @media print {
    body { -webkit-print-color-adjust: exact; }
  }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="workshop-name">${data.workshop.name}</div>
    <div class="workshop-tagline">Diagnóstico Automotriz Profesional</div>
    <div class="report-badge">Reporte #${data.report_number}</div>
  </div>
  <div class="workshop-contact">
    <div>${data.workshop.address}</div>
    <div>${data.workshop.phone}</div>
    <div>${data.workshop.email || ''}</div>
    <div style="margin-top:8px; color:white; font-size:10px">
      ${new Date(data.created_at).toLocaleDateString('es-MX', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })}
    </div>
  </div>
</div>

<div class="severity-banner severity-${data.severity}">
  ${data.severity === 'critical' ? '⚠️ FALLAS CRÍTICAS DETECTADAS' : data.severity === 'warning' ? '⚡ ADVERTENCIAS DETECTADAS' : '✅ VEHÍCULO EN BUEN ESTADO'}
  — ${data.dtcs.length} código(s) encontrado(s)
</div>

<div class="section">
  <div class="section-title">Datos del Vehículo</div>
  <div class="vehicle-grid">
    <div class="vehicle-field"><label>Marca</label><div class="value">${data.vehicle.make}</div></div>
    <div class="vehicle-field"><label>Modelo</label><div class="value">${data.vehicle.model}</div></div>
    <div class="vehicle-field"><label>Año</label><div class="value">${data.vehicle.year}</div></div>
    <div class="vehicle-field"><label>Motor</label><div class="value">${data.vehicle.engine || 'N/A'}</div></div>
    <div class="vehicle-field"><label>Propietario</label><div class="value">${data.customer.name || 'N/A'}</div></div>
    <div class="vehicle-field"><label>Teléfono</label><div class="value">${data.customer.phone || 'N/A'}</div></div>
    <div class="vehicle-field"><label>Kilometraje</label><div class="value">${data.vehicle.mileage?.toLocaleString() || 'N/A'} km</div></div>
    <div class="vehicle-field"><label>Tipo</label><div class="value">${data.vehicle.type === 'car' ? 'Automóvil' : 'Motocicleta'}</div></div>
  </div>
  ${data.vehicle.vin ? `<div class="vin-code">VIN: ${data.vehicle.vin}</div>` : ''}
</div>

${data.dtcs.length > 0 ? `
<div class="section">
  <div class="section-title">Códigos de Falla Detectados (${data.dtcs.length})</div>
  <table class="dtc-table">
    <thead>
      <tr><th>Código</th><th>Sistema</th><th>Descripción</th><th>Severidad</th><th>Causas Comunes</th></tr>
    </thead>
    <tbody>
      ${data.dtcs.map(dtc => `
      <tr>
        <td><span class="dtc-code">${dtc.code}</span></td>
        <td>${dtc.system || '-'}</td>
        <td style="max-width:200px">${dtc.description_es || dtc.description || '-'}</td>
        <td><span class="severity-badge badge-${dtc.severity || 'info'}">${dtc.severity === 'critical' ? 'Crítico' : dtc.severity === 'warning' ? 'Advertencia' : 'Informativo'}</span></td>
        <td style="color:#6B7280; max-width:150px">${(dtc.common_causes || []).slice(0,2).join(', ') || '-'}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</div>
` : ''}

<div class="section">
  <div class="section-title">Telemetría al Momento del Diagnóstico</div>
  <div class="telemetry-grid">
    <div class="telemetry-item"><div class="telemetry-value">${data.telemetry.rpm || 0}</div><div class="telemetry-unit">RPM</div><div class="telemetry-label">Revoluciones</div></div>
    <div class="telemetry-item"><div class="telemetry-value">${data.telemetry.temp || 0}°</div><div class="telemetry-unit">Celsius</div><div class="telemetry-label">Temp. Motor</div></div>
    <div class="telemetry-item"><div class="telemetry-value">${data.telemetry.voltage || 0}</div><div class="telemetry-unit">Voltios</div><div class="telemetry-label">Batería</div></div>
    <div class="telemetry-item"><div class="telemetry-value">${data.telemetry.load || 0}%</div><div class="telemetry-unit">Carga</div><div class="telemetry-label">Motor</div></div>
    <div class="telemetry-item"><div class="telemetry-value">${data.telemetry.speed || 0}</div><div class="telemetry-unit">km/h</div><div class="telemetry-label">Velocidad</div></div>
    <div class="telemetry-item"><div class="telemetry-value">${data.telemetry.throttle || 0}%</div><div class="telemetry-unit">Apertura</div><div class="telemetry-label">Acelerador</div></div>
    <div class="telemetry-item"><div class="telemetry-value">${data.telemetry.maf || 0}</div><div class="telemetry-unit">g/s</div><div class="telemetry-label">Flujo Aire</div></div>
    <div class="telemetry-item"><div class="telemetry-value">${data.telemetry.o2 || 0}</div><div class="telemetry-unit">Voltios</div><div class="telemetry-label">Sensor O2</div></div>
  </div>
</div>

${data.ai_diagnosis ? `
<div class="section">
  <div class="section-title">Diagnóstico con Inteligencia Artificial</div>
  <div class="ai-diagnosis">
    <div class="ai-badge">⚡ AutoTech AI — Gemini 1.5 Pro</div>
    <div class="ai-summary">${data.ai_diagnosis.diagnosis_summary}</div>
    ${data.ai_diagnosis.probable_causes ? `
    <div style="margin-top:12px">
      ${data.ai_diagnosis.probable_causes.slice(0, 3).map(cause => `
      <div class="probability-row">
        <span style="width:160px; font-size:10px; font-weight:600">${cause.component}</span>
        <div class="prob-bar"><div class="prob-fill" style="width:${cause.probability}%"></div></div>
        <span style="width:35px; font-size:10px; font-weight:700; color:#0066FF">${cause.probability}%</span>
      </div>`).join('')}
    </div>` : ''}
  </div>
</div>
` : ''}

${data.quote_items && data.quote_items.length > 0 ? `
<div class="section">
  <div class="section-title">Cotización de Reparación</div>
  <table class="quote-table">
    <thead>
      <tr><th>#</th><th>Descripción</th><th>Mano de Obra</th><th>Refacciones</th><th>Total</th></tr>
    </thead>
    <tbody>
      ${data.quote_items.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.description}</td>
        <td>$${item.labor?.toFixed(2) || '0.00'}</td>
        <td>$${item.parts?.toFixed(2) || '0.00'}</td>
        <td style="font-weight:700">$${((item.labor || 0) + (item.parts || 0)).toFixed(2)}</td>
      </tr>`).join('')}
    </tbody>
  </table>
  <div class="totals-section">
    <div class="total-line"><span>Subtotal</span><span>$${data.quote_summary.subtotal.toFixed(2)}</span></div>
    <div class="total-line"><span>IVA (${data.quote_summary.tax_rate}%)</span><span>$${data.quote_summary.tax.toFixed(2)}</span></div>
    ${data.quote_summary.discount > 0 ? `<div class="total-line" style="color:#00C853"><span>Descuento</span><span>-$${data.quote_summary.discount.toFixed(2)}</span></div>` : ''}
    <div class="total-final"><span>TOTAL</span><span>$${data.quote_summary.total.toFixed(2)} ${data.quote_summary.currency}</span></div>
  </div>
</div>
` : ''}

${data.technician_notes ? `
<div class="section">
  <div class="section-title">Observaciones del Técnico</div>
  <div style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:8px; padding:16px; font-size:11px; line-height:1.8">
    ${data.technician_notes}
  </div>
</div>
` : ''}

<div class="footer">
  <div class="footer-text">
    <div style="font-weight:700; color:#0A0A0F; margin-bottom:4px">${data.workshop.name}</div>
    <div>${data.workshop.address}</div>
    <div>${data.workshop.phone}</div>
    <div style="margin-top:8px; color:#9CA3AF">Reporte generado con AutoTech PRO — ${new Date().toISOString().split('T')[0]}</div>
  </div>
  <div style="text-align:center">
    <div class="qr-placeholder">QR<br>REPORTE</div>
    <div class="page-number">ID: ${data.report_id?.substring(0,8).toUpperCase()}</div>
  </div>
</div>

</body>
</html>
`

export const QUOTE_ONLY_TEMPLATE = (data) => `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
  :root { --primary: #0066FF; --dark: #0A0A0F; --gray: #6B7280; --border: #E5E7EB; --light: #F9FAFB; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: var(--dark); background: white; font-size: 11px; }
  .header { background: var(--dark); color: white; padding: 40px; display: flex; justify-content: space-between; }
  .section { padding: 40px; border-bottom: 1px solid var(--border); }
  .quote-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  .quote-table th { background: var(--light); padding: 12px; text-align: left; font-size: 9px; text-transform: uppercase; border-bottom: 2px solid var(--border); }
  .quote-table td { padding: 12px; border-bottom: 1px solid var(--border); }
  .totals { margin-left: auto; width: 250px; margin-top: 20px; }
  .total-line { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); }
  .total-final { display: flex; justify-content: space-between; padding: 16px 0; font-size: 20px; font-weight: 900; color: var(--primary); }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1 style="font-size:24px; font-weight:900">COTIZACIÓN</h1>
      <p style="color:var(--primary); font-weight:700; letter-spacing:2px">#${data.report_number}</p>
    </div>
    <div style="text-align:right">
      <h2 style="font-size:16px">${data.workshop.name}</h2>
      <p style="font-size:10px; color:rgba(255,255,255,0.6)">${data.workshop.phone}</p>
    </div>
  </div>
  <div class="section">
    <h3 style="font-size:9px; text-transform:uppercase; color:var(--gray); letter-spacing:2px">Cliente & Vehículo</h3>
    <div style="display:grid; grid-template-columns: 1fr 1fr; margin-top:10px">
      <div><strong>Cliente:</strong> ${data.customer.name}</div>
      <div><strong>Vehículo:</strong> ${data.vehicle.make} ${data.vehicle.model} (${data.vehicle.year})</div>
    </div>
  </div>
  <div class="section">
    <table class="quote-table">
      <thead><tr><th>Descripción</th><th>Total</th></tr></thead>
      <tbody>
        ${data.quote_items.map(item => `
        <tr>
          <td>${item.description}</td>
          <td style="font-weight:700">$${((item.labor || 0) + (item.parts || 0)).toFixed(2)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="totals">
      <div class="total-line"><span>Subtotal</span><span>$${data.quote_summary.subtotal.toFixed(2)}</span></div>
      <div class="total-line"><span>IVA (${data.quote_summary.tax_rate}%)</span><span>$${data.quote_summary.tax.toFixed(2)}</span></div>
      <div class="total-final"><span>TOTAL</span><span>$${data.quote_summary.total.toFixed(2)} ${data.quote_summary.currency}</span></div>
    </div>
  </div>
  <div style="padding:40px; font-size:10px; color:var(--gray)">
    * Cotización válida por 15 días naturales a partir de la fecha de emisión.
  </div>
</body>
</html>
`
