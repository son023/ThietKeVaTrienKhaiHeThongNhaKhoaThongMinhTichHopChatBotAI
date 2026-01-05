import { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import { authController } from "../../controllers/AuthController";
import { userController, UpdateUserRequestDTO } from "../../controllers/UserController";
import { patientController } from "../../controllers/PatientController";
import { UserDTO } from "../../models";
import { PatientDTO } from "../../models/Patient";

export function PatientProfile() {
  const [selectedTab, setSelectedTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Data from API
  const [user, setUser] = useState<UserDTO | null>(null);
  const [patient, setPatient] = useState<PatientDTO | null>(null);

  // Form data
  const [profileData, setProfileData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    contactPhone: "",
    email: "",
    address: "",
  });


  // Password form state
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load data on mount
  useEffect(() => {
    loadProfileData();
  }, []);


  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const currentUser = authController.getCurrentUser();
      if (!currentUser?.id) {
        toast.error("Vui lòng đăng nhập");
        return;
      }

      // Load user data
      const userData = await userController.getById(currentUser.id);
      setUser(userData);

      // Load patient data (patientId = userId)
      let patientData = null;
      try {
        patientData = await patientController.getById(currentUser.id);

        setPatient(patientData);
      } catch (error) {
        console.warn("Patient profile not found, will create on save");
      }

      // Populate form - Sử dụng patientData thay vì patient state
      setProfileData({
        fullName: userData.fullName || "",
        dob: patientData?.dob 
        ? new Date(patientData.dob).toISOString().split('T')[0]
        : "",     
        gender: patientData?.gender || "",
        contactPhone: userData.phone || "",
        email: userData.email || "",
        address: patientData?.address || ""
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Không thể tải thông tin cá nhân");
    } finally {
      setIsLoading(false);
    }
  };


  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const currentUser = authController.getCurrentUser();
      if (!currentUser?.id) {
        toast.error("Vui lòng đăng nhập");
        return;
      }

      console.log("update", profileData);
      // Update user
      const updateUserData: UpdateUserRequestDTO = {
        fullName: profileData.fullName,
        phone: profileData.contactPhone,
        email: profileData.email,
      };
      await userController.update(currentUser.id, updateUserData);

      // Update patient profile
      try {
        await patientController.upsertProfile(currentUser.id, {
          dob: profileData.dob,
          gender: profileData.gender,
          address: profileData.address,
          contactPhone: profileData.contactPhone
        });
      } catch (error) {
        console.error("Failed to update patient profile:", error);
        toast.warning("Cập nhật thông tin bệnh nhân thất bại");
      }

      toast.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
      await loadProfileData(); // Reload data
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Không thể cập nhật thông tin");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ tất cả các trường");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setChangingPassword(true);
      await authController.changePassword(user.id, currentPassword, newPassword);
      
      toast.success("Đổi mật khẩu thành công");
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMessage = error instanceof Error ? error.message : "Không thể đổi mật khẩu";
      toast.error(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-[var(--page-bg)] py-10 px-5 md:px-20 min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-regular)]">Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[var(--page-bg)] py-10 px-5 md:px-20 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="typo-h1 text-[var(--text-strong)] mb-2">
            Thông tin cá nhân
          </h1>
          <p className="text-base text-[var(--text-regular)] opacity-70">
            Quản lý thông tin cá nhân và cài đặt tài khoản
          </p>
        </div>

        {/* Profile Header Card */}
        <Card className="p-6 md:p-8 border-[var(--border-soft)] bg-[var(--surface-bg)] shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent)] rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="typo-h2 text-[var(--text-strong)] mb-1">
                {user?.fullName || "Chưa có tên"}
              </h2>
              <p className="text-sm text-[var(--text-regular)] opacity-70 mb-2">
                {user?.email || ""}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg font-medium text-xs">
                  Tài khoản đã xác thực
                </span>
                {patient?.userId && (
                  <span className="px-3 py-1.5 bg-[var(--accent-ghost)] text-[var(--accent-light)] rounded-lg font-medium text-xs">
                    Mã BN: {patient.userId.substring(0, 8).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-2xl grid-cols-2 mb-6">
            <TabsTrigger value="info" className="font-medium">
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="security" className="font-medium">
              Đổi mật khẩu
            </TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="info">
            <Card className="p-6 md:p-8 border-[var(--border-soft)] bg-[var(--surface-bg)] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="typo-h4 text-[var(--text-strong)]">
                  Thông tin cá nhân
                </h3>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-white border-2 border-[var(--accent-light)] text-[var(--accent-light)] hover:bg-[var(--accent-ghost)]"
                  >
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        loadProfileData(); // Reset form
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-gradient-to-r from-[var(--accent-light)] to-[var(--accent)]"
                      disabled={isSaving}
                    >
                      {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="fullName"
                    className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2"
                  >
                    Họ và tên
                  </Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        fullName: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="dateOfBirth"
                    className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2"
                  >
                    Ngày sinh
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profileData.dob}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        dob: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="gender"
                    className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2"
                  >
                    Giới tính
                  </Label>
                  <select
                    id="gender"
                    value={profileData.gender}
                    onChange={(e) =>
                      setProfileData({ ...profileData, gender: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-[var(--border-soft)] rounded-lg bg-white"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <div>
                  <Label
                    htmlFor="phone"
                    className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2"
                  >
                    Số điện thoại
                  </Label>
                  <Input
                    id="phone"
                    value={profileData.contactPhone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, contactPhone: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label
                    htmlFor="email"
                    className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label
                    htmlFor="address"
                    className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2"
                  >
                    Địa chỉ
                  </Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </div>

                {/*<div>*/}
                {/*  <Label*/}
                {/*    htmlFor="emergencyContact"*/}
                {/*    className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2"*/}
                {/*  >*/}
                {/*    Người liên hệ khẩn cấp*/}
                {/*  </Label>*/}
                {/*  <Input*/}
                {/*    id="emergencyContact"*/}
                {/*    value={profileData.emergencyContact}*/}
                {/*    onChange={(e) =>*/}
                {/*      setProfileData({*/}
                {/*        ...profileData,*/}
                {/*        emergencyContact: e.target.value,*/}
                {/*      })*/}
                {/*    }*/}
                {/*    disabled={!isEditing}*/}
                {/*  />*/}
                {/*</div>*/}

                {/*<div>*/}
                {/*  <Label*/}
                {/*    htmlFor="emergencyPhone"*/}
                {/*    className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2"*/}
                {/*  >*/}
                {/*    SĐT người liên hệ khẩn cấp*/}
                {/*  </Label>*/}
                {/*  <Input*/}
                {/*    id="emergencyPhone"*/}
                {/*    value={profileData.emergencyPhone}*/}
                {/*    onChange={(e) =>*/}
                {/*      setProfileData({*/}
                {/*        ...profileData,*/}
                {/*        emergencyPhone: e.target.value,*/}
                {/*      })*/}
                {/*    }*/}
                {/*    disabled={!isEditing}*/}
                {/*  />*/}
                {/*</div>*/}

              </div>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="p-6 md:p-8 border-[var(--border-soft)] bg-[var(--surface-bg)] shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-[var(--accent-ghost)] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-[var(--accent-light)]" />
                </div>
                <div className="flex-1">
                  <h3 className="typo-h4 text-[var(--text-strong)] mb-1">
                    Đổi mật khẩu
                  </h3>
                  <p className="text-sm text-[var(--text-regular)] opacity-70">
                    Cập nhật mật khẩu định kỳ để bảo vệ tài khoản của bạn
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="current-password"
                    className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2 block"
                  >
                    Mật khẩu hiện tại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="new-password"
                    className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2 block"
                  >
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="confirm-password"
                    className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2 block"
                  >
                    Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => {
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    variant="outline"
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    className="bg-gradient-to-r from-[var(--accent-light)] to-[var(--accent)]"
                  >
                    {changingPassword ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
