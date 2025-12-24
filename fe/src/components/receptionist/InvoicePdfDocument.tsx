import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';
import { InvoiceDTO } from '../../controllers/InvoiceController';
import { AppointmentDTO } from '../../controllers/AppointmentController';
import { UserDTO } from '../../models/User';



// Đăng ký font Arial hỗ trợ tiếng Việt từ file local
// Với Vite, các file trong thư mục public được serve ở root URL
// Đường dẫn phải là tương đối từ root: /fonts/Arial.ttf
// Lưu ý: @react-pdf/renderer có thể không hỗ trợ tốt font từ URL trong một số trường hợp
let arialFontRegistered = false;

// Thử đăng ký font Arial với đường dẫn tương đối từ public folder
try {
    Font.register({
        family: 'Arial',
        fonts: [
            {
                src: '/fonts/GoogleSansFlex_9pt-Black.ttf', // Đường dẫn tương đối từ root (Vite serve từ public folder)
                fontWeight: 'normal'
            },
            {
                src: '/fonts/GoogleSansFlex_9pt-Bold.ttf',
                fontWeight: 'bold'
            }
        ]
    });
    arialFontRegistered = true;
    console.log('✅ Arial font registered successfully');
} catch (error) {
    // Fallback: Nếu đăng ký font thất bại, sẽ sử dụng font mặc định Helvetica
    // Helvetica cũng hỗ trợ tiếng Việt tốt và không cần đăng ký
    // Điều này đảm bảo PDF luôn được tạo thành công dù font Arial có lỗi hay không
    console.warn('⚠️ Arial font registration failed, will use default Helvetica font:', error);
    arialFontRegistered = false;
}

const styles = StyleSheet.create({
    page: {
        // Sử dụng Arial nếu đã đăng ký thành công, nếu không sẽ fallback về Helvetica
        // Helvetica là font mặc định được hỗ trợ sẵn và hỗ trợ tốt tiếng Việt
        fontFamily: 'Arial',
        fontSize: 11,
        padding: 24,
        color: '#333',
    },
    header: {
        textAlign: 'center',
        marginBottom: 16,
        borderBottom: '2pt solid #01304e',
        paddingBottom: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#01304e',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 11,
        fontWeight: 'normal',
        color: '#555',
        marginBottom: 2,
    },
    statusBadge: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 6,
    },
    statusBadgePaid: {
        backgroundColor: '#4caf50',
        color: '#fff',
        padding: '4pt 12pt',
        borderRadius: 12,
        fontSize: 10,
        fontWeight: 'bold',
    },
    statusBadgePending: {
        backgroundColor: '#ff9800',
        color: '#fff',
        padding: '4pt 12pt',
        borderRadius: 12,
        fontSize: 10,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#01304e',
        marginBottom: 6,
        borderBottom: '1pt solid #3FB5FF',
        paddingBottom: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 3,
        fontSize: 10,
    },
    label: {
        fontWeight: 'bold',
    },
    value: {},
    twoCols: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 12,
    },
    box: {
        flex: 1,
        padding: 8,
        backgroundColor: '#f5f7fb',
        borderRadius: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#01304e',
        color: '#fff',
        paddingVertical: 6,
        paddingHorizontal: 4,
        fontSize: 9,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 4,
        paddingHorizontal: 4,
        fontSize: 9,
        borderBottom: '0.5pt solid #ddd',
    },
    cell: {
        paddingRight: 4,
    },
    right: {
        textAlign: 'right',
    },
    center: {
        textAlign: 'center',
    },
    totals: {
        marginTop: 10,
        marginLeft: 'auto',
        width: '55%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
        fontSize: 10,
    },
    totalRowPatient: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1565c0',
    },
    paymentInfo: {
        marginTop: 20,
        padding: 12,
        backgroundColor: '#f0f7ff',
        border: '2pt solid #3FB5FF',
        borderRadius: 4,
    },
    paymentTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#01304e',
        marginBottom: 8,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
        fontSize: 10,
    },
    footer: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 9,
        color: '#777',
    },
});

interface InvoicePdfDocumentProps {
    invoiceData: InvoiceDTO;
    items: {
        serviceType: string;
        name: string;
        quantity: number;
        unitPrice: number;
        insurancePayAmount: number;
        patientPayAmount: number;
    }[];
    patientData: UserDTO | null;
    doctorData: UserDTO | null;
    appointmentData: AppointmentDTO | null;
    subtotal: number;
    insurancePays: number;
    patientPays: number;
    isPaid?: boolean;
    paymentData?: {
        paymentMethod: string;
        totalAmount?: number;
        transactionId?: string;
        paidAt?: string;
        description?: string;
    } | null;
    paymentMethod?: string;
    amountReceived?: string;
    change?: number;
}

