// Portfolio page JavaScript - Wait for DOM to be ready
(function() {
  'use strict';
  
  // Function to initialize portfolio functionality
  function initPortfolio() {
    // Validate script is loading
    if (typeof console !== 'undefined') {
      console.log('Portfolio script initializing...');
    }

    // DOM Elements - Query inside function to ensure DOM is ready
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const modalImg = document.getElementById('modalImg');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalLinks = document.getElementById('modalLinks');
    const modalClose = document.getElementById('modalClose');
    const emptyState = document.getElementById('emptyState');
    
    // Validate critical elements exist
    if (!modalBackdrop || !modalClose) {
      console.error('Portfolio: Required modal elements not found');
      return;
    }
    
    if (projectCards.length === 0) {
      console.warn('Portfolio: No project cards found');
    }

    // Move modal to body for proper viewport centering
    if (modalBackdrop && modalBackdrop.parentNode !== document.body) {
      document.body.appendChild(modalBackdrop);
    }

    // State
    let currentFilter = 'all';
    let currentSearch = '';

  // Function to extract year from card
  function getCardYear(card) {
    const yearRoleEl = card.querySelector('.card-year-role');
    const yearRole = yearRoleEl ? yearRoleEl.textContent : '';
    const yearMatch = yearRole.match(/(\d{4})/);
    if (yearMatch) {
      return parseInt(yearMatch[1], 10);
    }
    // Fallback: try to get from project-data
    const projectDataEl = card.querySelector('.project-data');
    const projectData = projectDataEl && projectDataEl.textContent ? projectDataEl.textContent.trim() : '';
    if (projectData) {
      try {
        const data = JSON.parse(projectData);
        const yearMatch2 = (data.yearrole || '').match(/(\d{4})/);
        if (yearMatch2) {
          return parseInt(yearMatch2[1], 10);
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    return 0; // Default to 0 for unknown years (will appear last)
  }

  // Store original card positions for restoration
  const originalCardPositions = new Map();
  
  // Store original positions on page load
  projectCards.forEach(card => {
    const categoryGrid = card.closest('.portfolio-grid');
    const category = (categoryGrid && categoryGrid.dataset.category) || 'other';
    if (!originalCardPositions.has(category)) {
      originalCardPositions.set(category, []);
    }
    originalCardPositions.get(category).push(card);
  });

  // Function to check if card is "coming soon"
  function isComingSoon(card) {
    const statusBadge = card.querySelector('.status-badge');
    return card.classList.contains('upcoming') || 
           (statusBadge && statusBadge.textContent && statusBadge.textContent.includes('Coming soon'));
  }

  // Function to sort cards by year (newest first)
  function sortCardsByYear() {
    const allGrids = document.querySelectorAll('.portfolio-grid:not(.unified-grid)');
    const unifiedGrid = document.getElementById('unified-portfolio-grid');
    
    // Re-query cards to get fresh NodeList (cards may have been moved)
    const allCardsQuery = document.querySelectorAll('.project-card');
    const allCardsArray = Array.from(allCardsQuery);
    
    // If "All Projects" is selected, create unified sorted view
    if (currentFilter === 'all' && !currentSearch && unifiedGrid) {
      // First, restore cards to their original grids if they were moved
      allGrids.forEach(grid => {
        const category = grid.dataset.category;
        const originalCards = originalCardPositions.get(category) || [];
        originalCards.forEach(card => {
          if (card.parentNode !== grid && card.parentNode) {
            grid.appendChild(card);
          }
        });
      });
      
      // Collect all cards from all categories (re-query to get fresh list)
      const allCards = Array.from(document.querySelectorAll('.project-card'));
      
      // Separate coming soon cards from regular cards
      const regularCards = allCards.filter(card => !isComingSoon(card));
      const comingSoonCards = allCards.filter(card => isComingSoon(card));
      
      // Sort regular cards by year (newest first)
      regularCards.sort((a, b) => {
        const yearA = getCardYear(a);
        const yearB = getCardYear(b);
        return yearB - yearA; // Descending order (newest first)
      });
      
      // Sort coming soon cards by year (newest first)
      comingSoonCards.sort((a, b) => {
        const yearA = getCardYear(a);
        const yearB = getCardYear(b);
        return yearB - yearA;
      });
      
      // Combine: regular cards first, then coming soon cards
      const allCardsSorted = [...regularCards, ...comingSoonCards];
      
      // Hide all category sections
      document.querySelectorAll('.section-title').forEach(title => {
        title.style.display = 'none';
      });
      allGrids.forEach(grid => {
        grid.style.display = 'none';
      });
      
      // Clear unified grid and add sorted cards (move, don't clone to preserve event listeners)
      unifiedGrid.innerHTML = '';
      allCardsSorted.forEach(card => {
        unifiedGrid.appendChild(card);
      });
      
      // Show unified grid
      unifiedGrid.style.display = 'grid';
    } else {
      // Restore cards to their original category grids
      allGrids.forEach(grid => {
        const category = grid.dataset.category;
        const originalCards = originalCardPositions.get(category) || [];
        originalCards.forEach(card => {
          if (card.parentNode !== grid && card.parentNode) {
            grid.appendChild(card);
          }
        });
      });
      
      // Show category sections
      document.querySelectorAll('.section-title').forEach(title => {
        title.style.display = '';
      });
      allGrids.forEach(grid => {
        grid.style.display = 'grid';
      });
      
      // Hide unified grid
      if (unifiedGrid) {
        unifiedGrid.style.display = 'none';
      }
      
      // Sort cards within each category grid by year (newest first), with coming soon at the end
      allGrids.forEach(grid => {
        const gridCards = Array.from(grid.querySelectorAll('.project-card'));
        
        // Separate coming soon from regular cards
        const regularCards = gridCards.filter(card => !isComingSoon(card));
        const comingSoonCards = gridCards.filter(card => isComingSoon(card));
        
        // Sort regular cards by year (newest first)
        regularCards.sort((a, b) => {
          const yearA = getCardYear(a);
          const yearB = getCardYear(b);
          return yearB - yearA; // Descending order (newest first)
        });
        
        // Sort coming soon cards by year (newest first)
        comingSoonCards.sort((a, b) => {
          const yearA = getCardYear(a);
          const yearB = getCardYear(b);
          return yearB - yearA;
        });
        
        // Combine: regular cards first, then coming soon cards
        const sortedCards = [...regularCards, ...comingSoonCards];
        
        // Reorder cards in DOM (this preserves event listeners)
        sortedCards.forEach(card => {
          grid.appendChild(card);
        });
      });
    }
  }

  // Filter functionality - scroll to section and highlight
  function filterProjects() {
    // Re-query cards to get fresh NodeList (cards may have been moved)
    const currentCards = document.querySelectorAll('.project-card');
    
    // Remove all hidden classes and highlights - show everything
    currentCards.forEach(card => {
      card.classList.remove('hidden', 'highlighted');
    });
    
    // Remove highlight from all sections
    document.querySelectorAll('.section-title').forEach(title => {
      title.classList.remove('active-section');
    });
    document.querySelectorAll('.portfolio-grid').forEach(grid => {
      grid.classList.remove('active-section-grid');
    });
    
    // Hide empty state
    emptyState.classList.add('hidden');
    
    // Sort cards by year
    sortCardsByYear();
    
    // If "All Projects" is selected, just remove highlights
    if (currentFilter === 'all' && !currentSearch) {
      return;
    }
    
    // Find and highlight the active section
    const sectionIdMap = {
      'micromobility': 'micromobility-section',
      'electrification': 'electrification-section',
      'emergency': 'emergency-section',
      'transit': 'transit-section',
      'other': 'other-section'
    };
    
    // Highlight cards based on search (if search is active)
    if (currentSearch) {
      currentCards.forEach(card => {
        const tags = (card.dataset.tags || '').toLowerCase();
        const titleEl = card.querySelector('.card-title');
        const title = titleEl ? titleEl.textContent.toLowerCase() : '';
        const tagsTextEl = card.querySelector('.card-tags');
        const tagsText = tagsTextEl ? tagsTextEl.textContent.toLowerCase() : '';
        
        const matchesSearch = title.includes(currentSearch) || 
          tags.includes(currentSearch) || 
          tagsText.includes(currentSearch);
        
        if (matchesSearch) {
          card.classList.add('highlighted');
        }
      });
    }
    
    // Highlight section if filter is selected (not "all")
    if (currentFilter !== 'all' && sectionIdMap[currentFilter]) {
    const sectionTitle = document.getElementById(sectionIdMap[currentFilter]);
    const sectionGrid = sectionTitle ? sectionTitle.nextElementSibling : null;
      
      if (sectionTitle) {
        sectionTitle.classList.add('active-section');
      }
      if (sectionGrid && sectionGrid.classList.contains('portfolio-grid')) {
        sectionGrid.classList.add('active-section-grid');
      }
    }
  }
  
  // Scroll to section function
  function scrollToSection(filter) {
    if (filter === 'all') {
      // Scroll to top of portfolio
      const portfolioContainer = document.querySelector('.portfolio-container');
      if (portfolioContainer) {
        portfolioContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    
    const sectionIdMap = {
      'micromobility': 'micromobility-section',
      'electrification': 'electrification-section',
      'emergency': 'emergency-section',
      'transit': 'transit-section',
      'other': 'other-section'
    };
    
    const sectionId = sectionIdMap[filter];
    if (sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
        // Calculate offset for fixed header
        const headerHeight = 70; // Adjust based on your header height
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }

  // Filter button handlers
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      // Update filter
      currentFilter = btn.dataset.filter;
      
      // If "All Projects" is selected, scroll to top and show unified year-ordered view
      if (currentFilter === 'all') {
        const portfolioContainer = document.querySelector('.portfolio-container');
        if (portfolioContainer) {
          portfolioContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        // Scroll to section for category filters
        scrollToSection(currentFilter);
      }
      
      // Update highlights and sorting
      filterProjects();
    });
  });

  // Search handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.toLowerCase().trim();
      filterProjects();
    });
  }

  // Initialize: Sort cards by year on page load
  sortCardsByYear();

  // Modal functionality - Open popup with project details
  function openModal(data) {
    // Set image
    if (data.img) {
      modalImg.src = data.img;
      modalImg.alt = data.title ? `${data.title} preview` : 'Project preview';
      modalImg.style.display = 'block';
    } else {
      modalImg.style.display = 'none';
    }
    
    // Set title
    modalTitle.textContent = data.title || '';
    
    // Set subtitle (year, role, and tags)
    const subtitleText = data.yearrole ? 
      `${data.yearrole}${data.sub ? ' · ' + data.sub : ''}` : 
      (data.sub || '');
    modalSubtitle.textContent = subtitleText;
    
    // Set description
    modalDescription.textContent = data.desc || '';
    
    // Clear and populate links
    modalLinks.innerHTML = '';
    if (data.links && data.links.length > 0) {
      try {
        const links = typeof data.links === 'string' ? JSON.parse(data.links) : data.links;
        links.forEach(link => {
          if (link.href && link.label) {
            const a = document.createElement('a');
            a.href = link.href;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.className = 'link-btn';
            a.textContent = link.label;
            modalLinks.appendChild(a);
          }
        });
      } catch (e) {
        console.error('Error parsing links:', e);
      }
    }

    // Show modal popup
    modalBackdrop.classList.add('active');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    modalBackdrop.setAttribute('aria-modal', 'true');
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    modalClose.focus();
  }

  // Close modal popup
  function closeModal() {
    modalBackdrop.classList.remove('active');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    modalBackdrop.setAttribute('aria-modal', 'false');
    document.body.style.overflow = '';
  }

    // Card click handlers - Use event delegation so it works even when cards are moved
    const portfolioContainer = document.querySelector('.portfolio-container');
    if (!portfolioContainer) {
      console.error('Portfolio: .portfolio-container not found');
      return;
    }
    
    portfolioContainer.addEventListener('click', (e) => {
      // Find the closest project card
      const card = e.target.closest('.project-card');
      if (!card) return;
      
      // Don't open modal for upcoming projects
      if (card.classList.contains('upcoming')) {
        return;
      }

      // Get project data from the hidden data element
      const dataEl = card.querySelector('.project-data');
      if (dataEl) {
        try {
          const jsonText = dataEl.textContent.trim();
          if (!jsonText) {
            return;
          }
          const data = JSON.parse(jsonText);
          openModal(data);
        } catch (e) {
          console.error('Error parsing project data:', e);
        }
      }
    });
    
    // Keyboard accessibility - Enter or Space to open (also using delegation)
    portfolioContainer.addEventListener('keydown', (e) => {
      const card = e.target.closest('.project-card');
      if (!card) return;
      
      if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === card) {
        e.preventDefault();
        card.click();
      }
    });
    
    // Set attributes for keyboard accessibility
    projectCards.forEach(card => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
    });

    // Close modal handlers
    // Click X button to close
    modalClose.addEventListener('click', closeModal);
    
    // Click outside modal (on backdrop) to close
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });

    // Press Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
        closeModal();
      }
    });

    // Initialize
    filterProjects();
    
    // Validate script loaded successfully
    if (typeof console !== 'undefined') {
      console.log('Portfolio script loaded successfully');
    }
  }
  
  // Wait for everything to be ready before initializing (important for GitHub Pages)
  function startPortfolio() {
    // Use both DOMContentLoaded and window.load to ensure everything is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        // Small delay to ensure all scripts/resources are loaded on GitHub Pages
        setTimeout(initPortfolio, 100);
      });
    } else if (document.readyState === 'interactive') {
      // DOM is ready but resources may still be loading
      window.addEventListener('load', function() {
        setTimeout(initPortfolio, 100);
      });
    } else {
      // Everything is already loaded
      setTimeout(initPortfolio, 100);
    }
  }
  
  startPortfolio();
})();
