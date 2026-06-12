const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = "gsk_"; // Replace with your Groq API key
const MODEL = "llama-3.3-70b-versatile"; 

let conversations = [];
let currentConversation = null;

// --- Conversation Management ---
function createNewConversation() {
  const id = Date.now().toString();
  const convo = { id, title: "New chat", messages: [] };
  conversations.unshift(convo);
  currentConversation = convo;
  renderHistory();
  renderMessages();
  return convo;
}

function switchConversation(id) {
  currentConversation = conversations.find(c => c.id === id);
  renderHistory();
  renderMessages();
}

function renderHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  conversations.forEach(c => {
    const div = document.createElement("div");
    div.className = "history-item" + (currentConversation && c.id === currentConversation.id ? " active" : "");
    div.textContent = c.title;
    div.onclick = () => switchConversation(c.id);
    list.appendChild(div);
  });
}

function renderMessages() {
  const welcome = document.getElementById("welcomeScreen");
  const msgs = document.getElementById("messages");
  const convo = currentConversation;
  if (!convo || convo.messages.length === 0) {
    welcome.style.display = "flex";
    msgs.innerHTML = "";
    return;
  }
  welcome.style.display = "none";
  msgs.innerHTML = "";
  convo.messages.forEach(m => appendBubble(m.role, m.content, false));
  scrollToBottom();
}

// --- UI Helpers ---
function appendBubble(role, content, animate = true) {
  const welcome = document.getElementById("welcomeScreen");
  welcome.style.display = "none";

  const msgs = document.getElementById("messages");
  const div = document.createElement("div");
  div.className = `message ${role}`;
  if (!animate) div.style.animation = "none";

  const avatarText = role === "assistant"
    ? `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 7.5C3 5.3 5.2 3.5 8 3.5s5 1.8 5 4-2.2 4-5 4c-.6 0-1.2-.1-1.7-.3L3 12.5l.7-2C3.3 9.7 3 8.6 3 7.5z" fill="white"/></svg>`
    : "You";

  const bubbleContent = role === "assistant"
    ? (typeof marked !== "undefined" ? marked.parse(content) : escapeHtml(content).replace(/\n/g, "<br>"))
    : `<p>${escapeHtml(content)}</p>`;

  div.innerHTML = `
    <div class="avatar">${avatarText}</div>
    <div class="bubble">${bubbleContent}</div>
  `;
  msgs.appendChild(div);
  if (animate) scrollToBottom();
  return div;
}

function showTyping() {
  const msgs = document.getElementById("messages");
  const welcome = document.getElementById("welcomeScreen");
  welcome.style.display = "none";
  const div = document.createElement("div");
  div.className = "message assistant";
  div.id = "typingIndicator";
  div.innerHTML = `
    <div class="avatar"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 7.5C3 5.3 5.2 3.5 8 3.5s5 1.8 5 4-2.2 4-5 4c-.6 0-1.2-.1-1.7-.3L3 12.5l.7-2C3.3 9.7 3 8.6 3 7.5z" fill="white"/></svg></div>
    <div class="bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>
  `;
  msgs.appendChild(div);
  scrollToBottom();
}

function removeTyping() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

function scrollToBottom() {
  const container = document.getElementById("messagesContainer");
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function setLoading(loading) {
  const btn = document.getElementById("sendBtn");
  const input = document.getElementById("userInput");
  btn.disabled = loading;
  input.disabled = loading;
}

// --- Sending Messages ---
async function sendMessage() {
  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if (!text) return;

  if (!currentConversation) createNewConversation();

  input.value = "";
  autoResize(input);
  document.getElementById("sendBtn").disabled = true;

  currentConversation.messages.push({ role: "user", content: text });
  if (currentConversation.messages.length === 1) {
    currentConversation.title = text.slice(0, 40) + (text.length > 40 ? "…" : "");
    renderHistory();
  }

  appendBubble("user", text);
  showTyping();
  setLoading(true);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        messages: currentConversation.messages.map(m => ({ role: m.role, content: m.content }))
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `API error ${response.status}`);
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
    currentConversation.messages.push({ role: "assistant", content: reply });
    removeTyping();
    appendBubble("assistant", reply);
  } catch (err) {
    removeTyping();
    const errMsg = err.message.includes("YOUR_GROQ_API_KEY")
      ? "Please add your Groq API key in js/app.js (line 2)."
      : `Error: ${err.message}`;
    appendBubble("assistant", errMsg);
    currentConversation.messages.push({ role: "assistant", content: errMsg });
  } finally {
    setLoading(false);
    document.getElementById("userInput").focus();
    updateSendBtn();
  }
}

// --- Input helpers ---
function handleKeyDown(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (!document.getElementById("sendBtn").disabled) sendMessage();
  }
}

function autoResize(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 160) + "px";
  updateSendBtn();
}

function updateSendBtn() {
  const input = document.getElementById("userInput");
  const btn = document.getElementById("sendBtn");
  if (!input.disabled) btn.disabled = input.value.trim().length === 0;
}

function useSuggestion(el) {
  const input = document.getElementById("userInput");
  input.value = el.textContent;
  autoResize(input);
  input.focus();
}

// --- Init ---
document.getElementById("newChatBtn").onclick = () => {
  createNewConversation();
};

document.getElementById("userInput").addEventListener("input", updateSendBtn);
