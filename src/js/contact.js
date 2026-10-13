
function loadMessages() {
    const raw = localStorage.getItem(STORAGE_KEY);
    try {
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

function saveMessage(obj) {
    const list = loadMessages();
    list.unshift(obj); // newest first
    const trimmed = list.slice(0, 20); // keep last 20
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    renderSavedMessages();
}

function deleteMessage(id) {
    const list = loadMessages().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    renderSavedMessages();
}

// --- Rendering (exclusively use template literals for output strings) ---
function renderSavedMessages() {
    let container = document.getElementById('savedMessages');
    if (!container) {
        container = document.createElement('section');
        container.id = 'savedMessages';
        container.className = 'contact-saved-messages';
        // insert after the form
        form.parentElement.insertBefore(container, form.nextSibling);
    }

    const msgs = loadMessages();

    if (msgs.length === 0) {
        container.innerHTML = `
                <h3>Recent Messages</h3>
                <p class="muted">No messages yet. Sent messages will appear here for quick reference.</p>
            `;
        return;
    }

    container.innerHTML = `
            <h3>Recent Messages (${msgs.length})</h3>
            <div class="messages-grid">
                ${msgs.map(m => `
                    <article class="message-card" data-id="${m.id}">
                        <header>
                            <strong>${m.name}</strong>
                            <small>${m.subject} • ${new Date(m.timestamp).toLocaleString()}</small>
                        </header>
                        <p class="msg-preview">${m.message.length > 140 ? `${m.message.slice(0, 140)}…` : m.message}</p>
                        <footer>
                            <span>${m.email}${m.phone ? ` • ${m.phone}` : ''}</span>
                            <button class="btn-view" data-id="${m.id}">View</button>
                            <button class="btn-delete" data-id="${m.id}">Delete</button>
                        </footer>
                    </article>
                `).join('')}
            </div>
        `;

    // attach event listeners (DOM interaction + events)
    container.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            const msg = loadMessages().find(x => x.id === id);
            if (!msg) return;
            const card = container.querySelector(`.message-card[data-id="${id}"]`);
            if (!card) return;
            card.innerHTML = `
                    <div class="message-details">
                        <header><strong>${msg.name}</strong> <small>${new Date(msg.timestamp).toLocaleString()}</small></header>
                        <p><strong>Subject:</strong> ${msg.subject}</p>
                        <p><strong>Email:</strong> ${msg.email}${msg.phone ? ` • ${msg.phone}` : ''}</p>
                        <p><strong>Subscribed:</strong> ${msg.subscribe ? 'Yes' : 'No'}</p>
                        <div class="full-message"><pre>${msg.message}</pre></div>
                        <footer><button class="btn-back" data-id="${id}">Back</button> <button class="btn-delete" data-id="${id}">Delete</button></footer>
                    </div>
                `;
            const backBtn = card.querySelector('.btn-back');
            backBtn.addEventListener('click', () => renderSavedMessages());
            card.querySelectorAll('.btn-delete').forEach(d => d.addEventListener('click', () => deleteMessage(id)));
        });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            if (!confirm('Delete this message?')) return;
            deleteMessage(id);
        });
    });
}

// --- Form submission handler (uses conditional branching, objects, arrays) ---
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const validName = validateField('name', nameInput);
    const validEmail = validateField('email', emailInput);
    const validPhone = validateField('phone', phoneInput);
    const validSubject = validateField('subject', subjectInput);
    const validMessage = validateField('message', messageInput);

    if (!(validName && validEmail && validPhone && validSubject && validMessage)) {
        successMessageEl.textContent = '';
        return;
    }

    const messageObj = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        subject: subjectInput.value,
        message: messageInput.value.trim(),
        subscribe: !!subscribeInput.checked,
        timestamp: new Date().toISOString()
    };

    saveMessage(messageObj);

    successMessageEl.innerHTML = `${messageObj.subscribe ? '✅ Subscribed & message saved.' : '✅ Message saved.'} Thank you, <strong>${messageObj.name}</strong>. We will respond to <strong>${messageObj.email}</strong>.`;

    form.reset();
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    setTimeout(() => { successMessageEl.textContent = ''; }, 6000);

    const saved = document.getElementById('savedMessages');
    if (saved) saved.scrollIntoView({ behavior: 'smooth' });
});

// --- Utility exposed for debugging or admin use ---
window.clearContactMessages = () => {
    if (!confirm('Clear all saved contact messages from localStorage?')) return;
    localStorage.removeItem(STORAGE_KEY);
    renderSavedMessages();
};