function getPageContent() {
  const article = document.querySelector('article') || document.body;
  return article.innerText;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getContent') {
    const content = getPageContent();
    sendResponse({ content });
  }
}); 