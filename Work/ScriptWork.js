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

// Полноэкранный просмотрщик
const imageViewerModal = document.getElementById('image-viewer-modal');
const fullSizeImage = document.getElementById('full-size-image');

let uploadedFiles = [];
let editingIndex = null;

// Загрузка нескольких файлов
fileInput.addEventListener('change', (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    let loadedCount = 0;
    files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const isFirst = uploadedFiles.length === 0;
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
    fileInput.value = "";
});

// Отображение превью файлов в модальном окне загрузки
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

function setMainCover(index) {
    uploadedFiles.forEach((f, i) => f.isCover = (i === index));
    renderUploadPreviews();
}

function removeUploadedFile(index) {
    const wasCover = uploadedFiles[index]?.isCover;
    uploadedFiles.splice(index, 1);
    if (wasCover && uploadedFiles.length > 0) {
        uploadedFiles[0].isCover = true;
    }
    renderUploadPreviews();
}

window.addEventListener('DOMContentLoaded', displayWorks);

function displayWorks() {
    portfolioList.innerHTML = "";
    const savedData = JSON.parse(localStorage.getItem('myPortfolio')) || [];
    
    if (savedData.length === 0) {
        portfolioList.innerHTML = `
            <div class="glass-box work-card empty-card">
                <h3>No Projects Yet</h3>
                <p>Click the "+" button below to add your first project!</p>
            </div>
        `;
        return;
    }

    savedData.forEach((item, index) => renderCard(item, index));
}

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

function openImageViewer(src) {
    fullSizeImage.src = src;
    imageViewerModal.style.display = 'flex';
}

function closeImageViewer() {
    imageViewerModal.style.display = 'none';
    fullSizeImage.src = '';
}

function saveWork() {
    const titleInput = document.getElementById('work-title');
    const descInput = document.getElementById('work-desc');

    if (!titleInput.value.trim() || !descInput.value.trim()) {
        alert("Please fill in both title and description.");
        return;
    }

    let currentData = JSON.parse(localStorage.getItem('myPortfolio')) || [];

    if (uploadedFiles.length > 0 && !uploadedFiles.some(f => f.isCover)) {
        uploadedFiles[0].isCover = true;
    }

    const projectObj = {
        title: titleInput.value,
        desc: descInput.value,
        files: uploadedFiles
    };

    if (editingIndex !== null) {
        currentData[editingIndex] = projectObj;
    } else {
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

// Карточка в списке
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

    card.onclick = () => openDetails(index);
    portfolioList.appendChild(card);
}

// Открытие подробностей с поддержкой вставки [img1], [img2] в тексте
function openDetails(index) {
    const currentData = JSON.parse(localStorage.getItem('myPortfolio')) || [];
    const item = currentData[index];
    if (!item) return;

    detailsTitle.textContent = item.title;

    const files = item.files || (item.fileContent ? [{ content: item.fileContent, type: item.fileType }] : []);
    const usedIndices = new Set();

    let formattedHTML = '';
    const lines = item.desc.split('\n');

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

    // В верхнюю галерею идут только не использованные в тексте файлы
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
