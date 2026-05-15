import { useState } from "react";

const CustomCheckbox = ({ checked, onChange, label, disabled }) => (
    <div
        className={`flex items-center justify-start gap-4 whitespace-nowrap ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={disabled ? undefined : onChange}
    >
        <div className="w-[30px] h-[30px] rounded-[4px] border-2 border-[#67A0F0] bg-[#23272C] flex items-center justify-center shrink-0">
            {checked && (
                <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                    <path
                        d="M1 5L5 9L13 1"
                        stroke="#67A0F0"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
            )}
        </div>
        <span className="text-[28px]">{label}</span>
    </div>
);

export default function SearchFilterModal({ onClose, onApply }) {
    const [filters, setFilters] = useState({
        "LOT 번호": false,
        "코일 번호": false,
        품번: false,
        작업자: false,
        고객사: false,
    });

    const toggleFilter = (key) => {
        setFilters((prev) => {
            const next = { ...prev, [key]: !prev[key] };

            if (key === "LOT 번호" && next["LOT 번호"]) {
                return {
                    "LOT 번호": true,
                    "코일 번호": false,
                    품번: false,
                    작업자: false,
                    고객사: false,
                };
            }

            if (key !== "LOT 번호") {
                next["LOT 번호"] = false;
            }

            return next;
        });
    };

    const isLotOnly = filters["LOT 번호"];

    return (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm bg-opacity-50 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center bg-[#23272C] rounded-xl p-8 w-[800px] h-[420px] relative gap-9">
                <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-[32px] pr-3"
                    onClick={onClose}
                    style={{ border: "none", background: "none" }}
                >
                    ✕
                </button>

                <div className="flex flex-col items-center justify-center">
                    <h2 className="text-[45px] text-center mb-1 text-white">
                        검색 필터 설정
                    </h2>
                    <p className="text-[24px] text-center text-[#585C63]">
                        * 검색 범위는 한 개 이상의 값이 입력되어야 합니다.
                    </p>
                </div>

                <div className="flex flex-col gap-y-4 items-center w-[680px] text-white">
                    {/* 1줄: LOT 번호, 코일 번호, 품번 */}
                    <div className="flex justify-center gap-x-8">
                        {["LOT 번호", "코일 번호", "품번"].map((key) => (
                            <CustomCheckbox
                                key={key}
                                label={key}
                                checked={filters[key]}
                                onChange={() => toggleFilter(key)}
                                disabled={isLotOnly && key !== "LOT 번호"}
                            />
                        ))}
                    </div>

                    {/* 2줄: 작업자, 고객사 */}
                    <div className="flex justify-center gap-x-8">
                        {["작업자", "고객사"].map((key) => (
                            <CustomCheckbox
                                key={key}
                                label={key}
                                checked={filters[key]}
                                onChange={() => toggleFilter(key)}
                                disabled={isLotOnly && key !== "LOT 번호"}
                            />
                        ))}
                    </div>
                </div>

                <button
                    className="w-[720px] h-[64px] bg-[#67A0F0] text-white text-[32px] rounded-xl font-semibold flex-shrink-0"
                    onClick={() =>
                        onApply({
                            startDate: null,
                            endDate: null,
                            filters,
                        })
                    }
                >
                    검색 필터 적용
                </button>
            </div>
        </div>
    );
}
