import { ReactComponent as MapSvg } from "../assets/images/map.svg";

export default function Map() {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className=" w-[1880px] h-[860px] flex items-center justify-center">
                <div className="flex w-full h-[840px] items-center justify-center">
                    <MapSvg style={{ width: "1772px", height: "802px" }} />
                </div>
            </div>
        </div>
    );
}
