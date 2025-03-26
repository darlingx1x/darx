/**
 * quotes-custom.js
 * Функционал для добавления пользовательских цитат
 */

document.addEventListener('DOMContentLoaded', function() {
    // Находим контейнер для цитат
    const quotesContainer = document.querySelector('.quotes-container');
    if (!quotesContainer) return;
    
    // Создаем форму для добавления цитат
    const quoteForm = document.createElement('div');
    quoteForm.className = 'quote-form';
    quoteForm.innerHTML = `
        <h3 class="form-title">Добавить свою цитату</h3>
        <div class="form-field">
            <label for="quoteText">Текст цитаты:</label>
            <textarea id="quoteText" placeholder="Введите текст цитаты..." rows="3"></textarea>
        </div>
        <div class="form-field">
            <label for="quoteAuthor">Автор:</label>
            <input type="text" id="quoteAuthor" placeholder="Имя автора">
        </div>
        <div class="form-actions">
            <button id="saveQuote" class="save-quote-btn">
                <span class="terminal-prefix">$></span> <span>Сохранить цитату</span>
            </button>
        </div>
    `;
    
    // Вставляем форму перед контейнером цитат
    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
        aboutSection.insertBefore(quoteForm, quotesContainer);
    }
    
    // Добавляем разделитель между формой и списком цитат
    const divider = document.createElement('div');
    divider.className = 'quotes-divider';
    aboutSection.insertBefore(divider, quotesContainer);
    
    // Добавляем секцию для пользовательских цитат
    const customQuotesContainer = document.createElement('div');
    customQuotesContainer.className = 'custom-quotes-container';
    customQuotesContainer.innerHTML = '<h3 class="custom-quotes-title">Ваши цитаты</h3>';
    
    // Вставляем контейнер для пользовательских цитат
    aboutSection.insertBefore(customQuotesContainer, quotesContainer);
    
    // Создаем кнопку переключения между предустановленными и пользовательскими цитатами
    const toggleBtn = document.createElement('div');
    toggleBtn.className = 'quotes-toggle';
    toggleBtn.innerHTML = `
        <button class="toggle-btn active" data-target="predefined">darlingx's</button>
        <button class="toggle-btn" data-target="custom">community</button>
    `;
    
    // Вставляем кнопки переключения после заголовка
    const quotesTitle = aboutSection.querySelector('.about-name');
    if (quotesTitle) {
        aboutSection.insertBefore(toggleBtn, quotesTitle.nextSibling);
    }
    
    // По умолчанию скрываем пользовательские цитаты
    customQuotesContainer.style.display = 'none';
    
    // Загружаем сохраненные цитаты
    loadCustomQuotes();
    
    // Обработчик сохранения новой цитаты
    document.getElementById('saveQuote').addEventListener('click', function() {
        const quoteText = document.getElementById('quoteText').value.trim();
        const quoteAuthor = document.getElementById('quoteAuthor').value.trim() || 'Аноним';
        
        if (quoteText) {
            // Сохраняем цитату
            saveCustomQuote(quoteText, quoteAuthor);
            
            // Очищаем форму
            document.getElementById('quoteText').value = '';
            document.getElementById('quoteAuthor').value = '';
            
            // Показываем уведомление
            showNotification('Цитата успешно сохранена!');
            
            // Переключаемся на пользовательские цитаты
            toggleQuotesView('custom');
        } else {
            showNotification('Пожалуйста, введите текст цитаты', 'error');
        }
    });
    
    // Обработчик переключения видов цитат
    document.querySelectorAll('.toggle-btn').forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            toggleQuotesView(target);
            
            // Обновляем активную кнопку
            document.querySelectorAll('.toggle-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Функция сохранения цитаты
    function saveCustomQuote(text, author) {
        // Получаем существующие цитаты
        let customQuotes = JSON.parse(localStorage.getItem('customQuotes') || '[]');
        
        // Добавляем новую цитату
        customQuotes.push({
            text: text,
            author: author,
            date: new Date().toLocaleDateString()
        });
        
        // Сохраняем обновленный список
        localStorage.setItem('customQuotes', JSON.stringify(customQuotes));
        
        // Обновляем отображение
        loadCustomQuotes();
    }
    
    // Функция загрузки пользовательских цитат
    function loadCustomQuotes() {
        const customQuotes = JSON.parse(localStorage.getItem('customQuotes') || '[]');
        const container = document.querySelector('.custom-quotes-container');
        
        // Очищаем контейнер, сохраняя заголовок
        const title = container.querySelector('.custom-quotes-title');
        container.innerHTML = '';
        container.appendChild(title);
        
        // Если нет цитат, показываем сообщение
        if (customQuotes.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-quotes-message';
            emptyMessage.textContent = 'У вас пока нет сохраненных цитат. Добавьте свою первую цитату выше!';
            container.appendChild(emptyMessage);
            return;
        }
        
        // Добавляем цитаты
        customQuotes.forEach((quote, index) => {
            const quoteItem = document.createElement('div');
            quoteItem.className = 'quote-item custom-quote';
            quoteItem.innerHTML = `
                <p class="quote-text">"${quote.text}"</p>
                <p class="quote-author">— ${quote.author}</p>
                <div class="quote-actions">
                    <button class="quote-delete" data-index="${index}">Удалить</button>
                </div>
            `;
            container.appendChild(quoteItem);
        });
        
        // Добавляем обработчики для удаления цитат
        document.querySelectorAll('.quote-delete').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                deleteCustomQuote(index);
            });
        });
    }
    
    // Функция удаления цитаты
    function deleteCustomQuote(index) {
        // Получаем существующие цитаты
        let customQuotes = JSON.parse(localStorage.getItem('customQuotes') || '[]');
        
        // Удаляем цитату
        customQuotes.splice(index, 1);
        
        // Сохраняем обновленный список
        localStorage.setItem('customQuotes', JSON.stringify(customQuotes));
        
        // Обновляем отображение
        loadCustomQuotes();
        
        // Показываем уведомление
        showNotification('Цитата удалена');
    }
    
    // Функция переключения видов цитат
    function toggleQuotesView(target) {
        if (target === 'custom') {
            quotesContainer.style.display = 'none';
            document.querySelector('.custom-quotes-container').style.display = 'block';
        } else {
            quotesContainer.style.display = 'block';
            document.querySelector('.custom-quotes-container').style.display = 'none';
        }
    }
    
    // Функция отображения уведомления
    function showNotification(message, type = 'success') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `quote-notification ${type}`;
        notification.textContent = message;
        
        // Добавляем уведомление на страницу
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});