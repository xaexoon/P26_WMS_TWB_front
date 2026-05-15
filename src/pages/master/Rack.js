import MasterPage from "../../components/MasterPage";
import {
    getRackList,
    getRack,
    insertRack,
    updateRack,
    deleteRack,
} from "../../api/masterApi";
const COLUMNS = [
    { key: "rack_name", label: "랙 이름" },
    { key: "destination_name", label: "구분" },
    { key: "rows", label: "행 (가로)" },
    { key: "cols", label: "열 (세로)" },
    {
        key: "using_yn",
        label: "상태",
        render: (v) => (v ? "사용" : "미사용"),
    },
];

const FORM_FIELDS = [
    { key: "rack_name", label: "랙 이름", type: "text" },
    {
        key: "destination_id",
        label: "구분",
        type: "select",
        defaultValue: 1,
        options: [
            { value: 1, label: "입고랙" },
            { value: 4, label: "출고랙" },
        ],
    },
    { key: "rows", label: "행 (가로)", type: "number" },
    { key: "cols", label: "열 (세로)", type: "number" },
    {
        key: "using_yn",
        label: "상태",
        type: "select",
        defaultValue: 1,
        options: [
            { value: 1, label: "사용" },
            { value: 0, label: "미사용" },
        ],
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
