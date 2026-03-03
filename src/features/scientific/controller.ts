import { useForm } from "react-hook-form";
import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { evaluateSafe } from "@/features/scientific/utils/expression-engine";
import { ScientificFormValue, ScientificInputHistoryEntry, ScientificInputToken, ScientificNotationMode, ScientificResult } from "./types";
import { zodResolver } from "@hookform/resolvers/zod";
import { scientificSchema } from "./schema";
import { moveCursor } from "./utils/input-handlers/move-cursor";
import { getCursorIndex } from "./utils/input-handlers/get-cursor-index";
import { calculatorInputHandler } from "./utils/input-handlers/calculator-input-handler";
import { tokensEqual } from "./utils/tokens-equal";

export const useScientificPageController = () => {
	const [notationMode, setNotationMode] = useState<ScientificNotationMode>("normal");
	const [inputValue, setInputValue] = useState<ScientificInputToken[]>([]);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [curResult, setCurResult] = useState<ScientificResult>({ expression: '', dataResult: { ok: false, result: '', error: '' } });
	const [results, setResults] = useState<ScientificResult[]>([]);
	const [calcError, setCalcError] = useState('');
	const [history, setHistory] = useState<ScientificInputHistoryEntry[]>([]);
	const inputRef = useRef<HTMLDivElement>(null);
	const [cursorIndex, setCursorIndex] = useState(0);

	const form = useForm<ScientificFormValue>({
		resolver: zodResolver(scientificSchema),
		defaultValues: { expression: [] },
	});

	const { handleSubmit } = form;

	// -------------
	// Form actions
	// -------------
	function onSubmit(value: ScientificFormValue) {
		const expressionTokens = value.expression;
		let expressionStr = "";
		for (let i = 0; i < expressionTokens.length; i++) {
			const t = expressionTokens[i];
			if (t.type === "sup" || t.type === "sub") {
				let combined = t.value;
				let j = i + 1;
				while (j < expressionTokens.length && expressionTokens[j].type === t.type) {
					combined += expressionTokens[j].value;
					j++;
				}
				expressionStr += (t.type === "sup") ? `^(${combined})` : `_(${combined})`;
				i = j - 1; // pular os que já juntei
			} else {
				expressionStr += t.value;
			}
		}

		const res = evaluateSafe(expressionStr);
		if (!res) {
			setCalcError("Ocorreu algum erro");
			return;
		}
		if (res.ok) {
			const newResult = { expression: expressionStr, dataResult: res };
			setCurResult(newResult);
			setResults(prev => [...prev, newResult]);
			handleReset();
		} else {
			setCalcError(res.error);
		}
	}

	const handleReset = () => {
		setCurResult({
			expression: '', dataResult: {
				ok: false, result: '', error: ''
			}
		}); // Zera o resultado atual
		form.reset({ expression: [] }); // Reseta o form do React Hook Form 
		setInputValue([]); // Limpa os tokens digitados
		setCursorIndex(0); // Reposiciona o cursor no início
		setCalcError('');
		if (inputRef.current) {
			moveCursor(inputRef.current, 0);
		}// manda o cursor pro começo do input
	}

	// -------------
	// Input handlers
	// -------------
	const handleClickInput = (offset = 0) => {
		const charIndex = inputValue.reduce((s, t) => s + (t.value.length || 0), 0) + offset;
		setCursorIndex(charIndex);
		if (inputRef.current) moveCursor(inputRef.current, charIndex);
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
		setCursorIndex((prev) => Math.max(0, prev - 1))
	}

	const handleKeyBoardEventInput = (e: KeyboardEvent<HTMLDivElement>) => {

		if (e.key.toLowerCase() === 'enter') {
			e.preventDefault();
			handleSubmit(onSubmit)();
			return;
		} else if (e.key.toLowerCase() === 'backspace') {
			if (inputValue.length === 0) return;
			e.preventDefault();
			handleEraser();
			return;
		} else if (e.key.toLowerCase() === 'arrowleft') {
			e.preventDefault();
			setCursorIndex(prev => Math.max(prev - 1, 0));
			return;
		} else if (e.key.toLowerCase() === 'arrowright') {
			e.preventDefault();
			const totalChars = inputValue.reduce((s, t) => s + (t.value.length || 0), 0);
			setCursorIndex(prev => Math.min(prev + 1, totalChars));
			return;
		}
		notationModeCallback(e, e.key);
	}

	// calcula índice absoluto de caracteres até o token clicado e move o cursor
	const handleTokenClick = (event: MouseEvent, tokenIndex: number, offset = 0) => {
		event.preventDefault();
		event.stopPropagation();

		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect(); // mede a largura real
		const clickX = event.clientX - rect.left; // posição do evento clique

		// const tokenValue = inputValue[tokenIndex]?.value ?? "";
		const tokenLength = inputValue[tokenIndex].value.length;  // tamanho do valor do token

		// soma de caracteres até o token clicado
		const baseIndex = inputValue
			.slice(0, tokenIndex)
			.reduce((s, t) => s + (t.value.length || 0), 0) + offset;

		// calcular posição aproximada dentro do token com proporção
		const proportion = rect.width > 0 ? Math.max(0, Math.min(1, clickX / rect.width)) : 0;
		const insideChar = Math.round(proportion * tokenLength); // 0..tokenLength

		const charIndex = baseIndex + insideChar;
		setCursorIndex(charIndex);

		if (inputRef.current) {
			moveCursor(inputRef.current, charIndex);
			inputRef.current.focus();
		}
	}

	const handleUndo = () => {
		if (history.length === 0) return;
		const historyCopy = [...history];  // Faz uma cópia do histórico atual
		if (historyCopy.length === 0) return; // Se não houver histórico, não faz nada
		const last = historyCopy.pop()!; // Remove o último estado do histórico e obtém ele ("!" garante que não é undefined)
		setInputValue(last.tokens.map(t => ({ ...t }))); // Atualiza o estado do input e do cursor
		setCursorIndex(last.cursor);
		setHistory(historyCopy);  // Atualiza o histórico sem o último estado
	}

	const handleModeControl = (mode: ScientificNotationMode) => {
		if (mode === 'sub') {
			if(notationMode === 'sub') {
				setNotationMode('normal')
			} else {
				setNotationMode('sub');
			}
			inputRef.current?.focus();
		} else if (mode === 'sup') {
			if(notationMode === 'sup') {
				setNotationMode('normal')
			} else {
				setNotationMode('sup');
			}
			inputRef.current?.focus();
		} else if (mode === 'scientific') { // se a notação científica estiver ativa
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

	const insertNegativeExponent1 = () => {
        inputRef.current?.focus();  // foca o input
        
        // cria token direto como sup
        const rawIndex = getCursorIndex(inputRef.current!);
        const { tokens, inserted } = calculatorInputHandler("sup", "-1", inputValue, rawIndex);
        
        pushHistory(); // salva snapshot
        setInputValue(tokens);
        setCursorIndex(rawIndex + inserted);
    };

	const notationModeCallback = (event: React.KeyboardEvent | React.MouseEvent<HTMLButtonElement>, newValue: string) => {
		event.preventDefault();
		const mathFunctions = ["mod", "cos", "sin", "tan", "cosh", "sinh", "tanh", "arg", "log", "ln", "re", "im", "conj", "abs", "factor"];
		const validCharRegex = /^[0-9i!÷%^()+{}\[\]<>πe,.\u221A×?~\-\s+]+$/; // aceita um ou mais caracteres
		if (!(validCharRegex.test(newValue) || mathFunctions.includes(newValue.toLowerCase()))) return;

		const rawIndex = getCursorIndex(inputRef.current!);// posição real do cursor
		const totalChars = inputValue.reduce((s, t) => s + (t.value?.length || 0), 0); // calcula quantos caracteres existem atualmente em inputValue
		const currentCursorIndex = Math.min(rawIndex, totalChars); // garante que o cursor não ultrapasse o total de caracteres

		const { tokens, inserted } = calculatorInputHandler(notationMode, newValue, inputValue, currentCursorIndex); // Chama a função que insere o novo valor respeitando o tipo de notação
		pushHistory();// Salva o estado atual no histórico antes da alteração
		setInputValue(tokens);
		setCursorIndex(currentCursorIndex + inserted); // Ajusta o cursor para a posição correta depois da inserção
	};

	const pushHistory = (tokens = inputValue, cursor = cursorIndex) => {
		const copy = tokens.map(t => ({ ...t }));
		setHistory(prev => {
			const last = prev[prev.length - 1];
			if (last && tokensEqual(last.tokens, copy) && last.cursor === cursor) return prev;
			return [...prev, { tokens: copy, cursor }]
		})
	}

	
	useEffect(() => {
		// Verifica se o div referenciado existe. Sem isso, tentar manipular o DOM daria erro.
		if (inputRef.current) {
			const totalChars = inputValue.reduce((s, t) => s + (t.value?.length || 0), 0);
			const safeIndex = Math.min(cursorIndex, totalChars);
			moveCursor(inputRef.current, safeIndex);
		}
	}, [cursorIndex, inputValue]);


	useEffect(() => {
		form.setValue("expression", inputValue, { shouldValidate: true });
	}, [form, inputValue]);

	return { form, handleReset, handleSubmit, onSubmit, screen, calcError, history, setHistory, notationMode, setNotationMode, inputRef, results, curResult, inputValue, cursorIndex, setInputValue, setCursorIndex, insertNegativeExponent1, handleClickInput, handleEraser, handleModeControl, handleTokenClick, notationModeCallback, pushHistory, handleKeyBoardEventInput, handleUndo }
}

export type ScientificPageController = ReturnType<typeof useScientificPageController>