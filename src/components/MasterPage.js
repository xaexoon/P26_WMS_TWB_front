import { useState, useEffect, useRef } from "react";
import ConfirmModal from "./ConfirmModal";
import AlarmModal from "./AlarmModal";

function CustomSelect({ value, onChange, options = [] }) {
    const [open, setOpen] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState({});
    const ref = useRef(null);

    const selected = options.find((o) => String(o.value) === String(value));

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    useEffect(() => {
        if (!open || !ref.current) return;

        const updatePosition = () => {
            const rect = ref.current.getBoundingClientRect();
            setDropdownStyle({
                position: "fixed",
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
            });
        };

        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);

        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [open]);

    const handleOpen = () => {
        if (!open && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setDropdownStyle({
                position: "fixed",
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
            });
        }
        setOpen((prev) => !prev);
    };

    return (
        <div ref={ref} className="relative">
            <div
                className="bg-[#2C3137] text-white text-[20px] px-4 py-3 rounded-xl border border-[#363D44] flex items-center justify-between cursor-pointer hover:border-[#67A0F0]"
                onClick={handleOpen}
            >
                <span>{selected ? selected.label : "선택하세요"}</span>
                <span
                    className="text-[#67A0F0] text-[16px] transition-transform duration-200"
                    style={{
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                >
                    ▼
                </span>
            </div>

            {open && (
                <div
                    className="bg-[#2C3137] border border-[#67A0F0] rounded-xl shadow-lg
                               [&::-webkit-scrollbar]:w-2
                               [&::-webkit-scrollbar-track]:bg-[#2C3137]
                               [&::-webkit-scrollbar-thumb]:bg-[#454C56]
                               [&::-webkit-scrollbar-thumb]:rounded-full"
                    style={{
                        ...dropdownStyle,
                        maxHeight: "300px",
                        overflowY: "auto",
                    }}
                >
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            className={`px-4 py-3 text-[20px] cursor-pointer flex items-center justify-between
                                ${
                                    String(value) === String(opt.value)
                                        ? "bg-[#67A0F0] text-white"
                                        : "text-white hover:bg-[#363D44]"
                                }`}
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                        >
                            <span>{opt.label}</span>
                            {String(value) === String(opt.value) && (
                                <span className="text-[16px]">✓</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function MasterModal({
    mode,
    data,
    formFields,
    onClose,
    onSave,
    onDelete,
    canDelete = true,
}) {
    const [form, setForm] = useState(
        data ||
            formFields.reduce(
                (acc, f) => ({ ...acc, [f.key]: f.defaultValue ?? "" }),
                {},
            ),
    );
    const [alarm, setAlarm] = useState(null);
    const mouseDownTarget = useRef(null);

    const handleChange = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

    const handleSaveClick = () => {
        const hasMissing = formFields.some((f) => {
            if (!f.required) return false;
            const v = form[f.key];
            if (v === null || v === undefined) return true;
            if (typeof v === "string" && v.trim() === "") return true;
            return false;
        });
        if (hasMissing) {
            setAlarm("필수 항목을 입력해 주세요");
            return;
        }
        onSave(form);
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onMouseDown={(e) => {
                mouseDownTarget.current = e.target;
            }}
            onClick={(e) => {
                if (
                    e.target === e.currentTarget &&
                    mouseDownTarget.current === e.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div
                className="bg-[#23272C] rounded-2xl p-8 w-[560px] flex flex-col gap-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-white text-[28px] font-semibold">
                        {mode === "add" ? "항목 추가" : "항목 수정"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-[28px]"
                        style={{ border: "none", background: "none" }}
                    >
                        ✕
                    </button>
                </div>

                <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                    {formFields.map((field) => (
                        <div key={field.key} className="flex flex-col gap-1">
                            <label className="text-gray-400 text-[18px]">
                                {field.label}
                                {field.required && (
                                    <span className="text-red-500 ml-1">*</span>
                                )}
                            </label>
                            {field.type === "select" ? (
                                <CustomSelect
                                    value={form[field.key]}
                                    onChange={(v) => handleChange(field.key, v)}
                                    options={field.options}
                                />
                            ) : (
                                <input
                                    type={field.type || "text"}
                                    className="bg-[#2C3137] text-white text-[20px] px-4 py-3 rounded-xl outline-none border border-[#363D44] focus:border-[#67A0F0]"
                                    value={form[field.key] || ""}
                                    onChange={(e) =>
                                        handleChange(field.key, e.target.value)
                                    }
                                    placeholder={
                                        field.placeholder ||
                                        `${field.label} 입력`
                                    }
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 mt-2">
                    {mode === "edit" && canDelete && (
                        <button
                            className="flex-1 py-4 rounded-xl text-[28px] font-semibold"
                            style={{
                                border: "none",
                                background: "#ef4444",
                                color: "white",
                            }}
                            onClick={() => onDelete(data)}
                        >
                            삭제
                        </button>
                    )}
                    <button
                        className="flex-1 py-4 rounded-xl text-[28px] font-semibold bg-[#67A0F0] text-white"
                        style={{ border: "none" }}
                        onClick={handleSaveClick}
                    >
                        {mode === "add" ? "추가" : "저장"}
                    </button>
                </div>
            </div>

            {alarm && (
                <AlarmModal
                    message={alarm}
                    onClose={() => setAlarm(null)}
                />
            )}
        </div>
    );
}

export default function MasterPage({
    title,
    columns,
    pkKey,
    formFields,
    fetchList,
    fetchSearch,
    fetchOne,
    onInsert,
    onUpdate,
    onDelete,
    protectedIds = [],
}) {
    const [list, setList] = useState([]);
    const [modal, setModal] = useState(null);
    const [searchValue, setSearchValue] = useState("");
    const [confirm, setConfirm] = useState(null);
    const [alarm, setAlarm] = useState(null);

    useEffect(() => {
        loadList();
    }, []);

    const loadList = async () => {
        const res = await fetchList();
        if (res?.data) setList(res.data);
    };

    const funcSearch = async () => {
        if (!searchValue.trim()) {
            loadList();
            return;
        }
        const res = await fetchSearch(searchValue);
        if (res?.data) setList(res.data);
    };

    const handleSave = async (form) => {
        setConfirm({
            message:
                modal.mode === "add"
                    ? "추가하시겠습니까?"
                    : "수정하시겠습니까?",
            onConfirm: async () => {
                const res =
                    modal.mode === "add"
                        ? await onInsert(form)
                        : await onUpdate(form);
                setConfirm(null);
                if (res?.success === false) {
                    setAlarm(res.message || "처리에 실패했습니다");
                    return;
                }
                setModal(null);
                loadList();
            },
        });
    };

    const handleDelete = async (data) => {
        setConfirm({
            message: "삭제하시겠습니까?",
            onConfirm: async () => {
                await onDelete(data[pkKey]);
                setConfirm(null);
                setModal(null);
                loadList();
            },
        });
    };

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-[1860px] h-[840px] flex flex-col gap-5">
                <div className="flex w-full h-[80px] items-center justify-between">
                    <span className="text-white text-[32px] font-semibold pl-3">
                        {title}
                    </span>
                    <div className="flex items-center gap-3">
                        <input
                            className="h-[60px] px-6 bg-[#454C56] text-white text-[20px] rounded-xl outline-none border border-[#363D44] focus:border-[#67A0F0] w-[400px]"
                            placeholder="검색어를 입력하세요"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && funcSearch()}
                        />
                        <button
                            className="h-[60px] px-8 bg-[#454C56] text-white text-[20px] font-semibold rounded-xl"
                            style={{ border: "none" }}
                            onClick={funcSearch}
                        >
                            검색
                        </button>
                        <button
                            className="h-[60px] px-8 bg-[#67A0F0] text-white text-[20px] font-semibold rounded-xl"
                            style={{ border: "none" }}
                            onClick={() => setModal({ mode: "add" })}
                        >
                            + 항목 추가
                        </button>
                    </div>
                </div>

                <div className="w-full h-[1px] bg-[#363D44]" />

                <div className="w-full flex-1 border border-[#363D44] rounded-xl overflow-auto">
                    <table className="w-full text-white text-[20px]">
                        <thead className="bg-[#454C56] sticky top-0">
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className="px-6 py-4 text-[26px] text-center"
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {list.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="text-center py-20 text-gray-400 text-[24px]"
                                    >
                                        등록된 데이터가 없습니다
                                    </td>
                                </tr>
                            ) : (
                                list.map((row, i) => (
                                    <tr
                                        key={i}
                                        className="border-b border-[#363D44] hover:bg-[#363D44] cursor-pointer"
                                        onClick={async () => {
                                            if (fetchOne) {
                                                const res = await fetchOne(
                                                    row[pkKey],
                                                );
                                                setModal({
                                                    mode: "edit",
                                                    data: res.data,
                                                });
                                            } else {
                                                setModal({
                                                    mode: "edit",
                                                    data: row,
                                                });
                                            }
                                        }}
                                    >
                                        {columns.map((col) => (
                                            <td
                                                key={col.key}
                                                className="px-6 py-4 text-center"
                                            >
                                                {col.render
                                                    ? col.render(
                                                          row[col.key],
                                                          row,
                                                      )
                                                    : (row[col.key] ?? "-")}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <MasterModal
                    mode={modal.mode}
                    data={modal.data}
                    formFields={formFields}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    canDelete={
                        !modal.data ||
                        !protectedIds.includes(modal.data[pkKey])
                    }
                />
            )}

            {confirm && (
                <ConfirmModal
                    message={confirm.message}
                    onConfirm={confirm.onConfirm}
                    onCancel={() => setConfirm(null)}
                />
            )}

            {alarm && (
                <AlarmModal message={alarm} onClose={() => setAlarm(null)} />
            )}
        </div>
    );
}
