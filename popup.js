// Добавим объект с переводами
const translations = {
  ru: {
    manifest_name: "Stop Discarding",
    manifest_description: "Предотвращает автоматическую выгрузку вкладок браузером для указанных вами доменов.",
    manifest_title: "Stop Discarding",
    add_domain_section: "Добавление домена",
    domain_mode: "Домен",
    regexp_mode: "Регулярное выражение",
    add_domain_placeholder: "Введите домен (например: example.com)",
    add_regexp_placeholder: "Введите регулярное выражение",
    add_button: "Добавить",
    domain_list_section: "Список доменов",
    search_placeholder: "Поиск по списку...",
    empty_list: "Список пуст",
    no_results: "Ничего не найдено по запросу \"$QUERY$\"",
    instruction_section: "Инструкция",
    examples_title: "Примеры:",
    example_exact: "• example.com - точное совпадение домена",
    example_port: "• example.com:8080 - домен с портом",
    example_wildcard: "• *.example.com - все поддомены",
    example_wildcard_port: "• *.example.com:3000 - все поддомены с портом 3000",
    example_localhost: "• localhost:8080 - локальный домен с портом",
    regexp_examples_title: "Примеры регулярных выражений:",
    regexp_example_wildcard: "• .*\\.example\\.com - все поддомены",
    regexp_example_exact: "• ^sub\\.example\\.com$ - точное совпадение",
    instruction_p1: "Этот плагин предотвращает автоматическую выгрузку (разгрузку) вкладок браузером Chrome для указанных вами доменов.",
    instruction_p2: "Когда в Chrome открыто много вкладок, браузер может автоматически выгружать неактивные вкладки для экономии памяти. При возврате к такой вкладке она будет загружена заново.",
    instruction_p3: "Вы можете защитить важные вкладки от выгрузки, добавив их домены в список:",
    instruction_p4: "Это особенно полезно для:",
    instruction_li1: "Конкретный домен (example.com)",
    instruction_li2: "Домен с портом (localhost:8080)",
    instruction_li3: "Все поддомены (*.example.com)",
    instruction_li4: "Регулярное выражение для сложных правил",
    instruction_li5: "Веб-приложений, которые должны оставаться активными",
    instruction_li6: "Сервисов мониторинга и уведомлений",
    instruction_li7: "Локальной разработки (localhost)",
    instruction_li8: "Важных рабочих инструментов",
    settings_section: "Настройки",
    language_label: "Язык интерфейса"
  },
  en: {
    manifest_name: "Stop Discarding",
    manifest_description: "Prevents Chrome from automatically discarding tabs for specified domains.",
    manifest_title: "Stop Discarding",
    add_domain_section: "Add Domain",
    domain_mode: "Domain",
    regexp_mode: "Regular Expression",
    add_domain_placeholder: "Enter domain (e.g. example.com)",
    add_regexp_placeholder: "Enter regular expression",
    add_button: "Add",
    domain_list_section: "Domain List",
    search_placeholder: "Search in list...",
    empty_list: "List is empty",
    no_results: "No results found for \"$QUERY$\"",
    instruction_section: "Instructions",
    examples_title: "Examples:",
    example_exact: "• example.com - exact domain match",
    example_port: "• example.com:8080 - domain with port",
    example_wildcard: "• *.example.com - all subdomains",
    example_wildcard_port: "• *.example.com:3000 - all subdomains with port 3000",
    example_localhost: "• localhost:8080 - local domain with port",
    regexp_examples_title: "Regular Expression Examples:",
    regexp_example_wildcard: "• .*\\.example\\.com - all subdomains",
    regexp_example_exact: "• ^sub\\.example\\.com$ - exact match",
    instruction_p1: "This extension prevents Chrome from automatically discarding tabs for domains you specify.",
    instruction_p2: "When Chrome has many tabs open, it may automatically discard inactive tabs to save memory. When you return to such a tab, it will be reloaded.",
    instruction_p3: "You can protect important tabs from being discarded by adding their domains to the list:",
    instruction_p4: "This is especially useful for:",
    instruction_li1: "Specific domain (example.com)",
    instruction_li2: "Domain with port (localhost:8080)",
    instruction_li3: "All subdomains (*.example.com)",
    instruction_li4: "Regular expression for complex rules",
    instruction_li5: "Web applications that need to stay active",
    instruction_li6: "Monitoring and notification services",
    instruction_li7: "Local development (localhost)",
    instruction_li8: "Important work tools",
    settings_section: "Settings",
    language_label: "Interface Language"
  }
};

