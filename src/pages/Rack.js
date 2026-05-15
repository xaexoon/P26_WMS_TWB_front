import { useEffect, useState } from "react";
import { ReactComponent as NextIcon } from "../assets/images/next_icon.svg";
import { ReactComponent as PrevIcon } from "../assets/images/prev_icon.svg";
import { getRackList, getRackCells } from "../api/rackApi";
import { useRackSocket } from "@/hooks/useRackSocket";

const RackGrid = ({ rows = 4, cols = 4, locationMap = {} }) => {
    const ROW_LABELS = ["A", "B", "C", "D", "E", "F"];
    const [tooltip, setTooltip] = useState({
        visible: false,
        label: "",
        lots: [],
        x: 0,
        y: 0,
    });

    const gapSize = 12;
    const available = 500 - 40;
    const cellSize = Math.floor(
        (available - (Math.max(rows, cols) - 1) * gapSize) /
            Math.max(rows, cols),
    );
    const fontSize = Math.floor(cellSize * 0.45);

    const handleMouseEnter = (e, label, lots) => {
        if (!lots) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            visible: true,
            label,
            lots,
            x: rect.left + rect.width / 2,
            y: rect.top,
        });
    };

    const handleMouseLeave = () => {
        setTooltip({ visible: false, label: "", lots: [], x: 0, y: 0 });
    };

    const cells = [];
    // 👇 루프 순서 변경: 숫자가 세로(위→아래), 알파벳이 가로(왼→오)
    for (let c = cols; c >= 1; c--) {
        for (let r = 0; r < rows; r++) {
            const label = `${ROW_LABELS[r]}${c}`;
            const lots = locationMap[label];
            const isFilled = !!lots;
            cells.push(
                <div
                    key={label}
                    style={{ width: cellSize, height: cellSize, fontSize }}
                    className={`flex items-center justify-center rounded-[8px] font-semibold cursor-pointer
                        ${isFilled ? "bg-[#67A0F0] text-white" : "bg-[#30363E] text-[#454C56]"}`}
                    onMouseEnter={(e) => handleMouseEnter(e, label, lots)}
                    onMouseLeave={handleMouseLeave}
                >
                    {label}
                </div>,
            );
        }
    }

    return (
        <>
            {tooltip.visible && (
                <div
                    className="fixed z-20 bg-[#1E2328] border border-[#67A0F0] rounded-[12px] p-6 shadow-lg"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y - 10,
                        transform: "translate(-50%, -100%)",
                    }}
                >
                    <div className="text-[#67A0F0] font-bold text-[20px] mb-2">
                        {tooltip.label}
                    </div>
                    {tooltip.lots.map((lot, i) => (
                        <div key={i} className="text-white text-[18px]">
                            {lot}
                        </div>
                    ))}
                </div>
            )}

            <div
                className="grid gap-3"
                style={{
                    gridTemplateColumns: `repeat(${rows}, ${cellSize}px)`,
                }}
            >
                {cells}
            </div>
        </>
    );
};

const RackPanel = ({ racks = [], label }) => {
    const [index, setIndex] = useState(0);
    const [locationMap, setLocationMap] = useState({});

    const currentRack = racks[index];

    useEffect(() => {
        setIndex(0);
    }, [racks]);

    useEffect(() => {
        if (!currentRack) return;
        setLocationMap({});
        getRackCells(currentRack.rack_id).then((res) => {
            if (!res?.data) return;
            setLocationMap(res.data);
        });
    }, [currentRack]);

    useRackSocket((msg) => {
        if (msg.type !== "rack_update") return;
        if (!currentRack) return;
        if (msg.rack_id !== currentRack.rack_id) return;
        setLocationMap(msg.locationMap);
    });

    const filledCount = Object.keys(locationMap).length;
    const totalCount = currentRack
        ? (currentRack.rows ?? 4) * (currentRack.cols ?? 4)
        : 16;
    const percent =
        totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

    return (
        <div className="flex flex-col items-center justify-center w-full gap-10">
            {/* 타이틀 */}
            <div className="flex items-center justify-start w-[810px] h-[60px]">
                <span className="text-[48px] text-white font-bold">
                    {label} 적치대 {currentRack ? `#${index + 1}` : ""}
                </span>
            </div>

            {/* 적치량 */}
            <div className="flex items-center justify-between w-[810px] h-[60px]">
                <span className="text-[40px] text-[#9A9A9A] font-bold">
                    현재 적치량
                </span>
                <span className="text-[40px] text-[#67A0F0] font-bold">
                    {filledCount}/{totalCount} ({percent}%)
                </span>
            </div>

            <div className="w-[830px] h-[3px] bg-[#363D44]" />

            {/* 테이블 */}
            <div className="flex items-center justify-center">
                <div className="flex flex-col w-[830px] h-[570px] gap-6">
                    <div className="flex items-center justify-between w-[790px] h-[500px]">
                        <button
                            style={{ border: "none", background: "none" }}
                            onClick={() =>
                                setIndex((prev) => Math.max(prev - 1, 0))
                            }
                        >
                            <PrevIcon />
                        </button>

                        <div className="w-[500px] h-[500px] rounded-[20px] bg-[#454C56] p-5 flex items-center justify-center">
                            {currentRack ? (
                                <RackGrid
                                    key={currentRack.rack_id}
                                    rows={currentRack.rows ?? 4}
                                    cols={currentRack.cols ?? 4}
                                    locationMap={locationMap}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-[#9A9A9A] text-[32px]">
                                    데이터 없음
                                </div>
                            )}
                        </div>

                        <button
                            style={{ border: "none", background: "none" }}
                            onClick={() =>
                                setIndex((prev) =>
                                    Math.min(prev + 1, racks.length - 1),
                                )
                            }
                        >
                            <NextIcon />
                        </button>
                    </div>

                    {/* 페이지네이션 */}
                    <div className="flex items-center justify-center w-[790px] h-[40px] gap-10">
                        {racks.map((_, i) => (
                            <div
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`rounded-full cursor-pointer ${
                                    i === index
                                        ? "bg-[#67A0F0] w-[30px] h-[30px]"
                                        : "bg-[#454C56] w-[21px] h-[21px]"
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function RackInfo() {
    const [inputRacks, setInputRacks] = useState([]);
    const [outputRacks, setOutputRacks] = useState([]);

    const fetchRacks = () => {
        getRackList().then((res) => {
            if (!res?.data) return;
            const active = res.data.filter((r) => r.using_yn === 1);
            setInputRacks(
                active.filter((r) => r.destination_name === "입고존"),
            );
            setOutputRacks(
                active.filter((r) => r.destination_name === "출고존"),
            );
        });
    };

    useEffect(() => {
        fetchRacks();
    }, []);

    // 👇 랙 목록 자체가 바뀌면 다시 가져오기
    useRackSocket((msg) => {
        if (msg.type === "rack_list_changed") fetchRacks();
    });

    return (
        <div className="flex items-center justify-center w-full h-full">
            <div className="flex items-between w-[1860px] h-[840px]">
                <RackPanel racks={inputRacks} label="입고" />
                <RackPanel racks={outputRacks} label="출고" />
            </div>
        </div>
    );
}
