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
}

export interface InventoryLotDTO {
  id: string;
  lotNo: string;
  expireDate: string;
  quantityOnHand: number;
  costPrice: number;
  medicineId: string;
  medicineName: string;
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

  // Lấy medicine với thông tin tồn kho
  async getMedicinesWithStock(): Promise<MedicineWithStock[]> {
    const medicines = await this.getAllMedicines();
    const lots = await this.getAllInventoryLots();

    return medicines.map(medicine => {
      const medicineLots = lots.filter((lot: InventoryLotDTO) => lot.medicineId === medicine.id);
      const stockQuantity = medicineLots.reduce((sum: number, lot: InventoryLotDTO) => sum + lot.quantityOnHand, 0);

      let stockStatus: 'available' | 'low' | 'out' = 'out';
      if (stockQuantity > 20) stockStatus = 'available';
      else if (stockQuantity > 0) stockStatus = 'low';

      return {
        ...medicine,
        stockQuantity,
        stockStatus,
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


}

export const inventoryController = new InventoryController();