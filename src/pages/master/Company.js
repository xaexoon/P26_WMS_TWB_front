import MasterPage from "../../components/MasterPage";
import {
    getCompanyList,
    getCompany,
    insertCompany,
    updateCompany,
    deleteCompany,
} from "../../api/masterApi";

const COLUMNS = [
    { key: "company_name", label: "고객사명" },
    { key: "company_code", label: "고객사 코드" },
    { key: "address", label: "주소" },
    { key: "contact_person", label: "담당자" },
    { key: "contact", label: "연락처" },
    {
        key: "using_yn",
        label: "사용여부",
        render: (v) => (v ? "사용" : "미사용"),
    },
];

const FORM_FIELDS = [
    { key: "company_name", label: "고객사명", type: "text", required: true },
    { key: "company_code", label: "고객사 코드", type: "text", required: true },
    { key: "address", label: "주소", type: "text" },
    { key: "contact_person", label: "담당자", type: "text" },
    { key: "contact", label: "연락처", type: "text" },
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

export default function Company() {
    return (
        <MasterPage
            title="고객사 관리"
            pkKey="company_id"
            columns={COLUMNS}
            formFields={FORM_FIELDS}
            fetchList={getCompanyList}
            fetchSearch={getCompanyList}
            fetchOne={getCompany}
            onInsert={insertCompany}
            onUpdate={updateCompany}
            onDelete={deleteCompany}
        />
    );
}
