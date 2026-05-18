import MasterPage from "../../components/MasterPage";

import {
    getInputMaterialList,
    getInputMaterial,
    insertInputMaterial,
    updateInputMaterial,
    deleteInputMaterial,
} from "../../api/masterApi";

const COLUMNS = [
    { key: "material_name", label: "자재명" },
    { key: "material_code", label: "자재 코드" },
    { key: "material_type", label: "구분" },
    { key: "width", label: "가로(mm)" },
    { key: "height", label: "세로(mm)" },
    { key: "thick", label: "두께(mm)" },
    { key: "quantity", label: "수량" },
];

const FORM_FIELDS = [
    { key: "material_name", label: "자재명", type: "text", required: true },
    { key: "material_code", label: "자재 코드", type: "text", required: true },
    {
        key: "material_type",
        label: "구분",
        type: "select",
        defaultValue: "A",
        required: true,
        options: [
            { value: "A", label: "A" },
            { value: "B", label: "B" },
        ],
        required: true
    },
    { key: "width", label: "가로(mm)", type: "number", required: true },
    { key: "height", label: "세로(mm)", type: "number", required: true },
    { key: "thick", label: "두께(mm)", type: "number", required: true },
    { key: "quantity", label: "수량", type: "number", required: true },
];

export default function InputMaterial() {
    return (
        <MasterPage
            title="입고 자재 관리"
            pkKey="material_id"
            columns={COLUMNS}
            formFields={FORM_FIELDS}
            fetchList={getInputMaterialList}
            fetchSearch={getInputMaterialList}
            fetchOne={getInputMaterial}
            onInsert={insertInputMaterial}
            onUpdate={updateInputMaterial}
            onDelete={deleteInputMaterial}
        />
    );
}
