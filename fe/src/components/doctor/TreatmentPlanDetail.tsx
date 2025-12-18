import { useState } from 'react';
import { ArrowLeft, Plus, Save, Printer, X, CheckCircle, Calendar, Edit, Trash2, GripVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';

interface TreatmentPlanDetailProps {
  planId: string | null;
  onBack: () => void;
}

export function TreatmentPlanDetail({ planId, onBack }: TreatmentPlanDetailProps) {
  const [editMode, setEditMode] = useState(false);
  const [generalNotes, setGeneralNotes] = useState('Bệnh nhân cần niềng răng để điều chỉnh khớp cắn và thẩm mỹ. Kế hoạch dự kiến 18-24 tháng.');

  // Mock data
  const plan = {
    id: 'tp1',
    name: 'Kế hoạch Niềng răng',
    patientName: 'Nguyễn Văn An',
    patientId: 'BN001',
    patientAge: 35,
    status: 'in-progress',
    progress: 40,
    startDate: '01/09/2025',
  };

  const [steps, setSteps] = useState([
    {
      id: 's1',
      name: 'Bước 1: Khám tổng quát & Chụp CT Cone Beam',
      status: 'completed',
      date: '01/09/2025',
      notes: 'Đã hoàn thành khám và chụp CT. Kết quả tốt.',
    },
    {
      id: 's2',
      name: 'Bước 2: Lấy dấu răng',
      status: 'completed',
      date: '08/09/2025',
      notes: 'Đã lấy dấu thành công.',
    },
    {
      id: 's3',
      name: 'Bước 3: Gắn mắc cài',
      status: 'completed',
      date: '20/09/2025',
      notes: 'Đã gắn mắc cài hàm trên và hàm dưới.',
    },
    {
      id: 's4',
      name: 'Bước 4: Tái khám siết răng lần 1',
      status: 'upcoming',
      date: '30/10/2025',
      notes: '',
    },
    {
      id: 's5',
      name: 'Bước 5: Tái khám siết răng lần 2',
      status: 'scheduled',
      date: '30/11/2025',
      notes: '',
    },
    {
      id: 's6',
      name: 'Bước 6: Tái khám siết răng lần 3',
      status: 'scheduled',
      date: '30/12/2025',
      notes: '',
    },
    {
      id: 's7',
      name: 'Bước 7: Đánh giá tiến độ',
      status: 'scheduled',
      date: '15/01/2026',
      notes: '',
    },
    {
      id: 's8',
      name: 'Bước 8: Tháo mắc cài & Gắn hàm duy trì',
      status: 'scheduled',
      date: '01/03/2026',
      notes: '',
    },
  ]);

  const documents = [
    { id: '1', name: 'X-quang ban đầu', date: '01/09/2025', type: 'X-ray' },
    { id: '2', name: 'CT Cone Beam', date: '01/09/2025', type: 'CT' },
    { id: '3', name: 'Ảnh răng trước điều trị', date: '01/09/2025', type: 'Photo' },
  ];

  const auditLog = [
    { id: '1', action: 'Đánh dấu hoàn thành "Gắn mắc cài"', user: 'BS. Nguyễn Văn Hùng', time: '20/09/2025 14:00' },
    { id: '2', action: 'Thêm bước "Tái khám siết răng lần 3"', user: 'BS. Nguyễn Văn Hùng', time: '08/09/2025 10:30' },
    { id: '3', action: 'Tạo kế hoạch điều trị', user: 'BS. Nguyễn Văn Hùng', time: '01/09/2025 09:00' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'upcoming':
        return <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center"><div className="w-2 h-2 bg-primary rounded-full" /></div>;
      case 'scheduled':
        return <div className="w-5 h-5 rounded-full border-2 border-neutral-border" />;
      case 'overdue':
        return <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center"><div className="w-2 h-2 bg-red-500 rounded-full" /></div>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Đã hoàn thành</Badge>;
      case 'upcoming':
        return <Badge className="bg-primary hover:bg-primary-strong text-white">Sắp tới</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="border-neutral-border/50">Đã lên lịch</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">Đã trễ hẹn</Badge>;
      default:
        return null;
    }
  };

  const markStepComplete = (stepId: string) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, status: 'completed' } : step
    ));
  };

  const deleteStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const totalSteps = steps.length;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="h-full flex flex-col bg-neutral-background">
      {/* Header */}
      <div className="bg-neutral-surface border-b border-neutral-border/30 p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-5">
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-lg border-neutral-border/50 hover:bg-neutral-muted transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="typo-h3">{plan.name}</h1>
              <Badge className={plan.status === 'completed' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-primary hover:bg-primary-strong text-white'}>
                {plan.status === 'completed' ? 'Hoàn tất ✅' : `Đang thực hiện (${completedSteps}/${totalSteps} bước đã hoàn thành)`}
              </Badge>
            </div>
            <p className="text-neutral-text/60">
              {plan.patientName} • {plan.patientAge} tuổi • Mã BN: <span className="font-mono">{plan.patientId}</span>
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm text-neutral-text/60 mb-2">
            <span className="font-medium">Tiến độ tổng thể</span>
            <span className="font-bold text-neutral-text">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="stages" className="h-full flex flex-col">
          <div className="border-b border-neutral-border/30 bg-neutral-surface px-6">
            <TabsList className="bg-transparent">
              <TabsTrigger value="stages" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">Giai đoạn điều trị</TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">Tài liệu & Hình ảnh</TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">Ghi chú & Lịch sử</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="stages" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <Button
                    variant={editMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                    className={editMode ? 'bg-primary hover:bg-primary-strong text-white rounded-lg' : 'rounded-lg border-neutral-border/50 hover:bg-neutral-muted'}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {editMode ? 'Đang chỉnh sửa' : 'Chế độ chỉnh sửa'}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg border-primary/50 text-primary hover:bg-primary hover:text-white transition-all">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm giai đoạn mới
                  </Button>
                </div>

                <div className="space-y-4 relative">
                  {/* Timeline line */}
                  <div className="absolute left-[20px] top-8 bottom-8 w-0.5 bg-neutral-border/30" />

                  {steps.map((step, index) => (
                    <Card key={step.id} className={`rounded-xl border bg-neutral-surface shadow-sm transition-all ${step.status === 'upcoming' ? 'border-primary shadow-md' : 'border-neutral-border/30 hover:border-primary/50 hover:shadow-md'}`}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          {editMode && step.status !== 'completed' && (
                            <button className="text-neutral-text/40 hover:text-neutral-text cursor-move mt-1 transition-colors">
                              <GripVertical className="w-5 h-5" />
                            </button>
                          )}

                          <div className="mt-1 relative z-10 bg-neutral-surface">
                            {getStatusIcon(step.status)}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                {editMode && step.status !== 'completed' ? (
                                  <Input
                                    defaultValue={step.name}
                                    className="mb-2 rounded-lg border-neutral-border/30 focus:border-primary"
                                  />
                                ) : (
                                  <h3 className="font-semibold text-neutral-text">{step.name}</h3>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                  <div className="flex items-center gap-2 text-sm text-neutral-text/60">
                                    <Calendar className="w-4 h-4" />
                                    {step.status === 'completed' ? 'Hoàn thành: ' : 'Dự kiến: '}
                                    {step.date}
                                  </div>
                                  {getStatusBadge(step.status)}
                                </div>
                              </div>
                            </div>

                            {step.notes && (
                              <div className="bg-neutral-muted p-3 rounded-lg text-sm text-neutral-text mb-3">
                                {step.notes}
                              </div>
                            )}

                            <div className="flex gap-2 flex-wrap">
                              {step.status !== 'completed' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 border-green-300 hover:bg-green-50 rounded-lg transition-all"
                                    onClick={() => markStepComplete(step.id)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Đánh dấu Hoàn thành
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-primary border-primary/30 hover:bg-primary hover:text-white rounded-lg transition-all"
                                  >
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Đặt lịch
                                  </Button>
                                </>
                              )}
                              {editMode && step.status !== 'completed' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="rounded-lg border-neutral-border/50 hover:bg-neutral-muted transition-all"
                                  >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Chỉnh sửa
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-500 border-red-300 hover:bg-red-50 rounded-lg transition-all"
                                    onClick={() => deleteStep(step.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Xóa
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="documents" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="p-6">
                <div className="mb-6">
                  <Button className="bg-primary hover:bg-primary-strong text-white rounded-lg shadow-sm hover:shadow transition-all">
                    <Plus className="w-4 h-4 mr-2" />
                    Upload tài liệu
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="cursor-pointer border border-neutral-border/30 bg-neutral-surface hover:border-primary hover:shadow-md transition-all rounded-xl">
                      <div className="aspect-video bg-neutral-muted flex items-center justify-center">
                        <div className="text-center text-neutral-text/40">
                          <div className="text-4xl mb-2">📄</div>
                          <p className="text-sm font-medium">{doc.type}</p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm font-semibold text-neutral-text">{doc.name}</p>
                        <p className="text-xs text-neutral-text/60 mt-1">{doc.date}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="notes" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                <Card className="rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="typo-h4">Ghi chú chung</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={generalNotes}
                      onChange={(e) => setGeneralNotes(e.target.value)}
                      className="min-h-[150px] rounded-lg border-neutral-border/30 focus:border-primary"
                      placeholder="Nhập ghi chú tổng quan về kế hoạch điều trị..."
                    />
                    <Button className="mt-4 bg-primary hover:bg-primary-strong text-white rounded-lg shadow-sm hover:shadow transition-all">
                      <Save className="w-4 h-4 mr-2" />
                      Lưu ghi chú
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="typo-h4">Lịch sử chỉnh sửa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {auditLog.map((log) => (
                        <div key={log.id} className="flex gap-3 p-4 bg-neutral-muted rounded-lg">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-neutral-text">{log.action}</p>
                            <p className="text-xs text-neutral-text/60 mt-1">
                              {log.user} • {log.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Toolbar */}
      <div className="bg-neutral-surface border-t border-neutral-border/30 p-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            <Button className="bg-primary hover:bg-primary-strong text-white rounded-lg shadow-sm hover:shadow transition-all">
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </Button>
            <Button variant="outline" className="rounded-lg border-neutral-border/50 hover:bg-neutral-muted transition-all">
              <Printer className="w-4 h-4 mr-2" />
              In kế hoạch
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {plan.status !== 'completed' && (
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm hover:shadow transition-all">
                <CheckCircle className="w-4 h-4 mr-2" />
                Hoàn tất Kế hoạch
              </Button>
            )}
            <Button variant="outline" className="text-red-500 border-red-300 hover:bg-red-50 rounded-lg transition-all">
              <X className="w-4 h-4 mr-2" />
              Hủy Kế hoạch
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
