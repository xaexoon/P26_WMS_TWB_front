import { Routes, Route, Navigate } from "react-router-dom";
import Header from "../components/Header";
import Map from "./Map";
import Search from "./Search";
import Rack from "./Rack";
import Equipment from "./master/Equipment";
import Worker from "./master/Worker";
import Company from "./master/Company";
import InputMaterial from "./master/InputMaterial";
import OutputMaterial from "./master/OutputMaterial";
import Destination from "./master/Destination";
import RackMaster from "./master/Rack";
import SearchTrace from "./SearchTrace";
import Printer from "./master/Printer";

export default function Main() {
    return (
        <div className="flex flex-col w-screen h-screen bg-[#30363E] overflow-hidden">
            <Header />
            <main className="w-full flex-1 overflow-auto bg-[#30363E] flex items-center justify-center">
                <Routes>
                    <Route
                        path="/search/trace/:lotNum"
                        element={<SearchTrace />}
                    />
                    <Route path="/map" element={<Map />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/rack" element={<Rack />} />
                    <Route path="/master/equipment" element={<Equipment />} />
                    <Route path="/master/worker" element={<Worker />} />
                    <Route path="/master/company" element={<Company />} />
                    <Route path="/master/rack" element={<RackMaster />} />
                    <Route
                        path="/master/destination"
                        element={<Destination />}
                    />
                    <Route
                        path="/master/input_material"
                        element={<InputMaterial />}
                    />
                    <Route
                        path="/master/output_material"
                        element={<OutputMaterial />}
                    />
                    <Route path="/master/printer" element={<Printer />} />
                    <Route path="*" element={<Navigate to="/map" replace />} />
                </Routes>
            </main>
        </div>
    );
}
