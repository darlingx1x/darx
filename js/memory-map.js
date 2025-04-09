/**
 * memory-map.js
 * Интерактивная карта воспоминаний и проекций будущего
 */

// Глобальные переменные для работы с картой
let memoryCanvas;
let memoryContext;
let memories = [];
let isCanvasInitialized = false;
let audioContext = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  console.log('Memory Map initializing...');
  
  // Получаем canvas элемент
  memoryCanvas = document.getElementById('memory-map');
  if (!memoryCanvas) {
    console.error('Memory map canvas not found!');
    return;
  }
  
  // Получаем 2D контекст для рисования
  memoryContext = memoryCanvas.getContext('2d');
  if (!memoryContext) {
    console.error('Failed to get 2D context for memory map!');
    return;
  }
  
  // Устанавливаем размеры canvas
  resizeCanvas();
  
  // Подключаем обработчик изменения размера окна
  window.addEventListener('resize', resizeCanvas);
  
  // Загружаем сохраненные воспоминания
  loadMemories();
  
  // Подключаем обработчики для кнопок
  setupButtonHandlers();
  
  // Рисуем карту
  drawMemoryMap();
  
  // Отмечаем инициализацию
  isCanvasInitialized = true;
  console.log('Memory Map initialized successfully!');
});

// Устанавливаем размеры canvas по размеру контейнера
function resizeCanvas() {
  if (!memoryCanvas) return;
  
  const container = memoryCanvas.parentElement;
  if (!container) return;
  
  // Получаем размеры контейнера
  const rect = container.getBoundingClientRect();
  
  // Устанавливаем размеры canvas
  memoryCanvas.width = rect.width;
  memoryCanvas.height = rect.height;
  
  // Перерисовываем карту
  if (isCanvasInitialized) {
    drawMemoryMap();
  }
}

// Настройка обработчиков для кнопок
function setupButtonHandlers() {
  const addMemoryBtn = document.getElementById('add-memory-btn');
  const projectBtn = document.getElementById('project-btn');
  
  if (addMemoryBtn) {
    console.log('Setting up memory button handler');
    addMemoryBtn.addEventListener('click', function() {
      console.log('Add memory button clicked');
      showMemoryModal('past');
    });
  } else {
    console.error('Add memory button not found!');
  }
  
  if (projectBtn) {
    console.log('Setting up project button handler');
    projectBtn.addEventListener('click', function() {
      console.log('Project button clicked');
      showMemoryModal('future');
    });
  } else {
    console.error('Project button not found!');
  }
}

// Отображение модального окна для добавления воспоминания
function showMemoryModal(type) {
  console.log(`Showing memory modal for type: ${type}`);
  
  // Проверяем, существует ли уже модальное окно
  let modal = document.querySelector('.memory-modal');
  
  // Если окна нет, создаем его
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'memory-modal';
    
    const title = type === 'past' ? 'Capture Memory Fragment' : 'Project Future Aspiration';
    
    // Создаем содержимое модального окна
    modal.innerHTML = `
      <div class="memory-modal-content">
        <h4>${title}</h4>
        <input type="text" id="memory-title" placeholder="Title" autocomplete="off">
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
        <input type="hidden" id="memory-type" value="${type}">
      </div>
    `;
    
    // Добавляем модальное окно на страницу
    document.body.appendChild(modal);
  } else {
    // Обновляем заголовок и тип воспоминания
    const title = type === 'past' ? 'Capture Memory Fragment' : 'Project Future Aspiration';
    modal.querySelector('h4').textContent = title;
    modal.querySelector('#memory-type').value = type;
    
    // Очищаем поля ввода
    modal.querySelector('#memory-title').value = '';
    modal.querySelector('#memory-desc').value = '';
    
    // Сбрасываем выбор эмоции
    modal.querySelectorAll('.emotion').forEach(emotion => {
      emotion.classList.remove('selected');
    });
  }
  
  // Подключаем обработчики событий
  setupModalHandlers(modal);
  
  // Отображаем модальное окно
  setTimeout(() => {
    modal.classList.add('active');
    playSound('open');
  }, 10);
}

// Настройка обработчиков событий модального окна
function setupModalHandlers(modal) {
  // Выбор эмоции
  const emotions = modal.querySelectorAll('.emotion');
  emotions.forEach(emotion => {
    emotion.addEventListener('click', function() {
      // Убираем выделение со всех эмоций
      emotions.forEach(e => e.classList.remove('selected'));
      // Добавляем выделение на выбранную эмоцию
      this.classList.add('selected');
      playSound('select');
    });
  });
  
  // Кнопка отмены
  const cancelBtn = modal.querySelector('#cancel-memory');
  cancelBtn.addEventListener('click', function() {
    modal.classList.remove('active');
    playSound('close');
    setTimeout(() => {
      modal.remove();
    }, 300);
  });
  
  // Кнопка сохранения
  const saveBtn = modal.querySelector('#save-memory');
  saveBtn.addEventListener('click', function() {
    const title = modal.querySelector('#memory-title').value.trim();
    const description = modal.querySelector('#memory-desc').value.trim();
    const selectedEmotion = modal.querySelector('.emotion.selected');
    const type = modal.querySelector('#memory-type').value;
    
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
    
    // Сохраняем воспоминание
    saveMemory(memory);
    
    // Закрываем модальное окно
    modal.classList.remove('active');
    playSound('success');
    setTimeout(() => {
      modal.remove();
    }, 300);
  });
}

