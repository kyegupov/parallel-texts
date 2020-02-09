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

function lay() {
    console.log('lay');
    let para1 = splitIntoFragments(getEl('source1'));
    console.log(para1);
    let para2 = splitIntoFragments(getEl('source2'));
    document.querySelectorAll('.text-row').forEach(
        (e: Element) => e.parentNode!.removeChild(e));
    const table = document.querySelector('table.main')!;
    for (let i = 0; i < Math.max(para1.length, para2.length); i++) {
        console.log('lay row ' + i);
        const p1 = i < para1.length ? para1[i] : [];
        const p2 = i < para2.length ? para2[i] : [];
        const row = table.appendChild(document.createElement('tr'));
        row.classList.add('text-row');
        const td1 = row.appendChild(document.createElement('td'));
        const td2 = row.appendChild(document.createElement('td'));
        p1.forEach(n => td1.appendChild(n.cloneNode()));
        p2.forEach(n => td2.appendChild(n.cloneNode()));
    }
}

const blockLevelEls = new Set(['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'dl', 'pre', 'hr', 'blockquote', 'address', 'br']);

function splitIntoFragments(el: HTMLElement): Node[][] {
    // TODO: best effort preservation of non-text nodes
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
