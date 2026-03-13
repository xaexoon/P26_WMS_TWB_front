import { useState } from "react";

export default function SearchFilterModal({ onClose, onApply }) {
    const [startDate, setStartDate] = useState("2026-03-03");
    const [endDate, setEndDate] = useState("2026-03-03");
    const [filters, setFilters] = useState({
        고유번호: false,
        검사횟수: false,
        이름: false,
        재료: false,
        완료여부: true,
        입고일자: false,
        출고일자: false,
    });

    const toggleFilter = (key) => {
        setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center bg-white rounded-xl p-8 w-[800px] h-[583px] relative">
                {/* 닫기 버튼 */}
                <button
                    className="absolute top-4 right-4 text-[42px] text-gray-500 pr-3"
                    onClick={onClose}
                >
                    ✕
                </button>

                {/* 제목 */}
                <div className="flex flex-col items-center justify-center">
                    <h2 className="text-[45px] text-center mb-1">
                        검색 필터 설정
                    </h2>
                    <p className="text-[24px] text-center text-red-400 mb-2">
                        * 검색 범위는 한 개 이상의 값이 입력되어야 합니다.
                    </p>
                </div>

                <div className="w-[720px] h-[277px] flex flex-col items-center justify-center">
                    {/* 검색 범위 */}
                    <div className="flex items-center justify-center w-[680px] h-[57px] gap-3 mb-6">
                        <div className="flex items-center w-[210px] h-[40px]">
                            <span className="text-[32px] font-semibold">
                                검색 범위
                            </span>
                        </div>
                        <div className="flex-1"></div>
                        <div className="flex items-center justify-center w-[440px] h-[57px] gap-3">
                            <input
                                type="date"
                                className="border border-gray-300 rounded px-2 py-1 text-[24px]"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span className="text-[24px]">~</span>
                            <input
                                type="date"
                                className="border border-gray-300 rounded px-2 py-1 text-[24px]"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 구분선 */}
                    <div className="w-[680px] h-[1px] bg-black"></div>

                    {/* 체크박스 */}
                    <div className="flex flex-col items-center w-[680px] mt-6 gap-y-4">
                        {/* 첫번째 줄: 4개 */}
                        <div className="grid grid-cols-4 w-full gap-x-16">
                            {["고유번호", "검사횟수", "이름", "재료"].map(
                                (key) => (
                                    <label
                                        key={key}
                                        className="flex items-center justify-start gap-2 cursor-pointer text-[24px]"
                                    >
                                        <input
                                            type="checkbox"
                                            className="w-[20px] h-[20px]"
                                            checked={filters[key]}
                                            onChange={() => toggleFilter(key)}
                                        />
                                        {key}
                                    </label>
                                ),
                            )}
                        </div>
                        {/* 두번째 줄: 3개 */}
                        <div className="grid grid-cols-4 w-full gap-x-16">
                            {["완료여부", "입고일자", "출고일자"].map((key) => (
                                <label
                                    key={key}
                                    className="flex items-center justify-start gap-2 cursor-pointer text-[24px]"
                                >
                                    <input
                                        type="checkbox"
                                        className="w-[20px] h-[20px]"
                                        checked={filters[key]}
                                        onChange={() => toggleFilter(key)}
                                    />
                                    {key}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 적용 버튼 */}
                <button
                    className="w-[720px] h-[80px] bg-[#70C180] text-white text-[36px] rounded-xl"
                    onClick={() => onApply({ startDate, endDate, filters })}
                >
                    검색 필터 적용
                </button>
            </div>
        </div>
    );
}
