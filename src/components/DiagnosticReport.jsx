import React from 'react';
import { 
    Document, 
    Page, 
    Text, 
    View, 
    StyleSheet, 
    Image, 
    pdf,
    Font
} from '@react-pdf/renderer';

// Configuración de Estilos Profesionales (Enterprise Style)
const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottom: 2,
        borderBottomColor: '#0052cc',
        paddingBottom: 20,
        marginBottom: 30,
    },
    logoSection: {
        flexDirection: 'column',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0052cc',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 10,
        color: '#666666',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        backgroundColor: '#f0f4f8',
        padding: 8,
        marginBottom: 10,
        color: '#0052cc',
        textTransform: 'uppercase',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    gridItem: {
        width: '50%',
        marginBottom: 10,
    },
    label: {
        fontSize: 8,
        color: '#666666',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 11,
        color: '#333333',
        fontWeight: 'bold',
    },
    table: {
        display: 'table',
        width: 'auto',
        borderStyle: 'solid',
        borderColor: '#e1e8ed',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomColor: '#e1e8ed',
        borderBottomWidth: 1,
    },
    tableColHeader: {
        width: '25%',
        borderStyle: 'solid',
        borderColor: '#e1e8ed',
        borderBottomColor: '#0052cc',
        borderBottomWidth: 2,
        backgroundColor: '#f8fafc',
        padding: 5,
    },
    tableCol: {
        width: '25%',
        borderStyle: 'solid',
        borderColor: '#e1e8ed',
        borderRightWidth: 1,
        padding: 5,
    },
    tableCellHeader: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#0052cc',
    },
    tableCell: {
        fontSize: 9,
        color: '#333333',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTop: 1,
        borderTopColor: '#e1e8ed',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerText: {
        fontSize: 8,
        color: '#999999',
    },
    badgeCritical: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        padding: '2 6',
        borderRadius: 4,
        fontSize: 7,
        fontWeight: 'bold',
    }
});

/**
 * Componente del Documento PDF
 */
const DiagnosticPDF = ({ vehicleData, dtcs, telemetry, workshopInfo }) => (
    <Document title={`Reporte_${vehicleData?.vin || 'Scanner'}`}>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoSection}>
                    <Text style={styles.title}>NOVADRIVE PRO</Text>
                    <Text style={styles.subtitle}>Sistemas de Diagnóstico Avanzado</Text>
                </View>
                <View style={{ textAlign: 'right' }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{workshopInfo.name}</Text>
                    <Text style={{ fontSize: 8, color: '#666' }}>Fecha: {new Date().toLocaleDateString()}</Text>
                    <Text style={{ fontSize: 8, color: '#666' }}>ID Reporte: {Math.random().toString(36).substr(2, 9).toUpperCase()}</Text>
                </View>
            </View>

            {/* Vehículo */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Identificación del Vehículo</Text>
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Marca / Modelo</Text>
                        <Text style={styles.value}>{vehicleData?.make} {vehicleData?.model}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>N° de Serie (VIN)</Text>
                        <Text style={styles.value}>{vehicleData?.vin}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Año</Text>
                        <Text style={styles.value}>{vehicleData?.year}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Text style={styles.label}>Tipo de Sistema</Text>
                        <Text style={styles.value}>{vehicleData?.type === 'moto' ? 'MOTOCICLETA' : 'TURISMO (CAR)'}</Text>
                    </View>
                </View>
            </View>

            {/* Diagnóstico DTC */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Análisis de Fallas (DTCs)</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellHeader}>Código</Text></View>
                        <View style={[styles.tableCol, { width: '55%' }]}><Text style={styles.tableCellHeader}>Descripción</Text></View>
                        <View style={[styles.tableCol, { width: '30%' }]}><Text style={styles.tableCellHeader}>Estado</Text></View>
                    </View>
                    {dtcs.length > 0 ? dtcs.map((dtc, i) => (
                        <View style={styles.tableRow} key={i}>
                            <View style={[styles.tableCol, { width: '15%' }]}><Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{dtc.code}</Text></View>
                            <View style={[styles.tableCol, { width: '55%' }]}><Text style={styles.tableCell}>{dtc.description}</Text></View>
                            <View style={[styles.tableCol, { width: '30%' }]}><Text style={styles.tableCell}>CONFIRMADO / CRÍTICO</Text></View>
                        </View>
                    )) : (
                        <View style={styles.tableRow}>
                            <View style={[styles.tableCol, { width: '100%' }]}><Text style={styles.tableCell}>No se detectaron fallas activas en la memoria de la ECU.</Text></View>
                        </View>
                    )}
                </View>
            </View>

            {/* Telemetría (Snapshot) */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Snapshot de Sensores (Freeze Frame)</Text>
                <View style={styles.grid}>
                    <View style={[styles.gridItem, { width: '25%' }]}>
                        <Text style={styles.label}>RPM Motor</Text>
                        <Text style={styles.value}>{telemetry.rpm} RPM</Text>
                    </View>
                    <View style={[styles.gridItem, { width: '25%' }]}>
                        <Text style={styles.label}>Carga Engine</Text>
                        <Text style={styles.value}>{telemetry.load}%</Text>
                    </View>
                    <View style={[styles.gridItem, { width: '25%' }]}>
                        <Text style={styles.label}>Temp. Refrig.</Text>
                        <Text style={styles.value}>{telemetry.temp}°C</Text>
                    </View>
                    <View style={[styles.gridItem, { width: '25%' }]}>
                        <Text style={styles.label}>Voltaje Bat.</Text>
                        <Text style={styles.value}>{telemetry.voltage}V</Text>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Generado por NovaDrive Pro - {workshopInfo.address}</Text>
                <Text style={styles.footerText}>Página 1 de 1</Text>
            </View>
        </Page>
    </Document>
);

/**
 * Hook/Componente de utilidad para exportación
 */
export const generateDiagnosticReport = async (data) => {
    const doc = <DiagnosticPDF 
        vehicleData={data.vehicleData} 
        dtcs={data.dtcs} 
        telemetry={data.telemetry} 
        workshopInfo={data.workshopInfo} 
    />;
    
    // Generar Blob
    const blob = await pdf(doc).toBlob();
    
    // Opción para Base64 (Útil para n8n / Webhooks)
    const reader = new FileReader();
    return new Promise((resolve) => {
        reader.onloadend = () => {
            resolve({
                blob,
                base64: reader.result,
                url: URL.createObjectURL(blob)
            });
        };
        reader.readAsDataURL(blob);
    });
};

export default DiagnosticPDF;
