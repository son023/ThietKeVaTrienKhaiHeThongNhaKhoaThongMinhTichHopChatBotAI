import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { Card } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import { labTestController } from '../../controllers/LabTestController';
import { LabTestDTO } from '../../models/LabTest';
import { authController } from '../../controllers/AuthController';
import { toast } from 'sonner';

export function LabReports() {
    const [allTests, setAllTests] = useState<LabTestDTO[]>([]);
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
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Không tải được dữ liệu');
                console.error('Failed to load lab tests:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const monthlyData = useMemo(() => {
        const now = new Date();
        const months: { [key: string]: { xray: number; ctScan: number; bloodTest: number; other: number } } = {};

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
            months[key] = { xray: 0, ctScan: 0, bloodTest: 0, other: 0 };
        }

        allTests.forEach(test => {
            if (!test.createdAt) return;
            const date = new Date(test.createdAt);
            const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
            
            if (months[key]) {
                const testTypeName = test.labTestType?.name?.toLowerCase() || '';
                if (testTypeName.includes('x-quang') || testTypeName.includes('xray') || testTypeName.includes('x ray')) {
                    months[key].xray++;
                } else if (testTypeName.includes('ct') || testTypeName.includes('scan')) {
                    months[key].ctScan++;
                } else if (testTypeName.includes('máu') || testTypeName.includes('blood')) {
                    months[key].bloodTest++;
                } else {
                    months[key].other++;
                }
            }
        });

        const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        return Object.entries(months)
            .sort(([keyA], [keyB]) => {
                const [monthA, yearA] = keyA.split('/').map(Number);
                const [monthB, yearB] = keyB.split('/').map(Number);
                if (yearA !== yearB) return yearA - yearB;
                return monthA - monthB;
            })
            .map(([key, data]) => {
                const [month] = key.split('/');
                return {
                    month: monthNames[parseInt(month) - 1],
                    ...data,
                };
            });
    }, [allTests]);

    const weeklyTrend = useMemo(() => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);

        const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const weekData: { [key: number]: number } = {};
        
        for (let i = 0; i < 7; i++) {
            weekData[i] = 0;
        }

        allTests.forEach(test => {
            if (!test.createdAt) return;
            const testDate = new Date(test.createdAt);
            if (testDate >= startOfWeek) {
                const dayIndex = (testDate.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
                weekData[dayIndex]++;
            }
        });

        return days.map((day, index) => ({
            day,
            tests: weekData[index] || 0,
        }));
    }, [allTests]);

    const testTypeStats = useMemo(() => {
        const typeCounts: { [key: string]: number } = {};
        
        allTests.forEach(test => {
            const testTypeName = test.labTestType?.name || 'Khác';
            typeCounts[testTypeName] = (typeCounts[testTypeName] || 0) + 1;
        });

        const total = allTests.length;
        const colors = ['#3fb5ff', '#ff9f43', '#2ecc71', '#9b59b6', '#e74c3c', '#3498db'];
        
        return Object.entries(typeCounts)
            .map(([type, count], index) => ({
                type,
                count,
                percentage: total > 0 ? Math.round((count / total) * 100) : 0,
                color: colors[index % colors.length],
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
    }, [allTests]);

    const summaryStats = useMemo(() => {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const lastSixMonths = allTests.filter(test => {
            if (!test.createdAt) return false;
            return new Date(test.createdAt) >= sixMonthsAgo;
        });

        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);
        
        const thisMonthTests = allTests.filter(test => {
            if (!test.createdAt) return false;
            return new Date(test.createdAt) >= thisMonth;
        });

        const lastMonth = new Date(thisMonth);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthEnd = new Date(thisMonth);
        lastMonthEnd.setMilliseconds(-1);
        
        const lastMonthTests = allTests.filter(test => {
            if (!test.createdAt) return false;
            const testDate = new Date(test.createdAt);
            return testDate >= lastMonth && testDate < thisMonth;
        });

        const growth = lastMonthTests.length > 0
            ? Math.round(((thisMonthTests.length - lastMonthTests.length) / lastMonthTests.length) * 100)
            : 0;

        return {
            totalSixMonths: lastSixMonths.length,
            averagePerMonth: Math.round(lastSixMonths.length / 6),
            thisMonth: thisMonthTests.length,
            growth,
        };
    }, [allTests]);

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="font-bold text-neutral-heading text-3xl mb-2">
                        Báo cáo thống kê
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
                    Báo cáo thống kê
                </h1>
                <p className="font-normal text-neutral-text/70 text-sm">
                    Phân tích hiệu suất và xu hướng xét nghiệm
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-5 border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                        {summaryStats.growth > 0 && (
                            <TrendingUp className="w-5 h-5 text-green-600 ml-auto" />
                        )}
                    </div>
                    <h3 className="font-bold text-neutral-heading text-2xl mb-1">
                        {summaryStats.totalSixMonths.toLocaleString('vi-VN')}
                    </h3>
                    <p className="font-normal text-neutral-text/70 text-sm">
                        Tổng xét nghiệm (6 tháng)
                    </p>
                </Card>

                <Card className="p-5 border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <h3 className="font-bold text-neutral-heading text-2xl mb-1">
                        {summaryStats.averagePerMonth.toLocaleString('vi-VN')}
                    </h3>
                    <p className="font-normal text-neutral-text/70 text-sm">
                        Trung bình/tháng
                    </p>
                </Card>

                <Card className="p-5 border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-accent-orange/10 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-accent-orange" />
                        </div>
                    </div>
                    <h3 className="font-bold text-neutral-heading text-2xl mb-1">
                        {summaryStats.thisMonth.toLocaleString('vi-VN')}
                    </h3>
                    <p className="font-normal text-neutral-text/70 text-sm">
                        Tháng này (đến nay)
                    </p>
                </Card>

                <Card className="p-5 border-neutral-border bg-neutral-surface hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className={`w-5 h-5 ${summaryStats.growth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                    </div>
                    <h3 className={`font-bold text-2xl mb-1 ${summaryStats.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {summaryStats.growth >= 0 ? '+' : ''}{summaryStats.growth}%
                    </h3>
                    <p className="font-normal text-neutral-text/70 text-sm">
                        So với tháng trước
                    </p>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Test Distribution */}
                <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
                    <h2 className="font-semibold text-neutral-heading text-lg mb-6">
                        Phân bố xét nghiệm theo tháng
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ebf6fc" />
                            <XAxis dataKey="month" stroke="#666666" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#666666" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #ebf6fc',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="xray" fill="#3fb5ff" name="X-quang" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="ctScan" fill="#ff9f43" name="CT Scan" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="bloodTest" fill="#2ecc71" name="XN máu" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="other" fill="#9b59b6" name="Khác" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Weekly Trend */}
                <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
                    <h2 className="font-semibold text-neutral-heading text-lg mb-6">
                        Xu hướng tuần này
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={weeklyTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ebf6fc" />
                            <XAxis dataKey="day" stroke="#666666" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#666666" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #ebf6fc',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="tests"
                                stroke="#3fb5ff"
                                strokeWidth={3}
                                dot={{ fill: '#3fb5ff', r: 5 }}
                                name="Số xét nghiệm"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Test Type Statistics */}
            <Card className="p-6 border-neutral-border bg-neutral-surface shadow-sm">
                <h2 className="font-semibold text-neutral-heading text-lg mb-6">
                    Thống kê theo loại xét nghiệm
                </h2>
                {testTypeStats.length === 0 ? (
                    <div className="text-center py-8">
                        <BarChart3 className="w-12 h-12 text-neutral-muted mx-auto mb-3" />
                        <p className="font-normal text-neutral-text/70 text-sm">
                            Chưa có dữ liệu thống kê
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {testTypeStats.map((stat, index) => (
                        <div key={index}>
                            <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-neutral-text/70 text-sm">
                  {stat.type}
                </span>
                                <div className="flex items-center gap-3">
                  <span className="font-semibold text-neutral-heading text-sm">
                    {stat.count}
                  </span>
                                    <span className="font-normal text-neutral-text/60 text-sm w-12 text-right">
                    {stat.percentage}%
                  </span>
                                </div>
                            </div>
                            <div className="h-3 bg-neutral-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full transition-all"
                                    style={{
                                        width: `${stat.percentage}%`,
                                        backgroundColor: stat.color,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
