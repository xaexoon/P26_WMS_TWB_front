import { useState } from "react";
import { ReactComponent as MapSvg } from "../assets/images/map.svg";
import MAP_AREAS, { SVG_SIZE } from "../utils/Mapareas";

// ─── info 데이터 ───────────────────────────────────────────
const AREA_INFO = {
    5: { 상태: "🟢 정상 가동", 담당자: "홍길동", 가동률: "92%" },
    4: { 상태: "🟢 정상 가동", 담당자: "김철수", 가동률: "87%" },
    3: { 상태: "🔴 점검 중", 담당자: "이영희", 가동률: "0%" },
    2: { 상태: "🟢 정상 가동", 담당자: "박민준", 가동률: "95%" },
    7: { 상태: "🟡 대기 중", 담당자: "최지수", 가동률: "0%" },
    6: { 상태: "🟢 정상 가동", 담당자: "정우성", 가동률: "78%" },
};

const AREAS = MAP_AREAS.map((area) => ({
    ...area,
    info: AREA_INFO[area.id] ?? {},
}));

// ─── 좌표 → % 변환 ────────────────────────────────────────
const toStyle = (area) => ({
    position: "absolute",
    zIndex: 10,
    cursor: "pointer",
    left: `${(area.x / SVG_SIZE.w) * 100}%`,
    top: `${(area.y / SVG_SIZE.h) * 100}%`,
    width: `${(area.w / SVG_SIZE.w) * 100}%`,
    height: `${(area.h / SVG_SIZE.h) * 100}%`,
});

const hoverStyle = {
    // backgroundColor: "rgba(255,0,0,0.35)",
    backgroundColor: "rgba(255,255,179,0.60)",
    border: "2px solid rgba(255,255,179,0.60) ",
    transition: "background-color 0.15s, border 0.15s",
};

const defaultStyle = {
    backgroundColor: "transparent",
    border: "2px solid transparent",
    transition: "background-color 0.15s, border 0.15s",
};

// ─── 모달 ─────────────────────────────────────────────────
function Modal({ area, onClose }) {
    if (!area) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-[#3C3C3CF2] rounded-xl shadow-2xl overflow-hidden w-[510px] h-[295px] flex flex-col justify-center">
                <div className="flex flex-col ml-10 gap-8">
                    <div className="flex">
                        <span className="text-white text-[36px]">2호기</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white text-[20px]">
                            내용 : A+B 작업
                        </span>
                        <span className="text-white text-[20px]">
                            상태 : 작업중
                        </span>
                        <span className="text-white text-[20px]">
                            재료 : A_001_200, B_002_180
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── 메인 ─────────────────────────────────────────────────
export default function Map() {
    const [activeArea, setActiveArea] = useState(null);
    const [hoveredId, setHoveredId] = useState(null);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-[1860px] h-[840px] flex items-center justify-center bg-white rounded-[20px]">
                <div className="flex w-full h-[860px] items-center justify-center">
                    <div className="relative w-[1772px] h-[802px]">
                        {/* Layer 1: SVG 맵 */}
                        <MapSvg
                            className="absolute inset-0 w-full h-full"
                            style={{ pointerEvents: "none" }}
                        />

                        {/* Layer 2: 클릭/호버 영역 */}
                        {AREAS.map((area) => (
                            <div
                                key={area.id}
                                onMouseEnter={() => setHoveredId(area.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                onClick={() => setActiveArea(area)}
                                style={{
                                    ...toStyle(area),
                                    ...(hoveredId === area.id
                                        ? hoverStyle
                                        : defaultStyle),
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <Modal area={activeArea} onClose={() => setActiveArea(null)} />
        </div>
    );
}
