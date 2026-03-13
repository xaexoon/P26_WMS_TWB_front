import { Routes, Route, Navigate } from "react-router-dom";
import Header from "../components/Header";
import Map from "./Map";
import Search from "./Search";

export default function Main() {
    return (
        <div className="flex flex-col w-[1920px] h-[1080px] bg-white overflow-hidden">
            <Header />
            <main className="w-full flex-1 overflow-hidden bg-gray-50 flex items-center justify-center">
                <Routes>
                    <Route path="/map" element={<Map />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/rack" element={<div>적치정보 페이지</div>} />
                    <Route path="*" element={<Navigate to="/map" replace />} />
                </Routes>
            </main>
        </div>
    );
}