// Обновим функцию локализации
function localizeHtml() {
  chrome.storage.sync.get(['selectedLanguage'], function(result) {
    const lang = result.selectedLanguage || 'ru';
    const messages = translations[lang];

    // Локализация текстовых элементов
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = messages[key];
    });

    // Локализация placeholder'ов
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = messages[key];
    });
  });
}

// Обновим функцию setLanguage
function setLanguage(lang) {
  chrome.storage.sync.set({ selectedLanguage: lang }, function() {
    localizeHtml();
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // Загружаем сохраненный язык
  chrome.storage.sync.get(['selectedLanguage'], function(result) {
    const lang = result.selectedLanguage || 'ru';
    document.getElementById('language-select').value = lang.startsWith('ru') ? 'ru' : 'en';
  });

  // Добавляем обработчик смены языка
  document.getElementById('language-select').addEventListener('change', function() {
    setLanguage(this.value);
  });

  // Добавляем вызов функции локализации
  localizeHtml();
  
  loadItems();
  
  document.getElementById('add-btn').addEventListener('click', addItem);
  document.getElementById('add-domain').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addItem();
    }
  });

  const input = document.getElementById('add-domain');
  let validationTimeout;

  // Добавляем обработчик ввода для валидации регулярных выражений
  input.addEventListener('input', function() {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const value = this.value.trim();
    const validationMessage = document.getElementById('validation-message');
    
    clearTimeout(validationTimeout);
    validationTimeout = setTimeout(() => {
      if (!value) {
        input.classList.remove('invalid');
        validationMessage.textContent = '';
        return;
      }

      if (mode === 'regexp') {
        try {
          new RegExp(value);
          input.classList.remove('invalid');
          validationMessage.textContent = '';
        } catch (e) {
          input.classList.add('invalid');
          validationMessage.textContent = `Ошибка в регулярном выражении: ${e.message}`;
        }
      } else {
        const validation = validateDomain(value.toLowerCase());
        if (!validation.valid) {
          input.classList.add('invalid');
          validationMessage.textContent = validation.error;
        } else {
          input.classList.remove('invalid');
          validationMessage.textContent = '';
        }
      }
    }, 300);
  });

  // Обработка переключения режима
  document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const hint = document.getElementById('regexp-hint');
      const examples = document.getElementById('domain-examples');
      const validationMessage = document.getElementById('validation-message');
      if (this.value === 'regexp') {
        input.placeholder = 'Введите регулярное выражение';
        hint.classList.add('show');
        examples.classList.remove('show');
        // Проверяем текущее значение при переключении на regexp
        if (input.value.trim()) {
          try {
            new RegExp(input.value.trim());
            input.classList.remove('invalid');
            validationMessage.textContent = '';
          } catch (e) {
            input.classList.add('invalid');
            validationMessage.textContent = `Ошибка в регулярном выражении: ${e.message}`;
          }
        }
      } else {
        input.placeholder = 'Введите домен (например: example.com или *.example.com)';
        hint.classList.remove('show');
        examples.classList.add('show');
        input.classList.remove('invalid');
        validationMessage.textContent = '';
      }
    });
  });

  // При загрузке страницы показываем примеры для доменов
  document.getElementById('domain-examples').classList.add('show');

  // Добавляем обработчики для поиска
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');

  searchInput.addEventListener('input', function() {
    const searchValue = this.value.trim().toLowerCase();
    searchClear.classList.toggle('show', searchValue.length > 0);
    filterItems(searchValue);
  });

  searchClear.addEventListener('click', function() {
    searchInput.value = '';
    searchClear.classList.remove('show');
    filterItems('');
  });

  // Заменим обработку табов на обработку спойлеров
  document.querySelectorAll('.spoiler-header').forEach(header => {
    header.addEventListener('click', function() {
      const targetId = this.dataset.target;
      const content = document.getElementById(targetId);
      
      // Переключаем текущий спойлер
      this.classList.toggle('active');
      content.classList.toggle('show');
    });
  });

  // По умолчанию открываем первый спойлер
  document.querySelector('.spoiler-header').click();
});

