import { API_BASE } from "./config";

const BASE_URL = `${API_BASE}/api/search`;

export const searchInput = async (start, end, filters, keyword) => {
    const params = new URLSearchParams({ start, end });
    if (filters["품번"] && keyword) params.append("material_code", keyword);
    if (filters["코일 번호"] && keyword) params.append("coil_num", keyword); // 👈 추가
    if (filters["작업자"] && keyword) params.append("worker_name", keyword);
    const res = await fetch(`${BASE_URL}/input?${params}`);
    return await res.json();
};

export const searchTwb = async (start, end) => {
    const res = await fetch(`${BASE_URL}/twb?start=${start}&end=${end}`);
    return await res.json();
};

export const searchCheck = async (start, end) => {
    const res = await fetch(`${BASE_URL}/check?start=${start}&end=${end}`);
    return await res.json();
};

export const searchOutput = async (start, end, filters, keyword) => {
    const params = new URLSearchParams({ start, end });
    if (filters["품번"] && keyword) params.append("product_code", keyword);
    if (filters["코일 번호"] && keyword) params.append("coil_num", keyword); // 👈 추가
    if (filters["작업자"] && keyword) params.append("worker_name", keyword);
    if (filters["고객사"] && keyword) params.append("company_name", keyword);
    const res = await fetch(`${BASE_URL}/output?${params}`);
    return await res.json();
};

export const searchByLotNum = async (lotNum) => {
    const res = await fetch(`${BASE_URL}/lot_num?lot_num=${lotNum}`);
    return await res.json();
};

export const getTrace = async (lotNum) => {
    const res = await fetch(`${BASE_URL}/trace/${lotNum}`);
    return await res.json();
};
