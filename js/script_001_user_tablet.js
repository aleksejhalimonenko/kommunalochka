const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const URL_SCRIPT = 'https://script.google.com/macros/s/AKfycbxO37_wj9dveyG5psxdS2Em_r8oRUxZxNRGDZ1VkXXAlK5Wxq4j3-PEt0sc2eqoeDLzkw/exec';

const i18n = {
    uk: {
        home_title: "Передача показників",
        history_title: "Історія показників",
        tariffs_title: "Тарифи",
        settings_title: "Налаштування",
        label_t1: "Електроенергія Т1 (кВт)",
        label_t2: "Електроенергія Т2 (кВт)",
        label_water: "Вода (куб. м)",
        label_gas: "Газ (куб. м)",
        btn_send: "Відправити дані",
        btn_expand: "Розгорнути",
        btn_close: "Закрити",
        nav_home: "Головна",
        nav_history: "Історія",
        nav_tariffs: "Тарифи",
        nav_info: "Інфо",
        nav_settings: "Налаштування",
        select_lang: "Оберіть мову",
        loading: "Завантаження...",
        error_load: "Помилка завантаження",
        error_network: "Помилка мережі",
        error_prefix: "Помилка",
        wait: "Зачекайте",
        sec: "сек",
        success_msg: "<b>Готово!</b> Дані збережено."
    },
    ru: {
        home_title: "Передача показаний",
        history_title: "История показаний",
        tariffs_title: "Тарифы",
        settings_title: "Настройки",
        label_t1: "Электроэнергия Т1 (кВт)",
        label_t2: "Электроэнергия Т2 (кВт)",
        label_water: "Вода (куб. м)",
        label_gas: "Газ (куб. м)",
        btn_send: "Отправить данные",
        btn_expand: "Развернуть",
        btn_close: "Закрыть",
        nav_home: "Главная",
        nav_history: "История",
        nav_tariffs: "Тарифы",
        nav_info: "Инфо",
        nav_settings: "Настройки",
        select_lang: "Выберите язык",
        loading: "Загрузка...",
        error_load: "Ошибка загрузки",
        error_network: "Ошибка сети",
        error_prefix: "Ошибка",
        wait: "Подождите",
        sec: "сек",
        success_msg: "<b>Готово!</b> Данные сохранены."
    }
};

// Функція отримання поточної мови
function getCurrLang() {
    return localStorage.getItem('appLang') || 'uk';
}

// Функція зміни мови
function setLanguage(lang) {
    localStorage.setItem('appLang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) {
            if (el.tagName === 'LABEL' || el.tagName === 'SPAN' || el.tagName === 'TH' || el.tagName === 'H2') {
                el.innerText = i18n[lang][key];
            } else if (el.tagName === 'BUTTON' && !el.classList.contains('loading')) {
                el.innerText = i18n[lang][key];
            } else {
                el.innerText = i18n[lang][key];
            }
        }
    });
}

// При завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = getCurrLang();
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.value = savedLang;
        langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
    }
    setLanguage(savedLang);

    const closeBtn = document.getElementById('closeBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => tg.close());
});

// Форматування дати
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    const lang = getCurrLang() === 'uk' ? 'uk-UA' : 'ru-RU';
    return date.toLocaleDateString(lang);
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeNav = document.getElementById('nav-' + pageId);
    if(activeNav) activeNav.classList.add('active');

    if (pageId === 'history') loadData('getHistory', 'historyTable');
    if (pageId === 'tarify') loadData('getTariffs', 'tarifyTable');
}

function loadData(action, tableId) {
    const lang = getCurrLang();
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = `<tr><td colspan="13" style="text-align:center;">${i18n[lang].loading}</td></tr>`;

    const url = action === 'getTariffs' ? `${URL_SCRIPT}?sheet=tarify` : `${URL_SCRIPT}?action=${action}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = '';
            
            // --- ДОБАВЛЯЕМ ЭТУ СТРОКУ ---
            data.reverse(); // Переворачиваем массив: новые записи станут первыми
            // ---------------------------

            data.forEach(row => {
                const tr = document.createElement('tr');
                if (tableId === 'historyTable') {
                    tr.innerHTML = `
                        <td>${formatDate(row.date)}</td>
                        <td>${row.user || 'Admin'}</td>
                        <td>${row.electricityT1 || '-'}</td>
                        <td>${row.electricityT2 || '-'}</td>
                        <td>${row.water || '-'}</td>
                        <td>${row.gas || '-'}</td>
                    `;
                } else {
                    // Код для таблицы тарифов остается таким же
                    tr.innerHTML = `
                        <td>${formatDate(row.date)}</td>
                        <td>${row.t1 || '-'}</td>
                        <td>${row.t2 || '-'}</td>
                        <td>${row.waterCharge || '-'}</td>
                        <td>${row.sewerCharge || '-'}</td>
                        <td>${row.waterSupply || '-'}</td>
                        <td>${row.sewerage || '-'}</td>
                        <td>${row.maintenance || '-'}</td>
                        <td>${row.gas || '-'}</td>
                        <td>${row.gasDelivery || '-'}</td>
                        <td>${row.rent || '-'}</td>
                        <td>${row.wasteCollection || '-'}</td>
                        <td>${row.heating || '-'}</td>
                    `;
                }
                tbody.appendChild(tr);
            });
        })
        .catch(() => {
            tbody.innerHTML = `<tr><td colspan="13" style="text-align:center; color:red;">${i18n[lang].error_load}</td></tr>`;
        });
}

document.getElementById('utilityForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const lang = getCurrLang();
    const submitBtn = document.getElementById('submitBtn');
    const responseDiv = document.getElementById('response');

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    const formData = new URLSearchParams(new FormData(this));

    // --- ПОЛУЧАЕМ ДАННЫЕ ИЗ TELEGRAM ---
    const user = tg.initDataUnsafe?.user;
    const userName = user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Неизвестный';
    const userId = user ? user.id : '000';

    // Отправляем в таблицу и имя, и ID (через пробел или в разные колонки, если подправишь GAS)
    formData.append('user', `${userName} (ID: ${userId})`); 
    // -----------------------------------

    fetch(URL_SCRIPT, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
	
	
    .then(res => res.json())
    .then(data => {
        responseDiv.style.display = 'block';
        if (data.result === 'success') {
            responseDiv.innerHTML = i18n[lang].success_msg;
            this.reset();
            
            let timeLeft = 5;
            submitBtn.innerText = `${i18n[lang].wait} ${timeLeft} ${i18n[lang].sec}...`;
            
            const timerId = setInterval(() => {
                timeLeft--;
                if (timeLeft > 0) {
                    submitBtn.innerText = `${i18n[lang].wait} ${timeLeft} ${i18n[lang].sec}...`;
                } else {
                    clearInterval(timerId);
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('loading');
                    submitBtn.innerText = i18n[lang].btn_send;
                    responseDiv.style.display = 'none';
                }
            }, 1000);

        } else {
            responseDiv.innerHTML = `<b>${i18n[lang].error_prefix}:</b> ` + data.message;
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.innerText = i18n[lang].btn_send;
        }
    })
    .catch(() => {
        responseDiv.style.display = 'block';
        responseDiv.innerText = i18n[lang].error_network;
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.innerText = i18n[lang].btn_send;
    });
});