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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-text/40" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm thuốc theo tên hoặc mô tả..."
          disabled={disabled}
          className="pl-11 pr-4 rounded-xl border-neutral-border/30 bg-neutral-surface focus:border-primary transition-colors h-11 shadow-sm"
        />
      </div>

      {showDropdown && filteredMedicines.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-neutral-surface border border-neutral-border/30 rounded-xl shadow-lg max-h-[400px] overflow-y-auto">
          {filteredMedicines.map((medicine) => (
            <button
              key={medicine.id}
              onClick={() => handleSelect(medicine)}
              disabled={medicine.stockStatus === 'out'}
              className={`w-full px-5 py-4 text-left hover:bg-neutral-muted/50 transition-colors border-b border-neutral-border/20 last:border-b-0 first:rounded-t-xl last:rounded-b-xl ${
                medicine.stockStatus === 'out' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 rounded bg-primary/10">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <p className="font-semibold text-neutral-text">{medicine.name}</p>
                  </div>
                  {medicine.description && (
                    <p className="text-xs text-neutral-text/60 mb-2 ml-7">{medicine.description}</p>
                  )}
                  <div className="flex items-center gap-4 ml-7">
                    <span className="text-xs text-neutral-text/60">
                      Đơn vị: <span className="font-medium">{medicine.unit || 'N/A'}</span>
                    </span>
                    <span className="text-xs font-bold text-primary">
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
        <div className="absolute z-50 w-full mt-2 bg-neutral-surface border border-neutral-border/30 rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-neutral-muted flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-8 h-8 text-neutral-text/30" />
          </div>
          <p className="text-sm text-neutral-text/60">Không tìm thấy thuốc phù hợp</p>
        </div>
      )}
    </div>
  );
}