function loadItems() {
  chrome.storage.sync.get(['protectedDomains', 'protectedRegexps'], function(result) {
    const domains = result.protectedDomains || [];
    const regexps = result.protectedRegexps || [];
    
    // Сохраняем все элементы в глобальной переменной
    window.allItems = [
      ...domains.map(d => ({ value: d, type: 'domain' })),
      ...regexps.map(r => ({ value: r, type: 'regexp' }))
    ];
    
    renderItems(window.allItems);
  });
}

function addItemToList(value, type) {
  const domainList = document.getElementById('domain-list');
  const div = document.createElement('div');
  div.className = 'domain-item';
  
  let typeLabel = type === 'regexp' ? 'RegExp' : 'Domain';
  if (type === 'domain' && value.includes('*')) {
    typeLabel = 'Wildcard';
  }
  
  div.innerHTML = `
    <span>
      <span class="item-type">[${typeLabel}]</span>
      <span>${value}</span>
    </span>
    <span class="delete-btn" data-value="${value}" data-type="${type}">✖</span>
  `;
  domainList.appendChild(div);
  
  div.querySelector('.delete-btn').addEventListener('click', function() {
    removeItem(this.dataset.value, this.dataset.type);
  });
}

function validateDomain(domain) {
  // Проверка на пробелы
  if (domain.includes(' ')) {
    return { valid: false, error: 'Домен не должен содержать пробелы' };
  }

  // Разрешаем localhost с опциональным портом
  if (domain === 'localhost' || /^localhost:\d+$/.test(domain)) {
    return { valid: true };
  }

  // Разделяем домен и порт
  const [domainPart, port] = domain.split(':');

  // Проверяем базовые требования к домену
  if (!domainPart) {
    return { valid: false, error: 'Домен не может быть пустым' };
  }

  if (domainPart.length > 255) {
    return { valid: false, error: 'Длина домена не может превышать 255 символов' };
  }

  // Проверяем порт, если он указан
  if (port !== undefined) {
    const portNum = parseInt(port, 10);
    if (isNaN(portNum)) {
      return { valid: false, error: 'Порт должен быть числом' };
    }
    if (portNum < 1 || portNum > 65535) {
      return { valid: false, error: 'Порт должен быть в диапазоне от 1 до 65535' };
    }
  }

  // Проверка для wildcard-доменов
  if (domainPart.includes('*')) {
    if (domainPart.startsWith('*') && !domainPart.startsWith('*.')) {
      return { valid: false, error: 'Wildcard должен использоваться с точкой: *.example.com' };
    }
    if (domainPart.endsWith('*')) {
      return { valid: false, error: 'Wildcard не может быть в конце домена' };
    }
    if (domainPart.split('*').length > 2) {
      return { valid: false, error: 'Можно использовать только один wildcard' };
    }
    
    // Проверяем части домена после wildcard
    const parts = domainPart.split('.');
    if (parts.length < 2) {
      return { valid: false, error: 'Домен должен содержать как минимум две части (например: *.example.com)' };
    }
    
    const domainWithoutWildcard = parts.slice(1).join('.');
    
    try {
      const punycodeUrl = new URL(`http://${domainWithoutWildcard}`);
      const punycodeHostname = punycodeUrl.hostname;
      
      // Проверяем оставшуюся часть домена
      const domainRegex = /^([\w-]+\.)*[\w-]+$|^(xn--[a-z0-9]+\.)*[\w-]+$/i;
      if (!domainRegex.test(punycodeHostname)) {
        return { valid: false, error: 'Неверный формат домена. Допустимы буквы, цифры, дефис и точка' };
      }
      return { valid: true };
    } catch (e) {
      return { valid: false, error: 'Неверный формат домена. Проверьте правильность написания' };
    }
  }

  // Для обычных доменов
  try {
    const punycodeUrl = new URL(`http://${domainPart}`);
    const punycodeHostname = punycodeUrl.hostname;

    // Проверяем, что домен не начинается или не заканчивается дефисом
    if (domainPart.startsWith('-') || domainPart.endsWith('-')) {
      return { valid: false, error: 'Домен не может начинаться или заканчиваться дефисом' };
    }

    // Проверяем, что между точками нет пустых частей
    if (domainPart.includes('..')) {
      return { valid: false, error: 'Домен не может содержать последовательные точки' };
    }

    // Базовая проверка домена с поддержкой IDN (русских доменов)
    const domainRegex = /^([\w-]+\.)*[\w-]+$|^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(xn--[a-z0-9]+\.)*[\w-]+$/i;
    
    if (!domainRegex.test(punycodeHostname)) {
      return { valid: false, error: 'Неверный формат домена. Допустимы буквы, цифры, дефис и точка' };
    }

    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'Неверный формат домена. Проверьте правильность написания' };
  }
}

