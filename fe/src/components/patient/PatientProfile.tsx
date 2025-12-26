import { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
  Bell,
  Shield,
  CreditCard,
  FileText,
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
import { insuranceController, PatientInsuranceDTO } from "../../controllers/InsuranceController";
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
  const [insurance, setInsurance] = useState<PatientInsuranceDTO | null>(null);

  // Form data
  const [profileData, setProfileData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    contactPhone: "",
    email: "",
    address: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    appointmentReminder: true,
    promotions: false,
    healthTips: true,
    paymentReminder: true,
    smsNotification: true,
    emailNotification: true,
  });

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

      // Load insurance data
      let insuranceData = null;
      try {
        insuranceData = await insuranceController.getActiveByPatientId(currentUser.id);

        
        setInsurance(insuranceData);
      } catch (error) {
        console.warn("Insurance not found");
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

  const handleChangePassword = () => {
    toast.success("Yêu cầu đổi mật khẩu đã được gửi đến email của bạn");
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
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-6">
            <TabsTrigger value="info" className="font-medium">
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="insurance" className="font-medium">
              Bảo hiểm
            </TabsTrigger>
            <TabsTrigger value="security" className="font-medium">
              Bảo mật
            </TabsTrigger>
            <TabsTrigger value="notifications" className="font-medium">
              Thông báo
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

          {/* Insurance Tab - READ ONLY */}
          <TabsContent value="insurance">
            <Card className="p-6 md:p-8 border-[var(--border-soft)] bg-[var(--surface-bg)] shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-[var(--accent-light)]" />
                <h3 className="typo-h4 text-[var(--text-strong)]">
                  Thông tin bảo hiểm
                </h3>
              </div>

              {insurance ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2">
                        Ngày cấp
                      </Label>
                      <div className="px-3 py-2 border border-[var(--border-soft)] rounded-lg bg-[var(--surface-muted)]">
                        {formatDate(insurance.issueDate)}
                      </div>
                    </div>

                    <div>
                      <Label className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2">
                        Ngày hết hạn
                      </Label>
                      <div className="px-3 py-2 border border-[var(--border-soft)] rounded-lg bg-[var(--surface-muted)]">
                        {formatDate(insurance.expiryDate)}
                      </div>
                    </div>

                    <div>
                      <Label className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2">
                        Trạng thái
                      </Label>
                      <div className="px-3 py-2 border border-[var(--border-soft)] rounded-lg bg-[var(--surface-muted)]">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${insurance.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : insurance.status === "EXPIRED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {insurance.status === "ACTIVE"
                            ? "Đang hoạt động"
                            : insurance.status === "EXPIRED"
                              ? "Hết hạn"
                              : "Tạm ngưng"}
                        </span>
                      </div>
                    </div>

                    {insurance.insurancePolicy && (
                      <>
                        <div>
                          <Label className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2">
                            Số chính sách
                          </Label>
                          <div className="px-3 py-2 border border-[var(--border-soft)] rounded-lg bg-[var(--surface-muted)]">
                            {insurance.insurancePolicy.policyNumber || "N/A"}
                          </div>
                        </div>

                        <div>
                          <Label className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2">
                            Loại bảo hiểm
                          </Label>
                          <div className="px-3 py-2 border border-[var(--border-soft)] rounded-lg bg-[var(--surface-muted)]">
                            {insurance.insurancePolicy.policyType || "N/A"}
                          </div>
                        </div>

                        <div>
                          <Label className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2">
                            Số tiền bảo hiểm
                          </Label>
                          <div className="px-3 py-2 border border-[var(--border-soft)] rounded-lg bg-[var(--surface-muted)]">
                            {insurance.insurancePolicy.coverageAmount
                              ? new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(insurance.insurancePolicy.coverageAmount)
                              : "N/A"}
                          </div>
                        </div>

                        <div>
                          <Label className="font-medium text-[var(--text-regular)] opacity-70 text-sm mb-2">
                            Mức khấu trừ
                          </Label>
                          <div className="px-3 py-2 border border-[var(--border-soft)] rounded-lg bg-[var(--surface-muted)]">
                            {insurance.insurancePolicy.deductible
                              ? new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(insurance.insurancePolicy.deductible)
                              : "N/A"}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-[var(--text-regular)] opacity-30 mx-auto mb-4" />
                  <p className="text-[var(--text-regular)] opacity-70">
                    Chưa có thông tin bảo hiểm
                  </p>
                  <p className="text-sm text-[var(--text-regular)] opacity-50 mt-2">
                    Vui lòng liên hệ bộ phận bảo hiểm để đăng ký
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-5">
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
                  <Button
                    onClick={handleChangePassword}
                    className="bg-white border-2 border-[var(--accent-light)] text-[var(--accent-light)] hover:bg-[var(--accent-ghost)]"
                  >
                    Đổi mật khẩu
                  </Button>
                </div>
              </Card>

              <Card className="p-6 md:p-8 border-[var(--border-soft)] bg-[var(--surface-bg)] shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="typo-h4 text-[var(--text-strong)] mb-1">
                      Xác thực hai yếu tố
                    </h3>
                    <p className="text-sm text-[var(--text-regular)] opacity-70 mb-4">
                      Tăng cường bảo mật tài khoản với xác thực hai yếu tố qua
                      SMS
                    </p>
                    <div className="flex items-center justify-between bg-[var(--surface-muted)] rounded-xl p-4">
                      <div>
                        <p className="font-medium text-[var(--text-strong)] text-sm mb-1">
                          Trạng thái
                        </p>
                        <p className="text-sm text-green-600">Đã kích hoạt</p>
                      </div>
                      <Switch checked={true} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="p-6 md:p-8 border-[var(--border-soft)] bg-[var(--surface-bg)] shadow-sm">
              <h3 className="typo-h4 text-[var(--text-strong)] mb-6">
                Cài đặt thông báo
              </h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between pb-5 border-b border-[var(--border-soft)]">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-[var(--accent-light)] mt-0.5" />
                    <div>
                      <p className="font-medium text-[var(--text-strong)] text-sm mb-1">
                        Nhắc nhở lịch hẹn
                      </p>
                      <p className="text-xs text-[var(--text-regular)] opacity-70">
                        Nhận thông báo trước 24 giờ và 1 giờ trước lịch hẹn
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.appointmentReminder}
                    onCheckedChange={(checked: any) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        appointmentReminder: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between pb-5 border-b border-[var(--border-soft)]">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-[var(--accent-light)] mt-0.5" />
                    <div>
                      <p className="font-medium text-[var(--text-strong)] text-sm mb-1">
                        Nhắc nhở thanh toán
                      </p>
                      <p className="text-xs text-[var(--text-regular)] opacity-70">
                        Nhận thông báo về hóa đơn chưa thanh toán
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.paymentReminder}
                    onCheckedChange={(checked: any) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        paymentReminder: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between pb-5 border-b border-[var(--border-soft)]">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-[var(--accent-light)] mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-[var(--text-strong)] text-sm mb-1">
                        Mẹo chăm sóc sức khỏe
                      </p>
                      <p className="text-xs text-[var(--text-regular)] opacity-70">
                        Nhận các bài viết và lời khuyên về chăm sóc răng miệng
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.healthTips}
                    onCheckedChange={(checked: any) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        healthTips: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between pb-5 border-b border-[var(--border-soft)]">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-[var(--accent-light)] mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-[var(--text-strong)] text-sm mb-1">
                        Khuyến mãi và ưu đãi
                      </p>
                      <p className="text-xs text-[var(--text-regular)] opacity-70">
                        Nhận thông báo về các chương trình khuyến mãi đặc biệt
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.promotions}
                    onCheckedChange={(checked: any) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        promotions: checked,
                      })
                    }
                  />
                </div>

                <div className="pt-5">
                  <h4 className="typo-h5 text-[var(--text-strong)] mb-4">
                    Kênh nhận thông báo
                  </h4>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4.5 h-4.5 text-[var(--accent-light)]" />
                        <p className="font-medium text-[var(--text-regular)] text-sm">
                          Tin nhắn SMS
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.smsNotification}
                        onCheckedChange={(checked: boolean) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            smsNotification: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4.5 h-4.5 text-[var(--accent-light)]" />
                        <p className="font-medium text-[var(--text-regular)] text-sm">
                          Email
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotification}
                        onCheckedChange={(checked: boolean) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailNotification: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--border-soft)]">
                <Button
                  onClick={() => toast.success("Đã lưu cài đặt thông báo")}
                  className="bg-gradient-to-r from-[var(--accent-light)] to-[var(--accent)] w-full sm:w-auto"
                >
                  Lưu cài đặt
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
