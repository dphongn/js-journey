// ==========================================
// 1. KHỞI TẠO STATE & DOM
// ==========================================
let quests = []; // Mảng lưu trữ danh sách nhiệm vụ
let hp = 100;
const MAX_HP = 100;
let isPoisoned = false;
let poisonTimer = null;

// Lấy các con trỏ DOM (Chỉ khai báo 1 lần duy nhất)
const hpText = document.getElementById("hp-text");
const hpBarFill = document.getElementById("hp-bar-fill");
const btnAttack = document.getElementById("btn-attack");
const btnHeal = document.getElementById("btn-heal");
const btnPoison = document.getElementById("btn-poison");
const gameOverText = document.getElementById("game-over-text");
const statusEffect = document.getElementById("status-effect");
const skillDesc = document.getElementById("skill-desc");
const spellInput = document.getElementById("spell-input");
const questInput = document.getElementById("quest-input");
const btnAddQuest = document.getElementById("btn-add-quest");
const questList = document.getElementById("quest-list");
const battleLog = document.getElementById("battle-log"); // Thêm DOM cho Battle Log
// Lấy các con trỏ DOM của Modal
const statsModal = document.getElementById("stats-modal");
const btnOpenStats = document.getElementById("btn-open-stats");
const closeModalSpan = document.querySelector(".close-modal");


// Các thẻ hiển thị chỉ số bên trong Modal
const statHp = document.getElementById("stat-hp");
const statPoison = document.getElementById("stat-poison");
const statQuestsTotal = document.getElementById("stat-quests-total");
const statQuestsDone = document.getElementById("stat-quests-done");
const registerForm = document.getElementById("register-form");
const regName = document.getElementById("reg-name");
const regEmail = document.getElementById("reg-email");
const regCode = document.getElementById("reg-code");

const errName = document.getElementById("err-name");
const errEmail = document.getElementById("err-email");
const errCode = document.getElementById("err-code");
const btnFetchMonster = document.getElementById("btn-fetch-monster");

const loginForm = document.getElementById("login-form");
const loginName = document.getElementById("login-name");
const loginCode = document.getElementById("login-code");
// ==========================================
// 2. CÁC HÀM TIỆN ÍCH (Utilities)
// ==========================================

function getAuthHeader() {
    const token = localStorage.getItem('knight_token'); // Lấy token từ localStorage
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '' 
    }
}

// Sự kiện click sẽ gọi API
btnFetchMonster.addEventListener("click", function() {
    // 1. Gửi HTTP GET Request lên Server của chính mình
    fetch('/api/monster')
        .then(response => response.json()) // 2. Ép dữ liệu trả về thành JSON
        .then(data => {
            // 3. Xử lý dữ liệu nhận được (data chính là object selectedMonster từ Server)
            const questText = `Tiêu diệt ${data.name} (HP: ${data.hp} - Bậc: ${data.type})`;
            
            // Gọi hàm addQuest có sẵn để nhét vào danh sách nhiệm vụ
            addQuest(questText);
            writeLog(`Phát hiện quái vật mới từ Server: ${data.name}! 🦇`, "#a29bfe");
        })
        .catch(error => {
            console.error("Lỗi kết nối Server:", error);
            writeLog("Mất kết nối với máy chủ trinh sát!", "red");
        });
});

function writeLog(text, color = "white") {
    if (!battleLog) {
        console.log(text); // An toàn nếu HTML chưa có thẻ battle-log
        return;
    }
    const li = document.createElement('li');
    li.innerText = text;
    li.style.color = color;
    battleLog.appendChild(li);
    battleLog.parentElement.scrollTop = battleLog.parentElement.scrollHeight; // Cuộn xuống cuối
}

// ==========================================
// 3. LOGIC TRẬN CHIẾN (Battle Logic)
// ==========================================
function startPoison() {
    if (isPoisoned || hp === 0) return;
    isPoisoned = true;
    updateUI();

    poisonTimer = setInterval(() => {
        hp -= 5;
        updateUI();
    }, 1000);
}

function stopPoison() {
    if (!isPoisoned) return;
    isPoisoned = false;
    clearInterval(poisonTimer);
}

function updateUI() {
    if (hp > MAX_HP) hp = MAX_HP;
    
    if (hp <= 0) {
        hp = 0;
        stopPoison();
        btnAttack.disabled = true;
        btnHeal.disabled = true;
        btnPoison.disabled = true;
        gameOverText.classList.remove("hidden");
    }

    hpText.innerText = hp;
    hpBarFill.style.width = hp + "%";

    if(isPoisoned) {
        hpBarFill.style.backgroundColor = '#9b59b6'; 
        statusEffect.classList.remove('hidden');
    } else {
        statusEffect.classList.add('hidden');
        if (hp <= 30) {
            hpBarFill.style.backgroundColor = '#8c1c13';
        } else {
            hpBarFill.style.backgroundColor = '#e84118';
        }
    }
}

