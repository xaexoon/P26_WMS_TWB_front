import { useState } from "react";
import MasterPage from "../../components/MasterPage";
import { QRCodeSVG } from "qrcode.react";
import { WMS_IP } from "../../api/config";
import {
    getWorkerList,
    getWorker,
    insertWorker,
    updateWorker,
    deleteWorker,
} from "../../api/masterApi";

import { jsPDF } from "jspdf";

function QRModal({ url, name, onClose }) {
    console.log("IP : " + WMS_IP);
    const handlePrint = () => {
        window.print();
    };

    const handleSave = () => {
        const svg = document.getElementById("qr-modal-svg");
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, 300, 300);

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const qrSize = 80;
            const x = (pageWidth - qrSize) / 2;
            const y = (pdf.internal.pageSize.getHeight() - qrSize) / 2;

            pdf.addImage(imgData, "PNG", x, y, qrSize, qrSize);
            pdf.save(`${name}_qr.pdf`);
        };
        img.src =
            "data:image/svg+xml;base64," +
            btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-[#23272C] rounded-2xl p-10 flex flex-col items-center gap-8"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between w-full">
                    <span className="text-white text-[28px] font-semibold">
                        {name} QR 코드
                    </span>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-[28px] print:hidden"
                        style={{ border: "none", background: "none" }}
                    >
                        ✕
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl">
                    <QRCodeSVG id="qr-modal-svg" value={url} size={300} />
                </div>

                <div className="flex gap-4 w-full">
                    <button
                        className="flex-1 py-4 rounded-xl text-[24px] font-semibold bg-[#454C56] text-white print:hidden"
                        style={{ border: "none" }}
                        onClick={handleSave}
                    >
                        저장
                    </button>
                    <button
                        className="flex-1 py-4 rounded-xl text-[24px] font-semibold bg-[#67A0F0] text-white print:hidden"
                        style={{ border: "none" }}
                        onClick={handlePrint}
                    >
                        출력
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Worker() {
    const [qrModal, setQrModal] = useState(null);

    const COLUMNS = [
        { key: "worker_name", label: "작업자명" },
        { key: "worker_code", label: "작업자 코드" },
        { key: "role", label: "역할" },
        { key: "department", label: "부서" },
        {
            key: "using_yn",
            label: "사용여부",
            render: (v) => (v ? "사용" : "미사용"),
        },
        {
            key: "worker_id",
            label: "QR 코드",
            render: (v, row) => (
                <div className="flex justify-center">
                    <QRCodeSVG
                        value={`http://${WMS_IP}/api/master/worker/${v}`}
                        size={80}
                        className="cursor-pointer hover:opacity-80"
                        onClick={(e) => {
                            e.stopPropagation();
                            setQrModal({
                                url: `http://${WMS_IP}/api/master/worker/${v}`,
                                name: row.worker_name,
                            });
                        }}
                    />
                </div>
            ),
        },
    ];

    const FORM_FIELDS = [
        { key: "worker_name", label: "작업자명", type: "text", required: true },
        { key: "worker_code", label: "작업자 코드", type: "text", required: true },
        {
            key: "role",
            label: "역할",
            type: "select",
            defaultValue: "작업자",
            options: [
                { value: "작업자", label: "작업자" },
                { value: "검사자", label: "검사자" },
                { value: "관리자", label: "관리자" },
            ],
            required: true
        },
        { key: "department", label: "부서", type: "text" },
        {
            key: "using_yn",
            label: "사용여부",
            type: "select",
            defaultValue: 1,
            options: [
                { value: 1, label: "사용" },
                { value: 0, label: "미사용" },
            ],
        },
    ];

    return (
        <>
            <MasterPage
                title="작업자 관리"
                pkKey="worker_id"
                columns={COLUMNS}
                formFields={FORM_FIELDS}
                fetchList={getWorkerList}
                fetchSearch={getWorkerList}
                fetchOne={getWorker}
                onInsert={insertWorker}
                onUpdate={updateWorker}
                onDelete={deleteWorker}
            />
            {qrModal && (
                <QRModal
                    url={qrModal.url}
                    name={qrModal.name}
                    onClose={() => setQrModal(null)}
                />
            )}
        </>
    );
}