export const InvoicePdfDocument: React.FC<InvoicePdfDocumentProps> = ({
    invoiceData,
    items,
    patientData,
    doctorData,
    appointmentData,
    subtotal,
    insurancePays,
    patientPays,
    isPaid = false,
    paymentData = null,
    paymentMethod = 'CASH',
    amountReceived = '',
    change = 0,
}) => {
    const displayInvoiceCode = invoiceData.id.substring(0, 8).toUpperCase();
    const displayDate = invoiceData.issueAt
        ? new Date(invoiceData.issueAt).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
        : '—';
    const displayPatientName = patientData?.fullName || 'N/A';
    const displayPatientCode = patientData?.id
        ? `BN${patientData.id.slice(-6).toUpperCase()}`
        : '—';
    const displayDoctorName = doctorData?.fullName || 'N/A';

    const paymentMethodMap: Record<string, string> = {
        CASH: 'Tiền mặt',
        BANK_TRANSFER: 'Chuyển khoản',
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>HÓA ĐƠN DỊCH VỤ Y TẾ</Text>
                    <Text style={styles.subtitle}>Mã hóa đơn: {displayInvoiceCode}</Text>
                    <Text style={styles.subtitle}>Ngày lập: {displayDate}</Text>
                    <View style={styles.statusBadge}>
                        <Text
                            style={isPaid ? styles.statusBadgePaid : styles.statusBadgePending}
                        >
                            {isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                        </Text>
                    </View>
                </View>

                {/* Info boxes */}
                <View style={styles.twoCols}>
                    <View style={styles.box}>
                        <Text style={styles.sectionTitle}>Thông tin Bệnh nhân</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>Họ tên:</Text>
                            <Text style={styles.value}>{displayPatientName}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Mã BN:</Text>
                            <Text style={styles.value}>{displayPatientCode}</Text>
                        </View>
                        {patientData?.phone && (
                            <View style={styles.row}>
                                <Text style={styles.label}>SĐT:</Text>
                                <Text style={styles.value}>{patientData.phone}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.box}>
                        <Text style={styles.sectionTitle}>Thông tin Bác sĩ</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>Bác sĩ:</Text>
                            <Text style={styles.value}>BS. {displayDoctorName}</Text>
                        </View>
                        {appointmentData?.appointmentStartTime && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Ngày khám:</Text>
                                <Text style={styles.value}>
                                    {new Date(
                                        appointmentData.appointmentStartTime
                                    ).toLocaleDateString('vi-VN')}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Items table */}
                <Text style={[styles.sectionTitle, { marginBottom: 4, marginTop: 8 }]}>
                    Chi tiết Dịch vụ/Vật tư
                </Text>

                <View>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.cell, { width: '6%' }]}>STT</Text>
                        <Text style={[styles.cell, { width: '15%' }]}>Loại</Text>
                        <Text style={[styles.cell, { width: '29%' }]}>
                            Tên Dịch vụ/Vật tư
                        </Text>
                        <Text
                            style={[
                                styles.cell,
                                styles.center,
                                { width: '7%' },
                            ]}
                        >
                            SL
                        </Text>
                        <Text
                            style={[
                                styles.cell,
                                styles.right,
                                { width: '12%' },
                            ]}
                        >
                            Đơn giá
                        </Text>
                        <Text
                            style={[
                                styles.cell,
                                styles.right,
                                { width: '13%' },
                            ]}
                        >
                            Thành tiền
                        </Text>
                        <Text
                            style={[
                                styles.cell,
                                styles.right,
                                { width: '9%' },
                            ]}
                        >
                            BH chi trả
                        </Text>
                        <Text
                            style={[
                                styles.cell,
                                styles.right,
                                { width: '9%' },
                            ]}
                        >
                            BN thanh toán
                        </Text>
                    </View>

                    {items.map((item, index) => {
                        const quantity = item.quantity ?? 0;
                        const unitPrice = item.unitPrice ?? 0;
                        const insurancePayAmount = item.insurancePayAmount ?? 0;
                        const patientPayAmount = item.patientPayAmount ?? 0;
                        const total = quantity * unitPrice;

                        return (
                            <View key={index} style={styles.tableRow}>
                                <Text style={[styles.cell, { width: '6%' }]}>
                                    {index + 1}
                                </Text>
                                <Text style={[styles.cell, { width: '15%' }]}>
                                    {item.serviceType}
                                </Text>
                                <Text style={[styles.cell, { width: '29%' }]}>
                                    {item.name}
                                </Text>
                                <Text
                                    style={[
                                        styles.cell,
                                        styles.center,
                                        { width: '7%' },
                                    ]}
                                >
                                    {quantity}
                                </Text>
                                <Text
                                    style={[
                                        styles.cell,
                                        styles.right,
                                        { width: '12%' },
                                    ]}
                                >
                                    {unitPrice.toLocaleString('vi-VN')}đ
                                </Text>
                                <Text
                                    style={[
                                        styles.cell,
                                        styles.right,
                                        { width: '13%' },
                                    ]}
                                >
                                    {total.toLocaleString('vi-VN')}đ
                                </Text>
                                <Text
                                    style={[
                                        styles.cell,
                                        styles.right,
                                        { width: '9%', color: '#2e7d32' },
                                    ]}
                                >
                                    {insurancePayAmount.toLocaleString('vi-VN')}đ
                                </Text>
                                <Text
                                    style={[
                                        styles.cell,
                                        styles.right,
                                        { width: '9%', color: '#1565c0' },
                                    ]}
                                >
                                    {patientPayAmount.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* Totals */}
                <View style={styles.totals}>
                    <View style={styles.totalRow}>
                        <Text style={styles.label}>Tổng cộng:</Text>
                        <Text style={styles.value}>
                            {subtotal.toLocaleString('vi-VN')}đ
                        </Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.label}>Bảo hiểm chi trả:</Text>
                        <Text style={[styles.value, { color: '#2e7d32' }]}>
                            -{insurancePays.toLocaleString('vi-VN')}đ
                        </Text>
                    </View>
                    <View style={styles.totalRowPatient}>
                        <Text style={styles.label}>Bệnh nhân thanh toán:</Text>
                        <Text style={styles.value}>
                            {patientPays.toLocaleString('vi-VN')}đ
                        </Text>
                    </View>
                </View>

                {/* Payment Info (nếu đã thanh toán) */}
                {isPaid && paymentData && (
                    <View style={styles.paymentInfo}>
                        <Text style={styles.paymentTitle}>Thông tin Thanh toán</Text>
                        <View style={styles.paymentRow}>
                            <Text style={styles.label}>Phương thức:</Text>
                            <Text style={styles.value}>
                                {paymentMethodMap[paymentData.paymentMethod] ||
                                    paymentMethodMap[paymentMethod]}
                            </Text>
                        </View>
                        {paymentData.totalAmount && (
                            <View style={styles.paymentRow}>
                                <Text style={styles.label}>Số tiền thanh toán:</Text>
                                <Text style={styles.value}>
                                    {paymentData.totalAmount.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                        )}
                        {paymentMethod === 'CASH' && amountReceived && (
                            <>
                                <View style={styles.paymentRow}>
                                    <Text style={styles.label}>Số tiền nhận:</Text>
                                    <Text style={styles.value}>
                                        {parseInt(amountReceived).toLocaleString('vi-VN')}đ
                                    </Text>
                                </View>
                                {change > 0 && (
                                    <View style={styles.paymentRow}>
                                        <Text style={styles.label}>Tiền thừa:</Text>
                                        <Text style={styles.value}>
                                            {change.toLocaleString('vi-VN')}đ
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}
                        {paymentData.paymentMethod === 'BANK_TRANSFER' &&
                            paymentData.transactionId && (
                                <View style={styles.paymentRow}>
                                    <Text style={styles.label}>Mã giao dịch:</Text>
                                    <Text style={styles.value}>
                                        {paymentData.transactionId}
                                    </Text>
                                </View>
                            )}
                        {paymentData.paidAt && (
                            <View style={styles.paymentRow}>
                                <Text style={styles.label}>Thời gian thanh toán:</Text>
                                <Text style={styles.value}>
                                    {new Date(paymentData.paidAt).toLocaleString('vi-VN')}
                                </Text>
                            </View>
                        )}
                        {(paymentData.description || '') && (
                            <View style={styles.paymentRow}>
                                <Text style={styles.label}>Ghi chú:</Text>
                                <Text style={styles.value}>
                                    {paymentData.description || ''}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Cảm ơn quý khách đã sử dụng dịch vụ!</Text>
                    <Text>
                        Hóa đơn này có giá trị pháp lý và được lưu trữ trong hệ thống.
                    </Text>
                    <Text style={{ marginTop: 8, fontSize: 8 }}>
                        In vào: {new Date().toLocaleString('vi-VN')}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

