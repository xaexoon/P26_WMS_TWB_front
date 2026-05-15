import { useState } from "react";
import MasterPage from "../../components/MasterPage";
import { QRCodeSVG } from "qrcode.react";
import { WMS_IP } from "../../api/config";
import {
    getEquipmentList,
    getEquipment,
    insertEquipment,
    updateEquipment,
    deleteEquipment,
} from "../../api/masterApi";
import { jsPDF } from "jspdf";

function QRModal({ url, name, onClose }) {
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
                        className="text-gray-400 hover:text-white text-[28px]"
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
                        className="flex-1 py-4 rounded-xl text-[24px] font-semibold bg-[#454C56] text-white"
                        style={{ border: "none" }}
                        onClick={handleSave}
                    >
                        저장
                    </button>
                    <button
                        className="flex-1 py-4 rounded-xl text-[24px] font-semibold bg-[#67A0F0] text-white"
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

const FORM_FIELDS = [
    { key: "equipment_name", label: "장비명", type: "text" },
    { key: "equipment_code", label: "장비 코드", type: "text" },
    { key: "description", label: "비고", type: "text" },
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

export default function Equipment() {
    const [qrModal, setQrModal] = useState(null);

    const COLUMNS = [
        { key: "equipment_name", label: "장비명" },
        { key: "equipment_code", label: "장비 코드" },
        { key: "description", label: "비고" },
        {
            key: "using_yn",
            label: "사용여부",
            render: (v) => (v ? "사용" : "미사용"),
        },
        {
            key: "equipment_id",
            label: "QR 코드",
            render: (v, row) => (
                <div className="flex justify-center">
                    <QRCodeSVG
                        value={`http://${WMS_IP}/api/master/equipment/${v}`}
                        size={80}
                        className="cursor-pointer hover:opacity-80"
                        onClick={(e) => {
                            e.stopPropagation();
                            setQrModal({
                                url: `http://${WMS_IP}/api/master/equipment/${v}`,
                                name: row.equipment_name,
                            });
                        }}
                    />
                </div>
            ),
        },
    ];

    return (
        <>
            <MasterPage
                title="장비 관리"
                pkKey="equipment_id"
                columns={COLUMNS}
                formFields={FORM_FIELDS}
                fetchList={getEquipmentList}
                fetchSearch={getEquipmentList}
                fetchOne={getEquipment}
                onInsert={insertEquipment}
                onUpdate={updateEquipment}
                onDelete={deleteEquipment}
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
