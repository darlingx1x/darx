/**
 * time.js - Оптимизированная версия
 * Расчёт оставшегося времени жизни с точностью до секунды
 */

// Класс для расчёта жизненных показателей
class LifeTimeCalculator {
    constructor(settings = {}) {
      // Значения по умолчанию с возможностью переопределения через settings
      this.settings = {
        birthdate: new Date('2004-05-16'),
        lifeExpectancy: 70,
        activeThreshold: 50,
        sleepHours: 8,
        workHours: 40,
        commuteHours: 1,
        necessitiesHours: 2,
        ...settings
      };
      
      // Запускаем первичное обновление
      this.updateCalculations();
      
      // Запускаем обновление каждую секунду
      this.startRealtimeUpdate();
    }
  
    // Запуск обновления в реальном времени
    startRealtimeUpdate() {
      // Обновляем каждую секунду
      this.intervalId = setInterval(() => {
        this.updateCalculations();
      }, 1000);
    }
  
    // Остановка обновления
    stopRealtimeUpdate() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
    }
  
    // Пересчитывает все показатели
    updateCalculations() {
      this.calculateAge();
      this.calculateRemainingTime();
      this.updateUI();
    }
  
    // Вычисление текущего возраста с точностью до миллисекунды
    calculateAge() {
      const now = new Date();
      const birthDate = new Date(this.settings.birthdate);
      
      // Рассчитываем точный возраст в миллисекундах
      const millisecondsDiff = now - birthDate;
      const millisecondsInYear = 365.25 * 24 * 60 * 60 * 1000;
      
      // Точный возраст с миллисекундной точностью
      this.ageExact = millisecondsDiff / millisecondsInYear;
      
      // Целое количество лет (для отображения)
      let age = now.getFullYear() - birthDate.getFullYear();
      const monthDiff = now.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
        age--;
      }
      this.age = age;
    }
  
    // Вычисление оставшегося времени и распределение часов
    calculateRemainingTime() {
      // Расчет оставшегося времени
      this.yearsRemaining = this.settings.lifeExpectancy - this.ageExact;
      this.daysRemaining = this.yearsRemaining * 365.25;
      
      // Перевод в различные единицы измерения для отображения
      const hoursPerYear = 365.25 * 24;
      const totalRemainingHours = this.yearsRemaining * hoursPerYear;
      const totalRemainingSeconds = totalRemainingHours * 3600;
      
      // Сохраняем точное время в секундах для реалтайм-обновления
      this.secondsRemaining = totalRemainingSeconds;
      
      // Расчет времени по категориям
      this.sleepHoursTotal = this.yearsRemaining * 365.25 * this.settings.sleepHours;
      const workingYearsRemaining = Math.min(this.yearsRemaining, Math.max(0, this.settings.activeThreshold - this.ageExact));
      this.workHoursTotal = workingYearsRemaining * 52 * this.settings.workHours;
      this.commuteHoursTotal = workingYearsRemaining * 260 * this.settings.commuteHours; // 260 рабочих дней в году
      this.necessitiesHoursTotal = this.yearsRemaining * 365.25 * this.settings.necessitiesHours;
      
      // Свободное время
      this.freeTimeHoursTotal = totalRemainingHours - (
        this.sleepHoursTotal +
        this.workHoursTotal +
        this.commuteHoursTotal +
        this.necessitiesHoursTotal
      );
      
      // Расчет процентов жизни для прогресс-баров
      this.activeLifePercentage = (this.ageExact / this.settings.activeThreshold) * 100;
      if (this.activeLifePercentage > 100) this.activeLifePercentage = 100;
      
      this.laterLifePercentage = 0;
      if (this.ageExact > this.settings.activeThreshold) {
        const laterLifeSpan = this.settings.lifeExpectancy - this.settings.activeThreshold;
        const laterLifeAge = this.ageExact - this.settings.activeThreshold;
        this.laterLifePercentage = (laterLifeAge / laterLifeSpan) * 100;
        if (this.laterLifePercentage > 100) this.laterLifePercentage = 100;
      }
    }
  
    // Форматирование времени для отображения
    formatTimeWithSeconds(seconds) {
      if (seconds < 60) {
        return `${Math.floor(seconds)} seconds`;
      } else if (seconds < 3600) {
        return `${Math.floor(seconds / 60)} minutes, ${Math.floor(seconds % 60)} seconds`;
      } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours} hours, ${minutes} minutes`;
      } else if (seconds < 2592000) { // ~30 дней
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        return `${days} days, ${hours} hours`;
      } else if (seconds < 31536000) { // ~365 дней
        const months = Math.floor(seconds / 2592000);
        const days = Math.floor((seconds % 2592000) / 86400);
        return `${months} months, ${days} days`;
      } else {
        const years = seconds / 31536000;
        if (years < 10) {
          return `${this.formatNumber(years, 1)} years`;
        } else {
          return `${Math.floor(years)} years`;
        }
      }
    }
  
    // Форматирование чисел
    formatNumber(number, decimalPlaces = 0) {
      return number.toLocaleString(undefined, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      });
    }
  
    // Обновление UI с новыми значениями
    updateUI() {
      // Обновляем статистику
      document.getElementById('age-value').textContent = this.formatNumber(this.ageExact, 9);
      document.getElementById('years-left-value').textContent = this.formatNumber(this.yearsRemaining, 9);
      document.getElementById('days-left-value').textContent = this.formatNumber(this.daysRemaining, 1);
      document.getElementById('hours-left-value').textContent = this.formatNumber(Math.floor(this.freeTimeHoursTotal));
      
      // Обновляем прогресс-бары
      const activeProgressBar = document.getElementById('active-progress');
      const activeProgressLabel = document.getElementById('progress-label');
      activeProgressBar.style.width = `${this.activeLifePercentage}%`;
      activeProgressLabel.textContent = `Active Life: ${Math.round(this.activeLifePercentage)}%`;
      
      const laterProgressBar = document.getElementById('later-progress');
      const laterProgressLabel = document.getElementById('later-progress-label');
      laterProgressBar.style.width = `${this.laterLifePercentage}%`;
      laterProgressLabel.textContent = `Later Life: ${Math.round(this.laterLifePercentage)}%`;
      
      // Обновляем распределение времени
      document.getElementById('sleep-value').textContent = this.formatTimeWithSeconds(this.sleepHoursTotal * 3600);
      document.getElementById('work-value').textContent = this.formatTimeWithSeconds(this.workHoursTotal * 3600);
      document.getElementById('commute-value').textContent = this.formatTimeWithSeconds(this.commuteHoursTotal * 3600);
      document.getElementById('necessities-value').textContent = this.formatTimeWithSeconds(this.necessitiesHoursTotal * 3600);
      document.getElementById('free-time-value').textContent = this.formatTimeWithSeconds(this.freeTimeHoursTotal * 3600);
    }
  
    // Обновление настроек и перерасчёт
    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings };
      this.updateCalculations();
      
      // Обновляем статичные звезды при изменении настроек
      createStarField();
    }
  }
  
  // Класс для создания статичного звездного поля
  function createStarField() {
    const container = document.getElementById('star-field');
    if (!container) return;
    
    // Очищаем контейнер перед созданием новых звезд
    container.innerHTML = '';
    
    // Текущая дата и дата рождения
    const now = new Date();
    const birthDate = new Date(calculatorInstance.settings.birthdate);
    
    // Конечная дата (ожидаемая продолжительность жизни)
    const lifeExpectancyDate = new Date(birthDate);
    lifeExpectancyDate.setFullYear(birthDate.getFullYear() + calculatorInstance.settings.lifeExpectancy);
    
    // Рассчитываем общее количество месяцев жизни
    const totalMonths = (lifeExpectancyDate.getFullYear() - birthDate.getFullYear()) * 12 +
                        (lifeExpectancyDate.getMonth() - birthDate.getMonth());
    
    // Рассчитываем количество прожитых месяцев
  const monthsLived = (now.getFullYear() - birthDate.getFullYear()) * 12 +
  (now.getMonth() - birthDate.getMonth());

// Определяем максимальное количество звезд в ряду
const starsPerRow = Math.min(Math.floor(container.clientWidth / 15), 20);

// Создаем звезды
for (let i = 0; i < totalMonths; i++) {
const star = document.createElement('div');
star.className = 'static-star';

// Если месяц уже прожит, добавляем класс past
if (i < monthsLived) {
star.classList.add('past');
}

// Добавляем информацию о месяце при наведении
const monthIndex = birthDate.getMonth() + i;
const year = birthDate.getFullYear() + Math.floor(monthIndex / 12);
const month = monthIndex % 12;
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];

star.title = `${monthNames[month]} ${year}`;
container.appendChild(star);
}
}

// Загрузка сохранённых настроек из localStorage
function loadSettings() {
const savedSettings = localStorage.getItem('timeCalculatorSettings');
if (savedSettings) {
try {
const settings = JSON.parse(savedSettings);
document.getElementById('birthdate').value = settings.birthdate || '2004-05-16';
document.getElementById('life-expectancy').value = settings.lifeExpectancy || 70;
document.getElementById('active-threshold').value = settings.activeThreshold || 50;
document.getElementById('sleep-hours').value = settings.sleepHours || 8;
document.getElementById('work-hours').value = settings.workHours || 40;
document.getElementById('commute-hours').value = settings.commuteHours || 1;
document.getElementById('necessities-hours').value = settings.necessitiesHours || 2;

// Обновляем калькулятор с загруженными настройками
calculatorInstance.updateSettings(settings);
} catch (e) {
console.error('Error loading settings:', e);
}
}
}

// Глобальная переменная для хранения экземпляра калькулятора
let calculatorInstance;

// Инициализация при загрузке документа
document.addEventListener('DOMContentLoaded', () => {
// Создаем калькулятор с настройками по умолчанию
calculatorInstance = new LifeTimeCalculator();

// Создаем статичное звездное поле
createStarField();

// Обработчик для панели настроек
const settingsToggleBtn = document.getElementById('settings-toggle-btn');
const settingsPanel = document.getElementById('settings-panel');

if (settingsToggleBtn && settingsPanel) {
settingsToggleBtn.addEventListener('click', () => {
settingsPanel.classList.toggle('visible');
});
}

// Обработчик для кнопки применения настроек
const applyBtn = document.getElementById('apply-btn');
if (applyBtn) {
applyBtn.addEventListener('click', () => {
const newSettings = {
birthdate: document.getElementById('birthdate').value,
lifeExpectancy: parseInt(document.getElementById('life-expectancy').value),
activeThreshold: parseInt(document.getElementById('active-threshold').value),
sleepHours: parseFloat(document.getElementById('sleep-hours').value),
workHours: parseFloat(document.getElementById('work-hours').value),
commuteHours: parseFloat(document.getElementById('commute-hours').value),
necessitiesHours: parseFloat(document.getElementById('necessities-hours').value)
};

// Сохраняем в localStorage
localStorage.setItem('timeCalculatorSettings', JSON.stringify(newSettings));

// Обновляем калькулятор
calculatorInstance.updateSettings(newSettings);

// Скрываем панель настроек
settingsPanel.classList.remove('visible');
});
}

// Обработчик для кнопки сброса настроек
const resetBtn = document.getElementById('reset-btn');
if (resetBtn) {
resetBtn.addEventListener('click', () => {
// Сброс значений полей формы
document.getElementById('birthdate').value = '2004-05-16';
document.getElementById('life-expectancy').value = '70';
document.getElementById('active-threshold').value = '50';
document.getElementById('sleep-hours').value = '8';
document.getElementById('work-hours').value = '40';
document.getElementById('commute-hours').value = '1';
document.getElementById('necessities-hours').value = '2';

// Настройки по умолчанию
const defaultSettings = {
birthdate: '2004-05-16',
lifeExpectancy: 70,
activeThreshold: 50,
sleepHours: 8,
workHours: 40,
commuteHours: 1,
necessitiesHours: 2
};

// Удаляем сохраненные настройки
localStorage.removeItem('timeCalculatorSettings');

// Обновляем калькулятор
calculatorInstance.updateSettings(defaultSettings);
});
}

// Добавляем эффект мигания при нажатии на карточки статистики
document.querySelectorAll('.stat-card').forEach(card => {
card.addEventListener('click', () => {
card.classList.add('blink');
setTimeout(() => {
card.classList.remove('blink');
}, 1000);
});
});

// Загружаем сохраненные настройки
loadSettings();

// Обработка события изменения размера окна
window.addEventListener('resize', () => {
// Пересоздаем звездное поле при изменении размера окна
createStarField();
});

// Обработка ухода со страницы
window.addEventListener('beforeunload', () => {
// Останавливаем обновление в реальном времени при уходе со страницы
if (calculatorInstance) {
calculatorInstance.stopRealtimeUpdate();
}
});
});