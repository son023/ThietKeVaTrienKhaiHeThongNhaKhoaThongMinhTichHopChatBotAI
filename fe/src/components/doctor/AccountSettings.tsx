import { User, Lock, FileSignature, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function AccountSettings() {
    return (
        <div className="p-6 bg-neutral-background min-h-screen">
            <div className="mb-8">
                <h1 className="typo-h2 mb-2">Tài khoản của tôi</h1>
                <p className="text-neutral-text/60">Quản lý thông tin cá nhân và cài đặt</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-neutral-muted border border-neutral-border/30 p-1 rounded-xl">
                    <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-neutral-surface data-[state=active]:shadow-sm">Thông tin cá nhân</TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-neutral-surface data-[state=active]:shadow-sm">Bảo mật</TabsTrigger>
                    <TabsTrigger value="signature" className="rounded-lg data-[state=active]:bg-neutral-surface data-[state=active]:shadow-sm">Chữ ký số</TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-neutral-surface data-[state=active]:shadow-sm">Thông báo</TabsTrigger>
                </TabsList>

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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <Label htmlFor="fullname" className="text-neutral-text font-medium mb-2 block">Họ và tên</Label>
                                        <Input id="fullname" defaultValue="Nguyễn Văn Hùng" className="rounded-xl border-neutral-border/30 focus:border-primary" />
                                    </div>
                                    <div>
                                        <Label htmlFor="code" className="text-neutral-text font-medium mb-2 block">Mã bác sĩ</Label>
                                        <Input id="code" defaultValue="BS001" disabled className="rounded-xl border-neutral-border/30 bg-neutral-muted" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <Label htmlFor="phone" className="text-neutral-text font-medium mb-2 block">Số điện thoại</Label>
                                        <Input id="phone" defaultValue="0901234567" className="rounded-xl border-neutral-border/30 focus:border-primary" />
                                    </div>
                                    <div>
                                        <Label htmlFor="email" className="text-neutral-text font-medium mb-2 block">Email</Label>
                                        <Input id="email" type="email" defaultValue="hung.nguyen@dental.vn" className="rounded-xl border-neutral-border/30 focus:border-primary" />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="specialization" className="text-neutral-text font-medium mb-2 block">Chuyên môn</Label>
                                    <Input id="specialization" defaultValue="Bác sĩ Nha khoa Tổng quát" className="rounded-xl border-neutral-border/30 focus:border-primary" />
                                </div>

                                <div>
                                    <Label htmlFor="license" className="text-neutral-text font-medium mb-2 block">Số giấy phép hành nghề</Label>
                                    <Input id="license" defaultValue="123456/BYT" className="rounded-xl border-neutral-border/30 focus:border-primary" />
                                </div>

                                <div>
                                    <Label htmlFor="bio" className="text-neutral-text font-medium mb-2 block">Giới thiệu</Label>
                                    <Textarea
                                        id="bio"
                                        defaultValue="Bác sĩ Nha khoa với 10 năm kinh nghiệm trong điều trị và phục hồi răng miệng."
                                        className="min-h-[100px] rounded-xl border-neutral-border/30 focus:border-primary"
                                    />
                                </div>

                                <Button className="bg-primary hover:bg-primary-strong text-white rounded-lg shadow-sm hover:shadow transition-all">
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

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
                                    <Label htmlFor="current-password" className="text-neutral-text font-medium mb-2 block">Mật khẩu hiện tại</Label>
                                    <Input id="current-password" type="password" className="rounded-xl border-neutral-border/30 focus:border-primary" />
                                </div>

                                <div>
                                    <Label htmlFor="new-password" className="text-neutral-text font-medium mb-2 block">Mật khẩu mới</Label>
                                    <Input id="new-password" type="password" className="rounded-xl border-neutral-border/30 focus:border-primary" />
                                </div>

                                <div>
                                    <Label htmlFor="confirm-password" className="text-neutral-text font-medium mb-2 block">Xác nhận mật khẩu mới</Label>
                                    <Input id="confirm-password" type="password" className="rounded-xl border-neutral-border/30 focus:border-primary" />
                                </div>

                                <Button className="bg-primary hover:bg-primary-strong text-white rounded-lg shadow-sm hover:shadow transition-all">
                                    Đổi mật khẩu
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="signature">
                    <Card className="rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 typo-h4">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <FileSignature className="w-5 h-5 text-primary" />
                                </div>
                                Chữ ký số
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-5 max-w-2xl">
                                <div className="border-2 border-dashed border-neutral-border/50 rounded-xl p-12 text-center bg-neutral-muted/30 hover:border-primary/50 transition-colors">
                                    <div className="w-20 h-20 mx-auto rounded-full bg-neutral-muted flex items-center justify-center mb-4">
                                        <FileSignature className="w-10 h-10 text-neutral-text/40" />
                                    </div>
                                    <p className="text-neutral-text/60 mb-4 font-medium">Chưa có chữ ký số</p>
                                    <Button variant="outline" className="rounded-lg border-primary/50 text-primary hover:bg-primary hover:text-white transition-all">
                                        Upload chữ ký
                                    </Button>
                                </div>

                                <div className="bg-primary/5 border border-primary/20 p-5 rounded-xl">
                                    <p className="text-sm text-neutral-text leading-relaxed">
                                        <strong className="font-semibold">Lưu ý:</strong> Chữ ký số sẽ được sử dụng để ký các tài liệu y khoa,
                                        đơn thuốc và kế hoạch điều trị. Vui lòng đảm bảo chữ ký của bạn rõ ràng và chính xác.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card className="rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 typo-h4">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Bell className="w-5 h-5 text-primary" />
                                </div>
                                Cài đặt thông báo
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1 max-w-2xl">
                                <div className="flex items-center justify-between py-4 border-b border-neutral-border/30 hover:bg-neutral-muted/30 px-4 rounded-lg transition-colors">
                                    <div>
                                        <p className="font-semibold text-neutral-text">Lịch hẹn mới</p>
                                        <p className="text-sm text-neutral-text/60 mt-1">Nhận thông báo khi có lịch hẹn mới</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between py-4 border-b border-neutral-border/30 hover:bg-neutral-muted/30 px-4 rounded-lg transition-colors">
                                    <div>
                                        <p className="font-semibold text-neutral-text">Nhắc nhở lịch hẹn</p>
                                        <p className="text-sm text-neutral-text/60 mt-1">Nhận nhắc nhở trước 1 giờ khi có lịch hẹn</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between py-4 border-b border-neutral-border/30 hover:bg-neutral-muted/30 px-4 rounded-lg transition-colors">
                                    <div>
                                        <p className="font-semibold text-neutral-text">Kết quả xét nghiệm</p>
                                        <p className="text-sm text-neutral-text/60 mt-1">Thông báo khi kết quả xét nghiệm sẵn sàng</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between py-4 border-b border-neutral-border/30 hover:bg-neutral-muted/30 px-4 rounded-lg transition-colors">
                                    <div>
                                        <p className="font-semibold text-neutral-text">Bệnh nhân hủy lịch</p>
                                        <p className="text-sm text-neutral-text/60 mt-1">Thông báo khi bệnh nhân hủy lịch hẹn</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>

                                <div className="flex items-center justify-between py-4 hover:bg-neutral-muted/30 px-4 rounded-lg transition-colors">
                                    <div>
                                        <p className="font-semibold text-neutral-text">Email tổng hợp cuối ngày</p>
                                        <p className="text-sm text-neutral-text/60 mt-1">Nhận email tổng hợp công việc cuối ngày</p>
                                    </div>
                                    <Switch />
                                </div>

                                <div className="pt-4">
                                    <Button className="bg-primary hover:bg-primary-strong text-white rounded-lg shadow-sm hover:shadow transition-all">
                                        Lưu cài đặt
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
