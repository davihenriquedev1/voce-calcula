export const moveCursor = (inputElement: HTMLElement, index: number) => {

    const rangeTextRep = document.createRange(); // instância de um objeto Range que é usado para representar uma seleção de texto no documento
    const selection = window.getSelection(); // obtém a seleção atual (que pode conter um cursor de texto) 

    if (!selection) return;

    let charCount = 0;
    let nodeToFocus: Node | null = null;
    let offset = 0;

    const walker = document.createTreeWalker(inputElement, NodeFilter.SHOW_TEXT, null);

    while (walker.nextNode()) {
        const node = walker.currentNode;
        const nodeLength = node.textContent?.length || 0;

        if (charCount + nodeLength >= index) {
            nodeToFocus = node;
            offset = index - charCount;
            break;
        }

        charCount += nodeLength;
    }

    if (nodeToFocus) {
        rangeTextRep.setStart(nodeToFocus, offset); // define o ponto de partida do range. coloque o cursor após o nó definido
        rangeTextRep.collapse(true); // Colapsa o Range para que ele não selecione nenhum texto. Ao passar true como argumento, você está indicando que deseja que o cursor fique no ponto de início do Range
        selection?.removeAllRanges(); // Remove todas as seleções (inclusive o cursor) da janela atual
        selection?.addRange(rangeTextRep); // Adiciona o Range que foi criado (e colapsado) à seleção atual. Isso efetivamente posiciona o cursor
        inputElement.focus();
    }
}