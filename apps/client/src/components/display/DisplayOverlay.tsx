import { PropsWithChildren } from "react";

export default function DisplayOverlay({ children }: PropsWithChildren) {
    return (
        <div className="fixed w-full h-full top-0 left-0 z-10 bg-slate-800 bg-opacity-80 flex justify-center items-center">
            <div className="w-5/6 h-5/6 bg-black border-white border-2 z-20 opacity-100 p-8 flex justify-center items-center">
                {children}
            </div>
        </div>
    );
}

