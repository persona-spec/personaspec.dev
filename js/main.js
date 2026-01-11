/**
 * PersonaSpec - Main JavaScript
 * Progressive enhancement for navigation and interactions
 */

(function() {
  'use strict';

  // ========================================
  // Navigation Scroll Effect
  // ========================================

  const nav = document.getElementById('nav');

  function handleScroll() {
    if (window.scrollY > 50) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  // Throttle scroll events for performance
  let scrollTimeout;
  window.addEventListener('scroll', function() {
    if (scrollTimeout) {
      window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(handleScroll);
  });

  // Initial check
  handleScroll();

  // ========================================
  // Mobile Navigation Toggle
  // ========================================

  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!nav.contains(event.target)) {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ========================================
  // Smooth Scroll for Anchor Links
  // ========================================

  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(event) {
      const targetId = this.getAttribute('href');

      // Skip if it's just "#"
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        event.preventDefault();

        const navHeight = nav.offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update URL without scrolling
        history.pushState(null, null, targetId);
      }
    });
  });

  // ========================================
  // Copy Code Button (for future use)
  // ========================================

  function addCopyButtons() {
    document.querySelectorAll('.code-block').forEach(function(block) {
      // Check if button already exists
      if (block.querySelector('.code-block__copy')) return;

      const header = block.querySelector('.code-block__header');
      if (!header) return;

      const copyButton = document.createElement('button');
      copyButton.className = 'code-block__copy';
      copyButton.textContent = 'Copy';
      copyButton.setAttribute('aria-label', 'Copy code to clipboard');

      copyButton.addEventListener('click', function() {
        const code = block.querySelector('code');
        if (!code) return;

        navigator.clipboard.writeText(code.textContent).then(function() {
          copyButton.textContent = 'Copied!';
          setTimeout(function() {
            copyButton.textContent = 'Copy';
          }, 2000);
        }).catch(function() {
          copyButton.textContent = 'Failed';
          setTimeout(function() {
            copyButton.textContent = 'Copy';
          }, 2000);
        });
      });

      header.appendChild(copyButton);
    });
  }

  // Add copy buttons if clipboard API is available
  if (navigator.clipboard) {
    addCopyButtons();
  }

  // ========================================
  // Intersection Observer for Animations
  // ========================================

  // Add fade-in animation to sections as they enter viewport
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all sections
  document.querySelectorAll('.section').forEach(function(section) {
    observer.observe(section);
  });

  // ========================================
  // Methodology Sidebar Active State
  // ========================================

  const docsSidebar = document.querySelector('.docs-sidebar');

  if (docsSidebar) {
    const sidebarLinks = docsSidebar.querySelectorAll('.docs-sidebar__link');
    const docsSections = document.querySelectorAll('.docs-section[id]');

    if (sidebarLinks.length > 0 && docsSections.length > 0) {
      // Create intersection observer for sections
      const sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            // Get the section ID
            const sectionId = entry.target.getAttribute('id');

            // Update sidebar links
            sidebarLinks.forEach(function(link) {
              const href = link.getAttribute('href');
              if (href === '#' + sectionId) {
                link.classList.add('is-active');
              } else {
                link.classList.remove('is-active');
              }
            });
          }
        });
      }, {
        rootMargin: '-100px 0px -50% 0px',
        threshold: 0
      });

      // Observe each documentation section
      docsSections.forEach(function(section) {
        sectionObserver.observe(section);
      });

      // Set initial active state based on current scroll position
      function setInitialActiveState() {
        var activeSet = false;
        docsSections.forEach(function(section) {
          var rect = section.getBoundingClientRect();
          if (!activeSet && rect.top <= 150 && rect.bottom > 100) {
            var sectionId = section.getAttribute('id');
            sidebarLinks.forEach(function(link) {
              var href = link.getAttribute('href');
              if (href === '#' + sectionId) {
                link.classList.add('is-active');
              } else {
                link.classList.remove('is-active');
              }
            });
            activeSet = true;
          }
        });

        // If no section is active and we're at the top, activate the first one
        if (!activeSet && window.scrollY < 200) {
          sidebarLinks[0].classList.add('is-active');
        }
      }

      setInitialActiveState();
    }
  }

  // ========================================
  // Persona Tabs (Example Page)
  // ========================================

  const personaTabs = document.querySelectorAll('.persona-tab');
  const personaSections = document.querySelectorAll('.persona-section');

  if (personaTabs.length > 0 && personaSections.length > 0) {
    personaTabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        var personaId = this.getAttribute('data-persona');

        // Update tab states
        personaTabs.forEach(function(t) {
          t.classList.remove('is-active');
        });
        this.classList.add('is-active');

        // Update section visibility
        personaSections.forEach(function(section) {
          section.classList.remove('is-active');
        });

        var targetSection = document.getElementById('persona-' + personaId);
        if (targetSection) {
          targetSection.classList.add('is-active');
        }
      });
    });
  }

  // ========================================
  // JSON Output Toggle (Example Page)
  // ========================================

  const jsonOutput = document.getElementById('json-output');

  if (jsonOutput) {
    var toggle = jsonOutput.querySelector('.json-output__toggle');

    if (toggle) {
      toggle.addEventListener('click', function() {
        jsonOutput.classList.toggle('is-open');
      });
    }
  }

})();
