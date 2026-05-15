import { API_BASE } from "./config";

const RACK_URL = `${API_BASE}/api/rack_info`;

export const getRackList = async (keyword = null) => {
    const url = keyword
        ? `${RACK_URL}/list?keyword=${keyword}`
        : `${RACK_URL}/list`;
    const res = await fetch(url);
    return await res.json();
};

export const getRack = async (rack_id) => {
    const res = await fetch(`${RACK_URL}/${rack_id}`);
    return await res.json();
};

export const getRackCells = async (rack_id) => {
    const res = await fetch(`${RACK_URL}/${rack_id}/cells`);
    return await res.json();
};

export const insertRack = async (body) => {
    const res = await fetch(`${RACK_URL}/insert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export const updateRack = async (body) => {
    const res = await fetch(`${RACK_URL}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return await res.json();
};

export const deleteRack = async (rack_id) => {
    const res = await fetch(`${RACK_URL}/delete?rack_id=${rack_id}`, {
        method: "POST",
    });
    return await res.json();
};
