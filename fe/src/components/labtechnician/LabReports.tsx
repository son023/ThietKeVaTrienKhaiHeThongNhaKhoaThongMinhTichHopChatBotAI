import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { Card } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export function LabReports() {
    const monthlyData = [
        { month: 'T6', xray: 245, ctScan: 87, bloodTest: 134, other: 56 },
        { month: 'T7', xray: 278, ctScan: 92, bloodTest: 145, other: 63 },
        { month: 'T8', xray: 312, ctScan: 108, bloodTest: 167, other: 71 },
        { month: 'T9', xray: 295, ctScan: 95, bloodTest: 152, other: 68 },
        { month: 'T10', xray: 334, ctScan: 112, bloodTest: 178, other: 79 },
        { month: 'T11', xray: 156, ctScan: 48, bloodTest: 89, other: 34 },
    ];

    const weeklyTrend = [
        { day: 'T2', tests: 42 },
        { day: 'T3', tests: 48 },
        { day: 'T4', tests: 56 },
        { day: 'T5', tests: 51 },
        { day: 'T6', tests: 63 },
        { day: 'T7', tests: 38 },
        { day: 'CN', tests: 28 },
    ];

    const testTypeStats = [
        { type: 'X-quang răng', count: 1340, percentage: 45, color: '#3fb5ff' },
        { type: 'CT Scan', count: 542, percentage: 18, color: '#ff9f43' },
        { type: 'Xét nghiệm máu', count: 865, percentage: 29, color: '#2ecc71' },
        { type: 'Khác', count: 371, percentage: 8, color: '#9b59b6' },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* DoctorHeader */}
            <div>
                <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[28px] mb-2">
                    Báo cáo thống kê
                </h1>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                    Phân tích hiệu suất và xu hướng xét nghiệm
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-5 border-[#ebf6fc]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#ebf6fc] rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-[#3fb5ff]" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-[#2ecc71] ml-auto" />
                    </div>
                    <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[24px] mb-1">
                        3,118
                    </h3>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                        Tổng xét nghiệm (6 tháng)
                    </p>
                </Card>

                <Card className="p-5 border-[#ebf6fc]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#e8f8f5] rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-[#2ecc71]" />
                        </div>
                    </div>
                    <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[24px] mb-1">
                        520
                    </h3>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                        Trung bình/tháng
                    </p>
                </Card>

                <Card className="p-5 border-[#ebf6fc]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#fff5e6] rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-[#ff9f43]" />
                        </div>
                    </div>
                    <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[24px] mb-1">
                        327
                    </h3>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                        Tháng này (đến nay)
                    </p>
                </Card>

                <Card className="p-5 border-[#ebf6fc]">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#f0e6ff] rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-[#9b59b6]" />
                        </div>
                    </div>
                    <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[24px] mb-1">
                        +12%
                    </h3>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                        So với tháng trước
                    </p>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Test Distribution */}
                <Card className="p-6 border-[#ebf6fc]">
                    <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px] mb-6">
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
                <Card className="p-6 border-[#ebf6fc]">
                    <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px] mb-6">
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
            <Card className="p-6 border-[#ebf6fc]">
                <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px] mb-6">
                    Thống kê theo loại xét nghiệm
                </h2>
                <div className="space-y-4">
                    {testTypeStats.map((stat, index) => (
                        <div key={index}>
                            <div className="flex items-center justify-between mb-2">
                <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px]">
                  {stat.type}
                </span>
                                <div className="flex items-center gap-3">
                  <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[14px]">
                    {stat.count}
                  </span>
                                    <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#999999] text-[13px] w-12 text-right">
                    {stat.percentage}%
                  </span>
                                </div>
                            </div>
                            <div className="h-3 bg-[#f0f0f0] rounded-full overflow-hidden">
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
            </Card>
        </div>
    );
}
