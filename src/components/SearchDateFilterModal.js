import { useState } from "react";

const getToday = () => new Date().toISOString().split("T")[0];

const CustomRadio = ({ checked, onChange, label }) => (
    <div
        className="flex items-center justify-start gap-4 whitespace-nowrap cursor-pointer"
        onClick={onChange}
    >
        <div className="w-[30px] h-[30px] rounded-full border-2 border-[#67A0F0] bg-[#23272C] flex items-center justify-center shrink-0">
            {checked && (
                <div className="w-[14px] h-[14px] rounded-full bg-[#67A0F0]" />
            )}
        </div>
        <span className="text-[28px] text-white">{label}</span>
    </div>
);

export default function SearchDateFilterModal({ onClose, onApply }) {
    const [startDate, setStartDate] = useState(getToday);
    const [endDate, setEndDate] = useState(getToday);
    const [dateType, setDateType] = useState("입고");

    return (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm bg-opacity-50 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center bg-[#23272C] rounded-xl p-8 w-[800px] h-[450px] relative gap-8">
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-[32px] pr-3"
                    onClick={onClose}
                    style={{ border: "none", background: "none" }}
                >
                    ✕
                </button>

                <div className="flex flex-col items-center justify-center">
                    <h2 className="text-[45px] text-center mb-1 text-white">
                        날짜 필터 설정
                    </h2>
                    <p className="text-[24px] text-center text-[#585C63]">
                        * 날짜 범위와 일자 유형을 선택해주세요.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-6 w-[680px]">
                    {/* 날짜 범위 */}
                    <div className="flex items-center justify-between w-full">
                        <span className="text-[32px] font-semibold text-white">
                            검색 범위
                        </span>
                        <div className="flex items-center gap-3">
                            <input
                                type="date"
                                className="rounded px-2 py-1 text-[24px] bg-[#2C3137] text-white border-[3px] border-[#363D44]"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="text-[24px] text-white">~</span>
                            <input
                                type="date"
                                className="rounded px-2 py-1 text-[24px] bg-[#2C3137] text-white border-[3px] border-[#363D44]"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="w-full h-[3px] bg-[#363D44]" />

                    {/* 일자 유형 선택 */}
                    <div className="flex items-center justify-between w-full">
                        <span className="text-[32px] font-semibold text-white">
                            일자 유형
                        </span>
                        <div className="flex gap-x-8">
                            {["입고", "TWB", "포장", "출고"].map((type) => (
                                <CustomRadio
                                    key={type}
                                    label={type}
                                    checked={dateType === type}
                                    onChange={() => setDateType(type)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    className="w-[720px] h-[80px] bg-[#67A0F0] text-white text-[32px] rounded-xl font-semibold flex-shrink-0"
                    onClick={() =>
                        onApply({
                            startDate,
                            endDate,
                            dateType,
                        })
                    }
                >
                    날짜 필터 적용
                </button>
            </div>
        </div>
    );
}
