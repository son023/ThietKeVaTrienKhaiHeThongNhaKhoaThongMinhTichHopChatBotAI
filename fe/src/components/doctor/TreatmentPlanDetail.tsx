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
        return <div className="w-5 h-5 rounded-full border-2 border-[#3FB5FF] flex items-center justify-center"><div className="w-2 h-2 bg-[#3FB5FF] rounded-full" /></div>;
      case 'scheduled':
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
      case 'overdue':
        return <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center"><div className="w-2 h-2 bg-red-500 rounded-full" /></div>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Đã hoàn thành</Badge>;
      case 'upcoming':
        return <Badge className="bg-[#3FB5FF]">Sắp tới</Badge>;
      case 'scheduled':
        return <Badge variant="outline">Đã lên lịch</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500">Đã trễ hẹn</Badge>;
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
    <div className="h-full flex flex-col">
      {/* DoctorHeader */}
      <div className="bg-white border-b border-[#e8e8e8] p-6 shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-[10px] border-[#e8e8e8]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[#01304e]">{plan.name}</h1>
              <Badge className={plan.status === 'completed' ? 'bg-green-500' : 'bg-[#3FB5FF]'}>
                {plan.status === 'completed' ? 'Hoàn tất ✅' : `Đang thực hiện (${completedSteps}/${totalSteps} bước đã hoàn thành)`}
              </Badge>
            </div>
            <p className="text-[#333333]/60">
              {plan.patientName} • {plan.patientAge} tuổi • Mã BN: {plan.patientId}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm text-[#333333]/60 mb-2">
            <span>Tiến độ tổng thể</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="stages" className="h-full flex flex-col">
          <div className="border-b bg-white px-6">
            <TabsList>
              <TabsTrigger value="stages">Giai đoạn điều trị</TabsTrigger>
              <TabsTrigger value="documents">Tài liệu & Hình ảnh</TabsTrigger>
              <TabsTrigger value="notes">Ghi chú & Lịch sử</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="stages" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <Button
                    variant={editMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                    className={editMode ? 'bg-[#3FB5FF] hover:bg-[#3FB5FF]/90' : ''}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {editMode ? 'Đang chỉnh sửa' : 'Chế độ chỉnh sửa'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm giai đoạn mới
                  </Button>
                </div>

                <div className="space-y-4 relative">
                  {/* Timeline line */}
                  <div className="absolute left-[20px] top-8 bottom-8 w-0.5 bg-gray-200" />

                  {steps.map((step, index) => (
                    <Card key={step.id} className={`rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)] ${step.status === 'upcoming' ? 'border-[#3FB5FF] shadow-[0px_4px_12px_0px_rgba(63,181,255,0.2)]' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {editMode && step.status !== 'completed' && (
                            <button className="text-gray-400 hover:text-gray-600 cursor-move mt-1">
                              <GripVertical className="w-5 h-5" />
                            </button>
                          )}
                          
                          <div className="mt-1 relative z-10 bg-white">
                            {getStatusIcon(step.status)}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                {editMode && step.status !== 'completed' ? (
                                  <Input
                                    defaultValue={step.name}
                                    className="mb-2"
                                  />
                                ) : (
                                  <h3 className="text-[#333333]">{step.name}</h3>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                  <div className="flex items-center gap-2 text-sm text-[#333333]/60">
                                    <Calendar className="w-4 h-4" />
                                    {step.status === 'completed' ? 'Hoàn thành: ' : 'Dự kiến: '}
                                    {step.date}
                                  </div>
                                  {getStatusBadge(step.status)}
                                </div>
                              </div>
                            </div>

                            {step.notes && (
                              <div className="bg-gray-50 p-3 rounded text-sm text-[#333333]/80 mb-3">
                                {step.notes}
                              </div>
                            )}

                            <div className="flex gap-2">
                              {step.status !== 'completed' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 border-green-300 hover:bg-green-50"
                                    onClick={() => markStepComplete(step.id)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Đánh dấu Hoàn thành
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-[#3FB5FF] border-[#3FB5FF]/30"
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
                                  >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Chỉnh sửa
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-500 border-red-300"
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
                <div className="mb-4">
                  <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Upload tài liệu
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="cursor-pointer hover:border-[#3FB5FF] transition-colors">
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <div className="text-center text-[#333333]/40">
                          <div className="text-4xl mb-2">📄</div>
                          <p className="text-sm">{doc.type}</p>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm text-[#333333]">{doc.name}</p>
                        <p className="text-xs text-[#333333]/60 mt-1">{doc.date}</p>
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
                <Card>
                  <CardHeader>
                    <CardTitle>Ghi chú chung</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={generalNotes}
                      onChange={(e) => setGeneralNotes(e.target.value)}
                      className="min-h-[150px]"
                      placeholder="Nhập ghi chú tổng quan về kế hoạch điều trị..."
                    />
                    <Button className="mt-3 bg-[#05619A] hover:bg-[#05619A]/90">
                      <Save className="w-4 h-4 mr-2" />
                      Lưu ghi chú
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Lịch sử chỉnh sửa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {auditLog.map((log) => (
                        <div key={log.id} className="flex gap-3 p-3 bg-gray-50 rounded">
                          <div className="w-2 h-2 bg-[#3FB5FF] rounded-full mt-2 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-[#333333]">{log.action}</p>
                            <p className="text-xs text-[#333333]/60 mt-1">
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
      <div className="bg-white border-t border-[#e8e8e8] p-4 shadow-[0px_-4px_12px_0px_rgba(159,166,175,0.08)]">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </Button>
            <Button variant="outline" className="rounded-[10px] border-[#e8e8e8]">
              <Printer className="w-4 h-4 mr-2" />
              In kế hoạch
            </Button>
          </div>
          <div className="flex gap-2">
            {plan.status !== 'completed' && (
              <Button className="bg-green-600 hover:bg-green-700 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                <CheckCircle className="w-4 h-4 mr-2" />
                Hoàn tất Kế hoạch
              </Button>
            )}
            <Button variant="outline" className="text-red-500 border-red-300 rounded-[10px]">
              <X className="w-4 h-4 mr-2" />
              Hủy Kế hoạch
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
