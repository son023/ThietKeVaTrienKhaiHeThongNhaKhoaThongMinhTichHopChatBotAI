import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { paymentController } from '../../controllers/PaymentController';
import { toast } from 'sonner';

interface PaymentResultProps {
    onNavigate: (page: string) => void;
}

export function PaymentResultPage({ onNavigate }: PaymentResultProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [message, setMessage] = useState('');
    const [orderInfo, setOrderInfo] = useState<{
        orderCode?: string;
        amount?: number;
        transactionId?: string;
    }>({});

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // 1. Lấy parameters từ URL
                const searchParams = new URLSearchParams(window.location.search);
                const code = searchParams.get('code');
                const status = searchParams.get('status');
                const orderCode = searchParams.get('orderCode');
                const id = searchParams.get('id');
                const cancel = searchParams.get('cancel');

                console.log('PayOS callback params:', {
                    code,
                    status,
                    orderCode,
                    id,
                    cancel
                });

                if (!orderCode) {
                    setIsSuccess(false);
                    setMessage('Thiếu thông tin giao dịch');
                    setIsLoading(false);
                    return;
                }

                // 2. Gọi backend để cập nhật trạng thái payment
                try {
                    const payment = await paymentController.handlePaymentCallback({
                        orderCode,
                        status: status || undefined,
                        code: code || undefined,
                        cancel: cancel || undefined,
                    });

                    console.log('Payment callback result:', payment);

                    // 3. Xác định kết quả dựa trên response từ backend
                    if (payment.status === 'SUCCESSFUL') {
                        setIsSuccess(true);
                        setMessage('Thanh toán thành công!');
                        setOrderInfo({
                            orderCode: orderCode,
                            transactionId: payment.transactionId,
                            amount: payment.totalAmount,
                        });
                        toast.success('Thanh toán thành công!');
                    } else if (payment.status === 'CANCELLED') {
                        setIsSuccess(false);
                        setMessage('Giao dịch đã bị hủy');
                        setOrderInfo({ orderCode });
                    } else {
                        setIsSuccess(false);
                        setMessage(getErrorMessage(code));
                        setOrderInfo({ orderCode });
                        toast.error('Thanh toán thất bại');
                    }
                } catch (apiError) {
                    console.error('API callback error:', apiError);
                    // Fallback to URL params if API fails
                    if (cancel === 'true' || status === 'CANCELLED') {
                        setIsSuccess(false);
                        setMessage('Giao dịch đã bị hủy');
                    } else if (code === '00' || status === 'PAID') {
                        setIsSuccess(true);
                        setMessage('Thanh toán thành công!');
                    } else {
                        setIsSuccess(false);
                        setMessage(getErrorMessage(code));
                    }
                    setOrderInfo({ orderCode });
                }
            } catch (error) {
                console.error('Error processing payment result:', error);
                setIsSuccess(false);
                setMessage('Có lỗi xảy ra khi xử lý kết quả thanh toán');
            } finally {
                setIsLoading(false);
            }
        };

        verifyPayment();
    }, []);

    // Hàm chuyển đổi mã lỗi PayOS sang thông báo
    const getErrorMessage = (code: string | null): string => {
        const errorMessages: Record<string, string> = {
            '01': 'Giao dịch thất bại do lỗi hệ thống',
            '02': 'Tài khoản không đủ số dư',
            '03': 'Thông tin thẻ không hợp lệ',
            '04': 'Giao dịch đã hết hạn',
            '05': 'Giao dịch bị từ chối',
            '06': 'Đã có lỗi xảy ra',
            '07': 'Giao dịch bị hủy',
            '99': 'Giao dịch thất bại',
        };
        return errorMessages[code || '99'] || 'Giao dịch không thành công';
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f0f9ff]">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
                    <div className="flex items-center justify-center mb-4">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    </div>
                    <h2 className="text-xl font-bold text-[#01304e] mb-2">
                        Đang xử lý kết quả thanh toán...
                    </h2>
                    <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    // Success state
    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f0f9ff]">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#01304e] mb-2">
                        Thanh toán thành công!
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Cảm ơn bạn đã sử dụng dịch vụ của DentalCareX.
                    </p>

                    {/* Thông tin giao dịch */}
                    {orderInfo.orderCode && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                            <p className="text-sm text-gray-600">Mã đơn hàng</p>
                            <p className="font-mono font-semibold text-[#01304e]">
                                {orderInfo.orderCode}
                            </p>
                            {orderInfo.transactionId && (
                                <>
                                    <p className="text-sm text-gray-600 mt-2">Mã giao dịch</p>
                                    <p className="font-mono text-sm text-gray-700">
                                        {orderInfo.transactionId}
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    <Button
                        className="w-full bg-[#3FB5FF] hover:bg-[#3FB5FF]/90"
                        onClick={() => {
                            // Xóa query params khỏi URL
                            window.history.replaceState({}, '', window.location.pathname);
                            onNavigate('dashboard');
                        }}
                    >
                        Về trang chủ
                    </Button>
                </div>
            </div>
        );
    }

    // Failure state
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f9ff]">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-[#01304e] mb-2">
                    Thanh toán thất bại
                </h2>
                <p className="text-gray-600 mb-4">{message}</p>

                {orderInfo.orderCode && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-gray-600">Mã đơn hàng</p>
                        <p className="font-mono font-semibold text-gray-700">
                            {orderInfo.orderCode}
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    <Button
                        className="w-full bg-[#3FB5FF] hover:bg-[#3FB5FF]/90"
                        onClick={() => {
                            window.history.replaceState({}, '', window.location.pathname);
                            onNavigate('payment');
                        }}
                    >
                        Thử lại
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            window.history.replaceState({}, '', window.location.pathname);
                            onNavigate('dashboard');
                        }}
                    >
                        Về trang chủ
                    </Button>
                </div>
            </div>
        </div>
    );
}