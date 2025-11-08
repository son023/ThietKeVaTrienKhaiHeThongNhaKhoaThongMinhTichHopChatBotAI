import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { ArrowLeft, Plus, Trash2, Printer, Save, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface ReceptionistInvoiceProps {
  invoiceId?: string;
  patientId?: string;
  onBack: () => void;
}

export function ReceptionistInvoice({ invoiceId, patientId, onBack }: ReceptionistInvoiceProps) {
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', name: 'Trám răng Composite Răng 46', quantity: 1, unitPrice: 500000 },
    { id: '2', name: 'Cạo vôi răng', quantity: 1, unitPrice: 300000 },
  ]);

  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>('amount');
  const [discountValue, setDiscountValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [notes, setNotes] = useState('');

  const patient = {
    name: 'Nguyễn Văn A',
    code: 'BN001',
  };

  const invoice = {
    code: 'HD0123',
    date: '28/10/2025',
    doctor: 'BS. Phạm Thị Ngọc Mai',
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const total = subtotal - discount;
  const change = amountReceived ? Math.max(0, parseInt(amountReceived) - total) : 0;

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      unitPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleConfirmPayment = () => {
    if (!paymentMethod || !amountReceived) {
      alert('Vui lòng nhập đầy đủ thông tin thanh toán');
      return;
    }
    setIsPaid(true);
    // Handle payment confirmation
    alert('Thanh toán thành công!');
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl text-[#01304e]">Hóa đơn #{invoice.code}</h1>
              <Badge
                variant="destructive"
                className={isPaid ? 'bg-green-600' : ''}
              >
                {isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
              </Badge>
            </div>
            <p className="text-gray-600">
              Bệnh nhân: <strong>{patient.name}</strong> ({patient.code}) • Bác sĩ: {invoice.doctor}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 rounded-[10px]">
            <Printer className="w-4 h-4" />
            In Hóa đơn
          </Button>
          {!isPaid && (
            <Button variant="outline" className="gap-2 rounded-[10px]">
              <Save className="w-4 h-4" />
              Lưu nháp
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Info */}
      <Card className="p-6">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Ngày lập</p>
            <p className="text-[#01304e]">{invoice.date}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Mã hóa đơn</p>
            <p className="text-[#01304e] font-mono">{invoice.code}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Bác sĩ thực hiện</p>
            <p className="text-[#01304e]">{invoice.doctor}</p>
          </div>
        </div>
      </Card>

      {/* Invoice Items */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg text-[#01304e]">Chi tiết Dịch vụ/Vật tư</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddItem}
            className="gap-2"
            disabled={isPaid}
          >
            <Plus className="w-4 h-4" />
            Thêm dòng
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">STT</TableHead>
              <TableHead>Tên Dịch vụ/Vật tư</TableHead>
              <TableHead className="w-[120px]">Số lượng</TableHead>
              <TableHead className="w-[150px]">Đơn giá</TableHead>
              <TableHead className="w-[150px]">Thành tiền</TableHead>
              {!isPaid && <TableHead className="w-[80px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {isPaid ? (
                    item.name
                  ) : (
                    <Input
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                      placeholder="Nhập tên dịch vụ"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {isPaid ? (
                    item.quantity
                  ) : (
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value))}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {isPaid ? (
                    `${item.unitPrice.toLocaleString('vi-VN')}đ`
                  ) : (
                    <Input
                      type="number"
                      min="0"
                      step="10000"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseInt(e.target.value))}
                    />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {(item.quantity * item.unitPrice).toLocaleString('vi-VN')}đ
                </TableCell>
                {!isPaid && (
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Totals */}
        <div className="mt-6 space-y-3 max-w-md ml-auto">
          <div className="flex justify-between items-center pb-3 border-b">
            <span className="text-gray-700">Tổng cộng (Subtotal)</span>
            <span className="text-lg text-[#01304e]">
              {subtotal.toLocaleString('vi-VN')}đ
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b">
            <span className="text-gray-700">Giảm giá (Discount)</span>
            <div className="flex items-center gap-2">
              {isPaid ? (
                <span className="text-red-600">-{discount.toLocaleString('vi-VN')}đ</span>
              ) : (
                <>
                  <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'amount' | 'percent')}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amount">VNĐ</SelectItem>
                      <SelectItem value="percent">%</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    step={discountType === 'percent' ? '1' : '10000'}
                    max={discountType === 'percent' ? '100' : undefined}
                    value={discountValue}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setDiscountValue(e.target.value);
                      if (discountType === 'percent') {
                        setDiscount(Math.round(subtotal * val / 100));
                      } else {
                        setDiscount(val);
                      }
                    }}
                    className="w-32 text-right"
                    placeholder="0"
                  />
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-lg text-[#01304e]">
              Tổng tiền thanh toán
            </span>
            <span className="text-2xl text-[#3FB5FF]">
              {total.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>
      </Card>

      {/* Payment Section */}
      {!isPaid && (
        <Card className="p-6">
          <h3 className="text-lg text-[#01304e] mb-4">Thông tin Thanh toán</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Phương thức thanh toán *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="rounded-[10px]">
                  <SelectValue placeholder="Chọn phương thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">💵 Tiền mặt</SelectItem>
                  <SelectItem value="card">💳 Thẻ</SelectItem>
                  <SelectItem value="transfer">🏦 Chuyển khoản</SelectItem>
                  <SelectItem value="insurance">🏥 Bảo hiểm</SelectItem>
                  <SelectItem value="momo">📱 MoMo</SelectItem>
                  <SelectItem value="zalopay">💰 ZaloPay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amountReceived">Số tiền nhận *</Label>
              <div className="relative">
                <Input
                  id="amountReceived"
                  type="number"
                  min="0"
                  step="10000"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder="Nhập số tiền"
                  className="rounded-[10px]"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                    onClick={() => setAmountReceived(total.toString())}
                  >
                    Đủ
                  </Button>
                </div>
              </div>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú về thanh toán..."
                className="rounded-[10px]"
              />
            </div>

            {amountReceived && parseInt(amountReceived) >= total && (
              <div className="col-span-2 p-4 bg-green-50 border border-green-200 rounded-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-green-900">Tiền thừa trả khách</span>
                  <span className="text-2xl text-green-600">
                    {change.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            )}

            {amountReceived && parseInt(amountReceived) < total && (
              <div className="col-span-2 p-4 bg-red-50 border border-red-200 rounded-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-red-900">⚠️ Số tiền chưa đủ</span>
                  <span className="text-xl text-red-600">
                    Còn thiếu: {(total - parseInt(amountReceived)).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 rounded-[10px]">
                <Save className="w-4 h-4" />
                Lưu (chờ thanh toán)
              </Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700 gap-2 rounded-[10px]">
                Hủy Hóa đơn
              </Button>
            </div>

            <Button
              size="lg"
              onClick={handleConfirmPayment}
              className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 gap-2 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
              disabled={!paymentMethod || !amountReceived || parseInt(amountReceived) < total}
            >
              <CheckCircle2 className="w-5 h-5" />
              Xác nhận Thanh toán ({total.toLocaleString('vi-VN')}đ)
            </Button>
          </div>
        </Card>
      )}

      {/* Payment Success */}
      {isPaid && (
        <Card className="p-6 bg-green-50 border-green-200 rounded-[15px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl text-green-900">✅ Thanh toán thành công!</h3>
                <p className="text-sm text-green-700 mt-2">
                  Phương thức: <strong>{paymentMethodMap[paymentMethod]}</strong> •
                  Số tiền nhận: <strong>{parseInt(amountReceived).toLocaleString('vi-VN')}đ</strong>
                  {change > 0 && ` • Tiền thừa: <strong>${change.toLocaleString('vi-VN')}đ</strong>`}
                </p>
                {notes && (
                  <p className="text-xs text-green-600 mt-1 italic">Ghi chú: {notes}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2 rounded-[10px] border-green-300"
                onClick={() => {
                  console.log('In hóa đơn');
                }}
              >
                <Printer className="w-4 h-4" />
                In hóa đơn
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 gap-2 rounded-[10px]"
                onClick={onBack}
              >
                Hoàn tất
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

const paymentMethodMap: Record<string, string> = {
  cash: '💵 Tiền mặt',
  card: '💳 Thẻ',
  transfer: '🏦 Chuyển khoản',
  insurance: '🏥 Bảo hiểm',
  momo: '📱 MoMo',
  zalopay: '💰 ZaloPay',
};
