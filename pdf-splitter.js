const MAX_SIZE =
10 * 1024 * 1024;

const pdfInput =
document.getElementById(
"pdf-input"
);

const splitBtn =
document.getElementById(
"split-btn"
);

const outputArea =
document.getElementById(
"output-area"
);

const thumbnailGrid =
document.getElementById(
"thumbnail-grid"
);

const previewModal =
document.getElementById(
"preview-modal"
);

const previewCanvas =
document.getElementById(
"preview-canvas"
);

const closePreview =
document.getElementById(
"close-preview"
);

let loadedPdf = null;

let originalPdfBytes = null;

let selectedPages =
new Set();
let selectedPages =
new Set();

pdfjsLib.GlobalWorkerOptions
.workerSrc =
"assets/pdfjs/pdf.worker.min.js";

pdfInput.addEventListener(
"change",
loadPDF
);

async function loadPDF(event){

    const file =
    event.target.files[0];

    if(!file){
        return;
    }

    if(file.size > MAX_SIZE){

        outputArea.innerHTML =
        "Maximum PDF size is 10 MB.";

        return;
    }

    const bytes =
await file.arrayBuffer();

originalPdfBytes =
bytes;

    loadedPdf =
    await pdfjsLib.getDocument({
        data:bytes
    }).promise;

    renderThumbnails();
    function toggleSelection(
pageNumber,
card
){

    if(
    selectedPages.has(
    pageNumber
    )
    ){

        selectedPages.delete(
        pageNumber
        );

        card.classList.remove(
        "selected"
        );

        const badge =
        card.querySelector(
        ".selection-badge"
        );

        if(badge){
            badge.remove();
        }

    }
    else{

        selectedPages.add(
        pageNumber
        );

        card.classList.add(
        "selected"
        );

        const badge =
        document.createElement(
        "div"
        );

        badge.className =
        "selection-badge";

        badge.textContent =
        "✓ Selected";

        card.appendChild(
        badge
        );
    }

    updateRangeInput();
}

    splitBtn.disabled =
    false;
}

async function renderThumbnails(){

    thumbnailGrid.innerHTML = "";

    const totalPages =
    loadedPdf.numPages;

    for(
        let pageNumber = 1;
        pageNumber <= totalPages;
        pageNumber++
    ){

        const page =
        await loadedPdf.getPage(
        pageNumber
        );

        const viewport =
        page.getViewport({
            scale:0.4
        });

        const canvas =
        document.createElement(
        "canvas"
        );

        canvas.className =
        "thumbnail-canvas";

        canvas.width =
        viewport.width;

        canvas.height =
        viewport.height;

        const ctx =
        canvas.getContext(
        "2d"
        );

        await page.render({

            canvasContext:ctx,

            viewport

        }).promise;

        const card =
        document.createElement(
        "div"
        );

        card.className =
        "thumbnail-card";

        card.innerHTML =

        `
        <div class="page-number">
        Page ${pageNumber}
        </div>
        `;

        card.prepend(canvas);

        card.addEventListener(
"click",
()=>{

    toggleSelection(
    pageNumber,
    card
    );
    const pageRangeInput =
document.getElementById(
"page-range"
);

pageRangeInput.addEventListener(
"input",
parsePageRanges
);

function parsePageRanges(){
function refreshSelectionUI(){

    const cards =

    document.querySelectorAll(
    ".thumbnail-card"
    );

    cards.forEach(
    card=>{

        const text =
        card.querySelector(
        ".page-number"
        )
        .textContent;

        const pageNumber =

        Number(
        text.replace(
        "Page ",
        ""
        )
        );

        card.classList.remove(
        "selected"
        );

        const oldBadge =
        card.querySelector(
        ".selection-badge"
        );

        if(oldBadge){
            oldBadge.remove();
        }

        if(
        selectedPages.has(
        pageNumber
        )
        ){

            card.classList.add(
            "selected"
            );

            const badge =
            document.createElement(
            "div"
            );

            badge.className =
            "selection-badge";

            badge.textContent =
            "✓ Selected";

            card.appendChild(
            badge
            );
        }
    });
}

    selectedPages.clear();

    const value =
    pageRangeInput.value
    .trim();

    if(!value){

        renderThumbnails();

        return;
    }

    const parts =
    value.split(",");

    parts.forEach(part=>{

        part = part.trim();

        if(
        part.includes("-")
        ){

            const
            [start,end]
            =
            part
            .split("-")
            .map(Number);

            for(
            let i=start;
            i<=end;
            i++
            ){

                selectedPages.add(
                i
                );
            }
        }
        else{

            const page =
            Number(part);

            if(page){

                selectedPages.add(
                page
                );
            }
        }
    });

    refreshSelectionUI();
    function updateRangeInput(){

    const pages =

    Array.from(
    selectedPages
    )
    .sort(
    (a,b)=>a-b
    );

    pageRangeInput.value =

    pages.join(",");
}
}

});
        });

        thumbnailGrid
        .appendChild(card);
    }
}

async function openPreview(
pageNumber
){

    const page =
    await loadedPdf.getPage(
    pageNumber
    );

    const viewport =
    page.getViewport({
        scale:1.5
    });

    previewCanvas.width =
    viewport.width;

    previewCanvas.height =
    viewport.height;

    const ctx =
    previewCanvas.getContext(
    "2d"
    );

    await page.render({

        canvasContext:ctx,

        viewport

    }).promise;

    previewModal.style.display =
    "flex";
}

closePreview.addEventListener(
"click",
()=>{

    previewModal.style.display =
    "none";

});

splitBtn.addEventListener(
"click",
splitPDF
);

async function splitPDF(){

    if(
    selectedPages.size === 0
    ){

        outputArea.innerHTML =

        "Select at least one page.";

        return;
    }

    try{

        splitBtn.disabled =
        true;

        splitBtn.textContent =
        "Processing...";

        const sourcePdf =

        await PDFLib
        .PDFDocument
        .load(
        originalPdfBytes
        );

        const outputPdf =

        await PDFLib
        .PDFDocument
        .create();

        const pages =

        Array.from(
        selectedPages
        )
        .sort(
        (a,b)=>a-b
        );

        for(const pageNumber of pages){

            if(
            pageNumber < 1
            ||
            pageNumber >
            sourcePdf.getPageCount()
            ){
                continue;
            }

            const copiedPages =

            await outputPdf
            .copyPages(
                sourcePdf,
                [
                pageNumber - 1
                ]
            );

            outputPdf.addPage(
            copiedPages[0]
            );
        }

        const outputBytes =

        await outputPdf.save();

        const blob =

        new Blob(
        [outputBytes],
        {
            type:
            "application/pdf"
        });

        const url =

        URL.createObjectURL(
        blob
        );

        const sizeMB =

        (
        blob.size /
        1024 /
        1024
        )
        .toFixed(2);

        outputArea.innerHTML =

        `
        <h4>

        Output Ready

        </h4>

        <br>

        <p>

        Selected Pages:
        ${pages.join(", ")}

        </p>

        <br>

        <p>

        Size:
        ${sizeMB} MB

        </p>

        <br>

        <a
        href="${url}"
        download="ginsen-split.pdf"
        class="suggest-btn">

        Download PDF

        </a>
        `;
    }
    catch(error){

        console.error(
        error
        );

        outputArea.innerHTML =

        "Unable to split PDF.";

    }
    finally{

        splitBtn.disabled =
        false;

        splitBtn.textContent =
        "Split PDF";

    }
}