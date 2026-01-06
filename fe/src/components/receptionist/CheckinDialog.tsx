import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Save, Plus, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { medicalServiceController, AllergyDTO } from '../../controllers/MedicalServiceController';
import { patientController, PatientProfileRequest } from '../../controllers/PatientController';
import { appointmentController } from '../../controllers/AppointmentController';
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
import { AllergySearchInput } from './AllergySearchInput';

export interface CheckinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: {
    id: string;
    patientId: string;
    patientName?: string;
    doctorName?: string;
    serviceName?: string;
  } | null;
  isReadOnly?: boolean;
  onCheckedIn?: () => void;
}

export function CheckinDialog({ open, onOpenChange, appointment, isReadOnly = false, onCheckedIn }: CheckinDialogProps) {
  const [allergies, setAllergies] = useState<AllergyDTO[]>([]);
  const [loadingAllergies, setLoadingAllergies] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    address: '',
    contactPhone: '',
    bloodType: '',
    insuranceNumber: '',
    allergyIds: [] as string[],
    underlyingDiseases: [] as Array<{ name: string; description: string; }>,
  });

  // State for adding new disease
  const [newDisease, setNewDisease] = useState({ name: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const resetForm = () => {
    setFormError(null);
    setFormData({
      address: '',
      contactPhone: '',
      bloodType: '',
      insuranceNumber: '',
      allergyIds: [],
      underlyingDiseases: [],
    });
    setNewDisease({ name: '', description: '' });
    setShowAddForm(false);
  };

  const close = () => {
    resetForm();
    onOpenChange(false);
  };

  const loadAllergies = async () => {
    try {
      setLoadingAllergies(true);
      const data = await medicalServiceController.getAllergies();
      setAllergies(data);
    } catch (error) {
      console.error('Failed to load allergies', error);
    } finally {
      setLoadingAllergies(false);
    }
  };

  const loadProfile = async () => {
    if (!appointment?.patientId) return;
    try {
      setLoadingProfile(true);
      const profile = await patientController.getById(appointment.patientId);

      // ✅ Extract allergy IDs from patient profile
      const existingAllergyIds = profile.patientAllergies?.map(
        (pa) => pa.allergyId
      ).filter(Boolean) || [];

      // ✅ Transform underlying diseases to our format
      const existingDiseases = profile.underlyingDiseases?.map((disease) => ({
        name: disease.name || '',
        description: disease.note || '', // Backend uses 'note' field
      })).filter(d => d.name) || [];

      setFormData((prev) => ({
        ...prev,
        address: profile.address || '',
        contactPhone: profile.contactPhone || '',
        bloodType: profile.bloodType || '',
        insuranceNumber: profile.insuranceNumber || '',
        allergyIds: existingAllergyIds,        // ✅ Auto-fill allergies
        underlyingDiseases: existingDiseases,  // ✅ Auto-fill diseases
      }));
    } catch (error) {
      // keep defaults if profile not found
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadAllergies();
      loadProfile();
    } else {
      resetForm();
    }
  }, [open, appointment?.patientId]);

  const addAllergy = (allergy: AllergyDTO) => {
    setFormData((prev) => ({
      ...prev,
      allergyIds: [...prev.allergyIds, allergy.id],
    }));
  };

  const removeAllergy = (allergyId: string) => {
    setFormData((prev) => ({
      ...prev,
      allergyIds: prev.allergyIds.filter((id) => id !== allergyId),
    }));
  };

  const addDisease = () => {
    if (!newDisease.name.trim()) {
      toast.error('Vui lòng nhập tên bệnh');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      underlyingDiseases: [...prev.underlyingDiseases, { ...newDisease }],
    }));

    setNewDisease({ name: '', description: '' });
    setShowAddForm(false);
    toast.success('Đã thêm bệnh nền');
  };

  const removeDisease = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      underlyingDiseases: prev.underlyingDiseases.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!appointment?.id || !appointment.patientId) return;

    setSaving(true);
    setFormError(null);
    const payload: PatientProfileRequest = {
      userId: appointment.patientId,
      address: formData.address || undefined,
      contactPhone: formData.contactPhone || undefined,
      bloodType: formData.bloodType || undefined,
      insuranceNumber: formData.insuranceNumber || undefined,
      patientAllergies: formData.allergyIds.map((id) => ({ allergyId: id })),
      underlyingDiseases: formData.underlyingDiseases.map((disease) => ({
        name: disease.name,
        note: disease.description || undefined,
      })),
    };

    try {
      await patientController.upsertProfile(appointment.patientId, payload);
      await appointmentController.checkIn(appointment.id);
      toast.success('Check-in thành công', {
        description: 'Đã lưu hồ sơ ban đầu và check-in bệnh nhân.',
      });
      onCheckedIn?.();
      close();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Không thể lưu hồ sơ/check-in';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-2xl bg-white border-neutral-border">
        <DialogHeader>
          <DialogTitle className="text-neutral-text text-xl font-bold">
            {isReadOnly ? 'Xem hồ sơ bệnh nhân' : 'Hồ sơ ban đầu & Check-in'}
          </DialogTitle>
          <DialogDescription className="text-neutral-text/70">
            {isReadOnly
              ? 'Thông tin hồ sơ bệnh nhân (chế độ xem)'
              : 'Nhập thông tin dị ứng, bệnh nền, tiền sử răng miệng trước khi check-in.'
            }
          </DialogDescription>
        </DialogHeader>

        {appointment && (
          <div className="text-sm p-3 bg-neutral-muted rounded-lg border border-neutral-border">
            <p className="font-semibold text-neutral-text">{appointment.patientName}</p>
            <p className="text-neutral-text/70 mt-0.5">{appointment.serviceName}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-neutral-text font-medium">Địa chỉ</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Địa chỉ liên hệ"
                disabled={loadingProfile || isReadOnly}
                className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface disabled:bg-neutral-muted"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-text font-medium">Số điện thoại</Label>
              <Input
                value={formData.contactPhone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))
                }
                placeholder="Số điện thoại bệnh nhân"
                disabled={loadingProfile || isReadOnly}
                className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface disabled:bg-neutral-muted"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-text font-medium">Nhóm máu</Label>
              <Select
                value={formData.bloodType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, bloodType: value }))}
                disabled={loadingProfile || isReadOnly}
              >
                <SelectTrigger className="bg-white border-neutral-border">
                  <SelectValue placeholder="Chọn nhóm máu" />
                </SelectTrigger>
                <SelectContent className="bg-white border-neutral-border">
                  {[
                    'A_POSITIVE',
                    'A_NEGATIVE',
                    'B_POSITIVE',
                    'B_NEGATIVE',
                    'AB_POSITIVE',
                    'AB_NEGATIVE',
                    'O_POSITIVE',
                    'O_NEGATIVE',
                    'UNKNOWN',
                  ].map((bt) => (
                      <SelectItem
                          key={bt}
                          value={bt}
                          className="bg-white text-black focus:bg-neutral-100"
                      >
                        {bt.replace('_', ' ')}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-text font-medium">Số bảo hiểm</Label>
              <Input
                value={formData.insuranceNumber}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, insuranceNumber: e.target.value }))
                }
                placeholder="Số thẻ BHYT"
                disabled={loadingProfile || isReadOnly}
                className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface disabled:bg-neutral-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-neutral-text font-medium">Dị ứng </Label>
            {loadingAllergies ? (
              <div className="flex items-center gap-2 p-4 bg-neutral-muted/20 rounded-lg">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <p className="text-sm text-neutral-text/70 font-medium">Đang tải danh mục dị ứng...</p>
              </div>
            ) : (
              <AllergySearchInput
                allergies={allergies}
                selectedIds={formData.allergyIds}
                onSelect={addAllergy}
                onRemove={removeAllergy}
                disabled={loadingProfile || isReadOnly}
              />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-neutral-text font-medium">Bệnh nền</Label>
              {!isReadOnly && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  disabled={loadingProfile}
                  className="h-8 gap-1 bg-primary hover:bg-primary-strong"
                >
                  <Plus className="w-4 h-4" />
                  Thêm bệnh
                </Button>
              )}
            </div>

            {/* Add Form */}
            {showAddForm && (
              <div className="p-4 bg-neutral-muted/20 rounded-lg border border-neutral-border space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Tên bệnh <span className="text-red-600">*</span></Label>
                    <Input
                      value={newDisease.name}
                      onChange={(e) => setNewDisease(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="VD: Tiểu đường type 2"
                      className="border-neutral-border focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Mô tả</Label>
                    <Input
                      value={newDisease.description}
                      onChange={(e) => setNewDisease(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="VD: Đang dùng Metformin 500mg"
                      className="border-neutral-border focus:border-primary"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewDisease({ name: '', description: '' });
                    }}
                    className="border-neutral-border"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addDisease}
                    className="bg-primary hover:bg-primary-strong"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Thêm
                  </Button>
                </div>
              </div>
            )}

            {/* Disease Table */}
            {formData.underlyingDiseases.length > 0 && (
              <div className="border border-neutral-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-neutral-muted/30">
                      <TableHead className="w-[40%] font-semibold">Tên bệnh</TableHead>
                      <TableHead className="w-[50%] font-semibold">Mô tả</TableHead>
                      <TableHead className="w-[10%] text-center font-semibold">Xóa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.underlyingDiseases.map((disease, index) => (
                      <TableRow key={index} className="hover:bg-neutral-muted/10">
                        <TableCell className="font-medium text-neutral-text">{disease.name}</TableCell>
                        <TableCell className="text-sm text-neutral-text/70">
                          {disease.description || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {!isReadOnly && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDisease(index)}
                              className="h-8 w-8 p-0 hover:bg-red-100"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {formData.underlyingDiseases.length === 0 && !showAddForm && (
              <div className="text-center py-8 bg-neutral-muted/20 rounded-lg border border-dashed border-neutral-border">
                <p className="text-sm text-neutral-text/60">
                  Chưa có bệnh nền. Nhấn "Thêm bệnh" để bắt đầu.
                </p>
              </div>
            )}
          </div>

          {formError && <div className="text-sm text-red-600 font-medium p-3 bg-red-50 border border-red-200 rounded-lg">{formError}</div>}

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-border">
            <Button variant="outline" onClick={close} disabled={saving} className="border-neutral-border hover:bg-neutral-muted transition-all">
              {isReadOnly ? 'Đóng' : 'Hủy'}
            </Button>
            {!isReadOnly && (
              <Button
                disabled={saving}
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary-strong flex items-center gap-2 shadow-sm transition-all duration-200"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Đang lưu...' : 'Lưu hồ sơ & Check-in'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CheckinDialog;

