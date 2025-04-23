const params = new URLSearchParams(window.location.search);
const bot = params.get('bot') ?? "hospital";
const withSound = params.get('tts') === "true";

const chatArea = document.getElementById('chatArea');
const chatContent = document.getElementById('chatContent');
const bgVideo = document.getElementById('bgVideo');
let videoPlayed = false;

document.title = "Tanya Saya";

// Function to speak text
function speakText(text) {
    // Cancel any ongoing speech first to avoid overlap if clicked quickly
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID'; // Set language to Indonesian
    // Optional: You can try selecting a specific voice if needed
    // const voices = speechSynthesis.getVoices();
    // const indonesianVoice = voices.find(voice => voice.lang === 'id-ID');
    // if (indonesianVoice) {
    //   utterance.voice = indonesianVoice;
    // }

    if (withSound) {
        speechSynthesis.speak(utterance);
    }
}

// Function to add a bot message (bubble + speech)
function addBotMessage(text) {
    const botBubble = document.createElement('div');
    botBubble.className = 'bubble bot';
    botBubble.innerText = text;
    chatContent.appendChild(botBubble);
    chatArea.scrollTop = chatArea.scrollHeight; // Scroll after adding
    speakText(text); // Speak the text
    videoPlayed = false;
}

function addRecommendationButton(option) {
    const buttonRow = document.querySelector('.button-row');
    const button = document.createElement('button');
    button.classList.add('chat-button');
    button.innerText = option;
    button.onclick = () => handleClick(option);
    buttonRow.appendChild(button);
}

window.onload = () => {
    sendChat("halo")
    bgVideo.src = `/assets/video/background-${bot}.mp4`;
};

function handleClick(option) {
    if (!videoPlayed) {
        bgVideo.play().catch(e => console.log("Autoplay blocked:", e));
        bgVideo.playsInline = true;
        videoPlayed = true;
        // Try speaking initial message again on first interaction if needed
        // This helps if the onload speech was blocked.
        if (speechSynthesis.speaking === false && chatContent.children.length === 1) {
            speakText(chatContent.children[0].innerText);
        }
    }

    const userBubble = document.createElement('div');
    userBubble.className = 'bubble user';
    userBubble.innerText = option;
    chatContent.appendChild(userBubble);
    chatArea.scrollTop = chatArea.scrollHeight; // Scroll after adding user bubble
    sendChat(option);
}

// Optional: Ensure voices are loaded (can sometimes help)
speechSynthesis.onvoiceschanged = () => {
    // console.log("Voices loaded:", speechSynthesis.getVoices());
};

async function sendChat(query) {
    const url = "https://1vr08zb0-4848.asse.devtunnels.ms/chat"
    // const url = "http://localhost:4848/chat"
    const lang = 'id-ID'
    const projectBot = bot == "hospital" ? "calm-cove-257517" : "security-txkx"
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "ProjectBot": projectBot,
            "Lang": lang
        },
        body: JSON.stringify({
            query: query
        })
    })
    .then((response) => response.json())
    .then((json) => {
        const data = json.data
        if (data && Array.isArray(data)) { // Check if data is valid
            data.forEach(chats => {
                const messageType = chats.type
                if (chats && typeof chats.value === 'string' && messageType === 'text') { // Check chat item validity
                    addBotMessage(chats.value);
                } else if (chats && messageType === 'button') {
                    clearRecommendationButton()
                    const recommendations = chats.value
                    recommendations.forEach(recommendation => {
                        addRecommendationButton(recommendation)
                    })
                } else if (chats && messageType === 'table') {
                    renderTable(chats.value)
                } else {
                    console.warn("Received invalid chat item:", chats);
                }
            });
        } else {
            console.warn("Received invalid data structure:", json);
            addBotMessage("Maaf, saya menerima respons yang tidak terduga."); // Inform user
        }
    })
    .catch(error => { // Add error handling
        console.error("Error fetching or processing chat response:", error);
        addBotMessage("Maaf, terjadi kesalahan saat memproses permintaan Anda.");
        // Optionally clear buttons even on error, if desired
        // if (buttonRow) buttonRow.innerHTML = '';
    });
}

function renderTable(data) {
    if (!data || !Array.isArray(data.headers) || !Array.isArray(data.rows)) {
        console.error("Invalid table data received:", data);
        return; // Don't render if data is malformed
    }

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'bubble bot table-container'; // Add class for potential specific styling
    tableWrapper.style.padding = '0'; // Remove bubble padding for the table wrapper
    tableWrapper.style.backgroundColor = 'transparent'; // Make wrapper transparent
    tableWrapper.style.maxWidth = '100%'; // Allow table to be wider than normal bubbles

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    // table.style.border = '1px solid #ccc'; // Use border on cells/header instead?
    table.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; // Slightly more opaque
    table.style.color = '#333'; // Darker text for better contrast
    table.style.borderRadius = '8px'; // Rounded corners for the table itself
    table.style.overflow = 'hidden'; // Ensure content respects border radius
    table.style.marginTop = '0px'; // No extra margin needed if wrapper has none
    table.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'; // Subtle shadow

    // Create header
    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    data.headers.forEach(headerText => {
        const th = document.createElement('th');
        th.innerText = headerText;
        th.style.padding = '10px 12px';
        th.style.backgroundColor = 'rgba(30, 98, 208, 0.85)'; // Match bot bubble color slightly opaque
        th.style.color = '#fff';
        th.style.textAlign = 'left';
        th.style.borderBottom = '2px solid rgba(0, 0, 0, 0.1)';
        headerRow.appendChild(th);
    });

    // Create body
    const tbody = table.createTBody();
    data.rows.forEach(rowData => {
        const tr = tbody.insertRow();
        rowData.forEach(cellText => {
            const td = tr.insertCell();
            td.innerText = cellText;
            td.style.padding = '9px 12px';
            td.style.borderTop = '1px solid #eee'; // Lighter internal border
            td.style.textAlign = 'left';
        });
        // Add hover effect to rows
        tr.style.transition = 'background-color 0.2s ease';
        tr.onmouseover = () => tr.style.backgroundColor = 'rgba(0, 0, 0, 0.03)';
        tr.onmouseout = () => tr.style.backgroundColor = 'transparent';
    });

    tableWrapper.appendChild(table);
    chatContent.appendChild(tableWrapper);
    chatArea.scrollTop = chatArea.scrollHeight; // Scroll after adding table
}

function clearRecommendationButton() {
    const buttonRow = document.querySelector('.button-row');

    if (buttonRow) {
        buttonRow.innerHTML = '';
    }
}