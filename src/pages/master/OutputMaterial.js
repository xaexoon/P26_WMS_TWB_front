import { useEffect, useMemo, useState } from "react";
import MasterPage from "../../components/MasterPage";
import {
    getOutputMaterialList,
    getOutputMaterial,
    insertOutputMaterial,
    updateOutputMaterial,
    deleteOutputMaterial,
    getInputMaterialList,
} from "../../api/masterApi";

const COLUMNS = [
    { key: "product_name", label: "제품명" },
    { key: "product_code", label: "제품 코드" },
    { key: "material_a_code", label: "A자재" },
    { key: "material_b_code", label: "B자재" },
    { key: "width", label: "가로(mm)" },
    { key: "height", label: "세로(mm)" },
    { key: "thick", label: "두께(mm)" },
    { key: "quantity", label: "수량" },
];

export default function OutputMaterial() {
    const [materials, setMaterials] = useState([]);

    useEffect(() => {
        getInputMaterialList().then((res) => {
            if (!res?.data) return;
            setMaterials(res.data);
        });
    }, []);

    const aOptions = useMemo(
        () =>
            materials
                .filter((m) => m.material_type === "A")
                .map((m) => ({
                    value: m.material_id,
                    label: m.material_code,
                })),
        [materials],
    );

    const bOptions = useMemo(
        () =>
            materials
                .filter((m) => m.material_type === "B")
                .map((m) => ({
                    value: m.material_id,
                    label: m.material_code,
                })),
        [materials],
    );

    const FORM_FIELDS = [
        { key: "product_name", label: "제품명", type: "text", required: true },
        { key: "product_code", label: "제품 코드", type: "text", required: true },
        {
            key: "material_a_id",
            label: "A자재",
            type: "select",
            options: aOptions,
            required: true,
        },
        {
            key: "material_b_id",
            label: "B자재",
            type: "select",
            options: bOptions,
            required: true,
        },
        { key: "width", label: "가로(mm)", type: "number", required: true },
        { key: "height", label: "세로(mm)", type: "number", required: true },
        { key: "thick", label: "두께(mm)", type: "number", required: true },
        { key: "quantity", label: "수량", type: "number", required: true },
    ];

    return (
        <MasterPage
            title="출고 자재 관리"
            pkKey="product_id"
            columns={COLUMNS}
            formFields={FORM_FIELDS}
            fetchList={getOutputMaterialList}
            fetchSearch={getOutputMaterialList}
            fetchOne={getOutputMaterial}
            onInsert={insertOutputMaterial}
            onUpdate={updateOutputMaterial}
            onDelete={deleteOutputMaterial}
        />
    );
}
