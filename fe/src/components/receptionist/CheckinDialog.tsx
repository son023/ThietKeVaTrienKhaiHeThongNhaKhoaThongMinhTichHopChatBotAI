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
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { Save } from 'lucide-react';
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
  onCheckedIn?: () => void;
}

export function CheckinDialog({ open, onOpenChange, appointment, onCheckedIn }: CheckinDialogProps) {
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
    underlyingDiseases: '',
  });

  const requireMedicalInfoMissing = useMemo(() => {
    const hasAllergy = formData.allergyIds.length > 0;
    const hasUnderlying = formData.underlyingDiseases.trim().length > 0;
    return !(hasAllergy || hasUnderlying);
  }, [formData.allergyIds.length, formData.underlyingDiseases]);

  const resetForm = () => {
    setFormError(null);
    setFormData({
      address: '',
      contactPhone: '',
      bloodType: '',
      insuranceNumber: '',
      allergyIds: [],
      underlyingDiseases: '',
    });
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
      setFormData((prev) => ({
        ...prev,
        address: profile.address || '',
        contactPhone: profile.contactPhone || '',
        bloodType: profile.bloodType || '',
        insuranceNumber: profile.insuranceNumber || '',
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

  const toggleAllergy = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      allergyIds: prev.allergyIds.includes(id)
        ? prev.allergyIds.filter((a) => a !== id)
        : [...prev.allergyIds, id],
    }));
  };

  const handleSubmit = async () => {
    if (!appointment?.id || !appointment.patientId) return;
    if (requireMedicalInfoMissing) {
      setFormError('Vui lòng nhập ít nhất 1 dị ứng hoặc 1 bệnh nền trước khi check-in.');
      return;
    }

    setSaving(true);
    setFormError(null);
    const payload: PatientProfileRequest = {
      userId: appointment.patientId,
      address: formData.address || undefined,
      contactPhone: formData.contactPhone || undefined,
      bloodType: formData.bloodType || undefined,
      insuranceNumber: formData.insuranceNumber || undefined,
      patientAllergies: formData.allergyIds.map((id) => ({ allergyId: id })),
      underlyingDiseases: formData.underlyingDiseases
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean)
        .map((name) => ({ name })),
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
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>Hồ sơ ban đầu & Check-in</DialogTitle>
          <DialogDescription>
            Nhập thông tin dị ứng, bệnh nền, tiền sử răng miệng trước khi check-in.
          </DialogDescription>
        </DialogHeader>

        {appointment && (
          <div className="text-sm text-gray-700">
            <p className="font-medium">{appointment.patientName}</p>
            <p className="text-gray-500">{appointment.serviceName}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Địa chỉ</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Địa chỉ liên hệ"
                disabled={loadingProfile}
              />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input
                value={formData.contactPhone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))
                }
                placeholder="Số điện thoại bệnh nhân"
                disabled={loadingProfile}
              />
            </div>
            <div className="space-y-2">
              <Label>Nhóm máu</Label>
              <Select
                value={formData.bloodType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, bloodType: value }))}
                disabled={loadingProfile}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Chọn nhóm máu" />
                </SelectTrigger>
                <SelectContent>
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
                    <SelectItem key={bt} value={bt}>
                      {bt.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Số bảo hiểm</Label>
              <Input
                value={formData.insuranceNumber}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, insuranceNumber: e.target.value }))
                }
                placeholder="Số thẻ BHYT (nếu có)"
                disabled={loadingProfile}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dị ứng (chọn trong danh mục)</Label>
            <ScrollArea className="h-32 border rounded-md p-2">
              {loadingAllergies ? (
                <p className="text-sm text-gray-500">Đang tải danh mục dị ứng...</p>
              ) : allergies.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có danh mục dị ứng</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {allergies.map((allergy) => (
                    <label
                      key={allergy.id}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={formData.allergyIds.includes(allergy.id)}
                        onCheckedChange={() => toggleAllergy(allergy.id)}
                      />
                      <span>{allergy.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <Label>Bệnh nền (mỗi dòng một bệnh)</Label>
            <Textarea
              value={formData.underlyingDiseases}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, underlyingDiseases: e.target.value }))
              }
              placeholder="Ví dụ: Tiểu đường type 2\nTăng huyết áp"
              rows={3}
            />
          </div>

          {formError && <div className="text-sm text-red-600">{formError}</div>}

          {requireMedicalInfoMissing && (
            <div className="text-xs text-orange-600">
              Bắt buộc nhập ít nhất 1 dị ứng hoặc 1 bệnh nền trước khi check-in.
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={close} disabled={saving}>
              Hủy
            </Button>
            <Button
              disabled={saving || requireMedicalInfoMissing}
              onClick={handleSubmit}
              className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Đang lưu...' : 'Lưu hồ sơ & Check-in'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CheckinDialog;

