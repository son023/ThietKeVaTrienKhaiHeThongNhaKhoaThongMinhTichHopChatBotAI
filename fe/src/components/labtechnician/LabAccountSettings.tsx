import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Bell, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';
import { authController } from '../../controllers/AuthController';
import { UserDTO } from '../../models';

export function LabAccountSettings() {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [changingPassword, setChangingPassword] = useState(false);
    
    // Password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

    useEffect(() => {
        const currentUser = authController.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

    const handleSaveProfile = () => {
        toast.success('Đã cập nhật thông tin cá nhân');
    };

    const handleChangePassword = async () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập');
            return;
        }

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Vui lòng điền đầy đủ tất cả các trường');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu mới không khớp');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        try {
            setChangingPassword(true);
            await authController.changePassword(user.id, currentPassword, newPassword);
            
            toast.success('Đổi mật khẩu thành công');
            
            // Clear password fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error changing password:', error);
            const errorMessage = error instanceof Error ? error.message : 'Không thể đổi mật khẩu';
            toast.error(errorMessage);
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="font-bold text-neutral-heading text-3xl mb-2">
                    Cài đặt tài khoản
                </h1>
                <p className="font-normal text-neutral-text/70 text-sm">
                    Quản lý thông tin cá nhân và cài đặt hệ thống
                </p>
            </div>

            {/* Profile Information */}
            <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
                <h2 className="font-semibold text-neutral-heading text-lg mb-6">
                    Thông tin cá nhân
                </h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="font-medium text-neutral-heading mb-2 block">
                                Họ và tên
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-text/60" />
                                <Input
                                    type="text"
                                    value={profileData.fullName}
                                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                    className="pl-10 border-neutral-border focus:border-primary focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="font-medium text-neutral-heading mb-2 block">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-text/60" />
                                <Input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    className="pl-10 border-neutral-border focus:border-primary focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="font-medium text-neutral-heading mb-2 block">
                                Số điện thoại
                            </Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-text/60" />
                                <Input
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    className="pl-10 border-neutral-border focus:border-primary focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="font-medium text-neutral-heading mb-2 block">
                                Chức vụ
                            </Label>
                            <Input
                                type="text"
                                value={profileData.position}
                                disabled
                                className="border-neutral-border bg-neutral-muted/30"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label className="font-medium text-neutral-heading mb-2 block">
                                Chuyên môn
                            </Label>
                            <Input
                                type="text"
                                value={profileData.specialization}
                                onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                                className="border-neutral-border focus:border-primary focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary-strong transition-all duration-200">
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Change Password */}
            <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
                <h2 className="font-semibold text-neutral-heading text-lg mb-6">
                    Đổi mật khẩu
                </h2>
                <div className="space-y-4">
                    <div>
                        <Label className="font-medium text-neutral-heading mb-2 block">
                            Mật khẩu hiện tại <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-text/60" />
                            <Input 
                                type="password" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className="pl-10 border-neutral-border focus:border-primary focus:ring-primary/20" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="font-medium text-neutral-heading mb-2 block">
                                Mật khẩu mới <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-text/60" />
                                <Input 
                                    type="password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="pl-10 border-neutral-border focus:border-primary focus:ring-primary/20" 
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="font-medium text-neutral-heading mb-2 block">
                                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-text/60" />
                                <Input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="pl-10 border-neutral-border focus:border-primary focus:ring-primary/20" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button 
                            onClick={handleChangePassword} 
                            disabled={changingPassword}
                            className="bg-primary hover:bg-primary-strong transition-all duration-200 disabled:opacity-50"
                        >
                            {changingPassword ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                                    Đang xử lý...
                                </>
                            ) : (
                                'Đổi mật khẩu'
                            )}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Notification Settings */}
            <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
                <h2 className="font-semibold text-neutral-heading text-lg mb-6">
                    Cài đặt thông báo
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-neutral-border">
                        <div className="flex items-start gap-3">
                            <Bell className="w-5 h-5 text-primary mt-1" />
                            <div>
                                <p className="font-medium text-neutral-heading text-sm mb-1">
                                    Xét nghiệm mới
                                </p>
                                <p className="font-normal text-neutral-text/70 text-sm">
                                    Thông báo khi có yêu cầu xét nghiệm mới
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={notifications.newTest}
                            onCheckedChange={(checked: any) => setNotifications({ ...notifications, newTest: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-neutral-border">
                        <div className="flex items-start gap-3">
                            <Bell className="w-5 h-5 text-red-600 mt-1" />
                            <div>
                                <p className="font-medium text-neutral-heading text-sm mb-1">
                                    Xét nghiệm khẩn cấp
                                </p>
                                <p className="font-normal text-neutral-text/70 text-sm">
                                    Thông báo ưu tiên cho xét nghiệm khẩn cấp
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={notifications.urgentTest}
                            onCheckedChange={(checked: any) => setNotifications({ ...notifications, urgentTest: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-neutral-border">
                        <div className="flex items-start gap-3">
                            <Bell className="w-5 h-5 text-accent-orange mt-1" />
                            <div>
                                <p className="font-medium text-neutral-heading text-sm mb-1">
                                    Bảo trì thiết bị
                                </p>
                                <p className="font-normal text-neutral-text/70 text-sm">
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
                            <Bell className="w-5 h-5 text-purple-600 mt-1" />
                            <div>
                                <p className="font-medium text-neutral-heading text-sm mb-1">
                                    Báo cáo định kỳ
                                </p>
                                <p className="font-normal text-neutral-text/70 text-sm">
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
