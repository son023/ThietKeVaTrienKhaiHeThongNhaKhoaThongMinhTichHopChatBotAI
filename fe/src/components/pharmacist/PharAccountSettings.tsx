import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Camera, Loader2, User, Lock } from 'lucide-react';
import { useMemo, useState, useEffect, useRef } from 'react';
import { authController } from '../../controllers/AuthController';
import { userController, UpdateUserRequestDTO } from '../../controllers/UserController';
import { pharmacistController, PharmacistRequest } from '../../controllers/PharmacistController';
import { UserDTO } from '../../models/User';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function PharAccountSettings() {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pharmacist-specific state
  const [pharmacistData, setPharmacistData] = useState<{
    degree?: string;
    certificate?: string;
  } | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [degree, setDegree] = useState('');
  const [certificate, setCertificate] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load current user data and avatar preview
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const currentUser = authController.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
          setFullName(currentUser.fullName || '');
          setPhone(currentUser.phone || '');
          setEmail(currentUser.email || '');
          
          // Load pharmacist data
          try {
            const pharmacist = await pharmacistController.getById(currentUser.id);
            setPharmacistData(pharmacist);
            setDegree(pharmacist.degree || '');
            setCertificate(pharmacist.certificate || '');
          } catch (error) {
            console.error('Error loading pharmacist data:', error);
          }
          
          // Load avatar preview from localStorage
          const savedAvatar = localStorage.getItem(`avatar_preview_${currentUser.id}`);
          if (savedAvatar) {
            setAvatarPreview(savedAvatar);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Update user data
      const updateData: UpdateUserRequestDTO = {
        fullName: fullName,
      };

      const updatedUser = await userController.update(user.id, updateData);
      
      // Merge with existing user data
      const mergedUser = {
        ...user,
        ...updatedUser,
        fullName: updatedUser.fullName || user.fullName,
      };
      
      setUser(mergedUser);
      localStorage.setItem('currentUser', JSON.stringify(mergedUser));
      
      // Update pharmacist data
      if (pharmacistData) {
        const pharmacistUpdate: PharmacistRequest = {
          userId: user.id,
          degree: degree || '',
          certificate: certificate || '',
        };
        
        try {
          await pharmacistController.update(user.id, pharmacistUpdate);
        } catch (error) {
          console.error('Error updating pharmacist data:', error);
        }
      }
      
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    // Validation - all fields required
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
      toast.error('Không thể đổi mật khẩu');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow letters (including Vietnamese), spaces, and common name characters
    const nameRegex = /^[a-zA-ZÀ-ỹ\s]*$/;
    
    if (nameRegex.test(value) || value === '') {
      setFullName(value);
    } else {
      toast.error('Họ và tên chỉ được chứa chữ cái và khoảng trắng');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 2MB');
      return;
    }

    if (!user) return;

    try {
      setUploadingAvatar(true);

      // Convert file to base64 for local preview
      const reader = new FileReader();
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        toast.error('Lỗi đọc file ảnh');
        setUploadingAvatar(false);
      };
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        setAvatarPreview(base64String);
        
        // Save to localStorage with user ID as key
        if (user?.id) {
          localStorage.setItem(`avatar_preview_${user.id}`, base64String);
        }
        
        setUploadingAvatar(false);
        toast.success('Ảnh đại diện đã được cập nhật');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing avatar:', error);
      toast.error('Không thể xử lý ảnh');
      setUploadingAvatar(false);
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name || name.trim() === '') {
      return 'DS';
    }
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Use useMemo for displayName
  const displayName = useMemo(() => user?.fullName, [user]);
  const avatarFallback = useMemo(
    () => (displayName ? getInitials(displayName) : 'DS'),
    [displayName]
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-neutral-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-neutral-text/70 font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[var(--page-bg)] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="typo-h2 mb-2">Tài khoản của tôi</h1>
        <p className="text-neutral-text/60">Quản lý thông tin cá nhân và cài đặt</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-neutral-muted border border-neutral-border/30 p-1 rounded-xl">
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-neutral-surface data-[state=active]:shadow-sm">
            Thông tin cá nhân
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-neutral-surface data-[state=active]:shadow-sm">
            Bảo mật
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 typo-h4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </div>
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5 max-w-2xl">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6 pb-5 border-b border-neutral-border/30">
                  <div className="relative">
                    <Avatar className="w-24 h-24 ring-4 ring-neutral-border">
                      {(avatarPreview || user?.imageUrl) ? (
                        <AvatarImage src={avatarPreview || user?.imageUrl} alt={displayName || 'Avatar'} />
                      ) : null}
                      <AvatarFallback className="bg-primary text-white text-2xl font-semibold">
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <button 
                      onClick={handleAvatarClick}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 w-9 h-9 bg-primary rounded-full flex items-center justify-center hover:bg-primary-strong transition-all shadow-md border-2 border-neutral-surface disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-text mb-1">Ảnh đại diện</p>
                    <p className="text-xs text-neutral-text/60">JPG, PNG. Tối đa 2MB</p>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <Label htmlFor="fullName" className="text-neutral-text font-medium mb-2 block">Họ và tên</Label>
                  <Input 
                    id="fullName" 
                    value={fullName}
                    onChange={handleFullNameChange}
                    placeholder={fullName ? "Chỉ chữ cái và khoảng trắng" : "Nhập họ và tên của bạn"}
                    className="rounded-xl border-neutral-border/30 focus:border-primary"
                  />
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="email" className="text-neutral-text font-medium mb-2 block">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email}
                      disabled 
                      className="rounded-xl border-neutral-border/30 bg-neutral-muted" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-neutral-text font-medium mb-2 block">Số điện thoại</Label>
                    <Input 
                      id="phone" 
                      value={phone}
                      disabled
                      className="rounded-xl border-neutral-border/30 bg-neutral-muted" 
                    />
                  </div>
                </div>

                {/* Pharmacist-specific fields */}
                <div>
                  <Label htmlFor="degree" className="text-neutral-text font-medium mb-2 block">Bằng cấp</Label>
                  <Input 
                    id="degree" 
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="Nhập bằng cấp"
                    className="rounded-xl border-neutral-border/30 focus:border-primary" 
                  />
                </div>

                <div>
                  <Label htmlFor="certificate" className="text-neutral-text font-medium mb-2 block">Chứng chỉ</Label>
                  <Input 
                    id="certificate" 
                    value={certificate}
                    onChange={(e) => setCertificate(e.target.value)}
                    placeholder="Nhập chứng chỉ"
                    className="rounded-xl border-neutral-border/30 focus:border-primary" 
                  />
                </div>

                <Button 
                  className="bg-primary hover:bg-primary-strong text-white rounded-lg shadow-sm hover:shadow transition-all"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 typo-h4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                Bảo mật
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5 max-w-2xl">
                <div>
                  <Label htmlFor="current-password" className="text-neutral-text font-medium mb-2 block">
                    Mật khẩu hiện tại <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="current-password" 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="rounded-xl border-neutral-border/30 focus:border-primary" 
                  />
                </div>

                <div>
                  <Label htmlFor="new-password" className="text-neutral-text font-medium mb-2 block">
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="rounded-xl border-neutral-border/30 focus:border-primary" 
                  />
                </div>

                <div>
                  <Label htmlFor="confirm-password" className="text-neutral-text font-medium mb-2 block">
                    Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="rounded-xl border-neutral-border/30 focus:border-primary" 
                  />
                </div>

                <Button 
                  className="bg-primary hover:bg-primary-strong text-white rounded-lg shadow-sm hover:shadow transition-all"
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Đổi mật khẩu'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

