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
      <DialogContent className="max-w-2xl bg-neutral-surface border-neutral-border">
        <DialogHeader>
          <DialogTitle className="text-neutral-text text-xl font-bold">Hồ sơ ban đầu & Check-in</DialogTitle>
          <DialogDescription className="text-neutral-text/70">
            Nhập thông tin dị ứng, bệnh nền, tiền sử răng miệng trước khi check-in.
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
                disabled={loadingProfile}
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
                disabled={loadingProfile}
                className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface disabled:bg-neutral-muted"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-text font-medium">Nhóm máu</Label>
              <Select
                value={formData.bloodType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, bloodType: value }))}
                disabled={loadingProfile}
              >
                <SelectTrigger className="bg-neutral-surface border-neutral-border">
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
              <Label className="text-neutral-text font-medium">Số bảo hiểm</Label>
              <Input
                value={formData.insuranceNumber}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, insuranceNumber: e.target.value }))
                }
                placeholder="Số thẻ BHYT (nếu có)"
                disabled={loadingProfile}
                className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface disabled:bg-neutral-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-neutral-text font-medium">Dị ứng (chọn trong danh mục)</Label>
            <ScrollArea className="h-32 border border-neutral-border rounded-lg p-3 bg-neutral-muted/20">
              {loadingAllergies ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <p className="text-sm text-neutral-text/70 font-medium">Đang tải danh mục dị ứng...</p>
                </div>
              ) : allergies.length === 0 ? (
                <p className="text-sm text-neutral-text/60 text-center py-4">Chưa có danh mục dị ứng</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {allergies.map((allergy) => (
                    <label
                      key={allergy.id}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-neutral-surface/50 p-2 rounded transition-colors"
                    >
                      <Checkbox
                        checked={formData.allergyIds.includes(allergy.id)}
                        onCheckedChange={() => toggleAllergy(allergy.id)}
                        className="border-neutral-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span className="text-neutral-text">{allergy.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <Label className="text-neutral-text font-medium">Bệnh nền (mỗi dòng một bệnh)</Label>
            <Textarea
              value={formData.underlyingDiseases}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, underlyingDiseases: e.target.value }))
              }
              placeholder="Ví dụ: Tiểu đường type 2&#10;Tăng huyết áp"
              rows={3}
              className="border-neutral-border focus:border-primary focus:ring-primary/20 bg-neutral-surface"
            />
          </div>

          {formError && <div className="text-sm text-red-600 font-medium p-3 bg-red-50 border border-red-200 rounded-lg">{formError}</div>}

          {requireMedicalInfoMissing && (
            <div className="text-xs text-accent-orange font-medium p-3 bg-accent-orange/10 border border-accent-orange/30 rounded-lg">
              Bắt buộc nhập ít nhất 1 dị ứng hoặc 1 bệnh nền trước khi check-in.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-border">
            <Button variant="outline" onClick={close} disabled={saving} className="border-neutral-border hover:bg-neutral-muted transition-all">
              Hủy
            </Button>
            <Button
              disabled={saving || requireMedicalInfoMissing}
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary-strong flex items-center gap-2 shadow-sm transition-all duration-200"
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

