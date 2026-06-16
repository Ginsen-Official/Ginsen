<script>

let sentences = [];
let currentIndex = 0;
let paused = false;

let playbackSeconds = 0;
let playbackInterval = null;

const STORAGE_KEY =
"speech_reader_progress";

const THEME_KEY =
"speech_reader_theme";

let currentUtterance = null;

function formatTime(totalSeconds){

    const hrs =
    String(
    Math.floor(totalSeconds/3600)
    ).padStart(2,"0");

    const mins =
    String(
    Math.floor(
    (totalSeconds%3600)/60
    )
    ).padStart(2,"0");

    const secs =
    String(
    totalSeconds%60
    ).padStart(2,"0");

    return `${hrs}:${mins}:${secs}`;
}

function updatePlaybackDisplay(){

    document.getElementById(
    "playback-duration"
    ).textContent =
    formatTime(playbackSeconds);
}

function startPlaybackTimer(){

    if(playbackInterval) return;

    playbackInterval =
    setInterval(()=>{

        playbackSeconds++;

        updatePlaybackDisplay();

        saveProgress();

    },1000);
}

function stopPlaybackTimer(){

    clearInterval(
    playbackInterval
    );

    playbackInterval = null;
}

function calculateEstimatedDuration(){
const text =
    document.getElementById(
    "textInput"
    ).value.trim();

    if(!text){

        document.getElementById(
        "estimated-duration"
        ).textContent =
        "00:00:00";

        return;
    }

    const words =
    text.split(/\s+/).length;

    const totalSeconds =
    Math.ceil(
        (words / 160) * 60
    );

    document.getElementById(
    "estimated-duration"
    ).textContent =
    formatTime(totalSeconds);
}

function saveProgress(){

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({

            text:
            document.getElementById(
            "textInput"
            ).value,

            currentIndex:
            currentIndex,

            paused:
            paused,

            playbackSeconds:
            playbackSeconds
        })
    );
}

function splitSentences(text){

    return text.match(
        /[^.!?]+[.!?]+|[^.!?]+$/g
    ) || [];
}

function prepareDisplay(){

    const text =
    document.getElementById(
    "textInput"
    ).value.trim();

    sentences =
    splitSentences(text);

    calculateEstimatedDuration();

    const display =
    document.getElementById(
    "display"
    );

    display.innerHTML = "";

    sentences.forEach(
    (sentence,index)=>{

        const span =
        document.createElement(
        "span"
        );

        span.id =
        "s" + index;

        span.dataset.index =
        index;

        span.className =
        "sentence future";

        span.textContent =
        sentence.trim();

        span.addEventListener(
        "dblclick",
        ()=>{

            speechSynthesis.cancel();

            stopPlaybackTimer();

            currentIndex =
            parseInt(
            span.dataset.index
            );

            paused = false;

            updateHighlight();

            startPlaybackTimer();

            speakCurrentSentence();

            saveProgress();
        });

        display.appendChild(
        span
        );
    });
}

function updateHighlight(){

    sentences.forEach(
    (_,i)=>{

        const el =
        document.getElementById(
        "s"+i
        );

        if(!el) return;

        el.className =
        "sentence";

        if(i < currentIndex){

            el.classList.add(
            "read"
            );

        }else if(
            i === currentIndex
        ){

            el.classList.add(
            "active"
            );

            setTimeout(()=>{

                el.scrollIntoView({

                    behavior:
                    "smooth",

                    block:
                    "center",

                    inline:
                    "nearest"
                });

            },100);

        }else{

            el.classList.add(
            "future"
            );
        }
    });

    saveProgress();
}

function toggleTheme(){

    document.body
    .classList.toggle(
    "dark-mode"
    );

    const isDark =
    document.body
    .classList.contains(
    "dark-mode"
    );

    document.getElementById(
    "theme-toggle"
    ).textContent =
    isDark
    ? "☀️"
    : "🌙";

    localStorage.setItem(
        THEME_KEY,
        isDark
        ? "dark"
        : "light"
    );
}

