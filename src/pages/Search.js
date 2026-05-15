import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReactComponent as SearchIcon } from "../assets/images/search_icon.svg";
import SearchFilterModal from "../components/SearchFilterModal";
import SearchDateFilterModal from "../components/SearchDateFilterModal";
import AlarmModal from "../components/AlarmModal";
import {
    searchInput,
    searchOutput,
    searchByLotNum,
    searchTwb,
    searchCheck,
} from "../api/searchApi";

const COMMON_HEADERS = [
    { key: "lot_num", label: "LOT 번호" },
    { key: "coil_num", label: "코일 번호" },
    { key: "material_name", label: "자재명" },
    { key: "quantity", label: "수량" },
    { key: "process_date", label: "작업일자" },
    { key: "process", label: "공정" },
];

const PROCESS_LABEL = {
    input: "입고",
    twb: "TWB",
    check: "포장",
    output: "출고",
};

export default function Search() {
    const navigate = useNavigate();
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isDateFilterModalOpen, setIsDateFilterModalOpen] = useState(false);
    const [alarmMessage, setAlarmMessage] = useState(null);
    const [searchValue, setSearchValue] = useState(
        () => sessionStorage.getItem("search_value") || "",
    );
    const [appliedFilters, setAppliedFilters] = useState(() =>
        JSON.parse(sessionStorage.getItem("search_filters") || "null"),
    );
    const [appliedDateFilter, setAppliedDateFilter] = useState(() =>
        JSON.parse(sessionStorage.getItem("search_date_filter") || "null"),
    );
    const [searchResult, setSearchResult] = useState(() =>
        JSON.parse(sessionStorage.getItem("search_result") || "null"),
    );

    useEffect(() => {
        const fromTrace = sessionStorage.getItem("from_trace");
        if (fromTrace) {
            sessionStorage.removeItem("from_trace");
        } else {
            sessionStorage.removeItem("search_value");
            sessionStorage.removeItem("search_filters");
            sessionStorage.removeItem("search_date_filter");
            sessionStorage.removeItem("search_result");
            setSearchValue("");
            setAppliedFilters(null);
            setAppliedDateFilter(null);
            setSearchResult(null);
        }
    }, []);

    const funcSearch = async () => {
        const filters = appliedFilters?.filters || {};

        // 1. LOT 번호 검색 - 날짜 없이도 가능
        if (filters["LOT 번호"]) {
            if (!searchValue) {
                setAlarmMessage("검색어를 입력해주세요");
                return;
            }
            const data = await searchByLotNum(searchValue);
            const merged = [
                ...(data.data?.input || []),
                ...(data.data?.twb || []),
                ...(data.data?.check || []),
                ...(data.data?.output || []),
            ];
            setSearchResult(merged);
            return;
        }

        // 2. 그 외 검색은 날짜 필터 필수
        if (!appliedDateFilter) {
            setAlarmMessage("날짜 필터를 먼저 설정해주세요");
            return;
        }

        if (appliedDateFilter.dateType === "입고") {
            const data = await searchInput(
                appliedDateFilter.startDate,
                appliedDateFilter.endDate,
                filters,
                searchValue,
            );
            setSearchResult(data.data);
        } else if (appliedDateFilter.dateType === "TWB") {
            const data = await searchTwb(
                appliedDateFilter.startDate,
                appliedDateFilter.endDate,
            );
            setSearchResult(data.data);
        } else if (appliedDateFilter.dateType === "포장") {
            const data = await searchCheck(
                appliedDateFilter.startDate,
                appliedDateFilter.endDate,
            );
            setSearchResult(data.data);
        } else if (appliedDateFilter.dateType === "출고") {
            const data = await searchOutput(
                appliedDateFilter.startDate,
                appliedDateFilter.endDate,
                filters,
                searchValue,
            );
            setSearchResult(data.data);
        }
    };

    const funcFilterApply = (filterData) => {
        setAppliedFilters(filterData);
        sessionStorage.setItem("search_filters", JSON.stringify(filterData));
        setIsFilterModalOpen(false);
        setSearchResult(null);
    };

    const funcDateFilterApply = (dateFilterData) => {
        setAppliedDateFilter(dateFilterData);
        sessionStorage.setItem(
            "search_date_filter",
            JSON.stringify(dateFilterData),
        );
        setIsDateFilterModalOpen(false);
        setSearchResult(null);
    };

    const removeFilter = (key) => {
        setAppliedFilters((prev) => ({
            ...prev,
            filters: { ...prev.filters, [key]: false },
        }));
        setSearchResult(null);
    };

    const removeDateFilter = () => {
        setAppliedDateFilter(null);
        sessionStorage.removeItem("search_date_filter");
        setSearchResult(null);
    };

    const handleRowClick = (row) => {
        sessionStorage.setItem("from_trace", "true");
        sessionStorage.setItem("search_value", searchValue);
        sessionStorage.setItem(
            "search_filters",
            JSON.stringify(appliedFilters),
        );
        sessionStorage.setItem(
            "search_date_filter",
            JSON.stringify(appliedDateFilter),
        );
        sessionStorage.setItem("search_result", JSON.stringify(searchResult));
        navigate(`/search/trace/${row.lot_num}`, { state: { row } });
    };

    const hasActiveTags =
        appliedDateFilter ||
        (appliedFilters &&
            Object.values(appliedFilters.filters).some((v) => v));

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-[1860px] h-[840px] flex flex-col items-center justify-center gap-5">
                <div className="flex w-[1800px] h-[80px] items-center gap-5 justify-center">
                    <div
                        className="w-[165px] h-[80px] bg-[#84BBF4] rounded-[10px] flex items-center justify-center cursor-pointer"
                        onClick={() => setIsDateFilterModalOpen(true)}
                    >
                        <span className="text-white text-[20pt]">
                            날짜 필터
                        </span>
                    </div>
                    <div
                        className="w-[165px] h-[80px] bg-[#84BBF4] rounded-[10px] flex items-center justify-center cursor-pointer"
                        onClick={() => setIsFilterModalOpen(true)}
                    >
                        <span className="text-white text-[20pt]">
                            검색 필터
                        </span>
                    </div>
                    <div className="flex flex-1 h-full rounded-[10px]">
                        <input
                            className="flex-1 h-full outline-none text-[20pt] pl-3 rounded-l-[10px] bg-[#454C56] text-white"
                            placeholder="검색어를 입력하세요"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && funcSearch()}
                        />
                        <div
                            className="flex items-center justify-center pr-5 cursor-pointer rounded-r-[10px] bg-[#454C56]"
                            onClick={funcSearch}
                        >
                            <SearchIcon />
                        </div>
                    </div>
                </div>

                {/* 필터 태그 */}
                {hasActiveTags && (
                    <div className="flex w-[1800px] gap-3 flex-wrap">
                        {/* 날짜 태그 */}
                        {appliedDateFilter && (
                            <div className="flex items-center gap-4 border border-[#22262D] bg-[#22262D] rounded-full px-4 h-[50px] text-[24px] pl-8 pr-8">
                                <span className="text-white">
                                    {appliedDateFilter.startDate} ~{" "}
                                    {appliedDateFilter.endDate}
                                </span>
                                <button
                                    onClick={removeDateFilter}
                                    className="text-[#717071]"
                                    style={{
                                        border: "none",
                                        background: "none",
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {/* 유형 태그 */}
                        {appliedDateFilter && (
                            <div className="flex items-center gap-4 border border-[#22262D] bg-[#22262D] rounded-full px-4 h-[50px] text-[24px] pl-8 pr-8">
                                <span className="text-white">
                                    {appliedDateFilter.dateType}
                                </span>
                                <button
                                    onClick={removeDateFilter}
                                    className="text-[#717071]"
                                    style={{
                                        border: "none",
                                        background: "none",
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {/* 검색 필터 태그들 */}
                        {appliedFilters &&
                            Object.entries(appliedFilters.filters)
                                .filter(([_, value]) => value)
                                .map(([key]) => (
                                    <div
                                        key={key}
                                        className="flex items-center gap-4 border border-[#22262D] bg-[#22262D] rounded-full px-4 h-[50px] text-[24px] pl-8 pr-8"
                                    >
                                        <span className="text-white">
                                            {key}
                                        </span>
                                        <button
                                            onClick={() => removeFilter(key)}
                                            className="text-[#717071]"
                                            style={{
                                                border: "none",
                                                background: "none",
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                    </div>
                )}

                <div className="w-[1800px] h-[3px] bg-[#363D44]"></div>

                {/* 결과 영역 */}
                <div className="w-[1800px] h-[670px] border border-[#454C56] rounded-xl overflow-auto">
                    {!Array.isArray(searchResult) ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-10">
                            <span className="text-[48px] font-extrabold text-white">
                                검색 필터를 설정해주세요
                            </span>
                            <span className="text-[28px] text-[#979797]">
                                검색 필터를 설정 후 조회가 가능합니다
                            </span>
                        </div>
                    ) : searchResult.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-[36px] text-white">
                                조회된 데이터가 없습니다
                            </span>
                        </div>
                    ) : (
                        <table className="w-full text-white text-[20px]">
                            <thead className="bg-[#454C56] sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 border-r border-[#363D44] w-[80px]">
                                        순번
                                    </th>
                                    {COMMON_HEADERS.map((h, j) => (
                                        <th
                                            key={h.key}
                                            className={`px-4 py-3 ${
                                                j < COMMON_HEADERS.length - 1
                                                    ? "border-r border-[#363D44]"
                                                    : ""
                                            }`}
                                        >
                                            {h.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {searchResult.map((row, i) => (
                                    <tr
                                        key={i}
                                        className={`border-b border-[#363D44] hover:bg-[#4A5260] cursor-pointer ${
                                            i % 2 === 0
                                                ? "bg-[#30363E]"
                                                : "bg-[#363D44]"
                                        }`}
                                        onClick={() => handleRowClick(row)}
                                    >
                                        <th className="px-4 py-3 font-normal border-r border-[#454C56] text-[#AAAAAA]">
                                            {i + 1}
                                        </th>
                                        {COMMON_HEADERS.map((h, j) => (
                                            <th
                                                key={h.key}
                                                className={`px-4 py-3 font-normal ${
                                                    j <
                                                    COMMON_HEADERS.length - 1
                                                        ? "border-r border-[#454C56]"
                                                        : ""
                                                }`}
                                            >
                                                {h.key === "process"
                                                    ? (PROCESS_LABEL[
                                                          row[h.key]
                                                      ] ?? row[h.key])
                                                    : (row[h.key] ?? "-")}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {isFilterModalOpen && (
                <SearchFilterModal
                    onClose={() => setIsFilterModalOpen(false)}
                    onApply={funcFilterApply}
                />
            )}
            {isDateFilterModalOpen && (
                <SearchDateFilterModal
                    onClose={() => setIsDateFilterModalOpen(false)}
                    onApply={funcDateFilterApply}
                />
            )}
            {alarmMessage && (
                <AlarmModal
                    message={alarmMessage}
                    onClose={() => setAlarmMessage(null)}
                />
            )}
        </div>
    );
}
