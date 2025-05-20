
	 // Инициализация Telegram Web App API
    if (!window.Telegram || !window.Telegram.WebApp) {
    alert("Это приложение работает только внутри Telegram");
    // Можно, например, скрыть весь контент или перенаправить:
    document.body.innerHTML = "<h2>Открывайте это приложение в Telegram</h2>";
  } else {
    window.Telegram.WebApp.ready();
	//window.Telegram.WebApp.expand();  // Разворачиваем WebApp на весь экран
	//window.Telegram.WebApp.MainButton.setText("Отправить данные");
	//window.Telegram.WebApp.MainButton.show();
        window.Telegram.WebApp.MainButton.hide(); // скрыть кнопку MainButton 
	//window.Telegram.WebApp.requestFullscreen.isAvailable();
window.Telegram.WebApp.requestFullscreen();
  }

//document.documentElement.requestFullscreen(); 
  
document.getElementById('utilityForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const form = this;
  const submitBtn = document.getElementById('submitBtn');
  const countdownSpan = document.getElementById('countdown');
  const responseDiv = document.getElementById('response');

  // Если кнопка заблокирована — предупреждаем и выходим
  if (submitBtn.disabled) {
    alert('Данные уже отправлены. Пожалуйста, подождите перед повторной отправкой.');
    return;
  }

  // Блокируем кнопку, меняем текст и добавляем анимацию (через класс)
  submitBtn.disabled = true;
  submitBtn.innerText = 'Надсилання...';
  submitBtn.classList.add('loading'); // стиль для анимации — добавим ниже в CSS

  const formData = new FormData(form);
  formData.append('user', 'Admin');
     


  fetch('https://script.google.com/macros/s/AKfycbwXzcQLbImnvgdEOkwNcr5eC3Gs_sjQH7a1BPA87HkH03ST5MeiY8LFpNrcPqKbFqmYWQ/exec')
    .then(response => response.json())
    .then(lastData => {
      const newData = {
        electricityt1: parseFloat(formData.get('electricityt1')),
        electricityt2: parseFloat(formData.get('electricityt2')),
        water: parseFloat(formData.get('water')),
        gas: parseFloat(formData.get('gas'))
      };

      let errors = [];

      if (newData.electricityt1 < lastData.electricityt1) {
        errors.push('Электроэнергия T1 меньше предыдущего значения.');
      }
      if (newData.electricityt2 < lastData.electricityt2) {
        errors.push('Электроэнергия T2 меньше предыдущего значения.');
      }
      if (newData.water < lastData.water) {
        errors.push('Вода меньше предыдущего значения.');
      }
      if (newData.gas < lastData.gas) {
        errors.push('Газ меньше предыдущего значения.');
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

        fetch('https://script.google.com/macros/s/AKfycbwXzcQLbImnvgdEOkwNcr5eC3Gs_sjQH7a1BPA87HkH03ST5MeiY8LFpNrcPqKbFqmYWQ/exec', {
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
			

            // Запускаем таймер 5 секунд, обновляем текст кнопки и спиннер убираем
            let timeLeft = 5;
            countdownSpan.innerText = `Зачекайте ${timeLeft} секунд`;
            const timerId = setInterval(() => {
              timeLeft--;
              if (timeLeft > 0) {
                countdownSpan.innerText = `Зачекайте ${timeLeft} секунд`;
              } else {
                clearInterval(timerId);
                countdownSpan.innerText = '';
                submitBtn.disabled = false;
                submitBtn.innerText = 'Відправити дані';
              }
            }, 1000);
          } else {
            responseDiv.innerText = 'Помилка при відправці даних: ' + (data.message || 'Неизвестная ошибка');
            submitBtn.disabled = false;
            submitBtn.innerText = 'Відправити дані';
          }
          submitBtn.classList.remove('loading');
		  
		  
        })
        .catch(error => {
          console.error('Ошибка:', error);
          responseDiv.style.display = 'block';
          responseDiv.innerText = 'Сталася помилка при відправленні даних.';
          submitBtn.disabled = false;
          submitBtn.innerText = 'Відправити дані';
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
