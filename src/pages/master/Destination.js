import MasterPage from "../../components/MasterPage";
import {
    getDestinationList,
    getDestination,
    insertDestination,
    updateDestination,
    deleteDestination,
} from "../../api/masterApi";

const COLUMNS = [
    { key: "destination_name", label: "목적지명" },
    { key: "destination_code", label: "목적지 코드" },
    { key: "description", label: "비고" },
    {
        key: "using_yn",
        label: "사용여부",
        render: (v) => (v ? "사용" : "미사용"),
    },
];

const FORM_FIELDS = [
    { key: "destination_name", label: "목적지명", type: "text", required: true },
    { key: "destination_code", label: "목적지 코드", type: "text", required: true },
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
        required: true
    },
];

export default function Destination() {
    return (
        <MasterPage
            title="목적지 관리"
            pkKey="destination_id"
            columns={COLUMNS}
            formFields={FORM_FIELDS}
            fetchList={getDestinationList}
            fetchSearch={getDestinationList}
            fetchOne={getDestination}
            onInsert={insertDestination}
            onUpdate={updateDestination}
            onDelete={deleteDestination}
            protectedIds={[1, 2]}
        />
    );
}
