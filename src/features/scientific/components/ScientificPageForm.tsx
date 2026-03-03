"use client";

import { Form } from '@/components/ui/form';
import { ScientificPageController } from '../controller';
import { useScreen } from '@/hooks/use-screen';
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScientificInputToken } from '../types';

export const ScientificPageForm = ({controller}: {controller: ScientificPageController}) => {
    const {form, onSubmit, handleSubmit, inputRef, inputValue, notationMode, handleReset,  handleTokenClick, notationModeCallback, handleUndo, handleEraser, handleKeyBoardEventInput, handleClickInput, handleModeControl, insertNegativeExponent1} = controller;

    const screen = useScreen();

    return (
        <Form {...form} >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full gap-2" >
                <div style={{ maxWidth: `${screen - 16}px` }} className={`flex items-center overflow-x-auto overflow-y-hidden border rounded p-2 h-[40px] focus:ring-1 focus:ring-ring`}>
                    <div ref={inputRef} onClick={() => handleClickInput()} onKeyDown={(e) => handleKeyBoardEventInput(e)} contentEditable suppressContentEditableWarning className="flex w-full items-center h-full text-base md:text-xl outline-none border-none whitespace-pre" tabIndex={0} >
                        {inputValue.map((token: ScientificInputToken, i: number) => (
                            <React.Fragment key={i}>
                                {token.type === "sup" && <sup onClick={(e) => handleTokenClick(e, i)}>{token.value}</sup>}
                                {token.type === "sub" && <sub onClick={(e) => handleTokenClick(e, i)}>{token.value}</sub>}
                                {token.type === "normal" && <span onClick={(e) => handleTokenClick(e, i)}>{token.value}</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="grid gap-2 w-full grid-cols-1 sm:grid-cols-2">
                        <div className="grid grid-cols-5  md:grid-cols-3 w-full gap-2">
                            <Button
                                type="button"
                                title="Subscrito"
                                onClick={() => handleModeControl("sub")}
                                className={`bg-background border-2 border-border text-primary w-full font-semibold text-base md:text-xl ${notationMode === "sub" ? "shadow-inner bg-secondary text-background" : ""}`}
                            >
                                &darr;n
                            </Button>
                            <Button
                                type="button"
                                title="Sobrescrito"
                                onClick={() => handleModeControl("sup")}
                                className={`bg-background border-2 border-border text-primary w-full font-semibold text-base md:text-xl ${notationMode === "sup" ? "shadow-inner bg-secondary text-background" : ""}`}
                            >
                                &uarr;n
                            </Button>
                            <Button
                                type="button"
                                title="Notação científica (×10^y)"
                                className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl"
                                onClick={() => handleModeControl("scientific")}
                            >
                                ×10<sup className="ml-[-5px]">y</sup>
                            </Button>
                            <Button
                                type="button"
                                title="Número 7" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '7')}>7</Button>
                            <Button type="button" title="Número 8" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '8')}>8</Button>
                            <Button type="button" title="Número 9" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '9')}>9</Button>
                            <Button type="button" title="Número 4" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '4')}>4</Button>
                            <Button type="button" title="Número 5" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '5')}>5</Button>
                            <Button type="button" title="Número 6" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '6')}>6</Button>
                            <Button type="button" title="Número 1" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '1')}>1</Button>
                            <Button type="button" title="Número 2" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '2')}>2</Button>
                            <Button type="button" title="Número 3" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '3')}>3</Button>
                            <Button type="button" title="Número 0" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '0')}>0</Button>
                            <Button type="button" title="Ponto decimal" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '.')}>.</Button>
                            <Button type="button" title="Número imaginário" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, 'i')}>i</Button>
                        </div>
                        <div className="grid grid-cols-5 md:grid-cols-3 w-full gap-2">
                            <Button type="button" title="Desfazer" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={handleUndo}>&#8630;</Button>
                            <Button type="button" title="Apagar" className="bg-destructive text-secondary-foreground hover:brightness-150 font-semibold text-2xl" onClick={handleEraser}>x</Button>
                            <Button title="Resetar" type="reset" className="font-semibold bg-secondary text-contrastgray hover:brightness-150 text-2xl" onClick={() => handleReset()}>C</Button>
                            <Button type="button" title="Módulo (MOD)" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, 'MOD')}>mod</Button>
                            <Button type="button" title="Parêntese esquerdo" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '(')}>(</Button>
                            <Button type="button" title="Parêntese direito" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, ')')}>)</Button>
                            <Button type="button" title="Divisão" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '÷')}>&divide;</Button>
                            <Button type="button" title="Multiplicação" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '×')}>×</Button>
                            <Button type="button" title="Subtração" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '-')}>-</Button>
                            <Button type="button" title="Pi (π)" className=" bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, 'π')}>&pi;</Button>
                            <Button type="button" title="Número de Euler" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl italic" onClick={(e) => notationModeCallback(e, 'e')}>e</Button>
                            <Button type="button" title="Adição" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '+')}>+</Button>
                            <Button title="Resultado" type="submit" className="hover:brightness-150 bg-secondary text-contrastgray font-semibold col-span-2 text-2xl">=</Button>
                            <Button type="button" title="Fatoração" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, 'factor')}>factor</Button>
                        </div>
                    </div>
                    <div className="grid gap-2 w-full ">
                        <div className="grid grid-cols-6 md:grid-cols-3 w-full gap-2">
                            <Button type="button" title="Cosseno" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, 'cos')}>cos</Button>
                            <Button type="button" title="Seno" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, 'sin')}>sin</Button>
                            <Button type="button" title="Tangente" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, 'tan')}>tan</Button>
                            <Button type="button" title="Hiperbólico seno" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, 'sinh')}>sinh</Button>
                            <Button type="button" title="Hiperbólico cosseno" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, 'cosh')}>cosh</Button>
                            <Button type="button" title="Hiperbólico tangente" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, 'tanh')}>tanh</Button>
                        </div>
                        <div className="grid grid-cols-4 w-full gap-2">
                            <Button type="button" title="Inverso (x^-1)" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={() => insertNegativeExponent1()}>x<sup>-1</sup></Button>
                            <Button type="button" title="Fatorial (x!)" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '!')}>x!</Button>
                            <Button type="button" title="Valor absoluto |x|" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, 'abs')}>|x|</Button>
                            <Button type="button" title="Argumento de número complexo" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, 'Arg')}>Arg</Button>
                            <Button type="button" title="Raiz quadrada" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '√')}>&radic;</Button>
                            <Button type="button" title="Porcentagem" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, '%')}>%</Button>
                            <Button type="button" title="Logaritmo base 10" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, 'log')}>log</Button>
                            <Button type="button" title="Logaritmo natural" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, 'ln')}>ln</Button>
                            <Button type="button" title="Parte real de número complexo" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, 'Re')}>Re</Button>
                            <Button type="button" title="Parte imaginária de número complexo" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl" onClick={(e) => notationModeCallback(e, 'Im')}>Im</Button>
                            <Button type="button" title="Conjugado de número complexo" className="bg-background border-2 border-border text-primary hover:brightness-150 font-semibold text-base md:text-xl col-span-2" onClick={(e) => notationModeCallback(e, 'conj')}>conj</Button>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    )
}
