import { useState } from "react";

export default function Main() {
    const [activeTab, setActiveTab] = useState("map");

    return (
        <div className="flex flex-col w-screen h-screen bg-white overflow-hidden">
            {/* 헤더 */}
            <header
                className="flex-shrink-0 flex items-center justify-between px-6 border-b border-gray-200 bg-white"
                style={{ height: "80px" }}
            >
                <div className="flex items-center gap-3">
                    {/* 로고 자리 */}
                    <div className="text-blue-600 font-bold text-lg">WMS</div>
                    <div className="w-px h-8 bg-gray-200 mx-1" />
                    <span className="text-sm font-semibold text-gray-700">
                        시스템 이름
                    </span>
                </div>

                {/* 탭 */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    {["현장 맵", "정보 검색", "적치 정보"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer
                                    ${
                                        activeTab === tab
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                            style={{ border: "none", fontFamily: "inherit" }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* 설정 */}
                <button
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                    style={{ border: "none", background: "none" }}
                >
                    ⚙
                </button>
            </header>

            {/* 콘텐츠 */}
            <main className="flex-1 overflow-hidden bg-gray-50 flex items-center justify-center">
                <span className="text-gray-400 text-sm">
                    {activeTab} 페이지
                </span>
            </main>
        </div>
    );
}
