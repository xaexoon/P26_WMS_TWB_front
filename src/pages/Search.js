import { useState } from "react";
import { ReactComponent as SearchIcon } from "../assets/images/search_icon.svg";
import SearchFilterModal from "../components/SearchFilterModal";

export default function Search() {
    const [searchValue, setSearchValue] = useState("");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState(null);

    const funcSearch = () => {
        console.log("검색어 : ", searchValue);
        // 검색 기능 추가 예정
    };

    const funcFilterApply = (filterData) => {
        setAppliedFilters(filterData);
        setIsFilterModalOpen(false);
    };

    const removeFilter = (key) => {
        setAppliedFilters((prev) => ({
            ...prev,
            filters: { ...prev.filters, [key]: false },
        }));
    };

    const removeDateFilter = () => {
        setAppliedFilters((prev) => ({
            ...prev,
            startDate: null,
            endDate: null,
        }));
    };

    const hasActiveTags =
        appliedFilters &&
        (appliedFilters.startDate ||
            Object.values(appliedFilters.filters).some((v) => v));

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-[1860px] h-[840px] flex flex-col items-center justify-center gap-5">
                <div className="flex w-[1800px] h-[80px] items-center justify-center">
                    <div
                        className="w-[165px] h-[80px] bg-[#84BBF4] rounded-xl flex items-center justify-center cursor-pointer"
                        onClick={() => setIsFilterModalOpen(true)}
                    >
                        <span className="text-white text-[20pt]">
                            검색 필터
                        </span>
                    </div>
                    <div className="flex-1"></div>
                    <div className="flex w-[1615px] h-full border border-[#D0D0D0] rounded-xl">
                        <input
                            className="flex-1 h-full outline-none text-[20pt] pl-3"
                            placeholder="검색어를 입력하세요"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && funcSearch()}
                        />
                        <div
                            className="flex items-center justify-center pr-5 cursor-pointer"
                            onClick={funcSearch}
                        >
                            <SearchIcon />
                        </div>
                    </div>
                </div>

                {/* 필터 태그 */}
                {hasActiveTags && (
                    <div className="flex w-[1800px] gap-3 flex-wrap">
                        {appliedFilters.startDate && (
                            <div className="flex items-center gap-2 border bg-[#D0D0D0] rounded-full px-4 h-[50px] text-[24px]">
                                <span>
                                    {appliedFilters.startDate}~{" "}
                                    {appliedFilters.endDate}
                                </span>
                                <button
                                    onClick={removeDateFilter}
                                    className="text-gray-400"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        {Object.entries(appliedFilters.filters)
                            .filter(([_, value]) => value)
                            .map(([key]) => (
                                <div
                                    key={key}
                                    className="flex items-center gap-2 border bg-[#D0D0D0] rounded-full px-4 h-[50px] text-[24px]"
                                >
                                    <span>{key}</span>
                                    <button
                                        onClick={() => removeFilter(key)}
                                        className="text-gray-400"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                    </div>
                )}

                <div className="w-[1800px] h-[1px] bg-[#D0D0D0]"></div>
                <div className="w-[1800px] h-[670px] border border-[#D0D0D0] rounded-xl flex flex-col items-center justify-center gap-10">
                    <span className="text-[30pt] text-[#1D3F6E]">
                        검색 필터를 설정해주세요
                    </span>
                    <span className="text-[20pt]">
                        검색 필터를 설정해야 조회가 가능합니다
                    </span>
                </div>
            </div>

            {isFilterModalOpen && (
                <SearchFilterModal
                    onClose={() => setIsFilterModalOpen(false)}
                    onApply={funcFilterApply}
                />
            )}
        </div>
    );
}
