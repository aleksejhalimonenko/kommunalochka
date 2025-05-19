document.getElementById('utilityForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = this;
    const formData = new FormData(form);

    // Добавим данные вручную в объект для URLSearchParams
    formData.append('user', 'Admin');

    // Конвертируем FormData в URLSearchParams для отправки в формате application/x-www-form-urlencoded
    const params = new URLSearchParams();
    for (const pair of formData) {
        params.append(pair[0], pair[1]);
    }

    fetch('https://script.google.com/macros/s/AKfycbyfR4vpaJqNf14cO0Vbzh-WLHf4li3ps0R9SqWu4VQ1XoQFGTKNTpAy09zfbQn1Np1U7w/exec', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: params.toString()
    })
    .then(response => response.json())
    .then(data => {
        const responseDiv = document.getElementById('response');
        responseDiv.style.display = 'block';
        responseDiv.innerText = 'Данные успешно отправлены!';
        form.reset();
    })
    .catch(error => {
        console.error('Ошибка:', error);
        const responseDiv = document.getElementById('response');
        responseDiv.style.display = 'block';
        responseDiv.innerText = 'Произошла ошибка при отправке данных.';
    });
});
