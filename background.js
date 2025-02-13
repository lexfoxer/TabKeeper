function wildcardToRegExp(domain) {
  return domain.replace(/[.+?^${}()|[\]\\]/g, '\\$&') // экранируем спецсимволы
             .replace(/\*/g, '.*'); // заменяем * на .*
}

function shouldProtectTab(tab) {
  return new Promise((resolve) => {
    if (!tab.url) {
      resolve(false);
      return;
    }

    try {
      const url = new URL(tab.url);
      const domainWithPort = url.port ? `${url.hostname}:${url.port}` : url.hostname;
      
      chrome.storage.sync.get(['protectedDomains', 'protectedRegexps'], function(result) {
        const protectedDomains = result.protectedDomains || [];
        const protectedRegexps = result.protectedRegexps || [];
        
        // Проверяем точное совпадение доменов и wildcard
        for (const d of protectedDomains) {
          if (d.includes('*')) {
            try {
              // Разделяем домен и порт в шаблоне
              const [domainPattern, port] = d.split(':');
              const domain = url.hostname;
              
              // Если в шаблоне указан порт, проверяем его совпадение
              if (port && port !== url.port) {
                continue;
              }
              
              const regex = new RegExp('^' + wildcardToRegExp(domainPattern) + '$');
              if (regex.test(domain) && (!port || port === url.port)) {
                resolve(true);
                return;
              }
            } catch (e) {
              console.error('Ошибка в wildcard шаблоне:', e);
            }
          } else if (d === domainWithPort) {
            resolve(true);
            return;
          }
        }
        
        // Проверяем регулярные выражения
        try {
          if (protectedRegexps.some(pattern => {
            const regex = new RegExp(pattern);
            return regex.test(domainWithPort);
          })) {
            resolve(true);
            return;
          }
        } catch (e) {
          console.error('Ошибка в регулярном выражении:', e);
        }
        
        resolve(false);
      });
    } catch (e) {
      resolve(false);
    }
  });
}

async function updateAllTabs() {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    setTabDiscard(tab.id, !(await shouldProtectTab(tab)));
  }
}

function setTabDiscard(tabId, status) {
  chrome.tabs.update(tabId, {autoDiscardable: status});
}

chrome.tabs.onCreated.addListener(async function(tab) {
  setTabDiscard(tab.id, !(await shouldProtectTab(tab)));
});

chrome.tabs.onReplaced.addListener(async function(tabId) {
  const tab = await chrome.tabs.get(tabId);
  setTabDiscard(tabId, !(await shouldProtectTab(tab)));
});

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    setTabDiscard(tabId, !(await shouldProtectTab(tab)));
  }
});

chrome.runtime.onInstalled.addListener(function(details) {
  updateAllTabs();
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'sync' && (changes.protectedDomains || changes.protectedRegexps)) {
    updateAllTabs();
  }
});
