import { useNavigate, useLocation } from "react-router-dom";
import { ReactComponent as SisLogo } from "../assets/images/sis_logo.svg";
import { ReactComponent as SettingIcon } from "../assets/images/setting_icon.svg";

const menu_list = [
    { label: "현장 맵", path: "/map" },
    { label: "정보 검색", path: "/search" },
    { label: "적치정보", path: "/rack" },
];

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <header className="w-full h-[180px] flex-shrink-0 flex items-center px-6 border-b border-gray-200 bg-white">
            {/* 왼쪽: 로고 + 타이틀 */}
            <div className="w-[910px] h-[120px] flex items-center gap-3">
                <div className="pl-3">
                    <SisLogo style={{ height: 83, width: "auto" }} />
                </div>
                <div className="w-px h-8 pl-3" />
                <span className="text-[30pt] font-semibold text-gray-700">
                    생산동 공정 자동화 통합 모니터링 시스템
                </span>
            </div>

            {/* 오른쪽: 탭 + 설정 */}
            <div className="h-[120px] flex items-center gap-4 ml-auto pr-3">
                <div className="w-[640px] h-[86px] flex items-center bg-[#EAEAEA] rounded-full p-1.5 gap-1">
                    {menu_list.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex-1 h-full rounded-full text-[20pt] font-medium transition-all duration-200 cursor-pointer whitespace-nowrap
                                ${
                                    location.pathname === item.path
                                        ? "bg-white text-gray-800 shadow-sm"
                                        : "text-gray-400 hover:text-gray-600"
                                }`}
                            style={{ border: "none", fontFamily: "inherit" }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                <SettingIcon />
            </div>
        </header>
    );
}
