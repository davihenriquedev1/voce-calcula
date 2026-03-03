/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { ScientificPageForm } from "./components/ScientificPageForm";
import { useScientificPageController } from "./controller";

export const ScientificPage = ()=> {
    const controller = useScientificPageController();
    const {results, calcError} = controller;

    return (
        <div className="flex min-h-screen p-2 md:p-8">
            <div className="flex flex-col w-full gap-2">
               <div className="flex flex-col bg-softgray bg-opacity-50 border border-gray-400 min-h-10">
                {results.map((item, key) => (
                    <div
                    key={key}
                    className="w-full flex items-center justify-between border-y p-2 font-bold  text-base md:text-2xl"
                    >
                        <div className="flex-1 text-left">{item.expression}</div>
                        <div className="mx-2 text-center">=</div>
                        <div className="flex-1 text-right">{item.dataResult.result}</div>
                    </div>
                ))}
                {calcError && <div className="self-end text-xs w-full text-center bg-destructive-foreground text-destructive px-1">{calcError}</div>}
                </div>
                <ScientificPageForm controller={controller}/>
            </div>
        </div>
    )
}