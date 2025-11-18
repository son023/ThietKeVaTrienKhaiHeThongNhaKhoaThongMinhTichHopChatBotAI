import { useState } from 'react';
import { User, Mail, Phone, Lock, Bell } from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';

export function LabAccountSettings() {
    const [profileData, setProfileData] = useState({
        fullName: 'Nguyễn Thị Lan',
        email: 'lan.nguyen@dentalcarex.vn',
        phone: '+84 912 345 678',
        position: 'Kỹ thuật viên xét nghiệm',
        specialization: 'X-quang & CT Scan',
    });

    const [notifications, setNotifications] = useState({
        newTest: true,
        urgentTest: true,
        maintenance: true,
        reports: false,
    });

    const handleSaveProfile = () => {
        toast.success('Đã cập nhật thông tin cá nhân');
    };

    const handleChangePassword = () => {
        toast.success('Đã thay đổi mật khẩu');
    };

    return (
        <div className="p-6 space-y-6 max-w-4xl">
            {/* DoctorHeader */}
            <div>
                <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[28px] mb-2">
                    Cài đặt tài khoản
                </h1>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                    Quản lý thông tin cá nhân và cài đặt hệ thống
                </p>
            </div>

            {/* Profile Information */}
            <Card className="p-6 border-[#ebf6fc]">
                <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px] mb-6">
                    Thông tin cá nhân
                </h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] mb-2 block">
                                Họ và tên
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                                <Input
                                    type="text"
                                    value={profileData.fullName}
                                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                    className="pl-10 border-[#ebf6fc]"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] mb-2 block">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                                <Input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    className="pl-10 border-[#ebf6fc]"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] mb-2 block">
                                Số điện thoại
                            </Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                                <Input
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    className="pl-10 border-[#ebf6fc]"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] mb-2 block">
                                Chức vụ
                            </Label>
                            <Input
                                type="text"
                                value={profileData.position}
                                disabled
                                className="border-[#ebf6fc] bg-[#f8fcff]"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] mb-2 block">
                                Chuyên môn
                            </Label>
                            <Input
                                type="text"
                                value={profileData.specialization}
                                onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                                className="border-[#ebf6fc]"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleSaveProfile} className="bg-[#3fb5ff] hover:bg-[#1e8bc3]">
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Change Password */}
            <Card className="p-6 border-[#ebf6fc]">
                <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px] mb-6">
                    Đổi mật khẩu
                </h2>
                <div className="space-y-4">
                    <div>
                        <Label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] mb-2 block">
                            Mật khẩu hiện tại
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                            <Input type="password" className="pl-10 border-[#ebf6fc]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] mb-2 block">
                                Mật khẩu mới
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                                <Input type="password" className="pl-10 border-[#ebf6fc]" />
                            </div>
                        </div>

                        <div>
                            <Label className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] mb-2 block">
                                Xác nhận mật khẩu mới
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#666666]" />
                                <Input type="password" className="pl-10 border-[#ebf6fc]" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleChangePassword} className="bg-[#3fb5ff] hover:bg-[#1e8bc3]">
                            Đổi mật khẩu
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Notification Settings */}
            <Card className="p-6 border-[#ebf6fc]">
                <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px] mb-6">
                    Cài đặt thông báo
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-[#ebf6fc]">
                        <div className="flex items-start gap-3">
                            <Bell className="w-5 h-5 text-[#3fb5ff] mt-1" />
                            <div>
                                <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#01304e] text-[15px] mb-1">
                                    Xét nghiệm mới
                                </p>
                                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                                    Thông báo khi có yêu cầu xét nghiệm mới
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={notifications.newTest}
                            onCheckedChange={(checked: any) => setNotifications({ ...notifications, newTest: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-[#ebf6fc]">
                        <div className="flex items-start gap-3">
                            <Bell className="w-5 h-5 text-[#ff4444] mt-1" />
                            <div>
                                <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#01304e] text-[15px] mb-1">
                                    Xét nghiệm khẩn cấp
                                </p>
                                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                                    Thông báo ưu tiên cho xét nghiệm khẩn cấp
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={notifications.urgentTest}
                            onCheckedChange={(checked: any) => setNotifications({ ...notifications, urgentTest: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-[#ebf6fc]">
                        <div className="flex items-start gap-3">
                            <Bell className="w-5 h-5 text-[#ff9f43] mt-1" />
                            <div>
                                <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#01304e] text-[15px] mb-1">
                                    Bảo trì thiết bị
                                </p>
                                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                                    Nhắc nhở lịch bảo trì thiết bị
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={notifications.maintenance}
                            onCheckedChange={(checked: any) => setNotifications({ ...notifications, maintenance: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-start gap-3">
                            <Bell className="w-5 h-5 text-[#9b59b6] mt-1" />
                            <div>
                                <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#01304e] text-[15px] mb-1">
                                    Báo cáo định kỳ
                                </p>
                                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                                    Nhận báo cáo thống kê hàng tuần
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={notifications.reports}
                            onCheckedChange={(checked: any) => setNotifications({ ...notifications, reports: checked })}
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
}
