// tarify.js
document.addEventListener('DOMContentLoaded', function() {
    // Здесь будет ваш код для загрузки данных тарифов
    // Например, с помощью fetch или другой логики

    // Пример загрузки данных (замените URL на ваш)
    fetch('url_для_загрузки_тарифов')
        .then(response => response.json())
        .then(data => {
            // Обработка и отображение данных тарифов
            const tariffContainer = document.getElementById('tariffData');
            tariffContainer.innerHTML = '';

            data.forEach(tariff => {
                const tariffElement = document.createElement('div');
                tariffElement.classList.add('tariff');
                tariffElement.innerHTML = `
                    <h3>${tariff.name}</h3>
                    <p>Цена: ${tariff.price} руб.</p>
                `;
                tariffContainer.appendChild(tariffElement);
            });
        })
        .catch(error => console.error('Ошибка загрузки тарифов:', error));
});
