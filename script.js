let hp = 100;
const MAX_HP = 100;
let isPoisoned = false;
let poisonTimer = null;

const hpText = document.getElementById("hp-text");
const hpBarFill = document.getElementById("hp-bar-fill");
const btnAttack = document.getElementById("btn-attack");
const btnHeal = document.getElementById("btn-heal");
const btnPoison = document.getElementById("btn-poison");
const gameOverText = document.getElementById("game-over-text");
const statusEffect = document.getElementById("status-effect");

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
    if (hp > MAX_HP) {
        hp = MAX_HP;
    }
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
        hpBarFill.style.backgroundColor = '#9b59b6'; // Tím lịm tìm sim
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
btnAttack.addEventListener("click", function() {
    hp -= 15;
    updateUI();
});

btnHeal.addEventListener("click", function() {
    hp += 20;
    stopPoison();
    updateUI();
});
btnPoison.addEventListener("click", function() {
    startPoison();
});

document.addEventListener('keydown', function(event) {
    if (hp <= 0) return;
    
    switch(event.code) {
        case 'Space':
            event.preventDefault();
            
            hp -= 15;
            updateUI();

            btnAttack.classList.add('active-simulated');
            setTimeout(() => btnAttack.classList.remove('active-simulated'), 100);
            break;
   
        case 'KeyH':
            hp += 20;
            stopPoison();
            updateUI();

            btnHeal.classList.add('active-simulated');
            setTimeout(() => btnHeal.classList.remove('active-simulated'), 100);
            break;
        
        case 'KeyP':
            startPoison();

            btnPoison.classList.add('active-simulated');
            setTimeout(() => btnPoison.classList.remove('active-simulated'), 100);
            break;

    }
});

updateUI();