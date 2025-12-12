import { useState, useEffect, useRef } from 'react';
import { Search, AlertCircle, Package } from 'lucide-react';
import { Input } from '../ui/input';
import { inventoryController, MedicineWithStock } from '../../controllers/InventoryController';
import { toast } from 'sonner';

interface MedicineSearchInputProps {
  onSelect: (medicine: MedicineWithStock) => void;
  disabled?: boolean;
}

export function MedicineSearchInput({ onSelect, disabled }: MedicineSearchInputProps) {
  const [query, setQuery] = useState('');
  const [medicines, setMedicines] = useState<MedicineWithStock[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<MedicineWithStock[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const data = await inventoryController.getMedicinesWithStock();
      setMedicines(data);
    } catch (error) {
      console.error('Error loading medicines:', error);
      toast.error('Không thể tải danh sách thuốc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query.trim()) {
      const filtered = medicines.filter(m =>
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.description?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMedicines(filtered);
      setShowDropdown(true);
    } else {
      setFilteredMedicines([]);
      setShowDropdown(false);
    }
  }, [query, medicines]);

  const handleSelect = (medicine: MedicineWithStock) => {
    onSelect(medicine);
    setQuery('');
    setShowDropdown(false);
  };

  const getStockBadge = (medicine: MedicineWithStock) => {
    const colors = {
      available: 'bg-green-100 text-green-800 border-green-300',
      low: 'bg-orange-100 text-orange-800 border-orange-300',
      out: 'bg-red-100 text-red-800 border-red-300',
    };

    const labels = {
      available: 'Còn hàng',
      low: 'Sắp hết',
      out: 'Hết hàng',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${colors[medicine.stockStatus]}`}>
        {labels[medicine.stockStatus]} ({medicine.stockQuantity})
      </span>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#333333]/40" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm thuốc theo tên hoặc mô tả..."
          disabled={disabled}
          className="pl-10 pr-4"
        />
      </div>

      {showDropdown && filteredMedicines.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#e8e8e8] rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
          {filteredMedicines.map((medicine) => (
            <button
              key={medicine.id}
              onClick={() => handleSelect(medicine)}
              disabled={medicine.stockStatus === 'out'}
              className={`w-full px-4 py-3 text-left hover:bg-[#f8f9fa] transition-colors border-b border-[#e8e8e8] last:border-b-0 ${
                medicine.stockStatus === 'out' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-[#3FB5FF]" />
                    <p className="font-semibold text-[#01304e]">{medicine.name}</p>
                  </div>
                  {medicine.description && (
                    <p className="text-xs text-[#333333]/60 mb-2">{medicine.description}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#333333]/60">
                      Đơn vị: {medicine.unit || 'N/A'}
                    </span>
                    <span className="text-xs font-semibold text-[#3FB5FF]">
                      {medicine.salePrice?.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {getStockBadge(medicine)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && filteredMedicines.length === 0 && query && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#e8e8e8] rounded-lg shadow-lg p-4 text-center">
          <AlertCircle className="w-8 h-8 text-[#333333]/20 mx-auto mb-2" />
          <p className="text-sm text-[#333333]/60">Không tìm thấy thuốc phù hợp</p>
        </div>
      )}
    </div>
  );
}

