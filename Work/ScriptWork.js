const modal = document.getElementById('modal');
const openModalBtn = document.getElementById('open-modal');
const portfolioList = document.getElementById('portfolio-list');
//------------------------------------------------------------------------------------------------------------------------
//Загрузка сохраненных работ с кнопкой удаления
window.addEventListener('DOMContentLoaded', () => {
    displayWorks();
});

function displayWorks() {
    portfolioList.innerHTML = "";
    const savedData = JSON.parse(localStorage.getItem('myPortfolio')) || [];
    savedData.forEach((item, index) => {
        renderCard(item.title, item.desc, index);
    });
}
//------------------------------------------------------------------------------------------------------------------------
//Открытие/Закрытие
openModalBtn.onclick = () => modal.style.display = 'flex';
function closeModal() { modal.style.display = 'none'; }
//------------------------------------------------------------------------------------------------------------------------
//Сохранение
function saveWork() {
    const titleInput = document.getElementById('work-title');
    const descInput = document.getElementById('work-desc');

    if (titleInput.value.trim() === "" || descInput.value.trim() === "") return;

    const currentData = JSON.parse(localStorage.getItem('myPortfolio')) || [];
    currentData.push({ title: titleInput.value, desc: descInput.value });
    localStorage.setItem('myPortfolio', JSON.stringify(currentData));

    titleInput.value = "";
    descInput.value = "";
    closeModal();
    displayWorks();
}
//------------------------------------------------------------------------------------------------------------------------
//Удаление по индексу
function deleteWork(index) {
    let currentData = JSON.parse(localStorage.getItem('myPortfolio')) || [];
    currentData.splice(index, 1);
    localStorage.setItem('myPortfolio', JSON.stringify(currentData));
    displayWorks();
}
//------------------------------------------------------------------------------------------------------------------------
//Отрисовка карточки с кнопкой удаления
function renderCard(title, desc, index) {
    const card = document.createElement('div');
    card.className = 'glass-box work-card';
    card.innerHTML = `
        <button class="delete-btn" onclick="deleteWork(${index})">&times;</button>
        <h3>${title}</h3>
        <p>${desc}</p>
    `;
    portfolioList.appendChild(card);
}