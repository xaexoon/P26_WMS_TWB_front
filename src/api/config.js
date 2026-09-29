// 페이지가 띄워진 호스트를 그대로 사용
// const WMS_IP = `${window.location.hostname}:8000`;

// 예: "192.168.254.80:8000" / "localhost:8000"
// const WMS_IP = "192.168.3.220:8000";

//dev
const WMS_IP = "192.168.1.249:8030";

export const API_BASE = `http://${WMS_IP}`;
export const WS_BASE = `ws://${WMS_IP}`;
export { WMS_IP };