function loadTheme(){

    const savedTheme =
    localStorage.getItem(
    THEME_KEY
    );

    if(savedTheme === "dark"){

        document.body
        .classList.add(
        "dark-mode"
        );

        document.getElementById(
        "theme-toggle"
        ).textContent =
        "☀️";
    }
}

function speakCurrentSentence(){

    if(
    currentIndex >=
    sentences.length
    ){

        stopPlaybackTimer();

        return;
    }

    updateHighlight();

    currentUtterance =
    new SpeechSynthesisUtterance(

        sentences[
        currentIndex
        ]

    );

    currentUtterance.onend =
    ()=>{

        if(paused){
            return;
        }

        currentIndex++;

        saveProgress();

        if(
        currentIndex <
        sentences.length
        ){

            speakCurrentSentence();

        }else{

            stopPlaybackTimer();
        }
    };

    speechSynthesis.speak(
        currentUtterance
    );
}

function loadProgress(){
const saved =
    localStorage.getItem(
    STORAGE_KEY
    );

    if(!saved) return;

    const data =
    JSON.parse(saved);

    document.getElementById(
    "textInput"
    ).value =
    data.text || "";

    currentIndex =
    data.currentIndex || 0;

    paused =
    data.paused || false;

    playbackSeconds =
    data.playbackSeconds || 0;

    updatePlaybackDisplay();

    prepareDisplay();

    updateHighlight();
}

function startReading(){

    speechSynthesis.cancel();

    stopPlaybackTimer();

    playbackSeconds = 0;

    updatePlaybackDisplay();

    currentIndex = 0;

    paused = false;

    prepareDisplay();

    if(
    sentences.length === 0
    ){
        return;
    }

    startPlaybackTimer();

    speakCurrentSentence();
}

function pauseReading(){

    if(
    speechSynthesis.speaking
    ){

        speechSynthesis.pause();

        paused = true;

        stopPlaybackTimer();

        saveProgress();
    }
}

function resumeReading(){

    if(
    speechSynthesis.paused
    ){

        paused = false;

        speechSynthesis.resume();

        startPlaybackTimer();

        saveProgress();

        return;
    }

    if(
    sentences.length === 0
    ){

        prepareDisplay();

        if(
        sentences.length === 0
        ){
            return;
        }
    }

    paused = false;

    startPlaybackTimer();

    speakCurrentSentence();

    saveProgress();
}

function stopReading(){

    speechSynthesis.cancel();

    paused = true;

    currentIndex = 0;

    playbackSeconds = 0;

    updatePlaybackDisplay();

    stopPlaybackTimer();

    updateHighlight();

    saveProgress();
}

document
.getElementById(
"txt-upload"
)
.value = "";{

    speechSynthesis.cancel();

    stopPlaybackTimer();

    localStorage.removeItem(
    STORAGE_KEY
    );

    document.getElementById(
    "textInput"
    ).value = "";

    document.getElementById(
    "display"
    ).innerHTML = "";

    document.getElementById(
    "estimated-duration"
    ).textContent =
    "00:00:00";

    document.getElementById(
    "playback-duration"
    ).textContent =
    "00:00:00";

    sentences = [];

    currentIndex = 0;

    paused = false;

    playbackSeconds = 0;
}

document
.getElementById(
"textInput"
)
.addEventListener(
"input",
()=>{

    calculateEstimatedDuration();

    saveProgress();
}
);


loadProgress();

calculateEstimatedDuration();


document
.getElementById(
"txt-upload"
)
.addEventListener(
"change",
function(event){

    const file =
    event.target.files[0];

    if(!file){
        return;
    }

    const reader =
    new FileReader();

    reader.onload =
    function(e){

        document
        .getElementById(
        "textInput"
        )
        .value =
        e.target.result;

        calculateEstimatedDuration();

        saveProgress();

    };

    reader.readAsText(file);

});
</script>