function addItem() {
  const input = document.getElementById('add-domain');
  const value = input.value.trim();
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const validationMessage = document.getElementById('validation-message');
  
  if (!value) {
    input.classList.add('invalid');
    validationMessage.textContent = 'Поле не может быть пустым';
    setTimeout(() => {
      input.classList.remove('invalid');
      validationMessage.textContent = '';
    }, 2000);
    return;
  }
  
  if (mode === 'regexp') {
    try {
      new RegExp(value);
    } catch (e) {
      input.classList.add('invalid');
      validationMessage.textContent = `Ошибка в регулярном выражении: ${e.message}`;
      setTimeout(() => {
        input.classList.remove('invalid');
        validationMessage.textContent = '';
      }, 2000);
      return;
    }
  } else {
    // Валидация домена
    const validation = validateDomain(value.toLowerCase());
    if (!validation.valid) {
      input.classList.add('invalid');
      validationMessage.textContent = validation.error;
      setTimeout(() => {
        input.classList.remove('invalid');
        validationMessage.textContent = '';
      }, 2000);
      return;
    }

    // Преобразуем русский домен в punycode при необходимости
    try {
      const [domainPart, port] = value.toLowerCase().split(':');
      const punycodeUrl = new URL(`http://${domainPart}`);
      value = punycodeUrl.hostname + (port ? `:${port}` : '');
    } catch (e) {
      console.error('Ошибка преобразования домена:', e);
    }
  }
  
  const storageKey = mode === 'regexp' ? 'protectedRegexps' : 'protectedDomains';
  
  chrome.storage.sync.get([storageKey], function(result) {
    const items = result[storageKey] || [];
    if (!items.includes(value)) {
      items.push(value);
      const update = {};
      update[storageKey] = items;
      chrome.storage.sync.set(update, function() {
        loadItems();
        input.value = '';
        input.title = '';
        // Открываем спойлер со списком
        const listHeader = document.querySelector('[data-target="list-section"]');
        const listContent = document.getElementById('list-section');
        if (!listContent.classList.contains('show')) {
          listHeader.click();
        }
      });
    } else {
      input.classList.add('invalid');
      input.title = 'Этот домен уже добавлен';
      setTimeout(() => {
        input.classList.remove('invalid');
        input.title = '';
      }, 2000);
    }
  });
}

function removeItem(value, type) {
  const storageKey = type === 'regexp' ? 'protectedRegexps' : 'protectedDomains';
  chrome.storage.sync.get([storageKey], function(result) {
    const items = result[storageKey] || [];
    const newItems = items.filter(item => item !== value);
    const update = {};
    update[storageKey] = newItems;
    chrome.storage.sync.set(update, loadItems);
  });
}

// Добавляем функцию для фильтрации элементов
function filterItems(searchValue) {
  if (!window.allItems) return;
  
  const filteredItems = searchValue
    ? window.allItems.filter(item => 
        item.value.toLowerCase().includes(searchValue.toLowerCase()))
    : window.allItems;
  
  renderItems(filteredItems);
}

// Добавляем функцию для отображения элементов
function renderItems(items) {
  const domainList = document.getElementById('domain-list');
  domainList.innerHTML = '';
  
  if (items.length === 0) {
    const searchValue = document.getElementById('search-input').value.trim();
    domainList.innerHTML = `<div class="no-results">${
      searchValue 
        ? `Ничего не найдено по запросу "${searchValue}"`
        : 'Список пуст'
    }</div>`;
    return;
  }
  
  items.forEach(item => {
    addItemToList(item.value, item.type);
  });
} 