// ==========================================
// 4. LOGIC NHIỆM VỤ (Quest Logic - State Driven)
// ==========================================
function addQuest(taskText) {
    const newQuest = { text: taskText};

    fetch('/api/quests', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(newQuest)
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            throw new Error("Chưa đăng nhập!");
        }
        return response.json();
    })
    .then(data => {
        quests.push(data);
        saveAndRender();
        writeLog(`Nhiệm vụ mới đã được thêm: "${taskText}"`, "#f1c40f");
    })
    .catch(error => {
        writeLog(error.message, "red");
    });
}

function toggleQuest(id) {
    fetch(`/api/quests/${id}`, {
        method: 'PUT',
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(updatedQuest => {
        if (updatedQuest.completed) {
            hp = Math.min(hp + 10, MAX_HP); // Thưởng 10 HP khi hoàn thành nhiệm vụ
        } else {
            hp -= 10;
            writeLog("Bỏ nhiệm vụ đã hoàn thành, mất 10 HP!", "#e74c3c");
        }

        updateUI();
        loadQuestsFromServer(); // Đồng bộ lại danh sách nhiệm vụ từ Server
    })
    .catch(error => {
        writeLog('Nhiệm vụ bị hủy, mất 10 HP!', "#e74c3c");
    });
}

function deleteQuest(id) { // FIX 2: Thêm hàm deleteQuest bị thiếu
    fetch(`/api/quests/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    })
    .then(response => response.json())
    .then(data => {
        quests = quests.filter(q => q.id !== id);
        loadQuestsFromServer(); // Đồng bộ lại danh sách nhiệm vụ từ Server
        writeLog("Nhiệm vụ đã được xóa!", "#e74c3c");
    })
    .catch(error => {
        writeLog("Không thể xóa nhiệm vụ!", "red");
    });
}

function loadQuestsFromServer() {
    const token = localStorage.getItem('knight_token');
    if (!token) {
        writeLog("Đăng nhập để tải nhiệm vụ!", "red");
        return;
    }

    fetch('/api/quests', {
        headers: getAuthHeader()
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('knight_token'); // Xóa token nếu không hợp lệ
            throw new Error("Thẻ bài đã hết hạn! Hãy đăng nhập lại.");
        }
        return response.json();
    })
    .then(data => {
        quests = data; // Cập nhật mảng quests từ dữ liệu nhận được
        updateUI();
        saveAndRender();
        writeLog("Danh sách nhiệm vụ đã được đồng bộ với Server.", "#3498db");
    })
    .catch(error => {
        writeLog(error.message, "red");
    });
}

function saveAndRender() {

    questList.innerHTML = "";

    quests.forEach(function(quest) {
        const li = document.createElement('li');
        li.className = 'quest-item';
        
        li.setAttribute('data-id', quest.id); // FIX 3: Thêm thuộc tính data-id cho li

        if (quest.completed) {
            li.classList.add('completed');
        }

        li.innerHTML = `
            <span class="quest-text">${quest.text}</span>
            <button class="btn-delete" style="color: red; cursor: pointer;">X</button>
        `;
        questList.appendChild(li);
    });
}

// Xử lý mọi click trong bảng nhiệm vụ
questList.addEventListener('click', function(event) {
    const clickedElement = event.target;

    const liItem = clickedElement.closest('.quest-item');
    
    if (!liItem) return; // Nếu click ngoài li, thì không làm gì cả
    // Đọc ID từ nhãn dán 'data-id'. 
    // Lưu ý: Mọi thứ trong HTML đều là chuỗi (String), nên ta phải ép kiểu về Number
    const id = Number(liItem.getAttribute('data-id'));

    // Nếu click vào chỗ trống (không có id), thì không làm gì cả
    if (!id) return;

    // Nếu click trúng nút Xóa
    if (clickedElement.classList.contains('btn-delete')) {
        deleteQuest(id);
    } 
    // Nếu click trúng dòng chữ (Span)
    else {
        toggleQuest(id);
    }
});

// ==========================================
// 5. GẮN SỰ KIỆN (Event Listeners)
// ==========================================

// --- Nút bấm chiến đấu ---
btnAttack.addEventListener('click', function() {
    hp -= 15;
    updateUI();
    writeLog("Bị quái vật tấn công (-15 HP)", "#ff7675");
});

btnHeal.addEventListener('click', function() {
    hp += 20;
    stopPoison();
    updateUI();
    writeLog("Uống máu và giải độc (+20 HP)", "#55efc4");
});

btnPoison.addEventListener('click', function() {
    startPoison();
    writeLog("Đạp bẫy độc!", "#a29bfe");
});

// --- Niệm chú ---
spellInput.addEventListener('input', function(event) {
    const currentText = event.target.value.toUpperCase();
    if (currentText === "FIREBALL") {
        if (hp > 0) {
            hp -= 50;
            updateUI();
            writeLog("Bạn đã sử dụng FIREBALL! Mất 50 HP 🔥", "#ff9f43");
            event.target.value = "";
        }
    }
});

// --- Thêm nhiệm vụ ---
btnAddQuest.addEventListener('click', function() {
    const text = questInput.value.trim();
    if (text !== "") {
        addQuest(text);
        questInput.value = ""; 
    }
});

// --- Tooltips (Di chuột) ---
btnAttack.addEventListener('mouseenter', () => skillDesc.innerText = "Mô tả: Tung một đòn chém cơ bản, mất 15 HP.");
btnAttack.addEventListener('mouseleave', () => skillDesc.innerText = "");

btnHeal.addEventListener('mouseenter', () => skillDesc.innerText = "Mô tả: Uống bình máu, hồi 20 HP và giải độc.");
btnHeal.addEventListener('mouseleave', () => skillDesc.innerText = "");

btnPoison.addEventListener('mouseenter', () => skillDesc.innerText = "Mô tả: Gây độc cho bản thân, mất 5 HP mỗi giây.");
btnPoison.addEventListener('mouseleave', () => skillDesc.innerText = "");

// --- Phím tắt ---
document.addEventListener('keydown', function(event) {
    if (hp <= 0) return;

    const activeEl = event.target;
    if (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') {
        return; // Thoát khỏi hàm ngay lập tức, cho phép gõ chữ bình thường
    }
    
    switch(event.code) {
        case 'Space':
            event.preventDefault();
            btnAttack.click(); // Mẹo: Thay vì viết lại logic, hãy kích hoạt (trigger) chính nút bấm đó
            btnAttack.classList.add('active-simulated');
            setTimeout(() => btnAttack.classList.remove('active-simulated'), 100);
            break;
        case 'KeyH':
            btnHeal.click();
            btnHeal.classList.add('active-simulated');
            setTimeout(() => btnHeal.classList.remove('active-simulated'), 100);
            break;
        case 'KeyP':
            btnPoison.click();
            btnPoison.classList.add('active-simulated');
            setTimeout(() => btnPoison.classList.remove('active-simulated'), 100);
            break;
    }
});
function updateModalStats() {
    statHp.innerText = hp;
    statPoison.innerText = isPoisoned ? "🤢 Đang trúng độc" : "🛡️ Bình thường";
    statPoison.style.color = isPoisoned ? "#9b59b6" : "#2ecc71";
    
    // Đếm số lượng nhiệm vụ từ Mảng quests của chúng ta
    statQuestsTotal.innerText = quests.length;
    
    // Thuật toán filter lọc ra các quest đã xong rồi đếm chiều dài mảng
    const completedCount = quests.filter(q => q.completed).length;
    statQuestsDone.innerText = completedCount;
}

// 1. Khi người dùng click nút "Xem Chỉ Số"
btnOpenStats.addEventListener("click", function() {
    updateModalStats(); // Cập nhật dữ liệu mới nhất
    statsModal.style.display = "block"; // Hiện Modal
});

// 2. Khi người dùng click vào dấu X (Close)
closeModalSpan.addEventListener("click", function() {
    statsModal.style.display = "none"; // Ẩn Modal
});

// 3. Khi người dùng click ra vùng nền mờ bên ngoài khung nội dung
window.addEventListener("click", function(event) {
    // event.target chính là phần tử cụ thể mà chuột click trúng.
    // Nếu click trúng chính là thẻ 'stats-modal' (lớp phủ nền mờ) chứ không phải khung content bên trong
    if (event.target === statsModal) {
        statsModal.style.display = "none"; // Ẩn Modal
    }
});
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Hàm kiểm tra Mã code (phải chứa ít nhất 1 chữ cái và 1 chữ số)
function validateCode(code) {
    const hasLetter = /[a-zA-Z]/.test(code);
    const hasNumber = /[0-9]/.test(code);
    return code.length >= 6 && hasLetter && hasNumber;
}

// Bắt sự kiện Submit Form
registerForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const username = regName.value.trim();
    const password = regCode.value; // Server chỉ cần username và password

    if(username.length < 3 || password.length < 6) {
        return writeLog("Lỗi: Tên >= 3 ký tự, Mã mật đạo >= 6 ký tự!", "red");
    }

    fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message) throw new Error(data.message);
        writeLog(`Đăng ký thành công! Hãy Đăng nhập, Hiệp sĩ ${data.username}`, "#2ecc71");
        registerForm.reset();
    })
    .catch(err => writeLog(err.message, "red"));
});

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const username = loginName.value.trim();
    const password = loginCode.value;

    fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message) throw new Error(data.message);
        
        // 1. Cất Thẻ bài (Token) vào Hành trang (localStorage)
        localStorage.setItem('knight_token', data.token);
        
        // 2. Đổi tên hiển thị
        document.querySelector("h1").innerText = `🗡️ Hiệp Sĩ ${username} 🛡️`;
        
        writeLog(`Đăng nhập thành công! Cấp phát Thẻ bài an ninh.`, "#3498db");
        loginForm.reset();
        
        // 3. Tải ngay nhiệm vụ của Hiệp sĩ này
        loadQuestsFromServer();
    })
    .catch(err => writeLog(err.message, "red"));
});

// ==========================================
// 6. KHỞI CHẠY (Initialization)
// ==========================================
loadQuestsFromServer(); // Gọi API lấy danh sách nhiệm vụ từ Server
updateUI();
