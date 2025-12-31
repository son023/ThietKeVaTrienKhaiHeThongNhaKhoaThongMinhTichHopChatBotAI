import {
  Calendar,
  Clock,
  CheckCircle2,
  PlusCircle ,
  Microscope,
  Activity,
} from "lucide-react";
import { Card } from "../ui/card";
import { useEffect, useState, useMemo } from "react";
import { labTestController } from "../../controllers/LabTestController";
import { LabTestDTO } from "../../models/LabTest";
import { authController } from "../../controllers/AuthController";
import { toast } from "sonner";

interface LabTechnicianDashboardProps {
  onNavigateToTest: (id: string) => void;
}

export function LabTechnicianDashboard({
  onNavigateToTest,
}: LabTechnicianDashboardProps) {
  const [allTests, setAllTests] = useState<LabTestDTO[]>([]);
  const [newTests, setNewTests] = useState<LabTestDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const currentUser = authController.getCurrentUser();
        let tests: LabTestDTO[] = [];

        if (currentUser?.id) {
          try {
            tests = await labTestController.getByTechnicianId(currentUser.id);
          } catch {
            tests = await labTestController.getAll();
          }
        } else {
          tests = await labTestController.getAll();
        }

        setAllTests(tests);

        try {
          const requests = await labTestController.getByStatus("REQUEST");
          setNewTests(requests);
        } catch (err) {
          console.error("Failed to load new test requests:", err);
          setNewTests([]);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Không tải được dữ liệu");
        console.error("Failed to load lab tests:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = (dateStr: string | undefined): boolean => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      return dateOnly.getTime() === todayOnly.getTime();
    };

    const pending = allTests.filter((t) => t.status === "ACCEPTED").length;
    const inProgress = allTests.filter((t) => t.status === "IN_PROGRESS").length;
    const completedToday = allTests.filter((t) => {
      if (t.status !== "COMPLETE") return false;
      return isToday(t.resultDate) || (!t.resultDate && isToday(t.updatedAt));
    }).length;
    const newTestsCount = newTests.length;

    return [
      {
        title: "Xét nghiệm mới",
        value: newTestsCount.toString(),
        icon: PlusCircle,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      {
        title: "Xét nghiệm chờ xử lý",
        value: pending.toString(),
        icon: Clock,
        color: "text-accent-orange",
        bgColor: "bg-accent-orange/10",
      },
      {
        title: "Đang thực hiện",
        value: inProgress.toString(),
        icon: Activity,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        title: "Hoàn thành hôm nay",
        value: completedToday.toString(),
        icon: CheckCircle2,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
    ];
  }, [allTests, newTests]);

  const pendingTests = useMemo(() => {
    return allTests
      .filter((t) => t.status === "REQUEST"|| t.status === "ACCEPTED" || t.status === "IN_PROGRESS")
      .sort((a, b) => {
        const aUrgent = a.abnormalFlag === "HIGH" ? 1 : 0;
        const bUrgent = b.abnormalFlag === "HIGH" ? 1 : 0;
        if (aUrgent !== bUrgent) return bUrgent - aUrgent;
        
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, 10)
      .map((test) => ({
        id: test.id,
        patientName: test.patientName || "Chưa có thông tin",
        testType: test.labTestType?.name || "Xét nghiệm",
        requestedBy: test.doctorName || test.doctorId || "N/A",
        requestedAt: test.createdAt
          ? new Date(test.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
        priority: test.abnormalFlag === "HIGH" ? "urgent" : "normal",
        status: test.status === "IN_PROGRESS" ? "in-progress" : "pending",
      }));
  }, [allTests]);

  const recentResults = useMemo(() => {
    return allTests
      .filter((t) => {
        return t.status === "COMPLETE" && (t.resultDate || t.updatedAt);
      })
      .sort((a, b) => {
        // Use resultDate first, fallback to updatedAt
        const aDate = a.resultDate 
          ? new Date(a.resultDate).getTime() 
          : (a.updatedAt ? new Date(a.updatedAt).getTime() : 0);
        const bDate = b.resultDate 
          ? new Date(b.resultDate).getTime() 
          : (b.updatedAt ? new Date(b.updatedAt).getTime() : 0);
        return bDate - aDate;
      })
      .slice(0, 5)
      .map((test) => {
        // Use resultDate first, fallback to updatedAt
        const completionDate = test.resultDate || test.updatedAt;
        return {
          id: test.id,
          patientName: test.patientName || "Chưa có thông tin",
          testType: test.labTestType?.name || "Xét nghiệm",
          completedAt: completionDate
            ? new Date(completionDate).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A",
          result: (() => {
            if (test.structureJson) {
              try {
                const parsed = JSON.parse(test.structureJson);
                return parsed.result || test.abnormalFlag || "Đã hoàn thành";
              } catch {
                return test.abnormalFlag || test.instructions || "Đã hoàn thành";
              }
            }
            return test.abnormalFlag || test.instructions || "Đã hoàn thành";
          })(),
        };
      });
  }, [allTests]);

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

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="font-bold text-neutral-heading text-3xl mb-2">
            Bảng điều khiển
          </h1>
          <p className="font-normal text-neutral-text/70 text-sm">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

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
            {pendingTests.length === 0 ? (
              <div className="text-center py-8">
                <Microscope className="w-12 h-12 text-neutral-muted mx-auto mb-3" />
                <p className="font-normal text-neutral-text/70 text-sm">
                  Không có xét nghiệm cần xử lý
                </p>
              </div>
            ) : (
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
            )}
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
            {recentResults.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-neutral-muted mx-auto mb-3" />
                <p className="font-normal text-neutral-text/70 text-sm">
                  Chưa có kết quả gần đây
                </p>
              </div>
            ) : (
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
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
