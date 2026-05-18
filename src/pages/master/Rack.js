import MasterPage from "../../components/MasterPage";
import {
    getRackList,
    getRack,
    insertRack,
    updateRack,
    deleteRack,
} from "../../api/masterApi";
const DESTINATION_LABELS = { 1: "입고랙", 2: "출고랙" };

const COLUMNS = [
    { key: "rack_name", label: "랙 이름" },
    {
        key: "destination_id",
        label: "구분",
        render: (v) => DESTINATION_LABELS[v] ?? "-",
    },
    { key: "rows", label: "행 (가로)" },
    { key: "cols", label: "열 (세로)" },
    {
        key: "using_yn",
        label: "상태",
        render: (v) => (v ? "사용" : "미사용"),
    },
];

const FORM_FIELDS = [
    { key: "rack_name", label: "랙 이름", type: "text", required: true },
    {
        key: "destination_id",
        label: "구분",
        type: "select",
        defaultValue: 1,
        required: true,
        options: [
            { value: 1, label: "입고랙" },
            { value: 2, label: "출고랙" },
        ],
    },
    { key: "rows", label: "행 (가로)", type: "number", required: true },
    { key: "cols", label: "열 (세로)", type: "number", required: true },
    {
        key: "using_yn",
        label: "상태",
        type: "select",
        defaultValue: 1,
        options: [
            { value: 1, label: "사용" },
            { value: 0, label: "미사용" },
        ],
        required: true
    },
];

export default function Rack() {
    return (
        <MasterPage
            title="랙 관리"
            pkKey="rack_id"
            columns={COLUMNS}
            formFields={FORM_FIELDS}
            fetchList={getRackList}
            fetchSearch={getRackList}
            fetchOne={getRack}
            onInsert={insertRack}
            onUpdate={updateRack}
            onDelete={deleteRack}
        />
    );
}
