const tg = window.Telegram.WebApp;

tg.ready();

tg.expand();



const URL_SCRIPT = 'https://script.google.com/macros/s/AKfycbxO37_wj9dveyG5psxdS2Em_r8oRUxZxNRGDZ1VkXXAlK5Wxq4j3-PEt0sc2eqoeDLzkw/exec';



let verifiedIds = []; // Масив для верифікованих ID



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

        success_msg: "<b>Готово!</b> Дані збережено.",

        access_denied: "Доступ обмежено. Ви не є верифікованим користувачем.",

sending: "Відправка..."

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

        success_msg: "<b>Готово!</b> Данные сохранены.",

        access_denied: "Доступ ограничен. Вы не являетесь верифицированным пользователем.",

sending: "Отправка..."

    }

};



// Функція завантаження верифікованих ID з історії

async function fetchVerifiedUsers() {

    // 1. Проверяем кэш, чтобы мгновенно пустить в настройки

    const cached = localStorage.getItem('cache_verifiedIds');

    if (cached) {

        verifiedIds = JSON.parse(cached);

    }



    try {

        const response = await fetch(`${URL_SCRIPT}?action=getHistory`);

        const data = await response.json();

        

        // 2. Убираем дубликаты через Set, чтобы массив не раздувался

        const ids = data.map(row => {

            const match = row.user ? row.user.match(/\(ID:\s*(\d+)\)/) : null;

            return match ? match[1] : null;

        }).filter(id => id !== null);



        verifiedIds = [...new Set(ids)]; 

        

        // 3. Сохраняем свежий список в кэш

        localStorage.setItem('cache_verifiedIds', JSON.stringify(verifiedIds));

    } catch (e) {

        console.error("Помилка верифікації користувачів", e);

    }

}



function getCurrLang() {

    return localStorage.getItem('appLang') || 'uk';

}



function setLanguage(lang) {

    localStorage.setItem('appLang', lang);

    document.querySelectorAll('[data-i18n]').forEach(el => {

        const key = el.getAttribute('data-i18n');

        if (i18n[lang][key]) {

            el.innerText = i18n[lang][key];

        }

    });

}



document.addEventListener('DOMContentLoaded', async () => {

    const savedLang = getCurrLang();

    const langSelect = document.getElementById('langSelect');

    if (langSelect) {

        langSelect.value = savedLang;

        langSelect.addEventListener('change', (e) => setLanguage(e.target.value));

    }

    setLanguage(savedLang);



    const closeBtn = document.getElementById('closeBtn');

    if (closeBtn) closeBtn.addEventListener('click', () => tg.close());



    // Завантажуємо список дозволених ID при старті

    await fetchVerifiedUsers();

showPage('home');

});



function formatDate(dateStr) {

    if (!dateStr) return '-';

    const date = new Date(dateStr);

    if (isNaN(date)) return dateStr;

    const lang = getCurrLang() === 'uk' ? 'uk-UA' : 'ru-RU';

    return date.toLocaleDateString(lang);

}



async function showPage(pageId) { // Додаємо async

    const lang = getCurrLang();

    

    // 1. ЗАПОБІЖНИК: Якщо масив порожній, чекаємо на завантаження перед перевіркою

    if (verifiedIds.length === 0) {

        await fetchVerifiedUsers(); 

    }



    const user = tg.initDataUnsafe?.user;

    const currentUserId = user ? String(user.id) : "000";

    const isVerified = verifiedIds.includes(currentUserId);



    // Блокування Налаштувань для гостей

    if (pageId === 'settings' && !isVerified) {

        tg.showAlert(i18n[lang].access_denied);

        return;

    }



    // Решта коду без змін

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

    const cacheKey = 'cache_' + action;

    

    // 1. Пытаемся взять из кэша

    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {

        renderTable(JSON.parse(cachedData), tableId);

    } else {

        // Если в кэше пусто, показываем "Загрузка..."

        const colCount = tableId === 'historyTable' ? 6 : 13;

        tbody.innerHTML = `<tr><td colspan="${colCount}" style="text-align:center;">${i18n[lang].loading}</td></tr>`;

    }



    // 2. Идем в сеть за свежими данными

    const url = action === 'getTariffs' ? `${URL_SCRIPT}?sheet=tarify` : `${URL_SCRIPT}?action=${action}`;



    fetch(url)

        .then(res => res.json())

        .then(data => {

            // Сохраняем свежак в кэш

            localStorage.setItem(cacheKey, JSON.stringify(data));

            // Отрисовываем свежие данные

            renderTable(data, tableId);

        })

        .catch(() => {

            if (!cachedData) {

                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">${i18n[lang].error_load}</td></tr>`;

            }

        });

}



// Выносим отрисовку в отдельную функцию, чтобы не дублировать код

function renderTable(data, tableId) {

    const tbody = document.querySelector(`#${tableId} tbody`);

    tbody.innerHTML = '';

    

    // Делаем копию и переворачиваем, чтобы не портить оригинал для кэша

    const displayData = [...data].reverse(); 



    displayData.forEach(row => {

        const tr = document.createElement('tr');

        if (tableId === 'historyTable') {

            tr.innerHTML = `

                <td>${formatDate(row.date)}</td>

                <td>${row.user || 'Admin'}</td>

                <td>${row.electricityT1 || '-'}</td>

                <td>${row.electricityT2 || '-'}</td>

                <td>${row.water || '-'}</td>

                <td>${row.gas || '-'}</td>`;

        } else {

            tr.innerHTML = `

                <td>${formatDate(row.date)}</td>

                <td>${row.t1 || '-'}</td><td>${row.t2 || '-'}</td>

                <td>${row.waterCharge || '-'}</td><td>${row.sewerCharge || '-'}</td>

                <td>${row.waterSupply || '-'}</td><td>${row.sewerage || '-'}</td>

                <td>${row.maintenance || '-'}</td><td>${row.gas || '-'}</td>

                <td>${row.gasDelivery || '-'}</td><td>${row.rent || '-'}</td>

                <td>${row.wasteCollection || '-'}</td><td>${row.heating || '-'}</td>`;

        }

        tbody.appendChild(tr);

    });

}



document.getElementById('utilityForm').addEventListener('submit', function(e) {

    e.preventDefault();

    const lang = getCurrLang();

    const user = tg.initDataUnsafe?.user;

    const currentUserId = user ? String(user.id) : "000";



    // ПЕРЕВІРКА ВЕРИФІКАЦІЇ ПЕРЕД ВІДПРАВКОЮ

    if (!verifiedIds.includes(currentUserId)) {

        tg.showAlert(i18n[lang].access_denied);

        return;

    }



    const submitBtn = document.getElementById('submitBtn');

    const responseDiv = document.getElementById('response');



    submitBtn.disabled = true;

    submitBtn.classList.add('loading');

submitBtn.innerText = i18n[lang].sending; // <--- УСТАНАВЛИВАЕМ ТЕКСТ "ОТПРАВКА..."



    const formData = new URLSearchParams(new FormData(this));

    const userName = user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Неизвестный';

    

    formData.append('user', `${userName} (ID: ${currentUserId})`); 



    fetch(URL_SCRIPT, {

        method: 'POST',

        body: formData,

        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }

    })

    .then(res => res.json())

    .then(data => {

        responseDiv.style.display = 'block';

        if (data.result === 'success') {

localStorage.removeItem('cache_getHistory');


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