# Automatización de Alertas DTC con n8n

Para conectar el sistema de diagnóstico con n8n y automatizar el envío de correos, sigue este flujo:

## 1. Configuración en Supabase (Trigger)
Configura un **Database Webhook** en el dashboard de Supabase:
- **Table**: `errores_dtc`
- **Events**: `INSERT`
- **Target URL**: La URL que obtendrás del nodo "Webhook" en n8n.

## 2. Estructura del Workflow en n8n
Crea un nuevo workflow con los siguientes nodos:

1.  **Webhook Node**:
    - Method: `POST`
    - Recibirá el trigger de Supabase con el `codigo` (DTC) y el `diagnostico_id`.

2.  **HTTP Request (Opcional - Lookup)**:
    - Si necesitas más detalles del error, puedes hacer una consulta a una API de base de datos DTC o usar un nodo de **AI Agent** (Gemini/OpenAI) con un prompt como:
      `"Actúa como un experto mecánico. Para el código de falla OBD-II {{ $json.codigo }}, devuelve una descripción técnica, 3 posibles causas y una lista de 2 repuestos comunes asociados."`

3.  **Supabase Node (Get Vehicle Data)**:
    - Usa el `diagnostico_id` para obtener el `vin`, marca y modelo del vehículo desde la tabla `diagnosticos` y `vehiculos`.

4.  **Gmail / Resend Node (Notification)**:
    - **To**: Correo del cliente o técnico.
    - **Subject**: `⚠️ Alerta de Motor: Código {{ $json.codigo }} Detectado`
    - **Body**: 
      ```text
      Se ha detectado un error en tu {{ $json.marca }} {{ $json.modelo }}.
      Código: {{ $json.codigo }}
      Descripción: {{ $json.descripcion_ai }}
      
      Sugerencia de Repuestos:
      - {{ $json.repuestos_ai }}
      ```

## 3. Beneficios
- **Proactividad**: El cliente recibe la alerta segundos después de que el escáner detecta el problema.
- **Monetización**: Al incluir repuestos sugeridos, puedes enlazar directamente a tu tienda o catálogo.
