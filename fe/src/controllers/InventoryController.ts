import { get } from "http";
import { API_CONFIG, createApiUrl, getApiHeaders } from "../config/api";


export interface DispenseOrderDTO {
  id: string;
  pharmacistId: string | null;
  prescription: string;
  status: string;
  medicalHistoryId: string;
  doctorId: string;
  createAt: string;
  updateAt: string;
}

export interface DispenseItemDTO {
  id: string;
  quantity: number;
  priceAtDispense: number;
  dosage: string;
  frequency: string;
  duration: string;
  usageInstructions: string;
  inventoryLotId: string;
  dispenseOrderId: string;
}

export interface MedicineDTO {
  id: string;
  name: string;
  unit: string;
  description: string;
  salePrice: number;
}

export interface MedicineWithStock extends MedicineDTO {
  stockQuantity: number;
  stockStatus: 'available' | 'low' | 'out';
  hasExpiring?: boolean;
  expiringQuantity?: number;
}

export interface InventoryLotDTO {
  id: string;
  lotNo: string;
  expireDate: string;
  quantityOnHand: number;
  costPrice: number;
  medicineId: string;
  medicineName: string;
  pharmacistId: string;
}

export interface CreateInventoryLotRequest {
  lotNo: string;
  expireDate: string;
  quantityOnHand: number;
  costPrice: number;
  medicineId: string;
  pharmacistId: string;
}

export interface StockLedgerDTO {
  id: string;
  type: string; // "IN", "OUT", "ADJUST"
  quantity: number;
  referenceType: string;
  referenceId: string;
  createAt: string;
}

export interface ManualExportRequest {
  inventoryLotId: string;
  quantity: number;
  reason: string; // "Hết hạn sử dụng", "Hư hỏng", "Chuyển kho", "Mất mát"
  notes?: string;
  pharmacistId: string;
}

export interface ManualExportResponse {
  id: string;
  inventoryLotId: string;
  lotNo: string;
  medicineName: string;
  quantity: number;
  reason: string;
  notes: string;
  exportedAt: string;

  pharmacistId?: string;
  prescriptionId?: string;
  dispenseOrderId?: string;
  exportType: 'MANUAL' | 'AUTO';
}

export interface CreateMedicineRequest {
  name: string;
  unit?: string;
  description?: string;
  salePrice?: number;
}

class InventoryController {
  private baseUrl = API_CONFIG.ENDPOINTS.INVENTORIES;

