import { useState } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Lock, Bell, Shield, CreditCard } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';

export function PatientProfile() {
  const [selectedTab, setSelectedTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);

  // Mock data
  const [profileData, setProfileData] = useState({
    fullName: 'Nguyễn Văn Minh',
    dateOfBirth: '15/05/1990',
    gender: 'Nam',
    phone: '+84 912 345 678',
    email: 'nguyenvanminh@email.com',
    address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
    emergencyContact: 'Nguyễn Thị Lan',
    emergencyPhone: '0987 654 321'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    appointmentReminder: true,
    promotions: false,
    healthTips: true,
    paymentReminder: true,
    smsNotification: true,
    emailNotification: true
  });

  const handleSaveProfile = () => {
    toast.success('Cập nhật thông tin thành công!');
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    toast.success('Yêu cầu đổi mật khẩu đã được gửi đến email của bạn');
  };

  return (
    <div className="w-full bg-[#fcfeff] py-[40px] px-[20px] md:px-[80px]">
      <div className="max-w-[1440px] mx-auto">
        {/* DoctorHeader */}
        <div className="mb-[32px]">
          <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[28px] md:text-[32px] mb-[8px]">
            Thông tin cá nhân
          </h1>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[16px]">
            Quản lý thông tin cá nhân và cài đặt tài khoản
          </p>
        </div>

        {/* Profile DoctorHeader Card */}
        <Card className="p-[24px] md:p-[32px] border-[#ebf6fc] mb-[24px]">
          <div className="flex flex-col sm:flex-row items-center gap-[24px]">
            <div className="w-[100px] h-[100px] bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3] rounded-[20px] flex items-center justify-center text-white font-['Fz_Poppins:Bold',sans-serif] text-[40px] shadow-[0px_8px_24px_0px_rgba(63,181,255,0.3)]">
              {profileData.fullName.charAt(0)}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[24px] mb-[4px]">
                {profileData.fullName}
              </h2>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px] mb-[8px]">
                {profileData.email}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-[8px]">
                <span className="px-[12px] py-[4px] bg-[#e8f5e9] text-[#4caf50] rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[13px]">
                  Tài khoản đã xác thực
                </span>
                <span className="px-[12px] py-[4px] bg-[#f5fbff] text-[#3fb5ff] rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[13px]">
                  Mã BN: BN-2024-0123
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full max-w-[600px] grid-cols-3 mb-[24px]">
            <TabsTrigger value="info" className="font-['Fz_Poppins:Medium',sans-serif]">
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="security" className="font-['Fz_Poppins:Medium',sans-serif]">
              Bảo mật
            </TabsTrigger>
            <TabsTrigger value="notifications" className="font-['Fz_Poppins:Medium',sans-serif]">
              Thông báo
            </TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="info">
            <Card className="p-[24px] md:p-[32px] border-[#ebf6fc]">
              <div className="flex items-center justify-between mb-[24px]">
                <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px]">
                  Thông tin cá nhân
                </h3>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-white border-2 border-[#3fb5ff] text-[#3fb5ff] hover:bg-[#ebf6fc]"
                  >
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex gap-[12px]">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-gradient-to-r from-[#3fb5ff] to-[#1e8bc3]"
                    >
                      Lưu thay đổi
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                <div>
                  <Label htmlFor="fullName" className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px] mb-[8px]">
                    Họ và tên
                  </Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    disabled={!isEditing}
                    className="font-['Fz_Poppins:Regular',sans-serif]"
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth" className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px] mb-[8px]">
                    Ngày sinh
                  </Label>
                  <Input
                    id="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                    disabled={!isEditing}
                    className="font-['Fz_Poppins:Regular',sans-serif]"
                  />
                </div>

                <div>
                  <Label htmlFor="gender" className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px] mb-[8px]">
                    Giới tính
                  </Label>
                  <Input
                    id="gender"
                    value={profileData.gender}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    disabled={!isEditing}
                    className="font-['Fz_Poppins:Regular',sans-serif]"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px] mb-[8px]">
                    Số điện thoại
                  </Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="font-['Fz_Poppins:Regular',sans-serif]"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="email" className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px] mb-[8px]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditing}
                    className="font-['Fz_Poppins:Regular',sans-serif]"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address" className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px] mb-[8px]">
                    Địa chỉ
                  </Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    disabled={!isEditing}
                    className="font-['Fz_Poppins:Regular',sans-serif]"
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyContact" className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px] mb-[8px]">
                    Người liên hệ khẩn cấp
                  </Label>
                  <Input
                    id="emergencyContact"
                    value={profileData.emergencyContact}
                    onChange={(e) => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                    disabled={!isEditing}
                    className="font-['Fz_Poppins:Regular',sans-serif]"
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyPhone" className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px] mb-[8px]">
                    SĐT người liên hệ khẩn cấp
                  </Label>
                  <Input
                    id="emergencyPhone"
                    value={profileData.emergencyPhone}
                    onChange={(e) => setProfileData({ ...profileData, emergencyPhone: e.target.value })}
                    disabled={!isEditing}
                    className="font-['Fz_Poppins:Regular',sans-serif]"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-[20px]">
              <Card className="p-[24px] md:p-[32px] border-[#ebf6fc]">
                <div className="flex items-start gap-[16px] mb-[24px]">
                  <div className="w-[48px] h-[48px] bg-[#ebf6fc] rounded-[12px] flex items-center justify-center flex-shrink-0">
                    <Lock className="w-[24px] h-[24px] text-[#3fb5ff]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px] mb-[4px]">
                      Đổi mật khẩu
                    </h3>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                      Cập nhật mật khẩu định kỳ để bảo vệ tài khoản của bạn
                    </p>
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    className="bg-white border-2 border-[#3fb5ff] text-[#3fb5ff] hover:bg-[#ebf6fc]"
                  >
                    Đổi mật khẩu
                  </Button>
                </div>
              </Card>

              <Card className="p-[24px] md:p-[32px] border-[#ebf6fc]">
                <div className="flex items-start gap-[16px]">
                  <div className="w-[48px] h-[48px] bg-[#e8f5e9] rounded-[12px] flex items-center justify-center flex-shrink-0">
                    <Shield className="w-[24px] h-[24px] text-[#4caf50]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px] mb-[4px]">
                      Xác thực hai yếu tố
                    </h3>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px] mb-[16px]">
                      Tăng cường bảo mật tài khoản với xác thực hai yếu tố qua SMS
                    </p>
                    <div className="flex items-center justify-between bg-[#f5fbff] rounded-[12px] p-[16px]">
                      <div>
                        <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#01304e] text-[14px] mb-[4px]">
                          Trạng thái
                        </p>
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#4caf50] text-[13px]">
                          Đã kích hoạt
                        </p>
                      </div>
                      <Switch checked={true} />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-[24px] md:p-[32px] border-[#ffebee] bg-[#fffbf0]">
                <div className="flex items-start gap-[16px]">
                  <div className="w-[48px] h-[48px] bg-[#ffebee] rounded-[12px] flex items-center justify-center flex-shrink-0">
                    <svg className="w-[24px] h-[24px] text-[#f44336]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#f44336] text-[18px] mb-[4px]">
                      Xóa tài khoản
                    </h3>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px] mb-[16px]">
                      Sau khi xóa, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn và không thể khôi phục
                    </p>
                    <Button
                      variant="outline"
                      className="border-[#f44336] text-[#f44336] hover:bg-[#ffebee]"
                    >
                      Xóa tài khoản
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="p-[24px] md:p-[32px] border-[#ebf6fc]">
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px] mb-[24px]">
                Cài đặt thông báo
              </h3>

              <div className="space-y-[24px]">
                <div className="flex items-center justify-between pb-[20px] border-b border-[#ebf6fc]">
                  <div className="flex items-start gap-[12px]">
                    <Bell className="w-[20px] h-[20px] text-[#3fb5ff] mt-[2px]" />
                    <div>
                      <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#01304e] text-[15px] mb-[4px]">
                        Nhắc nhở lịch hẹn
                      </p>
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                        Nhận thông báo trước 24 giờ và 1 giờ trước lịch hẹn
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.appointmentReminder}
                    onCheckedChange={(checked: any) =>
                      setNotificationSettings({ ...notificationSettings, appointmentReminder: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between pb-[20px] border-b border-[#ebf6fc]">
                  <div className="flex items-start gap-[12px]">
                    <CreditCard className="w-[20px] h-[20px] text-[#3fb5ff] mt-[2px]" />
                    <div>
                      <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#01304e] text-[15px] mb-[4px]">
                        Nhắc nhở thanh toán
                      </p>
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                        Nhận thông báo về hóa đơn chưa thanh toán
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.paymentReminder}
                    onCheckedChange={(checked: any) =>
                      setNotificationSettings({ ...notificationSettings, paymentReminder: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between pb-[20px] border-b border-[#ebf6fc]">
                  <div className="flex items-start gap-[12px]">
                    <svg className="w-[20px] h-[20px] text-[#3fb5ff] mt-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <div>
                      <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#01304e] text-[15px] mb-[4px]">
                        Mẹo chăm sóc sức khỏe
                      </p>
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                        Nhận các bài viết và lời khuyên về chăm sóc răng miệng
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.healthTips}
                    onCheckedChange={(checked: any) =>
                      setNotificationSettings({ ...notificationSettings, healthTips: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between pb-[20px] border-b border-[#ebf6fc]">
                  <div className="flex items-start gap-[12px]">
                    <svg className="w-[20px] h-[20px] text-[#3fb5ff] mt-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <div>
                      <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#01304e] text-[15px] mb-[4px]">
                        Khuyến mãi và ưu đãi
                      </p>
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                        Nhận thông báo về các chương trình khuyến mãi đặc biệt
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.promotions}
                    onCheckedChange={(checked: any) =>
                      setNotificationSettings({ ...notificationSettings, promotions: checked })
                    }
                  />
                </div>

                <div className="pt-[20px]">
                  <h4 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[16px] mb-[16px]">
                    Kênh nhận thông báo
                  </h4>

                  <div className="space-y-[16px]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-[12px]">
                        <Phone className="w-[18px] h-[18px] text-[#3fb5ff]" />
                        <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px]">
                          Tin nhắn SMS
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.smsNotification}
                        onCheckedChange={(checked: boolean) =>
                          setNotificationSettings({ ...notificationSettings, smsNotification: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-[12px]">
                        <Mail className="w-[18px] h-[18px] text-[#3fb5ff]" />
                        <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px]">
                          Email
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotification}
                        onCheckedChange={(checked: boolean) =>
                          setNotificationSettings({ ...notificationSettings, emailNotification: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-[24px] pt-[24px] border-t border-[#ebf6fc]">
                <Button
                  onClick={() => toast.success('Đã lưu cài đặt thông báo')}
                  className="bg-gradient-to-r from-[#3fb5ff] to-[#1e8bc3] w-full sm:w-auto"
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
