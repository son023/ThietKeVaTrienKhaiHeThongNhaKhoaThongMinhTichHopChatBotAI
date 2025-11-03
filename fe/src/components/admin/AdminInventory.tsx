import { AlertTriangle, Package, Plus, TrendingDown, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  category: string;
  stock: number;
  min: number;
  unit: string;
  status: string;
}

export function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Amoxicillin 500mg', category: 'Thuốc', stock: 5, min: 20, unit: 'Hộp', status: 'low' },
    { id: 2, name: 'Composite Filtek Z350', category: 'Vật tư', stock: 45, min: 10, unit: 'Tuýp', status: 'good' },
    { id: 3, name: 'Găng tay y tế', category: 'Vật tư', stock: 150, min: 50, unit: 'Hộp', status: 'good' },
    { id: 4, name: 'Kim tiêm nha khoa', category: 'Vật tư', stock: 8, min: 30, unit: 'Hộp', status: 'low' },
    { id: 5, name: 'Paracetamol 500mg', category: 'Thuốc', stock: 65, min: 30, unit: 'Hộp', status: 'good' },
  ]);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    stock: 0,
    min: 0,
    unit: '',
  });

  const recentTransactions = [
    { id: 1, type: 'import', product: 'Composite Filtek Z350', quantity: 20, date: '25/10/2025', user: 'Admin Nam' },
    { id: 2, type: 'export', product: 'Găng tay y tế', quantity: -10, date: '24/10/2025', user: 'BS. Hùng' },
    { id: 3, type: 'import', product: 'Paracetamol 500mg', quantity: 50, date: '23/10/2025', user: 'Admin Nam' },
  ];

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      category: product.category,
      stock: product.stock,
      min: product.min,
      unit: product.unit,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingProduct) {
      const newStock = editForm.stock;
      const newMin = editForm.min;
      const newStatus = newStock < newMin ? 'low' : 'good';
      
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { ...p, ...editForm, status: newStatus }
          : p
      ));
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    }
  };

  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[#01304e] mb-1">Quản lý Kho</h1>
            <p className="text-sm text-[#333333]/60">Quản lý thuốc và vật tư y tế</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-green-600 hover:bg-green-700 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
              <Plus className="w-4 h-4 mr-2" />
              Nhập kho
            </Button>
            <Button variant="outline" className="rounded-[15px]">
              <TrendingDown className="w-4 h-4 mr-2" />
              Xuất kho
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Tổng sản phẩm</p>
                <p className="text-[#01304e]">{products.length}</p>
              </div>
              <Package className="w-8 h-8 text-[#3FB5FF]" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Sắp hết hàng</p>
                <p className="text-[#01304e]">{products.filter(p => p.status === 'low').length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Giá trị tồn kho</p>
                <p className="text-[#01304e] text-sm">45.5M ₫</p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#333333]/60 mb-1">Sắp hết hạn</p>
                <p className="text-[#01304e]">3</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Danh mục Sản phẩm</TabsTrigger>
          <TabsTrigger value="transactions">Nhập/Xuất kho</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="text-[#01304e]">Danh sách sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Tồn kho</TableHead>
                    <TableHead>Tối thiểu</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="text-[#333333]">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className={product.status === 'low' ? 'text-red-600' : 'text-[#333333]'}>
                        {product.stock} {product.unit}
                      </TableCell>
                      <TableCell className="text-[#333333]/60">{product.min} {product.unit}</TableCell>
                      <TableCell>
                        {product.status === 'low' ? (
                          <Badge className="bg-red-500">Sắp hết</Badge>
                        ) : (
                          <Badge className="bg-green-500">Đủ hàng</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="rounded-[10px]"
                          onClick={() => handleEditProduct(product)}
                        >
                          Chỉnh sửa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="text-[#01304e]">Lịch sử Nhập/Xuất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 bg-white border border-[#e8e8e8] rounded-[10px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'import' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'import' ? (
                            <Plus className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-[#333333]">{transaction.product}</p>
                          <p className="text-sm text-[#333333]/60">
                            {transaction.type === 'import' ? 'Nhập kho' : 'Xuất kho'} • {transaction.user}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`${transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                        </p>
                        <p className="text-sm text-[#333333]/60">{transaction.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[15px] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#01304e]">Chỉnh sửa sản phẩm</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho sản phẩm {editingProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="edit-product-name">Tên sản phẩm</Label>
              <Input 
                id="edit-product-name" 
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Nhập tên sản phẩm" 
                className="rounded-[10px] border-[#e8e8e8]" 
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Danh mục</Label>
              <Input 
                id="edit-category" 
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                placeholder="Ví dụ: Thuốc, Vật tư..." 
                className="rounded-[10px] border-[#e8e8e8]" 
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-stock">Tồn kho</Label>
                <Input 
                  id="edit-stock" 
                  type="number" 
                  value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: parseInt(e.target.value) || 0 })}
                  placeholder="0" 
                  className="rounded-[10px] border-[#e8e8e8]" 
                />
              </div>
              <div>
                <Label htmlFor="edit-min">Tối thiểu</Label>
                <Input 
                  id="edit-min" 
                  type="number" 
                  value={editForm.min}
                  onChange={(e) => setEditForm({ ...editForm, min: parseInt(e.target.value) || 0 })}
                  placeholder="0" 
                  className="rounded-[10px] border-[#e8e8e8]" 
                />
              </div>
              <div>
                <Label htmlFor="edit-unit">Đơn vị</Label>
                <Input 
                  id="edit-unit" 
                  value={editForm.unit}
                  onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                  placeholder="Hộp, Tuýp..." 
                  className="rounded-[10px] border-[#e8e8e8]" 
                />
              </div>
            </div>
            
            {/* Warning if stock is low */}
            {editForm.stock < editForm.min && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-[10px] flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-orange-900">Cảnh báo: Tồn kho thấp hơn mức tối thiểu</p>
                  <p className="text-xs text-orange-600">
                    Tồn kho hiện tại ({editForm.stock}) thấp hơn mức tối thiểu ({editForm.min})
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)} 
                className="rounded-[10px]"
              >
                Hủy
              </Button>
              <Button 
                className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px]"
                onClick={handleSaveEdit}
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
