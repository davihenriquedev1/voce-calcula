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
        const validCharRegex = /^[0-9iI!%^*()+{}\[\]<>πe,.\u221A×?~\-\s+]+$/; // aceita um ou mais caracteres
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
            inputRef.current?.focus();
        } else if (mode === 'sup') {
            notationMode === 'sup' ? setNotationMode('normal') : setNotationMode('sup');
            inputRef.current?.focus();
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

    const toThePowerOfMinus1 = (event: React.MouseEvent<HTMLButtonElement>) => {
        inputRef.current?.focus();  // foca o input
        
        // cria token direto como sup
        const rawIndex = getCursorIndex(inputRef.current!);
        const { tokens, inserted } = calculatorInputHandler("sup", "-1", inputValue, rawIndex);
        
        pushHistory(); // salva snapshot
        setInputValue(tokens);
        setCursorIndex(rawIndex + inserted);
    };

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
                            <div ref={inputRef} onClick={()=>handleClickInput} onKeyDown={(e)=> handleKeyBoardEventInput(e)} contentEditable suppressContentEditableWarning className="flex w-full items-center h-full text-xl outline-none border-none whitespace-pre" tabIndex={0} >
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
                                    title="Subscrito"
                                    onClick={() => modeControl("sub")}
                                    className={`w-full font-semibold ${ notationMode === "sub" ? "shadow-inner bg-secondary text-background" : ""}`}   
                                >
                                    &darr;n
                                </Button>
                                <Button
                                    title="Sobrescrito"
                                    onClick={() => modeControl("sup")}
                                    className={`w-full font-semibold ${ notationMode === "sup" ? "shadow-inner bg-secondary text-background" : ""}`}
                                >
                                    &uarr;n
                                </Button>
                                <Button
                                    title="Notação científica (×10^y)"
                                    className="hover:brightness-150 font-semibold"
                                    onClick={() => modeControl("scientific")}
                                >
                                    ×10<sup>y</sup>
                                </Button>
                                <Button title="Número 7" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '7')}>7</Button>
                                <Button title="Número 8" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '8')}>8</Button>
                                <Button title="Número 9" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '9')}>9</Button>
                                <Button title="Número 4" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '4')}>4</Button>
                                <Button title="Número 5" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '5')}>5</Button>
                                <Button title="Número 6" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '6')}>6</Button>
                                <Button title="Número 1" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '1')}>1</Button>
                                <Button title="Número 2" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '2')}>2</Button>
                                <Button title="Número 3" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '3')}>3</Button>
                                <Button title="Número 0" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '0')}>0</Button>
                                <Button title="Ponto decimal" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '.')}>.</Button>
                                <Button title="Número imaginário" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'i')}>i</Button>
                            </div>
                            <div className="grid grid-cols-3 w-full gap-2">
                                <Button title="Desfazer" className="hover:brightness-150 font-semibold" onClick={handleUndo}>&#8630;</Button>
                                <Button title="Apagar" className="bg-destructive text-secondary-foreground hover:brightness-150 font-semibold text-2xl" onClick={handleEraser}>x</Button>
                                <Button title="Resetar" type="reset" className="font-semibold bg-secondary text-secondary-foreground hover:brightness-150 text-2xl" onClick={() => handleReset()}>C</Button>
                                <Button title="Módulo (MOD)" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'MOD')}>mod</Button>
                                <Button title="Divisão" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '/')}>&divide;</Button>
                                <Button title="Parêntese esquerdo" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '(')}>(</Button>
                                <Button title="Parêntese direito" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, ')')}>)</Button>
                                <Button title="Multiplicação" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '×')}>×</Button>
                                <Button title="Subtração" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '-')}>-</Button>
                                <Button title="Pi (π)" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'π')}>&pi;</Button>
                                <Button title="Número de Euler" className="hover:brightness-150 font-semibold italic" onClick={(e)=> notationModeCallback(e, 'e')}>e</Button>
                                <Button title="Adição" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '+')}>+</Button>
                                <Button title="Resultado" type="submit" className="hover:brightness-150 bg-secondary text-secondary-foreground font-semibold col-span-2 text-2xl">=</Button>
                                <Button title="Fatoração" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'factor')}>factor</Button>
                            </div>

                            <div className="grid gap-2 w-full">
                                <div className="grid grid-cols-3 w-full gap-2">
                                    <Button title="Cosseno" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'cos')}>cos</Button>
                                    <Button title="Seno" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'sin')}>sin</Button>
                                    <Button title="Tangente" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'tan')}>tan</Button>
                                    <Button title="Hiperbólico seno" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'sinh')}>sinh</Button>
                                    <Button title="Hiperbólico cosseno" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'cosh')}>cosh</Button>
                                    <Button title="Hiperbólico tangente" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'tanh')}>tanh</Button>
                                </div>

                                <div className="grid grid-cols-4 w-full gap-2">
                                    <Button title="Inverso (x^-1)" className="hover:brightness-150 font-semibold" onClick={(e)=> toThePowerOfMinus1(e)}>x<sup>-1</sup></Button>
                                    <Button title="Fatorial (x!)" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, '!')}>x!</Button>
                                    <Button title="Valor absoluto |x|" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'abs')}>|x|</Button>
                                    <Button title="Argumento de número complexo" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'Arg')}>Arg</Button>
                                    <Button title="Raiz quadrada" className="hover:brightness-150 font-semibold col-span-2" onClick={(e)=> notationModeCallback(e, '√')}>&radic;</Button>
                                    <Button title="Logaritmo base 10" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'log')}>log</Button>
                                    <Button title="Logaritmo natural" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'ln')}>ln</Button>
                                    <Button title="Parte real de número complexo" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'Re')}>Re</Button>
                                    <Button title="Parte imaginária de número complexo" className="hover:brightness-150 font-semibold" onClick={(e)=> notationModeCallback(e, 'Im')}>Im</Button>
                                    <Button title="Conjugado de número complexo" className="hover:brightness-150 font-semibold col-span-2" onClick={(e)=> notationModeCallback(e, 'conj')}>conj</Button>
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