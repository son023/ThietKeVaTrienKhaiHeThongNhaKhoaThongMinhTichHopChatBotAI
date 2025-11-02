import { Search, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface TreatmentPlansProps {
  onNavigateToPlan: (id: string) => void;
}

export function TreatmentPlans({ onNavigateToPlan }: TreatmentPlansProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const treatmentPlans = [
    {
      id: 'tp1',
      patientName: 'Nguyễn Văn An',
      patientId: 'BN001',
      planName: 'Kế hoạch Niềng răng',
      status: 'in-progress',
      progress: 40,
      totalSteps: 8,
      completedSteps: 3,
      startDate: '01/09/2025',
      nextAppointment: '30/10/2025',
    },
    {
      id: 'tp2',
      patientName: 'Lê Văn Cường',
      patientId: 'BN003',
      planName: 'Cấy ghép Implant Răng 46',
      status: 'in-progress',
      progress: 60,
      totalSteps: 5,
      completedSteps: 3,
      startDate: '15/09/2025',
      nextAppointment: '27/10/2025',
    },
    {
      id: 'tp3',
      patientName: 'Phạm Thị Dung',
      patientId: 'BN004',
      planName: 'Điều trị tủy răng 26',
      status: 'in-progress',
      progress: 75,
      totalSteps: 4,
      completedSteps: 3,
      startDate: '10/10/2025',
      nextAppointment: '28/10/2025',
    },
    {
      id: 'tp4',
      patientName: 'Trần Thị Bình',
      patientId: 'BN002',
      planName: 'Phục hình răng sứ',
      status: 'completed',
      progress: 100,
      totalSteps: 6,
      completedSteps: 6,
      startDate: '01/08/2025',
      nextAppointment: null,
    },
    {
      id: 'tp5',
      patientName: 'Đỗ Thị Phương',
      patientId: 'BN006',
      planName: 'Điều trị nha chu',
      status: 'in-progress',
      progress: 33,
      totalSteps: 6,
      completedSteps: 2,
      startDate: '20/10/2025',
      nextAppointment: '02/11/2025',
    },
  ];

  const filteredPlans = treatmentPlans.filter((plan) =>
    plan.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inProgressPlans = filteredPlans.filter(p => p.status === 'in-progress');
  const completedPlans = filteredPlans.filter(p => p.status === 'completed');

  const renderPlanCard = (plan: typeof treatmentPlans[0]) => (
    <Card
      key={plan.id}
      className="cursor-pointer hover:border-[#3FB5FF] transition-all rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)] hover:shadow-[0px_4px_12px_0px_rgba(63,181,255,0.3)]"
      onClick={() => onNavigateToPlan(plan.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-[#333333] mb-1">{plan.planName}</h3>
            <p className="text-sm text-[#333333]/60">
              {plan.patientName} • {plan.patientId}
            </p>
          </div>
          <Badge className={plan.status === 'completed' ? 'bg-green-500' : 'bg-[#3FB5FF]'}>
            {plan.completedSteps}/{plan.totalSteps} bước
          </Badge>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-sm text-[#333333]/60 mb-1">
            <span>Tiến độ</span>
            <span>{plan.progress}%</span>
          </div>
          <Progress value={plan.progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-[#333333]/60">
            <Calendar className="w-4 h-4" />
            <span>Bắt đầu: {plan.startDate}</span>
          </div>
          {plan.nextAppointment && (
            <div className="flex items-center gap-2 text-[#3FB5FF]">
              <Clock className="w-4 h-4" />
              <span>{plan.nextAppointment}</span>
            </div>
          )}
          {!plan.nextAppointment && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Hoàn tất</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <h1 className="text-[#01304e] mb-4">Kế hoạch điều trị</h1>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#333333]/40" />
          <Input
            type="text"
            placeholder="Tìm kiếm kế hoạch điều trị..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-[10px] border-[#e8e8e8]"
          />
        </div>
      </div>

      <Tabs defaultValue="in-progress">
        <TabsList>
          <TabsTrigger value="in-progress">
            Đang thực hiện ({inProgressPlans.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Đã hoàn thành ({completedPlans.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressPlans.map(renderPlanCard)}
          </div>
          {inProgressPlans.length === 0 && (
            <div className="text-center py-12 text-[#333333]/60">
              Không có kế hoạch điều trị đang thực hiện
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedPlans.map(renderPlanCard)}
          </div>
          {completedPlans.length === 0 && (
            <div className="text-center py-12 text-[#333333]/60">
              Không có kế hoạch điều trị đã hoàn thành
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
