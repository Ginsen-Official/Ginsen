const MAX_FILES = 20;
const MAX_SIZE = 10 * 1024 * 1024;

let pdfFiles = [];

const pdfInput =
document.getElementById(
"pdf-input"
);

const pdfList =
document.getElementById(
"pdf-list"
);

const mergeBtn =
document.getElementById(
"merge-btn"
);

pdfInput.addEventListener(
"change",
handleFiles
);

function handleFiles(event){

    const files =
    Array.from(
    event.target.files
    );

    files.forEach(file=>{

        const valid =

        file.type ===
        "application/pdf"

        &&

        file.size <=
        MAX_SIZE;

        pdfFiles.push({

            file,
            valid

        });

    });

    if(pdfFiles.length >
    MAX_FILES){

        pdfFiles =
        pdfFiles.slice(
        0,
        MAX_FILES
        );
    }

    renderFiles();
}

function renderFiles(){

    if(pdfFiles.length === 0){

        pdfList.innerHTML =
        "No PDFs selected.";

        mergeBtn.disabled =
        true;

        return;
    }

    pdfList.innerHTML = "";

    pdfFiles.forEach(
    (item,index)=>{

        const card =
        document.createElement(
        "div"
        );

        card.className =

        item.valid

        ?

        "pdf-card pdf-valid"

        :

        "pdf-card pdf-invalid";

        card.innerHTML =

        `
        <div class="pdf-name">

        ${item.valid ? "✓" : "✗"}

        ${item.file.name}

        </div>

        <div class="pdf-meta">

        ${(
        item.file.size /
        1024 /
        1024
        ).toFixed(2)}

        MB

        ${
        item.valid

        ?

        ""

        :

        "<br>Maximum size is 10 MB"
        }

        </div>

        <div class="pdf-actions">

        <button
        class="up-btn"
        onclick="moveUp(${index})">

        ↑ Move Up

        </button>

        <button
        class="down-btn"
        onclick="moveDown(${index})">

        ↓ Move Down

        </button>

        <button
        class="remove-btn"
        onclick="removePdf(${index})">

        Remove

        </button>

        </div>
        `;

        pdfList.appendChild(
        card
        );
    });

    const validCount =

    pdfFiles.filter(
    f=>f.valid
    ).length;

    mergeBtn.disabled =
    validCount === 0;
}

function moveUp(index){

    if(index === 0){
        return;
    }

    [
    pdfFiles[index-1],
    pdfFiles[index]
    ]

    =

    [
    pdfFiles[index],
    pdfFiles[index-1]
    ];

    renderFiles();
}

function moveDown(index){

    if(
    index ===
    pdfFiles.length - 1
    ){
        return;
    }

    [
    pdfFiles[index+1],
    pdfFiles[index]
    ]

    =

    [
    pdfFiles[index],
    pdfFiles[index+1]
    ];

    renderFiles();
}

function removePdf(index){

    pdfFiles.splice(
    index,
    1
    );

    renderFiles();
}

mergeBtn.addEventListener(
"click",
mergePDFs
);

async function mergePDFs(){

    const validFiles =

    pdfFiles.filter(
    item => item.valid
    );

    if(validFiles.length === 0){
        return;
    }

    try{

        mergeBtn.disabled = true;

        mergeBtn.textContent =
        "Merging...";

        const mergedPdf =

        await PDFLib.PDFDocument
        .create();

        for(const item of validFiles){

            const bytes =

            await item.file
            .arrayBuffer();

            const pdf =

            await PDFLib.PDFDocument
            .load(bytes);

            const pages =

            await mergedPdf.copyPages(
                pdf,
                pdf.getPageIndices()
            );

            pages.forEach(page=>{

                mergedPdf.addPage(
                page
                );

            });

        }

        const mergedBytes =

        await mergedPdf.save();

        const blob =

        new Blob(
        [mergedBytes],
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

        document
        .getElementById(
        "output-area"
        )
        .innerHTML =

        `
        <p>

        Output Ready

        </p>

        <br>

        <p>

        Size:
        ${sizeMB} MB

        </p>

        <br>

        <a
        href="${url}"
        download="ginsen-merged.pdf"
        class="suggest-btn">

        Download PDF

        </a>
        `;

    }
    catch(error){

        console.error(
        error
        );

        document
        .getElementById(
        "output-area"
        )
        .innerHTML =

        "Unable to merge PDFs.";

    }
    finally{

        mergeBtn.disabled =
        false;

        mergeBtn.textContent =
        "Merge PDFs";

    }
}