import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ReactComponent as KrrLogo } from "../assets/images/k_road_robotics.svg";
import { ReactComponent as SettingIcon } from "../assets/images/setting_icon.svg";
import { managerLogin } from "@/api/masterApi";

const menu_list = [
    { label: "현장 맵", path: "/map" },
    { label: "정보 검색", path: "/search" },
    { label: "적치정보", path: "/rack" },
];

const setting_menu = [
    { label: "입고 자재 관리", path: "/master/input_material" },
    { label: "출고 자재 관리", path: "/master/output_material" },
    { label: "작업자 관리", path: "/master/worker" },
    { label: "장비 관리", path: "/master/equipment" },
    { label: "목적지 관리", path: "/master/destination" },
    { label: "랙 관리", path: "/master/rack" },
    { label: "고객사 관리", path: "/master/company" },
    { label: "프린터 관리", path: "/master/printer" },
];

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showSettingModal, setShowSettingModal] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSettingClick = () => {
        setPassword("");
        setPasswordError("");
        setShowPasswordModal(true);
    };

    const handlePasswordSubmit = async () => {
        if (isLoading) return;
        if (!password) {
            setPasswordError("비밀번호를 입력하세요");
            return;
        }

        setIsLoading(true);
        try {
            const res = await managerLogin(password);

            if (res?.success) {
                setShowPasswordModal(false);
                setShowSettingModal(true);
                setPassword("");
                setPasswordError("");
            } else {
                setPasswordError(
                    res?.message || "비밀번호가 일치하지 않습니다",
                );
                setPassword("");
            }
        } catch (err) {
            console.error(err);
            setPasswordError("서버와 통신할 수 없습니다");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordKeyDown = (e) => {
        if (e.key === "Enter") {
            handlePasswordSubmit();
        }
    };

    const handleSettingNav = (path) => {
        navigate(path);
        setShowSettingModal(false);
    };

    const closePasswordModal = () => {
        setShowPasswordModal(false);
        setPassword("");
        setPasswordError("");
    };

    return (
        <>
            <header className="w-full h-[180px] flex-shrink-0 flex items-center px-6 bg-[#30363E] pl-[50px] pr-[50px]">
                {/* 왼쪽: 로고 + 타이틀 */}
                <div className="w-[910px] h-[120px] flex items-center gap-[50px]">
                    <div className="flex items-center">
                        <KrrLogo
                            style={{ height: 60, width: "auto" }}
                            className="text-white"
                        />
                    </div>

                    <span className="flex text-[38px] items-center font-semibold text-white">
                        <span className="font-extrabold">
                            생산동 공정 자동화&nbsp;
                        </span>
                        <span className="font-semibold">
                            통합 모니터링 시스템
                        </span>
                    </span>
                </div>

                {/* 오른쪽: 탭 + 설정 */}
                <div className="h-[120px] flex items-center gap-8 ml-auto pr-3">
                    <div className="h-[86px] flex items-center bg-[#454C56] rounded-full p-2 gap-2">
                        {menu_list.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-[200px] h-[66px] rounded-full text-[32px] font-medium transition-all duration-200 cursor-pointer whitespace-nowrap
                                ${
                                    location.pathname.startsWith(item.path)
                                        ? "bg-white text-gray-800 shadow-sm"
                                        : "text-gray-400 hover:text-gray-600"
                                }`}
                                style={{
                                    border: "none",
                                    fontFamily: "inherit",
                                }}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div
                        className="cursor-pointer"
                        onClick={handleSettingClick}
                    >
                        <SettingIcon />
                    </div>
                </div>
            </header>

            {/* 비밀번호 모달 */}
            {showPasswordModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={closePasswordModal}
                >
                    <div
                        className="bg-[#30363E] rounded-2xl p-8 w-[500px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-white text-[32px] font-semibold pl-2">
                                관리자 인증
                            </span>
                            <button
                                onClick={closePasswordModal}
                                className="text-gray-400 hover:text-white text-[28px] leading-none cursor-pointer"
                                style={{ border: "none", background: "none" }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <label className="text-[#AAAAAA] text-[20px] pl-2">
                                비밀번호를 입력하세요
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordError("");
                                }}
                                onKeyDown={handlePasswordKeyDown}
                                autoFocus
                                disabled={isLoading}
                                className="w-full bg-[#454C56] text-white text-[24px] px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#67A0F0] disabled:opacity-50"
                                placeholder="비밀번호"
                                style={{ border: "none" }}
                            />
                            {passwordError && (
                                <span className="text-red-400 text-[18px] pl-2">
                                    {passwordError}
                                </span>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={closePasswordModal}
                                disabled={isLoading}
                                className="flex-1 bg-[#454C56] hover:bg-[#555D68] text-white text-[24px] font-medium py-3 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
                                style={{
                                    border: "none",
                                    fontFamily: "inherit",
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handlePasswordSubmit}
                                disabled={isLoading}
                                className="flex-1 bg-[#67A0F0] hover:bg-[#5590E0] text-white text-[24px] font-medium py-3 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
                                style={{
                                    border: "none",
                                    fontFamily: "inherit",
                                }}
                            >
                                {isLoading ? "확인 중..." : "확인"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 설정 메뉴 모달 */}
            {showSettingModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setShowSettingModal(false)}
                >
                    <div
                        className="bg-[#30363E] rounded-2xl p-8 w-[600px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-white text-[32px] font-semibold pl-2">
                                설정
                            </span>
                            <button
                                onClick={() => setShowSettingModal(false)}
                                className="text-gray-400 hover:text-white text-[28px] leading-none cursor-pointer"
                                style={{ border: "none", background: "none" }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {setting_menu.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleSettingNav(item.path)}
                                    className="bg-[#454C56] hover:bg-[#555D68] text-white text-[24px] font-medium py-4 rounded-xl transition-all duration-200 cursor-pointer"
                                    style={{
                                        border: "none",
                                        fontFamily: "inherit",
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
