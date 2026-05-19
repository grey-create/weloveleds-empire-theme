// Complete article-toc.js file - handles TOC AND complete search functionality
// This replaces your entire article-toc.js file

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // EXISTING TOC FUNCTIONALITY (Keep this)
    // ==========================================
    const headings = document.querySelectorAll('#article-content h2, #article-content h3');
    const tocList = document.querySelector('#article-toc ul');
    
    if (tocList && headings.length > 0) {
        headings.forEach((h, i) => {
            if (!h.id) h.id = 'section-' + i;
            const li = document.createElement('li');
            if (h.tagName === 'H3') li.className = 'child';
            li.innerHTML = '<a href="#' + h.id + '">' + h.textContent + '</a>';
            tocList.appendChild(li);
        });
    }

    // Auto-assign colors to new tags (article pages)
    const autoColors = [
        '#8b5a2c', '#2dd4bf', '#f472b6', '#a855f7', '#3b82f6', 
        '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
        '#84cc16', '#f97316', '#ec4899', '#6366f1', '#14b8a6',
        '#eab308', '#e11d48', '#7c3aed', '#059669', '#dc2626'
    ];
    
    let colorIndex = 0;
    const usedTags = new Set();
    
    document.querySelectorAll('.tag-pill').forEach(pill => {
        const tagName = pill.getAttribute('data-tag');
        const computedStyle = window.getComputedStyle(pill);
        const hasCustomColor = computedStyle.backgroundColor !== 'rgb(0, 122, 204)';
        
        if (!hasCustomColor && !usedTags.has(tagName)) {
            pill.style.backgroundColor = autoColors[colorIndex % autoColors.length];
            usedTags.add(tagName);
            colorIndex++;
        }
    });

    // Smooth scrolling for TOC links
    document.querySelectorAll('#article-toc a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ==========================================
    // COMPLETE ENHANCED SEARCH FUNCTIONALITY
    // ==========================================
    
    // Only run search if we're on the blog page
    const blogSearchInput = document.getElementById('post-search');
    if (!blogSearchInput) return;
    
    let searchData = [];
    let allSuggestions = new Set();
    let suggestionsArray = [];
    let searchTimeout;
    let isSearching = false;
    
    // Initialize search system
    function initializeSearch() {
        buildSearchIndex();
        setupSearchHandlers();
        console.log('Enhanced search system initialized');
    }
    
    // Build comprehensive search index
    function buildSearchIndex() {
        const articles = document.querySelectorAll('.blog-card');
        searchData = [];
        allSuggestions = new Set();
        
        articles.forEach(card => {
            const title = card.getAttribute('data-title') || '';
            const excerpt = card.getAttribute('data-excerpt') || '';
            const tags = card.getAttribute('data-tags') || '';
            const url = card.getAttribute('data-url') || '';
            
            // Extract visible content for deeper search
            const titleElement = card.querySelector('.card-title');
            const excerptElement = card.querySelector('.card-excerpt');
            const visibleTitle = titleElement ? titleElement.textContent.trim() : '';
            const visibleExcerpt = excerptElement ? excerptElement.textContent.trim() : '';
            
            // Build comprehensive searchable text
            const allContent = [
                title, visibleTitle, excerpt, visibleExcerpt, tags
            ].join(' ').toLowerCase().replace(/\s+/g, ' ').trim();
            
            searchData.push({
                element: card,
                title: title.toLowerCase(),
                excerpt: excerpt.toLowerCase(), 
                tags: tags.toLowerCase(),
                url: url,
                searchText: allContent,
                originalTitle: title,
                originalExcerpt: excerpt
            });
            
            // Build suggestions from titles and tags
            (title + ' ' + tags).split(' ').forEach(word => {
                if (word.length > 2) {
                    allSuggestions.add(word.toLowerCase());
                }
            });
        });
        
        suggestionsArray = Array.from(allSuggestions).slice(0, 50);
        console.log(`Search index built: ${searchData.length} articles, ${suggestionsArray.length} suggestions`);
    }
    
    // Setup search event handlers
    function setupSearchHandlers() {
        blogSearchInput.addEventListener('input', handleSearchInput);
        
        // Handle suggestion dropdown clicks
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-container')) {
                const suggestions = document.getElementById('search-suggestions');
                if (suggestions) suggestions.style.display = 'none';
            }
        });
    }
    
    // Handle search input with debouncing
    function handleSearchInput(event) {
        const query = event.target.value.trim();
        const suggestions = document.getElementById('search-suggestions');
        
        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        // Handle empty search
        if (query.length === 0) {
            resetSearch();
            if (suggestions) suggestions.style.display = 'none';
            return;
        }
        
        // Show suggestions for short queries
        if (query.length >= 2) {
            showSuggestions(query);
        }
        
        // Debounced search
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 150);
    }
    
    // Show search suggestions
    function showSuggestions(query) {
        const suggestions = document.getElementById('search-suggestions');
        if (!suggestions) return;
        
        const matchingSuggestions = suggestionsArray
            .filter(word => word.includes(query.toLowerCase()) && word !== query.toLowerCase())
            .slice(0, 5);
        
        if (matchingSuggestions.length > 0) {
            suggestions.innerHTML = matchingSuggestions
                .map(word => `<div class="search-suggestion" onclick="selectSuggestion('${word}')">${word}</div>`)
                .join('');
            suggestions.style.display = 'block';
        } else {
            suggestions.style.display = 'none';
        }
    }
    
    // Perform the actual search
    function performSearch(query) {
        isSearching = true;
        blogSearchInput.classList.add('searching');
        
        const results = searchWithRelevance(query);
        displaySearchResults(results, query);
        updateSidebarSearch(query);
        
        blogSearchInput.classList.remove('searching');
    }
    
    // Search with relevance scoring
    function searchWithRelevance(query) {
        const normalizedQuery = query.toLowerCase().trim();
        const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 1);
        const results = [];
        
        searchData.forEach(article => {
            const score = calculateRelevanceScore(article, normalizedQuery, queryWords);
            if (score > 0) {
                results.push({
                    ...article,
                    relevanceScore: score
                });
            }
        });
        
        // Sort by relevance (highest first)
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);
        return results;
    }
    
    // Calculate relevance score for each article
    function calculateRelevanceScore(article, fullQuery, queryWords) {
        let score = 0;
        const { title, excerpt, tags, searchText } = article;
        
        // Exact phrase matches (highest priority)
        if (title.includes(fullQuery)) score += 100;
        if (tags.includes(fullQuery)) score += 80;
        if (excerpt.includes(fullQuery)) score += 60;
        if (searchText.includes(fullQuery)) score += 40;
        
        // Individual word matches
        queryWords.forEach(word => {
            if (title.includes(word)) score += 30;     // Title words very important
            if (tags.includes(word)) score += 25;      // Tag words important
            if (excerpt.includes(word)) score += 15;   // Excerpt words relevant
            if (searchText.includes(word)) score += 10; // General content
        });
        
        // Bonus for multiple word matches in same article
        const matchingWords = queryWords.filter(word => searchText.includes(word)).length;
        if (matchingWords > 1) {
            score += matchingWords * 8;
        }
        
        // Partial word matching for typo tolerance
        queryWords.forEach(word => {
            if (word.length > 3) {
                const partial = word.substring(0, Math.floor(word.length * 0.7));
                if (searchText.includes(partial)) {
                    score += 5;
                }
            }
        });
        
        return score;
    }
    
    // Display search results
    function displaySearchResults(results, query) {
        let visibleCount = 0;
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // First, hide all articles and reset highlighting
        searchData.forEach(item => {
            item.element.style.display = 'none';
            resetArticleHighlighting(item.element);
        });
        
        // Show and highlight matching articles
        results.forEach((result, index) => {
            result.element.style.display = '';
            result.element.style.order = index; // CSS order for relevance sorting
            
            // Add top result styling for best matches
            if (index < 3) {
                result.element.classList.add('top-result');
            } else {
                result.element.classList.remove('top-result');
            }
            
            // Highlight search terms
            highlightInArticle(result.element, query);
            visibleCount++;
        });
        
        // Show/hide no results message
        handleNoResults(visibleCount, query);
        
        // Hide suggestions
        const suggestions = document.getElementById('search-suggestions');
        if (suggestions) suggestions.style.display = 'none';
    }
    
    // Highlight search terms in article
    function highlightInArticle(article, query) {
        const titleElement = article.querySelector('.card-title');
        const excerptElement = article.querySelector('.card-excerpt');
        const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 1);
        
        // Highlight title
        if (titleElement) {
            const originalTitle = titleElement.getAttribute('data-original-text') || titleElement.textContent;
            if (!titleElement.getAttribute('data-original-text')) {
                titleElement.setAttribute('data-original-text', originalTitle);
            }
            
            let highlightedTitle = originalTitle;
            
            // Highlight full phrase first
            const fullPhraseRegex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            highlightedTitle = highlightedTitle.replace(fullPhraseRegex, '<span class="search-highlight phrase-match">$1</span>');
            
            // Then individual words
            queryWords.forEach(word => {
                const wordRegex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                highlightedTitle = highlightedTitle.replace(wordRegex, '<span class="search-highlight">$1</span>');
            });
            
            titleElement.innerHTML = highlightedTitle;
        }
        
        // Highlight excerpt
        if (excerptElement) {
            const originalExcerpt = excerptElement.getAttribute('data-original-text') || excerptElement.textContent;
            if (!excerptElement.getAttribute('data-original-text')) {
                excerptElement.setAttribute('data-original-text', originalExcerpt);
            }
            
            let highlightedExcerpt = originalExcerpt;
            
            // Highlight full phrase first
            const fullPhraseRegex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            highlightedExcerpt = highlightedExcerpt.replace(fullPhraseRegex, '<span class="search-highlight phrase-match">$1</span>');
            
            // Then individual words
            queryWords.forEach(word => {
                const wordRegex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                highlightedExcerpt = highlightedExcerpt.replace(wordRegex, '<span class="search-highlight">$1</span>');
            });
            
            excerptElement.innerHTML = highlightedExcerpt;
        }
    }
    
    // Reset article highlighting
    function resetArticleHighlighting(article) {
        const titleElement = article.querySelector('.card-title');
        const excerptElement = article.querySelector('.card-excerpt');
        
        if (titleElement && titleElement.getAttribute('data-original-text')) {
            titleElement.innerHTML = titleElement.getAttribute('data-original-text');
        }
        if (excerptElement && excerptElement.getAttribute('data-original-text')) {
            excerptElement.innerHTML = excerptElement.getAttribute('data-original-text');
        }
        
        article.classList.remove('top-result');
    }
    
    // Update sidebar search highlighting
    function updateSidebarSearch(query) {
        const escapedTerm = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        document.querySelectorAll('.blog-nav li').forEach(li => {
            const originalText = li.getAttribute('data-original-text') || li.textContent;
            if (!li.getAttribute('data-original-text')) {
                li.setAttribute('data-original-text', originalText);
            }
            
            const matches = originalText.toLowerCase().includes(query.toLowerCase());
            li.style.display = matches ? '' : 'none';
            
            const linkElement = li.querySelector('a');
            if (linkElement) {
                if (matches) {
                    const regex = new RegExp('(' + escapedTerm + ')', 'gi');
                    linkElement.innerHTML = originalText.replace(regex, '<span class="search-highlight">$1</span>');
                } else {
                    linkElement.innerHTML = originalText;
                }
            }
        });
        
        // Auto-expand relevant tag groups
        document.querySelectorAll('.tag-bucket').forEach(bucket => {
            const hasVisibleItems = Array.from(bucket.querySelectorAll('li')).some(li => 
                li.style.display !== 'none'
            );
            bucket.open = hasVisibleItems;
        });
    }
    
    // Handle no results message
    function handleNoResults(count, query) {
        const grid = document.querySelector('.blog-grid');
        let noResultsMsg = document.getElementById('no-results-message');
        
        if (count === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.id = 'no-results-message';
                noResultsMsg.className = 'no-results enhanced-no-results';
                grid.appendChild(noResultsMsg);
            }
            
            noResultsMsg.innerHTML = `
                <h3>No articles found</h3>
                <p>No articles match your search for "<strong>${query}</strong>".</p>
                <p><strong>Try:</strong></p>
                <ul>
                    <li>Different or broader keywords</li>
                    <li>Product names (LED, Neon, Strip)</li>
                    <li>Application areas (Office, Restaurant, Home)</li>
                    <li>Technical terms (Installation, Lighting)</li>
                </ul>
            `;
            noResultsMsg.style.display = 'block';
        } else {
            if (noResultsMsg) {
                noResultsMsg.style.display = 'none';
            }
        }
    }
    
    // Reset search to show all articles
    function resetSearch() {
        isSearching = false;
        
        // Show all articles and reset highlighting
        searchData.forEach(item => {
            item.element.style.display = '';
            item.element.style.order = '';
            resetArticleHighlighting(item.element);
        });
        
        // Reset sidebar
        document.querySelectorAll('.blog-nav li').forEach(li => {
            li.style.display = '';
            const originalText = li.getAttribute('data-original-text');
            if (originalText) {
                const linkElement = li.querySelector('a');
                if (linkElement) {
                    linkElement.innerHTML = originalText;
                }
            }
        });
        
        // Close tag buckets
        document.querySelectorAll('.tag-bucket').forEach(bucket => {
            bucket.open = false;
        });
        
        // Hide no results message
        const noResultsMsg = document.getElementById('no-results-message');
        if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }
    
    // Global function for rebuilding search index (called after load more)
    window.rebuildSearchIndex = function() {
        if (blogSearchInput) {
            buildSearchIndex();
            console.log('Search index rebuilt after loading more articles');
        }
    };
    
    // Initialize the search system
    initializeSearch();
});