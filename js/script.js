
	 // Инициализация Telegram Web App API
    if (!window.Telegram || !window.Telegram.WebApp) {
    alert("Это приложение работает только внутри Telegram");
    // Можно, например, скрыть весь контент или перенаправить:
    document.body.innerHTML = "<h2>Открывайте это приложение в Telegram</h2>";
  } else {
    window.Telegram.WebApp.ready();
	window.Telegram.WebApp.expand();  // Разворачиваем WebApp на весь экран
	window.Telegram.WebApp.MainButton.setText("Отправить данные");
	window.Telegram.WebApp.MainButton.show();
  }
//не ммешает
document.documentElement.requestFullscreen(); 
  
document.getElementById('utilityForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const form = this;
  const submitBtn = document.getElementById('submitBtn');
    // Убираем переменную countdownSpan, она не нужна теперь
   // const countdownSpan = document.getElementById('countdown');
  const responseDiv = document.getElementById('response');

  // Если кнопка заблокирована — предупреждаем и выходим
  if (submitBtn.disabled) {
    alert('Данные уже отправлены. Пожалуйста, подождите перед повторной отправкой.');
    return;
  }

  // Блокируем кнопку, меняем текст и добавляем анимацию (через класс)
  submitBtn.disabled = true;
  submitBtn.innerText = 'Отправка...';
  submitBtn.classList.add('loading'); // стиль для анимации — добавим ниже в CSS

  const formData = new FormData(form);
  formData.append('user', 'Admin');
     


  fetch('https://script.google.com/macros/s/AKfycbw4OVM_ltfYhgQ_QSio5aZ-3hMDtZFbUUFyrKuti22rjwikp-Bz2w_ckEn3cdy_7g8Ziw/exec')
    .then(response => response.json())
    .then(lastData => {
      const newData = {
        electricityt1: parseFloat(formData.get('electricityt1')),
        electricityt2: parseFloat(formData.get('electricityt2')),
        water: parseFloat(formData.get('water')),
        gas: parseFloat(formData.get('gas')),
		//date: formData.get('date')  // 👈 Дата без валидации
      };

      let errors = [];

      if (newData.electricityt1 < lastData.electricityt1) {
        errors.push('Электроэнергия T1 меньше предыдущего значения.скрипт сайта');
      }
      if (newData.electricityt2 < lastData.electricityt2) {
        errors.push('Электроэнергия T2 меньше предыдущего значения.скрипт сайта');
      }
      if (newData.water < lastData.water) {
        errors.push('Вода меньше предыдущего значения.скрипт сайта');
      }
      if (newData.gas < lastData.gas) {
        errors.push('Газ меньше предыдущего значения.скрипт сайта');
      }

      if (errors.length > 0) {
        responseDiv.style.display = 'block';
        responseDiv.innerText = errors.join('\n');

        // Разблокируем кнопку и убираем анимацию, возвращаем текст
        submitBtn.disabled = false;
        submitBtn.innerText = 'Отправить данные';
        submitBtn.classList.remove('loading');
      } else {
        // Отправляем данные на сервер
        const params = new URLSearchParams();
        for (const pair of formData) {
          params.append(pair[0], pair[1]);
        }

        fetch('https://script.google.com/macros/s/AKfycbw4OVM_ltfYhgQ_QSio5aZ-3hMDtZFbUUFyrKuti22rjwikp-Bz2w_ckEn3cdy_7g8Ziw/exec', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          body: params.toString()
        })
        .then(response => response.json())
        .then(data => {
          responseDiv.style.display = 'block';
          if (data.result === 'success') {
            responseDiv.innerText = 'Дані успішно надіслані!';
            form.reset();
			
            // === Изменения здесь: таймер теперь внутри кнопки ===
            let timeLeft = 5;
            submitBtn.disabled = true;

            // Запускаем таймер, обновляем текст кнопки с отчётом
            const timerId = setInterval(() => {
              if (timeLeft > 0) {
                submitBtn.innerText = `Зачекайте ${timeLeft} секунд(и)`;
                timeLeft--;
              } else {
                clearInterval(timerId);
                submitBtn.disabled = false;
                submitBtn.innerText = 'Відправити дані';
              }
            }, 1000);
          } else {
            responseDiv.innerText = 'Помилка при відправці даних: ' + (data.message || 'Неизвестная ошибка');
            submitBtn.disabled = false;
            submitBtn.innerText = 'Отправить данные';
          }
          submitBtn.classList.remove('loading');
		  
		  
        })
        .catch(error => {
          console.error('Ошибка:', error);
          responseDiv.style.display = 'block';
          responseDiv.innerText = 'Произошла ошибка при отправке данных.';
          submitBtn.disabled = false;
          submitBtn.innerText = 'Отправить данные';
          submitBtn.classList.remove('loading');
        });
      }
    })
    .catch(error => {
      console.error('Ошибка при получении последних данных:', error);
      responseDiv.style.display = 'block';
      responseDiv.innerText = 'Ошибка при получении последних данных.';
      submitBtn.disabled = false;
      submitBtn.innerText = 'Отправить данные';
      submitBtn.classList.remove('loading');
    });
});
// Обработчик кнопки "Закрыть"
document.getElementById('closeBtn').addEventListener('click', function () {
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.close();
  } else {
    alert("Кнопка работает только внутри Telegram.");
  }
});