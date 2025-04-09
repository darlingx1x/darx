// Код для memory-map.js
document.addEventListener('DOMContentLoaded', function() {
  // Инициализация WebGL контекста
  const canvas = document.getElementById('memory-map');
  if (!canvas) return;
  
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    console.warn('WebGL не поддерживается, используем canvas fallback');
    initCanvasMemoryMap(canvas);
    return;
  }
  
  // Хранение воспоминаний
  let memories = JSON.parse(localStorage.getItem('timeMemories') || '[]');
  
  // Инициализация 3D сцены
  initWebGLMemoryMap(gl, memories);
  
  // Обработчики для кнопок
  document.getElementById('add-memory-btn').addEventListener('click', function() {
    showMemoryModal('past');
  });
  
  document.getElementById('project-btn').addEventListener('click', function() {
    showMemoryModal('future');
  });
});

// Функция для отображения модального окна добавления воспоминания
function showMemoryModal(type) {
  // Создаем модальное окно в кибер-стиле
  const modal = document.createElement('div');
  modal.className = 'memory-modal';
  
  const title = type === 'past' ? 'Capture Memory Fragment' : 'Project Future Aspiration';
  
  modal.innerHTML = `
    <div class="memory-modal-content">
      <h4>${title}</h4>
      <input type="text" id="memory-title" placeholder="Title">
      <textarea id="memory-desc" placeholder="Description"></textarea>
      <div class="emotion-selector">
        <span>Emotional signature:</span>
        <div class="emotion-scale">
          <span data-value="joy" class="emotion">Joy</span>
          <span data-value="reflection" class="emotion">Reflection</span>
          <span data-value="aspiration" class="emotion">Aspiration</span>
          <span data-value="sublime" class="emotion">Sublime</span>
        </div>
      </div>
      <div class="modal-actions">
        <button id="cancel-memory">Cancel</button>
        <button id="save-memory">Crystallize</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  // Добавление анимации появления
  setTimeout(() => modal.classList.add('active'), 10);
  
  // Подключаем обработчики событий
  setupMemoryModalHandlers(modal, type);
}

// Функция для настройки обработчиков событий модального окна
function setupMemoryModalHandlers(modal, type) {
  // Выбор эмоции
  const emotions = modal.querySelectorAll('.emotion');
  emotions.forEach(emotion => {
    emotion.addEventListener('click', function() {
      // Убираем выделение со всех эмоций
      emotions.forEach(e => e.classList.remove('selected'));
      // Добавляем выделение на выбранную эмоцию
      this.classList.add('selected');
    });
  });
  
  // Кнопка отмены
  const cancelBtn = modal.querySelector('#cancel-memory');
  cancelBtn.addEventListener('click', function() {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  });
  
  // Кнопка сохранения
  const saveBtn = modal.querySelector('#save-memory');
  saveBtn.addEventListener('click', function() {
    const title = modal.querySelector('#memory-title').value.trim();
    const description = modal.querySelector('#memory-desc').value.trim();
    const selectedEmotion = modal.querySelector('.emotion.selected');
    
    if (!title) {
      alert('Please enter a title for your memory');
      return;
    }
    
    const emotion = selectedEmotion ? selectedEmotion.dataset.value : 'reflection';
    
    // Создаем новое воспоминание
    const memory = {
      id: Date.now(),
      title,
      description,
      emotion,
      type,
      timestamp: new Date().toISOString(),
      position: generateRandomPosition(type)
    };
    
    // Получаем существующие воспоминания
    let memories = JSON.parse(localStorage.getItem('timeMemories') || '[]');
    memories.push(memory);
    
    // Сохраняем обновленный список
    localStorage.setItem('timeMemories', JSON.stringify(memories));
    
    // Обновляем визуализацию
    updateMemoryVisualization();
    
    // Закрываем модальное окно
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  });
}

// Генерация случайной позиции для воспоминания
function generateRandomPosition(type) {
  // Прошлые воспоминания располагаются в левой части карты
  // Будущие проекции - в правой
  const x = type === 'past' ? Math.random() * 0.4 : 0.6 + Math.random() * 0.4;
  const y = Math.random();
  const z = Math.random() * 0.5;
  
  return { x, y, z };
}

// Обновление визуализации воспоминаний
function updateMemoryVisualization() {
  const canvas = document.getElementById('memory-map');
  if (!canvas) return;
  
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    initCanvasMemoryMap(canvas);
    return;
  }
  
  // Получаем сохраненные воспоминания
  const memories = JSON.parse(localStorage.getItem('timeMemories') || '[]');
  
  // Обновляем WebGL сцену
  initWebGLMemoryMap(gl, memories);
}

// Функция инициализации 3D визуализации воспоминаний
function initWebGLMemoryMap(gl, memories) {
  // Базовая реализация WebGL для отображения точек в 3D пространстве
  // Очищаем канвас
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // Если нет воспоминаний, показываем заглушку
  if (memories.length === 0) {
    drawPlaceholder(gl);
    return;
  }
  
  // Иначе рисуем точки и соединения между ними
  drawMemoryPoints(gl, memories);
}

// Отображение заглушки, когда нет воспоминаний
function drawPlaceholder(gl) {
  // Простая анимация пульсирующего текста на канвасе
  const canvas = gl.canvas;
  const ctx = canvas.getContext('2d');
  
  // Очищаем 2D контекст
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Рисуем текст
  ctx.font = '20px VT323, monospace';
  ctx.fillStyle = '#FFD700';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('No memories captured yet', canvas.width / 2, canvas.height / 2 - 15);
  ctx.fillText('Use the buttons below to start your constellation', canvas.width / 2, canvas.height / 2 + 15);
}

// Рисование точек воспоминаний
function drawMemoryPoints(gl, memories) {
  // Упрощенная реализация для демонстрации
  // В реальном проекте здесь был бы полноценный WebGL код
  // с шейдерами, буферами и т.д.
  
  // Для демонстрации используем 2D канвас
  const canvas = gl.canvas;
  const ctx = canvas.getContext('2d');
  
  // Очищаем 2D контекст
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Рисуем соединительные линии
  ctx.beginPath();
  memories.forEach((memory, i) => {
    const x = memory.position.x * canvas.width;
    const y = memory.position.y * canvas.height;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Рисуем точки воспоминаний
  memories.forEach(memory => {
    const x = memory.position.x * canvas.width;
    const y = memory.position.y * canvas.height;
    
    // Определяем цвет в зависимости от эмоции
    let color;
    switch(memory.emotion) {
      case 'joy': color = '#FFD700'; break; // Золотой
      case 'reflection': color = '#87CEEB'; break; // Голубой
      case 'aspiration': color = '#9370DB'; break; // Пурпурный
      case 'sublime': color = '#00FA9A'; break; // Зеленый
      default: color = '#FFFFFF'; // Белый
    }
    
    // Рисуем свечение
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Рисуем точку
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Добавляем подпись
    ctx.font = '12px VT323, monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(memory.title, x, y - 15);
  });
}

// Оптимизированный canvas fallback для браузеров без WebGL
function initCanvasMemoryMap(canvas) {
  const ctx = canvas.getContext('2d');
  // Получаем сохраненные воспоминания
  const memories = JSON.parse(localStorage.getItem('timeMemories') || '[]');
  
  // Если нет воспоминаний, показываем заглушку
  if (memories.length === 0) {
    // Очищаем канвас
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем текст
    ctx.font = '20px VT323, monospace';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No memories captured yet', canvas.width / 2, canvas.height / 2 - 15);
    ctx.fillText('Use the buttons below to start your constellation', canvas.width / 2, canvas.height / 2 + 15);
    return;
  }
  
  // Иначе рисуем точки и соединения между ними (аналогично WebGL версии)
  // Очищаем канвас
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Рисуем соединительные линии
  ctx.beginPath();
  memories.forEach((memory, i) => {
    const x = memory.position.x * canvas.width;
    const y = memory.position.y * canvas.height;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Рисуем точки воспоминаний
  memories.forEach(memory => {
    const x = memory.position.x * canvas.width;
    const y = memory.position.y * canvas.height;
    
    // Определяем цвет в зависимости от эмоции
    let color;
    switch(memory.emotion) {
      case 'joy': color = '#FFD700'; break; // Золотой
      case 'reflection': color = '#87CEEB'; break; // Голубой
      case 'aspiration': color = '#9370DB'; break; // Пурпурный
      case 'sublime': color = '#00FA9A'; break; // Зеленый
      default: color = '#FFFFFF'; // Белый
    }
    
    // Рисуем свечение
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Рисуем точку
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Добавляем подпись
    ctx.font = '12px VT323, monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(memory.title, x, y - 15);
  });
}