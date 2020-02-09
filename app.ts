document.addEventListener('DOMContentLoaded', main);

const getEl = (id: string) => document.getElementById(id)!;

let source1isSet = false;
let source2isSet = false;
let laid = false;

function main() {
    editableOnChange(getEl('source1'), async () => {
        source1isSet = true;
        if (source1isSet && source2isSet) {
            lay();
        }
    });
    editableOnChange(getEl('source2'), async () => {
        source2isSet = true;
        if (source1isSet && source2isSet) {
            lay();
        }
    });
}

function editableOnChange(el: HTMLElement, action: (el: Element)=>void) {
    let old = el.innerHTML;
    let check = (e: Event) => {
        const newHtml = (e.target as Element).innerHTML;
        if (newHtml != old) {
            old = newHtml;
            action(e.target as Element);
        }
    };
    el.onblur = check;
    el.onkeyup = check;
    el.onpaste = check;
    el.onmouseup = check;
    console.log(el);
}

let paragraphs: Node[][][] = [];

function lay() {
    console.log('lay');
    paragraphs = [
        splitIntoFragments(getEl('source1')),
        splitIntoFragments(getEl('source2')),
    ];
    render();
}

function render() {
    document.querySelectorAll('.text-row').forEach(
        (e: Element) => e.parentNode!.removeChild(e));
    const table = document.querySelector('table.main')!;
    for (let i = 0; i < Math.max(paragraphs[0].length, paragraphs[1].length); i++) {
        const row = table.appendChild(document.createElement('tr'));
        row.classList.add('text-row');
        for (let j = 0; j < 2; j++) {
            const p = i < paragraphs[j].length ? paragraphs[j][i] : [];
            const td = row.appendChild(document.createElement('td'));
            if (i > 0) {
                const mergeUpBtn = td.appendChild(document.createElement('button'));
                mergeUpBtn.classList.add('merge-up');
                mergeUpBtn.textContent = '⇧';
                mergeUpBtn.onclick = mergeUp;
            }
            td.setAttribute('data-col', ''+j);
            td.setAttribute('data-row', ''+i);
            td.setAttribute('contenteditable', 'true');
            td.onkeyup = maybeSplit;
            p.forEach(n => td.appendChild(n.cloneNode()));
        }
    }
}

function mergeUp(ev: Event) {
    const btn = ev.target as HTMLElement;
    const td = btn.parentNode! as HTMLElement;
    const i = parseInt(td.getAttribute('data-row')!);
    const j = parseInt(td.getAttribute('data-col')!);
    paragraphs[j][i-1] = paragraphs[j][i-1].concat(paragraphs[j][i]);
    paragraphs[j].splice(i, 1);
    render();
}

function maybeSplit(ev: Event) {
    const td = ev.target as HTMLElement;
    const split = td.querySelectorAll('p, div');
    if (split.length > 0) {
        const i = parseInt(td.getAttribute('data-row')!);
        const j = parseInt(td.getAttribute('data-col')!);
        paragraphs[j][i] = Array.from(split[0].childNodes);
        paragraphs[j].splice(i+1, 0, Array.from(split[1].childNodes));
        render();
    }
}

const blockLevelEls = new Set(['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'dl', 'pre', 'hr', 'blockquote', 'address', 'br']);

function splitIntoFragments(el: HTMLElement): Node[][] {
    // TODO: best effort preservation of non-text nodes
    // TODO: smarter segmentation
    let out: Node[][] = [];
    let accumulator: Node[] = [];
    let walker = (el: HTMLElement) => {
        for (const n of el.childNodes) {
            if (n.nodeType == Node.TEXT_NODE) {
                accumulator.push(n);
            }
            if (n.nodeType == Node.ELEMENT_NODE) {
                if (blockLevelEls.has((n as HTMLElement).tagName.toLowerCase())) {
                    if (accumulator.length) {
                        out.push(accumulator);
                        accumulator = [];
                    }
                }
                walker(n as HTMLElement);
            }
        }
    };
    walker(el);
    if (accumulator.length) {
        out.push(accumulator);
        accumulator = [];
    }
    return out;
}
