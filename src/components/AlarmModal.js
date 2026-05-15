export default function AlarmModal({ message, onClose }) {
    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]"
            onClick={onClose}
        >
            <div
                className="bg-[#23272C] rounded-2xl p-8 w-[500px] flex flex-col gap-8"
                onClick={(e) => e.stopPropagation()}
            >
                <p className="text-white text-[26px] text-center font-medium leading-relaxed">
                    {message}
                </p>
                <button
                    className="w-full py-3 rounded-xl text-[22px] font-semibold bg-[#67A0F0] text-white"
                    style={{ border: "none" }}
                    onClick={onClose}
                >
                    확인
                </button>
            </div>
        </div>
    );
}
