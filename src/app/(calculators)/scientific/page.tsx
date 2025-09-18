"use client";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button";
import React, { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { calculatorInputHandler } from "@/utils/input-handlers/calculatorInputHandler";
import { moveCursor } from "@/utils/input-handlers/moveCursor";
import { getCursorIndex } from "@/utils/input-handlers/getCursorIndex";
import { useScreen } from "@/hooks/useScreen";

const formSchema = z.object({
    expression: z.string().min(1, 'preencha algum valor')
});

type FormValue = z.infer<typeof formSchema>

type Result = {
    expression: string;
    finalResult: string
}

export type NotationMode = "normal" | "sup" | "sub" | "scientific";

export type InputToken = { type: NotationMode; value: string }

type HistoryEntry = { tokens: InputToken[]; cursor: number };


const Page = ()=> {
    const [notationMode, setNotationMode] = useState<NotationMode>("normal");
    const [inputValue, setInputValue] = useState<InputToken[]>([]);
    const [currentResult, setCurrentResult] = useState<Result>({expression: '', finalResult: ''});
    const [results, setResults] = useState<Result[]>([]);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const inputRef = useRef<HTMLDivElement>(null);
    const [cursorIndex, setCursorIndex] = useState(0);
    const screen = useScreen();

    const form = useForm<FormValue>({
        resolver: zodResolver(formSchema)
    });
    
    const { handleSubmit, watch } = form;

    function onSubmit(value: FormValue) {
        const expression = value.expression;
        const res = '' // implementar função de cálculo calculateExpression(expression);
        const newResult = { expression, finalResult: res };
        setCurrentResult(newResult);
        setResults([...results, newResult]);
        form.reset({ expression: '' });
    }

    const tokensEqual = (a:InputToken[], b: InputToken[])=> {
        if(a.length !== b.length) return false;
        for (let i = 0; i < a.length;i++) {
            if(a[i].type !== b[i].type || a[i].value !== b[i].value) return false;
        }
        return true;
    }

    const pushHistory = (tokens = inputValue, cursor = cursorIndex) => {
        const copy = tokens.map(t => ({...t}));
        setHistory(prev => {
            const last = prev[prev.length - 1];
            if (last && tokensEqual(last.tokens, copy) && last.cursor === cursor) return prev;
            return [...prev, {tokens: copy, cursor}]
        })
    }

    // calcula índice absoluto de caracteres até o token clicado e move o cursor
    const handleTokenClick = (event: MouseEvent, tokenIndex: number, offset = 0) => {
        const rect = event.currentTarget.getBoundingClientRect(); // mede a largura real
        const clickX = event.clientX - rect.left; // posição do evento clique
        const tokenLength = inputValue[tokenIndex].value.length;  // tamanho do valor do token
       
        // soma de caracteres até o token clicado
        const baseIndex = inputValue
            .slice(0, tokenIndex)
            .reduce((s, t)=> s + (t.value.length || 0), 0 ) + offset;
        
        let charIndex;
        if (clickX > rect.width / 2 ) {
            charIndex = baseIndex + tokenLength;
        } else {
            charIndex = baseIndex;
        }
        setCursorIndex(charIndex);
        if(inputRef.current) moveCursor(inputRef.current, charIndex);
    }

    const handleReset = () => {
        setCurrentResult({expression: '', finalResult: ''}); // Zera o resultado atual
        form.reset({ expression: '' }); // Reseta o form do React Hook Form 
        setInputValue([]); // Limpa os tokens digitados
        setCursorIndex(0); // Reposiciona o cursor no início
        if (inputRef.current) {
            moveCursor(inputRef.current, 0);
        }// manda o cursor pro começo do input
    }

    const handleEraser = () => {
        if (cursorIndex <= 0) return; // Se o cursor já estiver na posição inicial, não faz nada

        pushHistory(); // Salva o estado atual dos tokens no histórico (cópia) antes de apagar

        setInputValue((prev) => { 
            const charToRemove = cursorIndex - 1; // índice absoluto do caractere a remover
            let acc = 0; // acumulador pra percorrer os tokens
            const newTokens = [...prev]; // cópia dos tokens atuais

            // Percorre os tokens até encontrar o que contém o caractere a ser removido
            for (let i = 0; i < newTokens.length; i++) { 
                const t = newTokens[i];
                const len = t.value.length;

                if (acc + len > charToRemove) { // Se o caractere está dentro deste token
                    const insideIndex = charToRemove - acc; // posição dentro do token
                    const newVal = t.value.slice(0, insideIndex) + t.value.slice(insideIndex + 1); // Remove o caractere da string do token

                    if (newVal.length > 0) {
                        newTokens[i] = { ...t, value: newVal }; // Atualiza o token se ainda restar conteúdo
                    } else {
                        newTokens.splice(i, 1);  // Remove o token inteiro se ficar vazio
                    }
                    break; // já encontrou e removeu, sai do loop
                }
                acc += len; // acumula o tamanho do token e passa pro próximo
            }

            return newTokens; // retorna o novo array de tokens atualizado
        });

        // Move o cursor uma posição pra trás (já que apagou um caractere)
        setCursorIndex((prev) => Math.max(0, prev - 1));
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const historyCopy = [...history];  // Faz uma cópia do histórico atual
        if (historyCopy.length === 0) return; // Se não houver histórico, não faz nada
        const last = historyCopy.pop()!; // Remove o último estado do histórico e obtém ele ("!" garante que não é undefined)
        setInputValue(last.tokens.map(t=> ({...t}))); // Atualiza o estado do input e do cursor
        setCursorIndex(last.cursor); 
        setHistory(historyCopy);  // Atualiza o histórico sem o último estado
    }   

    const handleClickInput = (offset = 0)=> {
        const charIndex = inputValue.reduce((s, t)=> s + (t.value.length || 0), 0 ) + offset;
        setCursorIndex(charIndex);
        if(inputRef.current) moveCursor(inputRef.current, charIndex);
    }
    
    const handleKeyBoardEventInput = (e:KeyboardEvent<HTMLDivElement>) => {
        if (e.key.toLowerCase() === 'enter') {
            e.preventDefault();
            handleSubmit(onSubmit)();
            return;
        } else if (e.key.toLowerCase() === 'backspace') {
            if(inputValue.length === 0) return;
            e.preventDefault();
            handleEraser();
            return;
        } else if (e.key.toLowerCase() === 'arrowleft') {
            e.preventDefault();
            setCursorIndex(prev => Math.max(prev - 1, 0));
            return;
        } else if (e.key.toLowerCase() === 'arrowright') {
            e.preventDefault();
            const totalChars = inputValue.reduce((s,t)=> s + (t.value.length || 0), 0);
            setCursorIndex(prev => Math.min(prev + 1, totalChars));
            return;
        }
        notationModeCallback(e, e.key);
    }

    const notationModeCallback = (event: React.KeyboardEvent | React.MouseEvent<HTMLButtonElement>, newValue: string) => {
        event.preventDefault();

        const mathFunctions = ["mod","cos","sin","tan","cosh","sinh","tanh","arg","log","ln","re","im","conj","abs","factor"];
        const validCharRegex = /^[0-9iI!%^*()+{}\/[\]<>π,.√×?~-]$/;
        if (!(validCharRegex.test(newValue) || mathFunctions.includes(newValue.toLowerCase()))) return;

        const rawIndex = getCursorIndex(inputRef.current!);// posição real do cursor
        const totalChars = inputValue.reduce((s,t)=> s + (t.value?.length || 0), 0); // calcula quantos caracteres existem atualmente em inputValue
        const currentCursorIndex = Math.min(rawIndex, totalChars); // garante que o cursor não ultrapasse o total de caracteres

        const { tokens, inserted } = calculatorInputHandler(notationMode, newValue, inputValue, currentCursorIndex); // Chama a função que insere o novo valor respeitando o tipo de notação
        pushHistory();// Salva o estado atual no histórico antes da alteração
        setInputValue(tokens);
        setCursorIndex(currentCursorIndex + inserted); // Ajusta o cursor para a posição correta depois da inserção
    };

    useEffect(() => {
        // Verifica se o div referenciado existe. Sem isso, tentar manipular o DOM daria erro.
        if (inputRef.current) {
            const totalChars = inputValue.reduce((s, t) => s + (t.value?.length || 0), 0);
            const safeIndex = Math.min(cursorIndex, totalChars);
            moveCursor(inputRef.current, safeIndex);
        }
    }, [cursorIndex, inputValue]);

    const modeControl = (mode:NotationMode) => {
        if (mode === 'sub') {
            notationMode === 'sub' ? setNotationMode('normal') : setNotationMode('sub');
        } else if (mode === 'sup') {
            notationMode === 'sup' ? setNotationMode('normal') : setNotationMode('sup');
        } else if(mode === 'scientific') { // se a notação científica estiver ativa
            pushHistory(); // salva snapshot antes de inserir ×10
            const currentCursorIndex = getCursorIndex(inputRef.current!);
            let result = calculatorInputHandler("normal", "×", inputValue, currentCursorIndex);
            let updatedTokens = result.tokens;
            let updatedCursor = currentCursorIndex + result.inserted;

            result = calculatorInputHandler("normal", "10", updatedTokens, updatedCursor);
            updatedTokens = result.tokens;
            updatedCursor = updatedCursor + result.inserted;

            setInputValue(updatedTokens);
            setCursorIndex(updatedCursor); // agora ficará *depois* do "10"
            setNotationMode("sup");
        }
    }

    return (
        <main className="flex min-h-screen">
            <div className="flex flex-col w-full p-2">
                <div className="bg-softgray bg-opacity-50 border border-gray-400">
                    {results.map((item, key)=> (
                        <div key={key} className="w-full flex justify-between border-y p-2 ">
                            <div>{item.expression}</div>
                            <div>=</div>
                            <div>{item.finalResult}</div>
                        </div>
                    ))}
                </div>
                
                <Form {...form} >
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full" >
                        <div style={{ maxWidth: `${screen-32}px` }} className={`flex items-center overflow-x-auto overflow-y-hidden border rounded p-2 h-[40px] my-2 focus:ring-1 focus:ring-ring`}>
                            <div ref={inputRef} onClick={()=>handleClickInput} onKeyDown={(e)=> handleKeyBoardEventInput(e)} contentEditable suppressContentEditableWarning className="flex w-full items-center h-full text-xl outline-none border-none" tabIndex={0} >
                                {inputValue.map((token, i) => (
                                    <React.Fragment key={i}>    
                                        {token.type === "sup" && <sup style={{paddingInline: '0.5px'}} onClick={(e) => handleTokenClick(e,i)}>{token.value}</sup>}
                                        {token.type === "sub" && <sub style={{paddingInline: '0.5px'}} onClick={(e) => handleTokenClick(e,i)}>{token.value}</sub>}
                                        {token.type === "normal" && <span onClick={(e) => handleTokenClick(e,i)}>{token.value}</span>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>  
                        <div className="grid gap-2 w-full grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                            <div className="grid grid-cols-3 w-full gap-2">
                                <Button
                                    onClick={() => modeControl("sub")}
                                    className={`w-full font-semibold ${ notationMode === "sub" ? "shadow-inner  bg-secondary text-background" : ""}`}   
                                >
                                    &darr;n
                                </Button>
                                <Button
                                    onClick={() => modeControl("sup")}
                                    className={`w-full font-semibold ${ notationMode === "sup" ? " shadow-inner  bg-secondary text-background" : ""}`}
                                >
                                    &uarr;n
                                </Button>
                                <Button
                                    className="hover:brightness-150 font-semibold"
                                    onClick={() => modeControl("scientific")}
                                    >×10<sup>y</sup></Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>7</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>8</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>9</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>4</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>5</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>6</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>1</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>2</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>3</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>0</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>.</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>i</Button>
                            </div>
                            <div className="grid grid-cols-3 w-full gap-2">
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'MOD')}>mod</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={handleUndo}>&#8630;</Button>
                                <div className="grid grid-cols-2 gap-2 w-full">
                                    <Button className="bg-destructive text-secondary-foreground  hover:brightness-150 font-semibold" onClick={handleEraser}>x</Button>
                                    <Button type="reset" className="font-semibold bg-secondary text-secondary-foreground hover:brightness-150" onClick={() => handleReset()}>C</Button>
                                </div>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '/')}>&divide;</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>(</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>)</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>×</Button>
                                <Button className="col-span-2 hover:brightness-150 font-semibold">Memory</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>-</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>&pi;</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>&#8455;</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>+</Button>
                                <Button type="submit" className="hover:brightness-150 bg-secondary text-secondary-foreground font-semibold" >=</Button>
                                <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'factor')}>factor</Button>
                            </div>
                            <div className="grid gap-2 w-full">
                                <div className="grid grid-cols-3 w-full gap-2">
                                    <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>cos</Button>
                                    <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>sin</Button>
                                    <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>tan</Button>
                                    <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>sinh</Button>
                                    <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>cosh</Button>
                                    <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>tanh</Button>
                                </div>
                                <div className="grid grid-cols-4 w-full gap-2">
                                    <Button className="hover:brightness-150 font-semibold" onClick={(e)=> {
                                        modeControl('sup');
                                        notationModeCallback(e, '-1');
                                    }}>x<sup>-1</sup></Button>  
                                    <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '!')}>x!</Button>
                                    <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'abs')}>|x|</Button>
                                    <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>Arg</Button>
                                    <Button className="hover:brightness-150 font-semibold col-span-2" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>&radic;</Button>
                                    <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>log</Button>
                                    <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>ln</Button>
                                    <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>Re</Button>
                                    <Button className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>Im</Button>
                                    <Button className="hover:brightness-150 font-semibold col-span-2" onClick={(e)=> notationModeCallback(e, e.currentTarget.textContent || '')}>conj</Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </main>
    )
}

export default Page;