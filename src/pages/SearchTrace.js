import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as InputIcon } from "../assets/images/trace/input_icon.svg";
import { ReactComponent as TwbIcon } from "../assets/images/trace/twb_icon.svg";
import { ReactComponent as CaseIcon } from "../assets/images/trace/case_icon.svg";
import { ReactComponent as OutputIcon } from "../assets/images/trace/output_icon.svg";

import { ReactComponent as PreIcon } from "../assets/images/trace/pre_icon.svg";

import { getTrace } from "../api/searchApi";

const STAGES = [
    { key: "input", label: "입고 라인", Icon: InputIcon },
    { key: "twb", label: "TWB 라인", Icon: TwbIcon },
    { key: "check", label: "포장 라인", Icon: CaseIcon },
    { key: "output", label: "출고 라인", Icon: OutputIcon },
];

const ROW_LABELS = [
    { key: "lot_num", label: "LOT NO." },
    { key: "material_code", label: "품번" },
    { key: "material_name", label: "품명" },
    { key: "date", label: "일자" },
    { key: "quantity", label: "수량" },
    { key: "worker_name", label: "책임자" },
    { key: "destination", label: "목적지" },
];

const DOT_SIZE = 60;

export default function SearchTrace() {
    const { lotNum } = useParams();
    const navigate = useNavigate();

    const [stageData, setStageData] = useState({
        input: null,
        twb: null,
        check: null,
        output: null,
    });
    const [lastStage, setLastStage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrace = async () => {
            setLoading(true);
            try {
                const res = await getTrace(lotNum);
                if (res?.data) {
                    const { input, twb, check, output, last_stage } = res.data;
                    setStageData({ input, twb, check, output });
                    setLastStage(last_stage);
                }
            } catch (e) {
                console.error("역추적 조회 실패", e);
            } finally {
                setLoading(false);
            }
        };
        fetchTrace();
    }, [lotNum]);

    const lastStageIndex = STAGES.findIndex((s) => s.key === lastStage);

    return (
        <div className="w-full h-full flex flex-col text-white px-[60px] py-[40px]">
            <div className="flex items-center gap-14 mb-[20px]">
                <button
                    onClick={() => navigate(-1)}
                    className="text-[42px] text-white leading-none"
                >
                    <PreIcon />
                </button>
                <span className="text-[40px] font-semibold">
                    {lotNum} 타임라인
                </span>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <span className="text-[32px] text-[#979797]">
                        조회 중...
                    </span>
                </div>
            ) : (
                <div className="flex-1">
                    <table className="w-full border-collapse table-fixed">
                        <thead>
                            {/* 타임라인 dot 행 */}
                            <tr>
                                <td className="w-[180px]" />
                                {STAGES.map((stage, i) => {
                                    const isCompleted = i <= lastStageIndex;
                                    return (
                                        <td
                                            key={stage.key}
                                            className="w-1/4 text-center relative py-[40px]"
                                        >
                                            {i < STAGES.length - 1 && (
                                                <div
                                                    className="absolute pointer-events-none"
                                                    style={{
                                                        top: "50%",
                                                        left: "50%",
                                                        right: "-50%",
                                                        borderTop: `9px dashed ${i < lastStageIndex ? "#67A0F0" : "#454C56"}`,
                                                        transform:
                                                            "translateY(-50%)",
                                                        zIndex: 0,
                                                    }}
                                                />
                                            )}
                                            <div className="flex justify-center relative z-10">
                                                <div
                                                    className="rounded-full border-[7px] flex-shrink-0 flex items-center justify-center"
                                                    style={{
                                                        width: `${DOT_SIZE}px`,
                                                        height: `${DOT_SIZE}px`,
                                                        backgroundColor:
                                                            isCompleted
                                                                ? "#67A0F0"
                                                                : "#30363E",
                                                        borderColor: isCompleted
                                                            ? "#67A0F0"
                                                            : "#454C56",
                                                    }}
                                                >
                                                    {isCompleted && (
                                                        <div
                                                            style={{
                                                                width: `${DOT_SIZE * 0.7}px`,
                                                                height: `${DOT_SIZE * 0.7}px`,
                                                                borderRadius:
                                                                    "50%",
                                                                backgroundColor:
                                                                    "#D6E7FF",
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>

                            {/* 아이콘 + 라벨 행 */}
                            <tr>
                                <td className="text-center text-[22px] text-[#67A0F0] border-r-[3px] border-[#363D44] pb-4 w-[180px] pr-8">
                                    라인 구분
                                </td>
                                {STAGES.map((stage, i) => {
                                    const isCompleted = i <= lastStageIndex;
                                    return (
                                        <td
                                            key={stage.key}
                                            className="text-center pb-[50px] border-r-[3px] border-[#363D44] last:border-r-0"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div
                                                    className={`w-[120px] h-[120px] rounded-[16px] flex items-center justify-center mx-auto ${isCompleted ? "bg-[#67A0F0]" : "bg-[#454C56]"}`}
                                                >
                                                    <stage.Icon className="w-[70px] h-[70px]" />
                                                </div>
                                                <span className="text-[36px] text-white">
                                                    {stage.label}
                                                </span>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        </thead>

                        <tbody>
                            {ROW_LABELS.map((r) => (
                                <tr key={r.key}>
                                    <td className="text-center text-[22px] text-[#67A0F0] border-r-[3px] border-[#363D44] w-[180px] pr-8">
                                        {r.label}
                                    </td>
                                    {STAGES.map((stage) => (
                                        <td
                                            key={stage.key}
                                            className="text-center text-[18px] text-[#AAAAAA] py-[12px] border-r-[3px] border-[#363D44] last:border-r-0"
                                        >
                                            {r.key === "destination"
                                                ? stageData[stage.key]
                                                    ? stage.key === "output"
                                                        ? (stageData[stage.key][
                                                              "company_name"
                                                          ] ?? "-")
                                                        : `${stageData[stage.key]["rack_name"] ?? "-"} / ${stageData[stage.key]["location"] ?? "-"}`
                                                    : "-"
                                                : (stageData[stage.key]?.[
                                                      r.key
                                                  ] ?? "-")}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