  // Lấy tất cả medicines
  async getAllMedicines(): Promise<MedicineDTO[]> {
    const url = createApiUrl(`${this.baseUrl}/medicines`);
    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders(true),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch medicines: ${response.statusText}`);
    }

    return response.json();
  }

  // Lấy medicine với thông tin tồn kho chi tiết
  async getMedicinesWithStock(): Promise<MedicineWithStock[]> {
    const [medicines, lots] = await Promise.all([
      this.getAllMedicines(),
      this.getAllInventoryLots()
    ]);

    // Tạo map để tính tổng tồn kho theo medicine
    const stockMap: Record<string, { total: number; expiringLots: number }> = {};
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    lots.forEach((lot: InventoryLotDTO) => {
      if (!stockMap[lot.medicineId]) {
        stockMap[lot.medicineId] = { total: 0, expiringLots: 0 };
      }
      stockMap[lot.medicineId].total += lot.quantityOnHand;

      // Kiểm tra sắp hết hạn (trong vòng 30 ngày)
      if (lot.expireDate) {
        const expireDate = new Date(lot.expireDate);
        if (expireDate <= thirtyDaysFromNow && expireDate >= today && lot.quantityOnHand > 0) {
          stockMap[lot.medicineId].expiringLots += lot.quantityOnHand;
        }
      }
    });

    return medicines.map(medicine => {
      const stock = stockMap[medicine.id] || { total: 0, expiringLots: 0 };
      const stockQuantity = stock.total;

      // Ngưỡng cảnh báo mặc định: 20 đơn vị
      const threshold = 20;

      let stockStatus: 'available' | 'low' | 'out' = 'out';
      if (stockQuantity > threshold) {
        stockStatus = 'available';
      } else if (stockQuantity > 0) {
        stockStatus = 'low';
      }

      return {
        ...medicine,
        stockQuantity,
        stockStatus,
        hasExpiring: stock.expiringLots > 0,
        expiringQuantity: stock.expiringLots,
      };
    });
  }



  // Lấy danh sách đơn cấp phát theo status
  async getDispenseOrdersByStatus(status?: string): Promise<DispenseOrderDTO[]> {
    const url = status
      ? createApiUrl(`${this.baseUrl}/dispense-orders/by-status?status=${status}`)
      : createApiUrl(`${this.baseUrl}/dispense-orders/by-status`);

    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders(true),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dispense orders: ${response.statusText}`);
    }

    return response.json();
  }

  // Lấy chi tiết đơn cấp phát
  async getDispenseOrderById(id: string): Promise<DispenseOrderDTO> {
    const url = createApiUrl(`${this.baseUrl}/dispense-orders/${id}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders(true),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dispense order: ${response.statusText}`);
    }

    return response.json();
  }

  // Lấy danh sách thuốc trong đơn cấp phát
  async getDispenseItemsByOrderId(dispenseOrderId: string): Promise<DispenseItemDTO[]> {
    const url = createApiUrl(`${this.baseUrl}/dispense-items/by-dispense-order/${dispenseOrderId}`);
    const response = await fetch(
      url,
      {
        method: 'GET',
        headers: getApiHeaders(true),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch dispense items: ${response.statusText}`);
    }

    return response.json();
  }

  // Đánh dấu đơn đã cấp phát
  async markAsSold(id: string, pharmacistId: string): Promise<DispenseOrderDTO> {
    const url = createApiUrl(`${this.baseUrl}/dispense-orders/${id}/sold?pharmacistId=${pharmacistId}`);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getApiHeaders(true),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark as sold: ${response.statusText}`);
    }

    return response.json();
  }

  // Lấy thông tin thuốc theo ID
  async getMedicineById(id: string): Promise<MedicineDTO> {
    const url = createApiUrl(`${this.baseUrl}/medicines/${id}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders(true),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch medicine: ${response.statusText}`);
    }

    return response.json();
  }

  // Lấy tất cả inventory lots
  async getAllInventoryLots(): Promise<InventoryLotDTO[]> {
    const url = createApiUrl(`${this.baseUrl}/inventory-lots`);
    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders(true),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch inventory lots: ${response.statusText}`);
    }

    return response.json();
  }

  // Lấy thông tin lô hàng theo ID
  async getInventoryLotById(id: string): Promise<InventoryLotDTO> {
    const url = createApiUrl(`${this.baseUrl}/inventory-lots/${id}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders(true),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch inventory lot: ${response.statusText}`);
    }

    return response.json();
  }

  // Kiểm tra trạng thái thanh toán của đơn thuốc
  async getPaymentStatusOfPrescription(dispenseOrderId: string): Promise<{ isPaid: boolean; invoiceId?: string; invoiceStatus?: string }> {
    const url = createApiUrl(`${this.baseUrl}/dispense-orders/${dispenseOrderId}/payment-status`);
    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders(true),
    });

    if (!response.ok) {
      throw new Error(`Failed to get payment status: ${response.statusText}`);
    }

    return response.json();
  }

  // Tạo inventory lot mới (nhập hàng)
  async createInventoryLot(request: CreateInventoryLotRequest): Promise<InventoryLotDTO> {
    const url = createApiUrl(`${this.baseUrl}/inventory-lots`);
    const response = await fetch(url, {
      method: 'POST',
      headers: getApiHeaders(true),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create inventory lot: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Cập nhật inventory lot (nhập hàng)
  async updateInventoryLot(id: string, request: CreateInventoryLotRequest): Promise<InventoryLotDTO> {
    const url = createApiUrl(`${this.baseUrl}/inventory-lots/${id}`);
    const response = await fetch(url, {
      method: 'PUT',
      headers: getApiHeaders(true),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update inventory lot: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // ==================== MANUAL EXPORT (XUẤT KHO THỦ CÔNG) ====================

  // Xuất kho thủ công
  async manualExport(request: ManualExportRequest): Promise<ManualExportResponse> {
    const url = createApiUrl(`${this.baseUrl}/inventory-lots/export`);
    const response = await fetch(url, {
      method: 'POST',
      headers: getApiHeaders(true),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to export stock: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Lấy danh sách xuất kho thủ công
  async getAllManualExports(): Promise<ManualExportResponse[]> {
    const url = createApiUrl(`${this.baseUrl}/inventory-lots/exports`);
    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders(true),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch manual exports: ${response.statusText}`);
    }

    return response.json();
  }

  // Lấy lịch sử stock ledger theo lot ID
  async getStockLedgersByLotId(lotId: string): Promise<StockLedgerDTO[]> {
    const url = createApiUrl(`${this.baseUrl}/inventory-lots/${lotId}/stock-ledgers`);
    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders(true),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stock ledgers: ${response.statusText}`);
    }

    return response.json();
  }

  // Lấy TẤT CẢ lịch sử xuất kho (manual + auto dispense)
  async getAllExports(): Promise<ManualExportResponse[]> {
    const url = createApiUrl(`${this.baseUrl}/inventory-lots/all-exports`);
    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders(true),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch all exports: ${response.statusText}`);
    }

    return response.json();
  }

  // Tạo thuốc mới
  async createMedicine(request: CreateMedicineRequest): Promise<MedicineDTO> {
    const url = createApiUrl(`${this.baseUrl}/medicines`);
    const response = await fetch(url, {
      method: 'POST',
      headers: getApiHeaders(true),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create medicine: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Lấy inventory lots theo medicine ID
  async getInventoryLotsByMedicineId(medicineId: string): Promise<InventoryLotDTO[]> {
    const allLots = await this.getAllInventoryLots();
    return allLots.filter(lot => lot.medicineId === medicineId);
  }

  // Lấy tất cả stock ledgers cho một medicine (từ tất cả các lots)
  async getStockLedgersByMedicineId(medicineId: string): Promise<StockLedgerDTO[]> {
    const lots = await this.getInventoryLotsByMedicineId(medicineId);
    const allLedgers = await Promise.all(
      lots.map(lot => this.getStockLedgersByLotId(lot.id).catch(() => []))
    );
    return allLedgers.flat();
  }

}

export const inventoryController = new InventoryController();