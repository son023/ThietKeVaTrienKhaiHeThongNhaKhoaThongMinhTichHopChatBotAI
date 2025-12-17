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
      className="group cursor-pointer hover:border-primary transition-all duration-200 rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm hover:shadow-md"
      onClick={() => onNavigateToPlan(plan.id)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-text mb-2 group-hover:text-primary transition-colors">{plan.planName}</h3>
            <p className="text-sm text-neutral-text/60">
              {plan.patientName} • <span className="font-mono">{plan.patientId}</span>
            </p>
          </div>
          <Badge className={`${plan.status === 'completed' ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary-strong'} text-white`}>
            {plan.completedSteps}/{plan.totalSteps} bước
          </Badge>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-neutral-text/60 mb-2">
            <span className="font-medium">Tiến độ</span>
            <span className="font-bold text-neutral-text">{plan.progress}%</span>
          </div>
          <Progress value={plan.progress} className="h-2.5" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-neutral-text/60">
            <Calendar className="w-4 h-4" />
            <span>Bắt đầu: {plan.startDate}</span>
          </div>
          {plan.nextAppointment && (
            <div className="flex items-center gap-2 text-primary font-medium">
              <Clock className="w-4 h-4" />
              <span>{plan.nextAppointment}</span>
            </div>
          )}
          {!plan.nextAppointment && (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Hoàn tất</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 bg-neutral-background min-h-screen">
      <div className="mb-8">
        <h1 className="typo-h2 mb-2">Kế hoạch điều trị</h1>
        <p className="text-neutral-text/60 mb-6">Quản lý và theo dõi các kế hoạch điều trị</p>

        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-text/40" />
          <Input
            type="text"
            placeholder="Tìm kiếm kế hoạch điều trị..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 rounded-xl border-neutral-border/30 bg-neutral-surface focus:border-primary transition-colors h-11 shadow-sm"
          />
        </div>
      </div>

      <Tabs defaultValue="in-progress" className="space-y-6">
        <TabsList className="bg-neutral-muted border border-neutral-border/30 p-1 rounded-xl">
          <TabsTrigger value="in-progress" className="rounded-lg data-[state=active]:bg-neutral-surface data-[state=active]:shadow-sm">
            Đang thực hiện ({inProgressPlans.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-neutral-surface data-[state=active]:shadow-sm">
            Đã hoàn thành ({completedPlans.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {inProgressPlans.map(renderPlanCard)}
          </div>
          {inProgressPlans.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-muted flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-neutral-text/40" />
              </div>
              <p className="text-neutral-text/60">Không có kế hoạch điều trị đang thực hiện</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {completedPlans.map(renderPlanCard)}
          </div>
          {completedPlans.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-muted flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-neutral-text/40" />
              </div>
              <p className="text-neutral-text/60">Không có kế hoạch điều trị đã hoàn thành</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
