import { useEffect, useState } from 'react';

interface DentalChartProps {
  value?: Record<string, string[]>;
  onChange?: (value: Record<string, string[]>) => void;
}

export function DentalChart({ value, onChange }: DentalChartProps) {
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [toothConditions, setToothConditions] = useState<Record<string, string[]>>(value || {});

  useEffect(() => {
    if (value) {
      setToothConditions(value);
    }
  }, [value]);

  const tools = [
    { id: 'cavity', name: 'Sâu răng', color: '#fb2c36' },
    { id: 'filling', name: 'Trám', color: '#2b7fff' },
    { id: 'root-canal', name: 'Lấy tủy', color: '#ad46ff' },
    { id: 'extraction', name: 'Nhổ', color: '#6a7282' },
    { id: 'implant', name: 'Implant', color: '#00c950' },
    { id: 'crown', name: 'Răng sứ', color: '#f0b100' },
    { id: 'issue', name: 'Vấn đề khác', color: '#94a3b8' },
  ];

  const upperTeeth = [
    [18, 17, 16, 15, 14, 13, 12, 11],
    [21, 22, 23, 24, 25, 26, 27, 28],
  ];

  const lowerTeeth = [
    [48, 47, 46, 45, 44, 43, 42, 41],
    [31, 32, 33, 34, 35, 36, 37, 38],
  ];

  const handleToothClick = (toothNum: number) => {
    if (!selectedTool) return;

    const toothKey = toothNum.toString();
    const current = toothConditions[toothKey] || [];
    let next: Record<string, string[]> = {};

    if (current.includes(selectedTool)) {
      // Remove condition
      const newConditions = current.filter(c => c !== selectedTool);
      if (newConditions.length === 0) {
        const { [toothKey]: _, ...rest } = toothConditions;
        next = rest;
      } else {
        next = {
          ...toothConditions,
          [toothKey]: newConditions,
        };
      }
    } else {
      // Add condition
      next = {
        ...toothConditions,
        [toothKey]: [...current, selectedTool],
      };
    }

    setToothConditions(next);
    onChange?.(next);
  };

  const getToothConditions = (toothNum: number) => {
    return toothConditions[toothNum.toString()] || [];
  };

  const getToothLabel = (toothNum: number) => {
    const conditions = getToothConditions(toothNum);
    if (conditions.length === 0) return '';
    
    return tools
      .filter(t => conditions.includes(t.id))
      .map(t => t.name)
      .join(', ');
  };

  const getPrimaryConditionColor = (toothNum: number) => {
    const conditions = getToothConditions(toothNum);
    if (conditions.length === 0) return null;
    
    const tool = tools.find(t => t.id === conditions[0]);
    return tool?.color;
  };

  const renderTooth = (toothNum: number) => {
    const conditions = getToothConditions(toothNum);
    const hasCondition = conditions.length > 0;
    const label = getToothLabel(toothNum);
    const primaryColor = getPrimaryConditionColor(toothNum);
    
    return (
      <div key={toothNum} className="relative">
        <button
          onClick={() => handleToothClick(toothNum)}
          className={`w-12 h-16 border border-[#d1d5dc] rounded-lg flex items-center justify-center relative transition-all ${
            primaryColor ? '' : 'bg-white'
          } ${selectedTool ? 'hover:border-[#3fb5ff] cursor-pointer' : ''}`}
          style={{
            backgroundColor: primaryColor || 'white',
          }}
        >
          <span className="font-['Arial:Regular',sans-serif] text-[12px] text-[#333333]">
            {toothNum}
          </span>
          
          {/* Status indicators - top right corner */}
          {conditions.length > 0 && (
            <div className="absolute -top-[2.8px] right-[38.8px] flex gap-[2px]">
              {conditions.slice(0, 3).map((conditionId, index) => {
                const tool = tools.find(t => t.id === conditionId);
                return (
                  <div
                    key={index}
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tool?.color }}
                  />
                );
              })}
            </div>
          )}
        </button>
        
        {/* Label below tooth */}
        {hasCondition && label && (
          <div className="absolute left-[0.65px] top-[67.97px] w-[46.675px] h-4 overflow-hidden">
            <p className="font-['Arial:Regular',sans-serif] text-[12px] text-[#ababab] text-center leading-4 truncate">
              {label}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Tools Section */}
      <div className="flex flex-col gap-3">
        <h3 className="font-['Arial:Regular',sans-serif] text-[16px] text-[#333333]">
          Công cụ đánh dấu
        </h3>
        <div className="flex gap-2 flex-wrap">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(selectedTool === tool.id ? '' : tool.id)}
              className={`h-8 px-4 rounded-lg border flex items-center gap-2 font-['Arial:Regular',sans-serif] text-[14px] text-neutral-950 transition-all ${
                selectedTool === tool.id
                  ? 'bg-white border-[#3fb5ff] shadow-md'
                  : 'bg-white border-[rgba(0,0,0,0.1)] hover:border-[#3fb5ff]'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: tool.color }}
              />
              {tool.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dental Chart */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col gap-8">
          {/* Upper Jaw */}
          <div className="flex flex-col gap-3">
            <p className="font-['Arial:Regular',sans-serif] text-[14px] text-[#ababab] text-center leading-5">
              Hàm trên
            </p>
            <div className="flex justify-center gap-8">
              <div className="flex gap-0">
                {upperTeeth[0].map(renderTooth)}
              </div>
              <div className="flex gap-0">
                {upperTeeth[1].map(renderTooth)}
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-[#d1d5dc]" />

          {/* Lower Jaw */}
          <div className="flex flex-col gap-3">
            <p className="font-['Arial:Regular',sans-serif] text-[14px] text-[#ababab] text-center leading-5">
              Hàm dưới
            </p>
            <div className="flex justify-center gap-8">
              <div className="flex gap-0">
                {lowerTeeth[0].map(renderTooth)}
              </div>
              <div className="flex gap-0">
                {lowerTeeth[1].map(renderTooth)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex flex-col gap-2">
          <p className="font-['Arial:Regular',sans-serif] text-[14px] text-[#333333] leading-5">
            Hướng dẫn:
          </p>
          <div className="flex flex-col gap-1">
            <p className="font-['Arial:Regular',sans-serif] text-[14px] text-[#ababab] leading-5">
              • Chọn công cụ, sau đó click vào răng để đánh dấu
            </p>
            <p className="font-['Arial:Regular',sans-serif] text-[14px] text-[#ababab] leading-5">
              • Click lại vào răng đã đánh dấu để xóa
            </p>
            <p className="font-['Arial:Regular',sans-serif] text-[14px] text-[#ababab] leading-5">
              • Có thể đánh dấu nhiều tình trạng cho cùng một răng
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
