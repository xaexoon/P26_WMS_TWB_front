import MasterPage from "../../components/MasterPage";
import {
    getPrinterList,
    getPrinter,
    insertPrinter,
    updatePrinter,
    deletePrinter,
} from "../../api/masterApi";

const COLUMNS = [
    { key: "printer_name", label: "프린터 이름" },
    { key: "printer_code", label: "프린터 코드" },
    { key: "address", label: "주소" },
    {
        key: "using_yn",
        label: "사용여부",
        render: (v) => (v ? "사용" : "미사용"),
    },
];

const FORM_FIELDS = [
    { key: "printer_name", label: "프린터 이름", type: "text", required: true },
    { key: "printer_code", label: "프린터 코드", type: "text", required: true },
    { key: "address", label: "주소", type: "text", required: true},
    {
        key: "using_yn",
        label: "사용여부",
        type: "select",
        defaultValue: 1,
        options: [
            { value: 1, label: "사용" },
            { value: 0, label: "미사용" },
        ],
        required: true
    },
];

export default function Printer() {
    return (
        <MasterPage
            title="프린터 관리"
            pkKey="printer_id"
            columns={COLUMNS}
            formFields={FORM_FIELDS}
            fetchList={getPrinterList}
            fetchSearch={getPrinterList}
            fetchOne={getPrinter}
            onInsert={insertPrinter}
            onUpdate={updatePrinter}
            onDelete={deletePrinter}
        />
    );
}
