function getPageContent() {
    // 常见的主要内容容器选择器，按优先级排序
    const mainSelectors = [
        'article',
        '[role="main"]',
        '.main-content',
        '#main-content',
        '.post-content',
        '.article-content',
        '.content-main',
        '.entry-content',
        '.post',
        'main',
        // 更多特定网站的选择器
        '.article-body',
        '.article__content',
        '.story-body',
        '.story-content',
        '.news-content',
        // 如果找不到特定容器，尝试更通用的选择器
        '#content',
        '.content',
        // 最后的后备选项
        'body'
    ];

    function getTextContent(element) {
        const clone = element.cloneNode(true);
        
        // 更新移除选择器，保留文章相关内容
        const removeSelectors = [
            'script', 'style', 'iframe', 
            'nav:not([role="navigation"])', 
            'header:not(.article-header):not([role="banner"])',
            'footer:not(.article-footer)',
            '.advertisement', 
            '.sidebar:not(.article-sidebar)',
            '.social-share:not(.article-share)',
            '.comments:not(.article-comments)',
            'form:not(.article-form)',
            '.search',
            '.newsletter',
            '[role="complementary"]',
            // Medium 特定的选择器
            '.metabar',
            '.js-metabar',
            '.js-postShareWidget',
            '.js-stickyFooter'
        ];
        
        removeSelectors.forEach(selector => {
            clone.querySelectorAll(selector).forEach(el => el.remove());
        });
        
        return clone;
    }

    // 针对 Medium 的特殊处理
    function findMediumArticleContent() {
        // Medium 文章内容的常见容器
        const mediumSelectors = [
            'article',
            '.article-content',
            '.story-content',
            '.post-content',
            '[data-testid="postContent"]',
            '.section-content'
        ];

        for (const selector of mediumSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                return element;
            }
        }
        return null;
    }

    // 尝试找到主要内容容器
    let mainContent = findMediumArticleContent();
    if (!mainContent) {
        // 如果不是 Medium 文章，使用常规查找逻辑
        for (const selector of mainSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim().length > 100) {
                mainContent = element;
                break;
            }
        }
    }

    const cleanedContent = getTextContent(mainContent);
    let markdown = '';

    // 1. 获取标题
    const metaTitle = document.querySelector('meta[property="og:title"]')?.content 
        || document.title;
    
    const h1 = cleanedContent.querySelector('h1');
    if (h1) {
        markdown += `# ${h1.textContent.trim()}\n\n`;
    } else {
        const firstHeader = cleanedContent.querySelector('h2, h3, h4, h5, h6');
        markdown += `# ${firstHeader ? firstHeader.textContent.trim() : metaTitle}\n\n`;
    }

    // 2. 按顺序处理所有内容
    function processNode(node) {
        if (!node) return;

        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (text) {
                markdown += text + ' ';
            }
            return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return;

        const tagName = node.tagName.toLowerCase();

        // 处理特定标签
        switch (tagName) {
            case 'h1':
                markdown += '\n\n# ' + node.textContent.trim() + '\n\n';
                break;
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
                markdown += '\n\n' + '#'.repeat(parseInt(tagName[1])) + ' ' + node.textContent.trim() + '\n\n';
                break;
            case 'img':
                const imgSrc = node.src || node.dataset.src;
                const imgAlt = node.alt || node.title || '图片';
                if (imgSrc && !imgSrc.includes('data:image')) {
                    markdown += `\n\n![${imgAlt}](${imgSrc})\n\n`;
                }
                break;
            case 'figure':
                const figImg = node.querySelector('img');
                const figCaption = node.querySelector('figcaption');
                if (figImg) {
                    const src = figImg.src || figImg.dataset.src;
                    const caption = figCaption ? figCaption.textContent.trim() : (figImg.alt || '图片');
                    if (src && !src.includes('data:image')) {
                        markdown += `\n\n![${caption}](${src})\n`;
                        if (figCaption) {
                            markdown += `*${caption}*\n\n`;
                        }
                    }
                }
                break;
            case 'p':
                if (node.classList.contains('pw-post-body-paragraph') || 
                    node.hasAttribute('data-selectable-paragraph')) {
                    markdown += '\n\n' + node.textContent.trim() + '\n\n';
                } else {
                    // 检查段落是否包含标题样式的文本
                    const style = window.getComputedStyle(node);
                    const fontSize = parseInt(style.fontSize);
                    const fontWeight = style.fontWeight;
                    
                    if (fontSize > 20 || parseInt(fontWeight) >= 600) {
                        // 可能是标题文本
                        markdown += '\n\n## ' + node.textContent.trim() + '\n\n';
                    } else {
                        markdown += '\n\n';
                        Array.from(node.childNodes).forEach(child => processNode(child));
                        markdown += '\n\n';
                    }
                }
                break;
            case 'div':
                // 检查div是否包含标题样式
                const divStyle = window.getComputedStyle(node);
                const divFontSize = parseInt(divStyle.fontSize);
                const divFontWeight = divStyle.fontWeight;
                
                if (divFontSize > 20 || parseInt(divFontWeight) >= 600) {
                    // 可能是标题文本
                    markdown += '\n\n## ' + node.textContent.trim() + '\n\n';
                } else {
                    // 递归处理子节点
                    Array.from(node.childNodes).forEach(child => processNode(child));
                }
                break;
            case 'blockquote':
                markdown += '\n\n> ' + node.textContent.trim() + '\n\n';
                break;
            case 'strong':
            case 'b':
                markdown += '**' + node.textContent.trim() + '** ';
                break;
            case 'em':
            case 'i':
                markdown += '_' + node.textContent.trim() + '_ ';
                break;
            case 'a':
                const url = node.href;
                const text = node.textContent.trim();
                if (text && url && !url.startsWith('javascript:') && !url.startsWith('#')) {
                    markdown += `[${text}](${url})`;
                } else {
                    markdown += text;
                }
                break;
            case 'ul':
            case 'ol':
                markdown += '\n\n';
                const isOrdered = tagName === 'ol';
                Array.from(node.children).forEach((li, index) => {
                    const prefix = isOrdered ? `${index + 1}. ` : '* ';
                    markdown += prefix + li.textContent.trim() + '\n';
                });
                markdown += '\n';
                break;
            case 'br':
                markdown += '\n';
                break;
            default:
                // 递归处理其他元素的子节点
                Array.from(node.childNodes).forEach(child => processNode(child));
        }
    }

    // 处理所有内容节点
    Array.from(cleanedContent.childNodes).forEach(node => processNode(node));

    // 清理多余的空行和空格
    markdown = markdown
        .replace(/\n\s*\n\s*\n/g, '\n\n')  // 将多个空行减少为两个
        .replace(/\s+$/gm, '')              // 删除行尾空格
        .trim();

    return markdown;
}

// 执行转换并在控制台输出结果
console.log('页面内容的Markdown格式：');
console.log('------------------------');
console.log(getPageContent());
console.log('------------------------'); 