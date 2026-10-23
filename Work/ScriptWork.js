const modal = document.getElementById('modal');
const openModalBtn = document.getElementById('open-modal');
const portfolioList = document.getElementById('portfolio-list');
const fileInput = document.getElementById('work-file');
const previewList = document.getElementById('preview-list');

const detailsModal = document.getElementById('details-modal');
const detailsTitle = document.getElementById('details-title');
const detailsDesc = document.getElementById('details-desc');
const detailsMediaContainer = document.getElementById('details-media-container');
const editProjectBtn = document.getElementById('edit-project-btn');
const deleteProjectBtn = document.getElementById('delete-project-btn');
const modalHeading = document.getElementById('modal-heading');
const saveBtnAction = document.getElementById('save-btn-action');

// Элементы для полноэкранного просмотра картинок
const imageViewerModal = document.getElementById('image-viewer-modal');
const fullSizeImage = document.getElementById('full-size-image');

let uploadedFiles = []; // Массив для хранения загруженных файлов (картинок/видео)
let editingIndex = null; // Индекс проекта, который сейчас редактируется (если null, значит создаем новый)

// ------------------------------------------------------------------------------------------------------------------------
// ЛОГИКА ЗАГРУЗКИ ФАЙЛОВ С КАРТИНКАМИ И ВИДЕО
// ------------------------------------------------------------------------------------------------------------------------
fileInput.addEventListener('change', (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    let loadedCount = 0;
    files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const isFirst = uploadedFiles.length === 0;
            // Пушим файл в массив со статусом обложки (первый по умолчанию главный)
            uploadedFiles.push({
                content: e.target.result,
                type: file.type,
                isCover: isFirst
            });
            loadedCount++;
            if (loadedCount === files.length) {
                renderUploadPreviews();
            }
        };
        reader.readAsDataURL(file);
    });
    fileInput.value = ""; // Очищаем инпут, чтобы можно было загрузить тот же файл снова при необходимости
});

// Рендер превьюшек файлов прямо в модальном окне создания/редактирования
function renderUploadPreviews() {
    previewList.innerHTML = '';
    uploadedFiles.forEach((file, idx) => {
        const item = document.createElement('div');
        item.className = `preview-thumb ${file.isCover ? 'is-cover' : ''}`;
        
        let mediaTag = file.type.startsWith('video/') 
            ? `<video src="${file.content}"></video>` 
            : `<img src="${file.content}" alt="preview">`;

        item.innerHTML = `
            ${mediaTag}
            <span class="img-tag-label">[img${idx + 1}]</span>
            <button type="button" class="star-btn" title="Set as main cover" onclick="setMainCover(${idx})">★</button>
            <button type="button" class="remove-file-btn" onclick="removeUploadedFile(${idx})">&times;</button>
        `;
        previewList.appendChild(item);
    });
}

// Выбор главной обложки карточки (кнопка ★)
function setMainCover(index) {
    uploadedFiles.forEach((f, i) => f.isCover = (i === index));
    renderUploadPreviews();
}

// Удаление конкретного файла из загруженных в модалке
function removeUploadedFile(index) {
    const wasCover = uploadedFiles[index]?.isCover;
    uploadedFiles.splice(index, 1);
    if (wasCover && uploadedFiles.length > 0) {
        uploadedFiles[0].isCover = true;
    }
    renderUploadPreviews();
}

// ------------------------------------------------------------------------------------------------------------------------
// ЗАГРУЗКА И ОТРОВКА ПРОЕКТОВ ИЗ LOCALSTORAGE
// ------------------------------------------------------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', displayWorks);

function displayWorks() {
    portfolioList.innerHTML = "";
    const savedData = JSON.parse(localStorage.getItem('myPortfolio')) || [];
    
    // Если проектов нет — показываем заглушку
    if (savedData.length === 0) {
        portfolioList.innerHTML = `
            <div class="glass-box work-card empty-card">
                <h3>No Projects Yet</h3>
                <p>Click the "+" button below to add your first project!</p>
            </div>
        `;
        return;
    }

    // Рендерим каждую карточку проекта в список
    savedData.forEach((item, index) => renderCard(item, index));
}

// ------------------------------------------------------------------------------------------------------------------------
// ОТКРЫТИЕ И ЗАКРЫТИЕ МОДАЛЬНЫХ ОКОН
// ------------------------------------------------------------------------------------------------------------------------
openModalBtn.onclick = () => {
    editingIndex = null;
    uploadedFiles = [];
    modalHeading.textContent = "New Project";
    saveBtnAction.textContent = "Add";
    document.getElementById('work-title').value = "";
    document.getElementById('work-desc').value = "";
    previewList.innerHTML = "";
    modal.style.display = 'flex';
};

function closeModal() { modal.style.display = 'none'; }
function closeDetailsModal() { detailsModal.style.display = 'none'; }

// Открытие картинки на весь экран при клике
function openImageViewer(src) {
    fullSizeImage.src = src;
    imageViewerModal.style.display = 'flex';
}

function closeImageViewer() {
    imageViewerModal.style.display = 'none';
    fullSizeImage.src = '';
}

// ------------------------------------------------------------------------------------------------------------------------
// СОХРАНЕНИЕ И УДАЛЕНИЕ ПРОЕКТОВ
// ------------------------------------------------------------------------------------------------------------------------
function saveWork() {
    const titleInput = document.getElementById('work-title');
    const descInput = document.getElementById('work-desc');

    if (!titleInput.value.trim() || !descInput.value.trim()) {
        alert("Please fill in both title and description.");
        return;
    }

    let currentData = JSON.parse(localStorage.getItem('myPortfolio')) || [];

    // Проверяем, выбрана ли обложка
    if (uploadedFiles.length > 0 && !uploadedFiles.some(f => f.isCover)) {
        uploadedFiles[0].isCover = true;
    }

    const projectObj = {
        title: titleInput.value,
        desc: descInput.value,
        files: uploadedFiles
    };

    if (editingIndex !== null) {
        // Режим редактирования существующего проекта
        currentData[editingIndex] = projectObj;
    } else {
        // Режим добавления нового проекта
        currentData.push(projectObj);
    }

    localStorage.setItem('myPortfolio', JSON.stringify(currentData));
    closeModal();
    displayWorks();
}

