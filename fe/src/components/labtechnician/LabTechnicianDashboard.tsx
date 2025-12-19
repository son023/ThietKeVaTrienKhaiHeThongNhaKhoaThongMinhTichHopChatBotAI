import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Microscope,
  Activity,
} from "lucide-react";
import { Card } from "../ui/card";

interface LabTechnicianDashboardProps {
  onNavigateToTest: (id: string) => void;
}

export function LabTechnicianDashboard({
  onNavigateToTest,
}: LabTechnicianDashboardProps) {
  const stats = [
    {
      title: "Xét nghiệm chờ xử lý",
      value: "12",
      icon: Clock,
      color: "text-accent-orange",
      bgColor: "bg-accent-orange/10",
    },
    {
      title: "Đang thực hiện",
      value: "5",
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Hoàn thành hôm nay",
      value: "28",
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Cần xử lý khẩn",
      value: "3",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const pendingTests = [
    {
      id: "1",
      patientName: "Nguyễn Văn An",
      testType: "X-quang răng",
      requestedBy: "BS. Trần Minh",
      requestedAt: "08:30",
      priority: "normal",
      status: "pending",
    },
    {
      id: "2",
      patientName: "Lê Thị Bình",
      testType: "CT Scan hàm mặt",
      requestedBy: "BS. Nguyễn Hà",
      requestedAt: "09:15",
      priority: "urgent",
      status: "pending",
    },
    {
      id: "3",
      patientName: "Phạm Minh Châu",
      testType: "Xét nghiệm máu",
      requestedBy: "BS. Trần Minh",
      requestedAt: "10:00",
      priority: "normal",
      status: "in-progress",
    },
    {
      id: "4",
      patientName: "Hoàng Thị Dung",
      testType: "Panoramic X-ray",
      requestedBy: "BS. Lê Thu",
      requestedAt: "10:30",
      priority: "normal",
      status: "pending",
    },
  ];

  const recentResults = [
    {
      id: "1",
      patientName: "Trần Văn Em",
      testType: "X-quang răng số 6",
      completedAt: "14:20",
      result: "Có dấu hiệu sâu răng",
    },
    {
      id: "2",
      patientName: "Nguyễn Thị Phương",
      testType: "CT Scan răng khôn",
      completedAt: "13:45",
      result: "Răng khôn mọc lệch 45°",
    },
    {
      id: "3",
      patientName: "Lê Minh Giang",
      testType: "Xét nghiệm nước bọt",
      completedAt: "12:30",
      result: "Bình thường",
    },
  ];

  const getPriorityBadge = (priority: string) => {
    if (priority === "urgent") {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-600 rounded-md font-medium text-xs">
          Khẩn cấp
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-primary/10 text-primary rounded-md font-medium text-xs">
        Bình thường
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === "in-progress") {
      return (
        <span className="px-2 py-1 bg-primary/10 text-primary rounded-md font-medium text-xs">
          Đang thực hiện
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-accent-orange/10 text-accent-orange rounded-md font-medium text-xs">
        Chờ xử lý
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-neutral-heading text-3xl mb-2">
          Bảng điều khiển
        </h1>
        <p className="font-normal text-neutral-text/70 text-sm">
          Tổng quan công việc hôm nay
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="p-5 border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <h3 className="font-bold text-neutral-heading text-3xl mb-1">
                {stat.value}
              </h3>
              <p className="font-normal text-neutral-text/70 text-sm">
                {stat.title}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Tests */}
        <Card className="lg:col-span-2 border-neutral-border bg-neutral-surface shadow-sm">
          <div className="p-6 border-b border-neutral-border">
            <h2 className="font-semibold text-neutral-heading text-lg">
              Xét nghiệm cần xử lý
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pendingTests.map((test) => (
                <div
                  key={test.id}
                  onClick={() => onNavigateToTest(test.id)}
                  className="p-4 bg-primary/5 rounded-xl hover:bg-primary/10 transition-all duration-200 cursor-pointer border border-primary/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <Microscope className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-heading text-sm">
                          {test.patientName}
                        </h3>
                        <p className="font-normal text-neutral-text/70 text-sm">
                          {test.testType}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getPriorityBadge(test.priority)}
                      {getStatusBadge(test.status)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-neutral-text/70 text-xs">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Yêu cầu bởi: {test.requestedBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {test.requestedAt}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Results */}
        <Card className="border-neutral-border bg-neutral-surface shadow-sm">
          <div className="p-6 border-b border-neutral-border">
            <h2 className="font-semibold text-neutral-heading text-lg">
              Kết quả gần đây
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentResults.map((result) => (
                <div
                  key={result.id}
                  className="pb-4 border-b border-neutral-border last:border-0"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <h3 className="font-semibold text-neutral-heading text-sm">
                      {result.patientName}
                    </h3>
                  </div>
                  <p className="font-normal text-neutral-text/70 text-sm mb-1">
                    {result.testType}
                  </p>
                  <p className="font-medium text-primary text-xs mb-1">
                    {result.result}
                  </p>
                  <p className="font-normal text-neutral-text/60 text-xs">
                    Hoàn thành lúc {result.completedAt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
