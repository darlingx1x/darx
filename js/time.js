/*
 * time.js
 * Скрипт для расчёта оставшегося времени, анимации космического путешествия,
 * управления настройками и обновления интерфейса.
 */

// Класс для расчёта жизненных показателей
class LifeTimeCalculator {
    constructor(settings = {}) {
      // Значения по умолчанию с возможностью переопределения через settings
      this.settings = {
        birthdate: new Date('2004-05-16'),
        lifeExpectancy: 70,      // в годах
        activeThreshold: 50,     // граница активной жизни
        sleepHours: 8,           // часов в день
        workHours: 40,           // часов в неделю
        commuteHours: 1,         // часов в день
        necessitiesHours: 2,     // часов в день
        ...settings
      };
      this.updateCalculations();
    }
  
    // Пересчитывает все показатели
    updateCalculations() {
      this.calculateAge();
      this.calculateRemainingTime();
      this.updateUI();
    }
  
    // Вычисление текущего возраста
    calculateAge() {
      const now = new Date();
      const birthDate = new Date(this.settings.birthdate);
      let age = now.getFullYear() - birthDate.getFullYear();
      const monthDiff = now.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
        age--;
      }
      // Точный возраст в годах с учетом месяцев
      this.ageExact = (now - birthDate) / (1000 * 60 * 60 * 24 * 365.25);
      this.age = age;
    }
  
    // Вычисление оставшегося времени и распределение часов
    calculateRemainingTime() {
      this.yearsRemaining = this.settings.lifeExpectancy - this.ageExact;
      this.daysRemaining = Math.round(this.yearsRemaining * 365.25);
      const hoursPerYear = 365.25 * 24;
      const totalRemainingHours = this.yearsRemaining * hoursPerYear;
      // Общие затраты времени по категориям
      this.sleepHoursTotal = this.yearsRemaining * 365.25 * this.settings.sleepHours;
      const workingYearsRemaining = Math.min(this.yearsRemaining, Math.max(0, 50 - this.ageExact));
      this.workHoursTotal = workingYearsRemaining * 52 * this.settings.workHours;
      this.commuteHoursTotal = workingYearsRemaining * 260 * this.settings.commuteHours;
      this.necessitiesHoursTotal = this.yearsRemaining * 365.25 * this.settings.necessitiesHours;
      // Свободное время рассчитывается как оставшиеся часы после вычитания прочего времени
      this.freeTimeHoursTotal = totalRemainingHours - (
        this.sleepHoursTotal +
        this.workHoursTotal +
        this.commuteHoursTotal +
        this.necessitiesHoursTotal
      );
      // Расчет процентов для прогресс-баров
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
  
    // Форматирование чисел с заданным количеством десятичных знаков
    formatNumber(number, decimalPlaces = 0) {
      return number.toLocaleString(undefined, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      });
    }
  
    // Форматирование времени в подходящих единицах
    formatTime(hours) {
      if (hours < 24) {
        return `${Math.round(hours)} hours`;
      } else if (hours < 24 * 30) {
        return `${Math.round(hours / 24)} days`;
      } else if (hours < 24 * 365.25) {
        return `${Math.round(hours / 24 / 30)} months`;
      } else {
        const years = hours / 24 / 365.25;
        return years < 10 ? `${this.formatNumber(years, 1)} years` : `${Math.round(years)} years`;
      }
    }
  
    // Обновление пользовательского интерфейса с новыми значениями
    updateUI() {
      document.getElementById('age-value').textContent = this.formatNumber(this.ageExact, 1);
      document.getElementById('years-left-value').textContent = this.formatNumber(this.yearsRemaining, 1);
      document.getElementById('days-left-value').textContent = this.formatNumber(this.daysRemaining);
      document.getElementById('hours-left-value').textContent = this.formatNumber(Math.round(this.freeTimeHoursTotal));
      // Обновление прогресс-баров
      const activeProgressBar = document.getElementById('active-progress');
      const activeProgressLabel = document.getElementById('progress-label');
      activeProgressBar.style.width = `${this.activeLifePercentage}%`;
      activeProgressLabel.textContent = `Active Life: ${Math.round(this.activeLifePercentage)}%`;
      const laterProgressBar = document.getElementById('later-progress');
      const laterProgressLabel = document.getElementById('later-progress-label');
      laterProgressBar.style.width = `${this.laterLifePercentage}%`;
      laterProgressLabel.textContent = `Later Life: ${Math.round(this.laterLifePercentage)}%`;
      // Обновление списка распределения времени
      document.getElementById('sleep-value').textContent = this.formatTime(this.sleepHoursTotal);
      document.getElementById('work-value').textContent = this.formatTime(this.workHoursTotal);
      document.getElementById('commute-value').textContent = this.formatTime(this.commuteHoursTotal);
      document.getElementById('necessities-value').textContent = this.formatTime(this.necessitiesHoursTotal);
      document.getElementById('free-time-value').textContent = this.formatTime(this.freeTimeHoursTotal);
    }
  
    // Обновление настроек и повторный пересчёт
    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings };
      this.updateCalculations();
    }
  }
  
  // Класс для анимации звездного поля (космическая визуализация)
  class StarFieldAnimation {
    constructor(container) {
      this.container = container;
      this.stars = [];
      this.init();
    }
  
    // Инициализация звездного поля с учетом прошедших месяцев жизни
    init() {
      // Очищаем контейнер перед созданием новых звезд
      this.container.innerHTML = '';
      const now = new Date();
      const birthDate = new Date(calculatorInstance.settings.birthdate);
      const lifeExpectancyDate = new Date(birthDate);
      lifeExpectancyDate.setFullYear(birthDate.getFullYear() + calculatorInstance.settings.lifeExpectancy);
      const totalMonths = (lifeExpectancyDate.getFullYear() - birthDate.getFullYear()) * 12 +
                          (lifeExpectancyDate.getMonth() - birthDate.getMonth());
      const monthsLived = (now.getFullYear() - birthDate.getFullYear()) * 12 +
                          (now.getMonth() - birthDate.getMonth());
      for (let i = 0; i < totalMonths; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 3 + 1;         // Размер от 1 до 4px
        const top = Math.random() * 100;              // Положение по вертикали в %
        const duration = Math.random() * 10 + 20;     // Длительность анимации 20-30s
        const delay = -i * (duration / totalMonths);  // Сдвиг анимации для равномерного распределения
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.top = `${top}%`;
        star.style.animationDuration = `${duration}s`;
        star.style.animationDelay = `${delay}s`;
        // Цвет для прошедших месяцев (золотой)
        if (i < monthsLived) {
          star.style.background = '#FFD700';
        }
        this.container.appendChild(star);
        this.stars.push(star);
      }
    }
  }
  
  // Глобальные переменные
  let calculatorInstance;
  let starFieldAnimation;
  
  // Загрузка сохранённых настроек из localStorage
  function loadSettings() {
    const savedSettings = localStorage.getItem('timeCalculatorSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      document.getElementById('birthdate').value = settings.birthdate || '2004-05-16';
      document.getElementById('life-expectancy').value = settings.lifeExpectancy || 70;
      document.getElementById('active-threshold').value = settings.activeThreshold || 50;
      document.getElementById('sleep-hours').value = settings.sleepHours || 8;
      document.getElementById('work-hours').value = settings.workHours || 40;
      document.getElementById('commute-hours').value = settings.commuteHours || 1;
      document.getElementById('necessities-hours').value = settings.necessitiesHours || 2;
      calculatorInstance.updateSettings(settings);
      starFieldAnimation.init();
    }
  }
  
  // Анимационный цикл, использующий requestAnimationFrame вместо setInterval
  let lastUpdateTime = 0;
  function animate(timestamp) {
    // Обновляем расчёты примерно раз в секунду
    if (timestamp - lastUpdateTime > 1000) {
      calculatorInstance.updateCalculations();
      lastUpdateTime = timestamp;
    }
    requestAnimationFrame(animate);
  }
  
  // Основные события при загрузке документа
  document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем калькулятор и звездное поле
    calculatorInstance = new LifeTimeCalculator();
    starFieldAnimation = new StarFieldAnimation(document.getElementById('star-field'));
    
    // Переключение панели настроек
    const settingsToggleBtn = document.getElementById('settings-toggle-btn');
    const settingsPanel = document.getElementById('settings-panel');
    settingsToggleBtn.addEventListener('click', () => {
      settingsPanel.classList.toggle('visible');
    });
    
    // Применение новых настроек
    const applyBtn = document.getElementById('apply-btn');
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
      calculatorInstance.updateSettings(newSettings);
      starFieldAnimation.init();
      settingsPanel.classList.remove('visible');
      localStorage.setItem('timeCalculatorSettings', JSON.stringify(newSettings));
    });
    
    // Сброс настроек к значениям по умолчанию
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', () => {
      document.getElementById('birthdate').value = '2004-05-16';
      document.getElementById('life-expectancy').value = '70';
      document.getElementById('active-threshold').value = '50';
      document.getElementById('sleep-hours').value = '8';
      document.getElementById('work-hours').value = '40';
      document.getElementById('commute-hours').value = '1';
      document.getElementById('necessities-hours').value = '2';
      const defaultSettings = {
        birthdate: '2004-05-16',
        lifeExpectancy: 70,
        activeThreshold: 50,
        sleepHours: 8,
        workHours: 40,
        commuteHours: 1,
        necessitiesHours: 2
      };
      calculatorInstance.updateSettings(defaultSettings);
      starFieldAnimation.init();
      localStorage.removeItem('timeCalculatorSettings');
    });
    
    // Эффект мигания при нажатии на карточки статистики
    document.querySelectorAll('.stat-card').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.add('blink');
        setTimeout(() => {
          card.classList.remove('blink');
        }, 1000);
      });
    });
    
    // Загрузка сохранённых настроек (если есть)
    loadSettings();
    
    // Запуск анимационного цикла
    requestAnimationFrame(animate);
  });
  