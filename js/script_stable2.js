document.getElementById('utilityForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const form = this;
  const formData = new FormData(form);
  formData.append('user', 'Admin');

  // Получение последних данных с сервера
  fetch('https://script.google.com/macros/s/AKfycbzrUik8eDGSiy4avMmPfq4wN-bcVkiGL5pgGvaB-SJeRtRlDbXK1YTKb06CFTQ8bv-U-w/exec')
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

      const responseDiv = document.getElementById('response');
      responseDiv.style.display = 'block';

      if (errors.length > 0) {
        responseDiv.innerText = errors.join('\n');
      } else {
        // Отправка данных на сервер
        const params = new URLSearchParams();
        for (const pair of formData) {
          params.append(pair[0], pair[1]);
        }

        fetch('https://script.google.com/macros/s/AKfycbzrUik8eDGSiy4avMmPfq4wN-bcVkiGL5pgGvaB-SJeRtRlDbXK1YTKb06CFTQ8bv-U-w/exec', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          body: params.toString()
        })
        .then(response => response.json())
        .then(data => {
          responseDiv.innerText = 'Данные успешно отправлены!';
          form.reset();
        })
        .catch(error => {
          console.error('Ошибка:', error);
          responseDiv.innerText = 'Произошла ошибка при отправке данных.';
        });
      }
    })
    .catch(error => {
      console.error('Ошибка при получении последних данных:', error);
    });
});