function deleteWork(index) {
    let currentData = JSON.parse(localStorage.getItem('myPortfolio')) || [];
    currentData.splice(index, 1);
    localStorage.setItem('myPortfolio', JSON.stringify(currentData));
    closeDetailsModal();
    displayWorks();
}

// ------------------------------------------------------------------------------------------------------------------------
// ОТРИСОВКА КАРТОЧКИ В СПИСКЕ (ТАЙТЛ СЛЕВА, МИНИ-КАРТИНКА СПРАВА)
// ------------------------------------------------------------------------------------------------------------------------
function renderCard(item, index) {
    const card = document.createElement('div');
    card.className = 'glass-box work-card list-item-card';

    const files = item.files || (item.fileContent ? [{ content: item.fileContent, type: item.fileType, isCover: true }] : []);
    const coverFile = files.find(f => f.isCover) || files[0];

    let previewHTML = '';
    if (coverFile) {
        if (coverFile.type.startsWith('image/')) {
            previewHTML = `<img src="${coverFile.content}" class="card-preview-img" alt="cover">`;
        } else {
            previewHTML = `<div class="card-preview-video-badge">VIDEO</div>`;
        }
    } else {
        previewHTML = `<div class="card-preview-empty"><i class="fas fa-folder-open"></i></div>`;
    }

    card.innerHTML = `
        <div class="card-title-area">
            <h3>${item.title}</h3>
        </div>
        <div class="card-preview-area">
            ${previewHTML}
        </div>
    `;

    // При клике на карточку открываем подробный просмотр проекта
    card.onclick = () => openDetails(index);
    portfolioList.appendChild(card);
}

// ------------------------------------------------------------------------------------------------------------------------
// ПРОСМОТР ДЕТАЛЕЙ ПРОЕКТА (ОКНО КНИГИ, ТЕКСТ С [img] ТЕГАМИ И ГАЛЕРЕЯ)
// ------------------------------------------------------------------------------------------------------------------------
function openDetails(index) {
    const currentData = JSON.parse(localStorage.getItem('myPortfolio')) || [];
    const item = currentData[index];
    if (!item) return;

    detailsTitle.textContent = item.title;

    const files = item.files || (item.fileContent ? [{ content: item.fileContent, type: item.fileType }] : []);
    const usedIndices = new Set(); // Сюда закидываем индексы картинок, которые уже вставили внутрь текста

    let formattedHTML = '';
    const lines = item.desc.split('\n');

    // Парсим текст: ищем теги вида [img1], [img2] и заменяем их картинками прямо между абзацами
    lines.forEach(line => {
        let lineText = line.trim();
        const tagMatch = lineText.match(/^\[img(\d+)\]$/i);

        if (tagMatch) {
            const fileIdx = parseInt(tagMatch[1], 10) - 1;
            if (files[fileIdx]) {
                usedIndices.add(fileIdx);
                const file = files[fileIdx];
                if (file.type.startsWith('image/')) {
                    formattedHTML += `<div class="inline-media"><img src="${file.content}" onclick="openImageViewer('${file.content}')" alt="inline img"></div>`;
                } else {
                    formattedHTML += `<div class="inline-media"><video src="${file.content}" controls></video></div>`;
                }
            }
        } else if (lineText !== '') {
            formattedHTML += `<p>${lineText}</p>`;
        }
    });

    detailsDesc.innerHTML = formattedHTML;

    // Оставшиеся файлы (не вставленные через теги в текст) выводим в общую галерею сверху
    detailsMediaContainer.innerHTML = '';
    files.forEach((f, idx) => {
        if (!usedIndices.has(idx)) {
            const mediaWrap = document.createElement('div');
            mediaWrap.className = 'media-item';
            if (f.type.startsWith('image/')) {
                mediaWrap.innerHTML = `<img src="${f.content}" onclick="openImageViewer('${f.content}')" alt="media">`;
            } else {
                mediaWrap.innerHTML = `<video src="${f.content}" controls></video>`;
            }
            detailsMediaContainer.appendChild(mediaWrap);
        }
    });

    // Привязываем кнопки Редактировать и Удалить внутри окна просмотра
    editProjectBtn.onclick = () => {
        closeDetailsModal();
        openEditModal(index);
    };

    deleteProjectBtn.onclick = () => {
        if (confirm("Delete this project?")) {
            deleteWork(index);
        }
    };

    detailsModal.style.display = 'flex';
}

// ------------------------------------------------------------------------------------------------------------------------
// ОТКРЫТИЕ МОДАЛКИ В РЕЖИМЕ РЕДАКТИРОВАНИЯ
// ------------------------------------------------------------------------------------------------------------------------
function openEditModal(index) {
    const currentData = JSON.parse(localStorage.getItem('myPortfolio')) || [];
    const item = currentData[index];
    
    editingIndex = index;
    modalHeading.textContent = "Edit Project";
    saveBtnAction.textContent = "Save";
    
    document.getElementById('work-title').value = item.title;
    document.getElementById('work-desc').value = item.desc;
    
    uploadedFiles = item.files ? [...item.files] : (item.fileContent ? [{ content: item.fileContent, type: item.fileType, isCover: true }] : []);
    renderUploadPreviews();

    modal.style.display = 'flex';
}
