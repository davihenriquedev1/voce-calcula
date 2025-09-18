export const getCursorIndex = (element: HTMLElement): number => {
    const sel = window.getSelection();
    if (!sel || !sel.focusNode) return 0;

    let index = 0;
    let node = sel.focusNode;
    let offset = sel.focusOffset;

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
    while (walker.nextNode()) {
        if (walker.currentNode === node) {
            index += offset;
            break;
        }
        index += walker.currentNode.textContent?.length || 0;
    }

    return index;
};