// Генерация случайной позиции в зависимости от типа воспоминания
function generateRandomPosition(type) {
  // Прошлые воспоминания располагаются в левой части карты
  // Будущие проекции - в правой
  let x, y, z;
  
  if (type === 'past') {
    x = Math.random() * 0.4; // 0-40% ширины для прошлых воспоминаний
  } else {
    x = 0.6 + Math.random() * 0.4; // 60-100% ширины для будущих проекций
  }
  
  y = Math.random() * 0.8 + 0.1; // 10-90% высоты для всех воспоминаний
  z = Math.random() * 0.5; // глубина для 3D-эффекта
  
  return { x, y, z };
}

// Сохранение воспоминания
function saveMemory(memory) {
  // Загружаем существующие воспоминания
  memories = loadMemories();
  
  // Добавляем новое воспоминание
  memories.push(memory);
  
  // Сохраняем в localStorage
  localStorage.setItem('timeMemories', JSON.stringify(memories));
  
  // Обновляем визуализацию
  drawMemoryMap();
}

// Загрузка сохраненных воспоминаний
function loadMemories() {
  try {
    const storedMemories = localStorage.getItem('timeMemories');
    memories = storedMemories ? JSON.parse(storedMemories) : [];
    return memories;
  } catch (error) {
    console.error('Error loading memories:', error);
    return [];
  }
}

// Рисование карты воспоминаний
function drawMemoryMap() {
  if (!memoryContext || !memoryCanvas) {
    console.error('Cannot draw memory map: context or canvas not available');
    return;
  }
  
  // Загружаем воспоминания, если они еще не загружены
  if (!memories.length) {
    memories = loadMemories();
  }
  
  // Очищаем холст
  memoryContext.clearRect(0, 0, memoryCanvas.width, memoryCanvas.height);
  
  // Если нет воспоминаний, рисуем placeholder
  if (!memories.length) {
    drawPlaceholder();
    return;
  }
  
  // Рисуем соединительные линии между воспоминаниями
  drawConnectionLines();
  
  // Рисуем точки воспоминаний
  drawMemoryPoints();
}

// Рисование placeholder, когда нет воспоминаний
function drawPlaceholder() {
  memoryContext.font = '20px VT323, monospace';
  memoryContext.fillStyle = '#FFD700';
  memoryContext.textAlign = 'center';
  memoryContext.textBaseline = 'middle';
  memoryContext.fillText('No memories captured yet', memoryCanvas.width / 2, memoryCanvas.height / 2 - 15);
  memoryContext.fillText('Use the buttons below to start your constellation', memoryCanvas.width / 2, memoryCanvas.height / 2 + 15);
}

// Рисование соединительных линий между воспоминаниями
function drawConnectionLines() {
  // Сортируем воспоминания по дате
  const sortedMemories = [...memories].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  // Рисуем линии
  memoryContext.beginPath();
  let firstPoint = true;
  
  sortedMemories.forEach(memory => {
    const x = memory.position.x * memoryCanvas.width;
    const y = memory.position.y * memoryCanvas.height;
    
    if (firstPoint) {
      memoryContext.moveTo(x, y);
      firstPoint = false;
    } else {
      memoryContext.lineTo(x, y);
    }
  });
  
  memoryContext.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  memoryContext.lineWidth = 1;
  memoryContext.stroke();
}

// Рисование точек воспоминаний
function drawMemoryPoints() {
  memories.forEach(memory => {
    const x = memory.position.x * memoryCanvas.width;
    const y = memory.position.y * memoryCanvas.height;
    
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
    const gradient = memoryContext.createRadialGradient(x, y, 0, x, y, 15);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    memoryContext.fillStyle = gradient;
    memoryContext.beginPath();
    memoryContext.arc(x, y, 15, 0, Math.PI * 2);
    memoryContext.fill();
    
    // Рисуем точку
    memoryContext.fillStyle = color;
    memoryContext.beginPath();
    memoryContext.arc(x, y, 4, 0, Math.PI * 2);
    memoryContext.fill();
    
    // Добавляем подпись
    memoryContext.font = '12px VT323, monospace';
    memoryContext.fillStyle = '#FFFFFF';
    memoryContext.textAlign = 'center';
    memoryContext.fillText(memory.title, x, y - 15);
    
    // Добавляем маркер прошлое/будущее
    const typeMarker = memory.type === 'past' ? '◄' : '►';
    memoryContext.fillText(typeMarker, x, y + 15);
  });
}

// Звуковые эффекты
function playSound(type) {
  // Инициализируем AudioContext при первом вызове
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      return;
    }
  }
  
  // Создаем осциллятор и усилитель
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  // Настраиваем параметры в зависимости от типа звука
  switch (type) {
    case 'open':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
      break;
      
    case 'close':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
      break;
      
    case 'select':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
      break;
      
    case 'success':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(550, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
      break;
      
    default:
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
  }
  
  // Подключаем осциллятор к усилителю, а усилитель к выходу
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
}

// Очистка всех воспоминаний (для тестирования)
function clearAllMemories() {
  if (confirm('Are you sure you want to delete all memories?')) {
    localStorage.removeItem('timeMemories');
    memories = [];
    drawMemoryMap();
  }
}

// Экспортируем функции для глобального доступа
window.MemoryMap = {
  initialize: function() {
    loadMemories();
    drawMemoryMap();
  },
  addMemory: function(type) {
    showMemoryModal(type);
  },
  clearMemories: clearAllMemories
};