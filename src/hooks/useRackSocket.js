import { useEffect, useRef } from "react";

import { WS_BASE } from "@/api/config";

const RACK_WS_URL = `${WS_BASE}/ws/rack`;

let socket = null;
const listeners = new Set();
let reconnectTimer = null;

function ensureSocket() {
    if (socket && socket.readyState <= 1) return;

    socket = new WebSocket(RACK_WS_URL);

    socket.onmessage = (e) => {
        try {
            const msg = JSON.parse(e.data);
            listeners.forEach((fn) => fn(msg));
        } catch (err) {
            console.error("rack ws parse error", err);
        }
    };

    socket.onclose = () => {
        socket = null;
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(ensureSocket, 3000);
    };

    socket.onerror = () => socket?.close();
}

export function useRackSocket(onMessage) {
    const ref = useRef(onMessage);
    ref.current = onMessage;

    useEffect(() => {
        ensureSocket();
        const fn = (msg) => ref.current?.(msg);
        listeners.add(fn);
        return () => listeners.delete(fn);
    }, []);
}
