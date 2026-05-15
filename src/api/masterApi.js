import { API_BASE } from "./config";

const BASE_URL = `${API_BASE}/api/master`;

// 관리자 로그인
export const managerLogin = async (password) => {
    const res = await fetch(`${BASE_URL}/manager/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
    });
    return await res.json();
};

// 장비관리
export const getEquipmentList = async (keyword = null) => {
    const url = keyword
        ? `${BASE_URL}/equipment/list?keyword=${keyword}`
        : `${BASE_URL}/equipment/list`;
    const res = await fetch(url);
    return await res.json();
};

export const getEquipment = async (equipment_id) => {
    const url = `${BASE_URL}/equipment/${equipment_id}`;
    const res = await fetch(url);
    return await res.json();
};

export const insertEquipment = async (body) => {
    const res = await fetch(`${BASE_URL}/equipment/insert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export const updateEquipment = async (body) => {
    const res = await fetch(`${BASE_URL}/equipment/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export const deleteEquipment = async (equipment_id) => {
    const res = await fetch(
        `${BASE_URL}/equipment/delete?equipment_id=${equipment_id}`,
        { method: "POST" },
    );
    return await res.json();
};

// 작업자관리
export const getWorkerList = async (keyword = null) => {
    const url = keyword
        ? `${BASE_URL}/worker/list?keyword=${keyword}`
        : `${BASE_URL}/worker/list`;
    const res = await fetch(url);
    return await res.json();
};

export const getWorker = async (worker_id) => {
    const res = await fetch(`${BASE_URL}/worker/${worker_id}`);
    return await res.json();
};

export const insertWorker = async (body) => {
    const res = await fetch(`${BASE_URL}/worker/insert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export const updateWorker = async (body) => {
    const res = await fetch(`${BASE_URL}/worker/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export const deleteWorker = async (worker_id) => {
    const res = await fetch(
        `${BASE_URL}/worker/delete?worker_id=${worker_id}`,
        { method: "POST" },
    );
    return await res.json();
};

// 목적지관리
export const getDestinationList = async (keyword = null) => {
    const url = keyword
        ? `${BASE_URL}/destination/list?keyword=${keyword}`
        : `${BASE_URL}/destination/list`;
    const res = await fetch(url);
    return await res.json();
};

export const getDestination = async (destination_id) => {
    const res = await fetch(`${BASE_URL}/destination/${destination_id}`);
    return await res.json();
};

export const insertDestination = async (body) => {
    const res = await fetch(`${BASE_URL}/destination/insert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export const updateDestination = async (body) => {
    const res = await fetch(`${BASE_URL}/destination/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export const deleteDestination = async (destination_id) => {
    const res = await fetch(
        `${BASE_URL}/destination/delete?destination_id=${destination_id}`,
        { method: "POST" },
    );
    return await res.json();
};

// 고객사관리
export const getCompanyList = async (keyword = null) => {
    const url = keyword
        ? `${BASE_URL}/company/list?keyword=${keyword}`
        : `${BASE_URL}/company/list`;
    const res = await fetch(url);
    return await res.json();
};

export const getCompany = async (company_id) => {
    const res = await fetch(`${BASE_URL}/company/${company_id}`);
    return await res.json();
};

export const insertCompany = async (body) => {
    const res = await fetch(`${BASE_URL}/company/insert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export const updateCompany = async (body) => {
    const res = await fetch(`${BASE_URL}/company/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export const deleteCompany = async (company_id) => {
    const res = await fetch(
        `${BASE_URL}/company/delete?company_id=${company_id}`,
        { method: "POST" },
    );
    return await res.json();
};

// 입고자재 관리
export const getInputMaterialList = async (keyword = null) => {
    const url = keyword
        ? `${BASE_URL}/input_material/list?keyword=${keyword}`
        : `${BASE_URL}/input_material/list`;
    const res = await fetch(url);
    return await res.json();
};

export const getInputMaterial = async (material_id) => {
    const res = await fetch(`${BASE_URL}/input_material/${material_id}`);
    return await res.json();
};

export const insertInputMaterial = async (body) => {
    const res = await fetch(`${BASE_URL}/input_material/insert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export const updateInputMaterial = async (body) => {
    const res = await fetch(`${BASE_URL}/input_material/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export const deleteInputMaterial = async (material_id) => {
    const res = await fetch(
        `${BASE_URL}/input_material/delete?input_material_id=${material_id}`,
        { method: "POST" },
    );
    return await res.json();
};

// 출고자재 관리
export const getOutputMaterialList = async (keyword = null) => {
    const url = keyword
        ? `${BASE_URL}/output_material/list?keyword=${keyword}`
        : `${BASE_URL}/output_material/list`;
    const res = await fetch(url);
    return await res.json();
};

export const getOutputMaterial = async (product_id) => {
    const res = await fetch(`${BASE_URL}/output_material/${product_id}`);
    return await res.json();
};

export const insertOutputMaterial = async (body) => {
    const res = await fetch(`${BASE_URL}/output_material/insert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export const updateOutputMaterial = async (body) => {
    const res = await fetch(`${BASE_URL}/output_material/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export const deleteOutputMaterial = async (product_id) => {
    const res = await fetch(
        `${BASE_URL}/output_material/delete?product_id=${product_id}`,
        { method: "POST" },
    );
    return await res.json();
};

// 랙관리
export const getRackList = async (keyword = null) => {
    const url = keyword
        ? `${BASE_URL}/rack/list?keyword=${keyword}`
        : `${BASE_URL}/rack/list`;
    const res = await fetch(url);
    return await res.json();
};

export const getRack = async (rack_id) => {
    const res = await fetch(`${BASE_URL}/rack/${rack_id}`);
    return await res.json();
};

export const insertRack = async (body) => {
    const res = await fetch(`${BASE_URL}/rack/insert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export const updateRack = async (body) => {
    const res = await fetch(`${BASE_URL}/rack/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export const deleteRack = async (rack_id) => {
    const res = await fetch(`${BASE_URL}/rack/delete?rack_id=${rack_id}`, {
        method: "POST",
    });
    return await res.json();
};

// 프린터 관리
export const getPrinterList = async (keyword = null) => {
    const url = keyword
        ? `${BASE_URL}/printer/list?keyword=${keyword}`
        : `${BASE_URL}/printer/list`;
    const res = await fetch(url);
    return await res.json();
};

export const getPrinter = async (printer_id) => {
    const res = await fetch(`${BASE_URL}/printer/${printer_id}`);
    return await res.json();
};

export const insertPrinter = async (body) => {
    const res = await fetch(`${BASE_URL}/printer/insert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export const updatePrinter = async (body) => {
    const res = await fetch(`${BASE_URL}/printer/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export const deletePrinter = async (printer_id) => {
    const res = await fetch(
        `${BASE_URL}/printer/delete?printer_id=${printer_id}`,
        {
            method: "POST",
        },
    );
    return await res.json();
};
