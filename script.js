// ==========================================
// 1. KHỞI TẠO STATE & DOM
// ==========================================
let quests = JSON.parse(localStorage.getItem('myQuests')) || [];
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


// ==========================================
// 2. CÁC HÀM TIỆN ÍCH (Utilities)
// ==========================================
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
    const newQuest = {
        id: Date.now(),
        text: taskText,
        completed: false
    };
    quests.push(newQuest);
    saveAndRender(); // FIX 4: Đã thêm lệnh gọi render
}

function toggleQuest(id) {
    const quest = quests.find(q => q.id === id);
    if (quest) {
        quest.completed = !quest.completed; 
        
        if (quest.completed) { // Đảm bảo chưa chết mới được hồi máu
            if (hp > 0) {
                hp += 10;
                updateUI(); 
                writeLog(`Hoàn thành: ${quest.text}. Hồi 10 HP! 💖`, "#2ecc71");
            }
        }
        else {
            if (hp > 0) {
                hp -= 10;
                updateUI();
                writeLog(`Huỷ nhiệm vụ: ${quest.text}. Mất 10 HP! 💔`, "#e74c3c");
            }
        }
    }
    saveAndRender();
}

function deleteQuest(id) { // FIX 2: Thêm hàm deleteQuest bị thiếu
    quests = quests.filter(q => q.id !== id);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('myQuests', JSON.stringify(quests));
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
    // CHÌA KHÓA: Chặn không cho trang web tải lại khi bấm Submit
    event.preventDefault();

    let isValid = true;

    // 1. Xác thực Tên Hiệp Sĩ
    const nameValue = regName.value.trim();
    if (nameValue === "") {
        errName.innerText = "Tên hiệp sĩ không được để trống!";
        regName.className = "input-error";
        isValid = false;
    } else if (nameValue.length < 3 || nameValue.length > 15) {
        errName.innerText = "Tên phải từ 3 đến 15 ký tự!";
        regName.className = "input-error";
        isValid = false;
    } else {
        errName.innerText = "";
        regName.className = "input-success";
    }

    // 2. Xác thực Email
    const emailValue = regEmail.value.trim();
    if (emailValue === "") {
        errEmail.innerText = "Email không được để trống!";
        regEmail.className = "input-error";
        isValid = false;
    } else if (!validateEmail(emailValue)) {
        errEmail.innerText = "Định dạng email không hợp lệ!";
        regEmail.className = "input-error";
        isValid = false;
    } else {
        errEmail.innerText = "";
        regEmail.className = "input-success";
    }

    // 3. Xác thực Mã mật đạo
    const codeValue = regCode.value;
    if (codeValue === "") {
        errCode.innerText = "Mã mật đạo không được để trống!";
        regCode.className = "input-error";
        isValid = false;
    } else if (!validateCode(codeValue)) {
        errCode.innerText = "Mã phải từ 6 ký tự trở lên, gồm cả chữ và số!";
        regCode.className = "input-error";
        isValid = false;
    } else {
        errCode.innerText = "";
        regCode.className = "input-success";
    }

    // NẾU TẤT CẢ THÔNG TIN HỢP LỆ (Form validated successfully)
    if (isValid) {
        // Đổi tên tiêu đề game thành tên người chơi vừa đăng ký
        const title = document.querySelector("h1");
        title.innerText = `🗡️ Hiệp Sĩ ${nameValue} 🛡️`;

        // Thưởng nóng 100 HP cho hiệp sĩ
        hp = MAX_HP; 
        updateUI();

        writeLog(`Danh tính xác thực! Chào mừng Hiệp Sĩ ${nameValue} gia nhập lực lượng! ❤️`, "#2ecc71");

        // Reset lại form và xóa các class báo xanh/đỏ
        registerForm.reset();
        regName.className = "";
        regEmail.className = "";
        regCode.className = "";
    } else {
        writeLog("Xác thực thất bại! Hãy kiểm tra lại các thông tin màu đỏ.", "#ff7675");
    }
});
// ==========================================
// 6. KHỞI CHẠY (Initialization)
// ==========================================
saveAndRender();
updateUI();
