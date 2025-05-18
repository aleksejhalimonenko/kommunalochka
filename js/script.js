window.Telegram.WebApp.ready();
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
  submitBtn.innerText = 'Отправка...';
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
            responseDiv.innerText = 'Данные успешно отправлены!';
            form.reset();

            // Запускаем таймер 60 секунд, обновляем текст кнопки и спиннер убираем
            let timeLeft = 5;
            countdownSpan.innerText = `Подождите ${timeLeft} секунд`;
            const timerId = setInterval(() => {
              timeLeft--;
              if (timeLeft > 0) {
                countdownSpan.innerText = `Подождите ${timeLeft} секунд`;
              } else {
                clearInterval(timerId);
                countdownSpan.innerText = '';
                submitBtn.disabled = false;
                submitBtn.innerText = 'Отправить данные';
              }

            }, 1000);
          } else {
            responseDiv.innerText = 'Ошибка при отправке данных: ' + (data.message || 'Неизвестная ошибка');
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
 // Вызов закрытия WebApp — один раз после окончания таймера
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.close();
    }
