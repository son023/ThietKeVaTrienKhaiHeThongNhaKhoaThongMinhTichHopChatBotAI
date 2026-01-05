import { useState, useEffect, useRef } from 'react';
import { Search, X, Shield } from 'lucide-react';
import { Input } from '../ui/input';
import { AllergyDTO } from '../../controllers/MedicalServiceController';

interface AllergySearchInputProps {
    allergies: AllergyDTO[];
    selectedIds: string[];
    onSelect: (allergy: AllergyDTO) => void;
    onRemove: (allergyId: string) => void;
    disabled?: boolean;
}

export function AllergySearchInput({
    allergies,
    selectedIds,
    onSelect,
    onRemove,
    disabled
}: AllergySearchInputProps) {
    const [query, setQuery] = useState('');
    const [filteredAllergies, setFilteredAllergies] = useState<AllergyDTO[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.trim()) {
            const filtered = allergies.filter(
                a => !selectedIds.includes(a.id) && a.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredAllergies(filtered);
            setShowDropdown(true);
        } else {
            setFilteredAllergies([]);
            setShowDropdown(false);
        }
    }, [query, allergies, selectedIds]);

    const handleSelect = (allergy: AllergyDTO) => {
        onSelect(allergy);
        setQuery('');
        setShowDropdown(false);
    };

    const selectedAllergies = allergies.filter(a => selectedIds.includes(a.id));

    return (
        <div className="space-y-3">
            {/* Search Input */}
            <div className="relative" ref={dropdownRef}>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-text/40" />
                    <Input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Tìm kiếm dị ứng..."
                        disabled={disabled}
                        className="pl-11 pr-4 rounded-lg border-neutral-border bg-neutral-surface focus:border-primary transition-colors"
                    />
                </div>

                {/* Dropdown */}
                {showDropdown && filteredAllergies.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-neutral-border rounded-lg shadow-lg max-h-[250px] overflow-y-auto">
                        {filteredAllergies.map((allergy) => (
                            <button
                                key={allergy.id}
                                onClick={() => handleSelect(allergy)}
                                className="w-full px-4 py-3 text-left hover:bg-neutral-muted/50 transition-colors border-b border-neutral-border/20 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                            >
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-red-600" />
                                    <p className="font-medium text-neutral-text">{allergy.name}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* No results */}
                {showDropdown && filteredAllergies.length === 0 && query && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-neutral-border rounded-lg shadow-lg p-6 text-center">
                        <p className="text-sm text-neutral-text/60">Không tìm thấy dị ứng phù hợp</p>
                    </div>
                )}
            </div>

            {/* Selected Allergies (Chips) */}
            {selectedAllergies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedAllergies.map((allergy) => (
                        <div
                            key={allergy.id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm border border-red-300"
                        >
                            <Shield className="w-3 h-3" />
                            <span>{allergy.name}</span>
                            <button
                                type="button"
                                onClick={() => onRemove(allergy.id)}
                                disabled={disabled}
                                className="hover:text-red-600 transition-colors disabled:opacity-50"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AllergySearchInput;
