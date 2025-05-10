// Global variables
let clippyInstalled = false;
window.topZ = 11;

// Paint functionality
let paintCanvas;
let paintCtx;
let paintTool = 'pencil';
let paintColor = '#000000';
let paintLineWidth = 1;
let isPainting = false;
let lastX = 0;
let lastY = 0;
let startX = 0;
let startY = 0;

// Window management
function toggleWindow(id, event) {
  const el = document.getElementById(id);
  const isVisible = el.style.display === "block";
  el.style.display = isVisible ? "none" : "block";

  if (!isVisible) {
    // Position the window
    if (id === "resumeWindow" || id === "terminalWindow" || id === "paintWindow" || id === "ieWindow") {
      // Center these windows
      positionWindowCentered(el);
      
      // If terminal is being opened, focus the input field
      if (id === "terminalWindow") {
        setTimeout(() => {
          const input = document.getElementById("terminal-input");
          if (input) input.focus();
        }, 100);
      }
      
      // If paint is being opened, initialize it
      if (id === "paintWindow") {
        setTimeout(initPaint, 100);
      }
    } else if (event) {
      // Position window relative to clicked icon
      positionWindowFromEvent(el, event);
    } else {
      // Default centered position for windows opened programmatically
      positionWindowCentered(el);
    }
    
    // Ensure the window is fully in view
    ensureWindowInView(el);
  }

  el.style.zIndex = ++window.topZ || 11;
  
  // Hide start menu when opening windows
  const startMenu = document.getElementById("startMenu");
  if (startMenu) {
    startMenu.style.display = "none";
  }
}

// Helper function to position window centered
function positionWindowCentered(el) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Use percentages for small screens
  if (viewportWidth < 768) {
    el.style.width = `${Math.min(90, Math.floor(el.offsetWidth / viewportWidth * 100))}vw`;
    el.style.left = `5vw`;
    el.style.top = `10vh`;
  } else {
    // Traditional centering for larger screens
    el.style.left = `calc(50% - ${el.offsetWidth / 2}px)`;
    el.style.top = `calc(50% - ${el.offsetHeight / 2}px)`;
  }
}

// Helper function to position window from click event
function positionWindowFromEvent(el, event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // On mobile, position windows in the center
  if (viewportWidth < 768) {
    positionWindowCentered(el);
    return;
  }
  
  // Initial position based on click
  let left = rect.left;
  let top = rect.bottom + 10;
  
  // Ensure window is fully visible (not outside screen)
  // Adjust horizontal position if needed
  if (left + el.offsetWidth > viewportWidth) {
    left = Math.max(0, viewportWidth - el.offsetWidth - 10);
  }
  
  // Adjust vertical position if needed
  if (top + el.offsetHeight > viewportHeight) {
    // If window would be outside bottom of screen,
    // try to position it above the clicked element instead
    const topPosition = rect.top - el.offsetHeight - 10;
    
    if (topPosition > 0) {
      // There's room above
      top = topPosition;
    } else {
      // Not enough room above either, so position at top of screen with small margin
      top = 10;
    }
  }
  
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

// Helper function to ensure window is fully in viewport
function ensureWindowInView(windowEl) {
  // Get window dimensions and position
  const rect = windowEl.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let left = parseInt(windowEl.style.left) || rect.left;
  let top = parseInt(windowEl.style.top) || rect.top;
  
  // Check right edge
  if (rect.right > viewportWidth) {
    left = Math.max(0, viewportWidth - rect.width - 10);
  }
  
  // Check left edge
  if (rect.left < 0) {
    left = 10;
  }
  
  // Check bottom edge
  if (rect.bottom > viewportHeight) {
    top = Math.max(0, viewportHeight - rect.height - 10);
  }
  
  // Check top edge
  if (rect.top < 0) {
    top = 10;
  }
  
  // Apply fixed position
  windowEl.style.left = `${left}px`;
  windowEl.style.top = `${top}px`;
}

// Start menu functionality
const startMessages = [
  "Oops! The Start menu is on vacation.",
  "You clicked Start, but nothing started.",
  "Start? More like... stall.",
  "404: Start menu not found.",
  "Please insert floppy disk to continue.",
  "This button does absolutely nothing. Happy clicking!",
  "The Start menu went out for snacks. Be back never.",
  "Start menu crashed. Blame Clippy."
];

function toggleStartMenu() {
  const message = startMessages[Math.floor(Math.random() * startMessages.length)];
  showContextWindow("Start Menu", message);
}

// Event listeners for hiding start menu when clicking elsewhere
window.addEventListener("click", function (e) {
  const startMenu = document.getElementById("startMenu");
  if (startMenu && !e.target.closest(".start-button") && !e.target.closest(".start-menu")) {
    startMenu.style.display = "none";
  }
});

// Make windows draggable
function makeDraggable(id) {
  const el = document.getElementById(id);
  if (!el) return;
  
  const bar = el.querySelector('.title-bar');
  let offsetX = 0, offsetY = 0, isDragging = false;

  bar.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    el.style.zIndex = ++window.topZ;
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      // Calculate new position
      let left = e.clientX - offsetX;
      let top = e.clientY - offsetY;
      
      // Ensure window stays in viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Prevent dragging beyond right edge
      if (left + el.offsetWidth > viewportWidth) {
        left = viewportWidth - el.offsetWidth;
      }
      
      // Prevent dragging beyond left edge
      if (left < 0) {
        left = 0;
      }
      
      // Prevent dragging beyond bottom edge
      if (top + el.offsetHeight > viewportHeight) {
        top = viewportHeight - el.offsetHeight;
      }
      
      // Prevent dragging beyond top edge
      if (top < 0) {
        top = 0;
      }
      
      // Apply position
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    }
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

// Context Menu
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
  const menu = document.getElementById("contextMenu");
  menu.style.top = `${e.clientY}px`;
  menu.style.left = `${e.clientX}px`;
  menu.style.display = "block";
});

document.addEventListener("click", () => {
  document.getElementById("contextMenu").style.display = "none";
});

// Clippy functionality
const clippyMessages = [
  "Hey! You seem nostalgic.",
  "Did you know you can draw in Paint?",
  "Want to snoop in Zia's homework folder?",
  "Her Outlook inbox is full of surprises.",
  "Fun fact: Clippy never left."
];

function showClippyMessage() {
  if (!clippyInstalled) return;
  
  const bubble = document.getElementById("clippy-bubble");
  bubble.textContent = clippyMessages[Math.floor(Math.random() * clippyMessages.length)];
  bubble.style.display = "block";
  setTimeout(() => bubble.style.display = "none", 5000);
}

function installClippy() {
  if (clippyInstalled) return;

  const win = document.getElementById('installingClippyWindow');
  const bar = document.getElementById('clippyProgress');
  const clippy = document.getElementById('clippy');
  const menuItem = document.getElementById('installClippyItem');

  // Ensure the window is displayed in the center by setting it explicitly
  win.style.display = 'block';
  win.style.position = 'fixed';
  win.style.top = '50%';
  win.style.left = '50%';
  win.style.transform = 'translate(-50%, -50%)';
  win.style.zIndex = ++window.topZ;
  
  bar.style.width = '0%';

  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    bar.style.width = progress + '%';
    if (progress >= 100) {
      clearInterval(interval);
      win.style.display = 'none';
      clippy.style.display = 'block';
      showClippyMessage();
      clippyInstalled = true;

      // Disable and gray out menu item
      menuItem.style.color = 'gray';
      menuItem.style.pointerEvents = 'none';
    }
  }, 300);
}

// Start Clippy message cycle
setInterval(showClippyMessage, 15000);

// Sticky note error
function showStickyError() {
  const popup = document.getElementById('stickyErrorWindow');
  popup.style.display = 'block';
  popup.style.zIndex = ++window.topZ;
}

function hideStickyError() {
  document.getElementById('stickyErrorWindow').style.display = 'none';
}

// Context popup window
function showContextWindow(title, message) {
  const win = document.getElementById("contextPopupWindow");
  const winTitle = win.querySelector(".title-bar-text");
  const winBody = win.querySelector(".window-body p");
  winTitle.innerHTML = `<img src="https://win98icons.alexmeub.com/icons/png/msg_info-0.png" alt=""> ${title}`;
  winBody.textContent = message;
  win.style.display = "block";
  win.style.zIndex = ++window.topZ;
}

function hideContextWindow() {
  document.getElementById("contextPopupWindow").style.display = "none";
}

// Funny error messages for Windows 98 Explorer
function showFunnyMessage(item) {
  let title = 'Error';
  let message = '';
  let icon = 'msg_error-0';
  
  switch(item) {
    case 'mycomputer':
      title = 'My Computer';
      message = 'This computer exists in 1998. Your files are stored on 3.5-inch floppy disks and you have 8MB of RAM. Please lower your expectations accordingly.';
      icon = 'msg_warning-0';
      break;
    case 'drivec':
      title = 'Disk Error';
      message = 'Drive C: contains 27 viruses, 118 broken shortcuts, and a digital pet from 1997 that is very hungry. Access denied for your own good.';
      icon = 'msg_error-0';
      break;
    case 'drived':
      title = 'Hardware Error';
      message = 'Drive D: is actually a CD-ROM with "Best of Windows 98 Startup Sounds" inside. Please insert a different CD to proceed.';
      icon = 'hardware-4';
      break;
    case 'homework':
      title = 'Homework Folder';
      message = 'It is just homework, I swear!';
      icon = 'directory_open-0';
      break;
    case 'network':
      title = 'Connection Error';
      message = 'Network connection failed. Please check your 56k modem and make sure nobody is using the telephone. Estimated download time: 7 days, 3 hours.';
      icon = 'connect_to_network-0';
      break;
    default:
      message = 'An unexpected error has occurred because that\'s what Windows 98 does best.';
  }
  
  // Show custom Windows 98 error popup
  const win = document.getElementById("contextPopupWindow");
  const winTitle = win.querySelector(".title-bar-text");
  const winBody = win.querySelector(".window-body p");
  winTitle.innerHTML = `<img src="https://win98icons.alexmeub.com/icons/png/${icon}.png" alt=""> ${title}`;
  winBody.textContent = message;
  win.style.display = "block";
  win.style.zIndex = ++window.topZ;

  // Play classic Windows error sound
  const errorSound = new Audio('https://www.myinstants.com/media/sounds/windows-xp-error.mp3');
  errorSound.volume = 0.3;
  errorSound.play().catch(err => console.log('Audio play failed:', err));
}

// Portfolio navigation and content
let currentPortfolioView = 0;
const portfolioViews = [
  // View 0: Main portfolio with folders
  `<div style="display: flex; gap: 30px; margin-top: 20px; padding: 15px;">
     <div class="portfolio-folder" onclick="setPortfolioView(1)">
       <img src="https://win98icons.alexmeub.com/icons/png/directory_closed-0.png" alt="Folder">
       <div>Data Analytics</div>
     </div>
     <div class="portfolio-folder" onclick="setPortfolioView(2)">
       <img src="https://win98icons.alexmeub.com/icons/png/directory_closed-0.png" alt="Folder">
       <div>AI & ML</div>
     </div>
   </div>`,
  
  // View 1: Data Analytics folder contents
  `<div style="display: flex; align-items: center; margin-bottom: 15px;">
     <img src="https://win98icons.alexmeub.com/icons/png/directory_open-0.png" style="width: 32px; height: 32px; margin-right: 10px;">
     <h3 style="margin: 0;">Data Analytics</h3>
   </div>
   <div style="display: flex; flex-wrap: wrap; gap: 20px; padding: 15px;">
     <div class="portfolio-file">
       <img src="https://win98icons.alexmeub.com/icons/png/chart-1.png" alt="File">
       <div>Sales Report.xlsx</div>
     </div>
     <div class="portfolio-file">
       <img src="https://win98icons.alexmeub.com/icons/png/graph-1.png" alt="File">
       <div>Marketing Analysis.ppt</div>
     </div>
     <div class="portfolio-file">
       <img src="https://win98icons.alexmeub.com/icons/png/stats-1.png" alt="File">
       <div>Customer Demographics.py</div>
     </div>
   </div>`,
  
  // View 2: AI & ML folder contents
  `<div style="display: flex; align-items: center; margin-bottom: 15px;">
     <img src="https://win98icons.alexmeub.com/icons/png/directory_open-0.png" style="width: 32px; height: 32px; margin-right: 10px;">
     <h3 style="margin: 0;">AI & ML</h3>
   </div>
   <div style="display: flex; flex-wrap: wrap; gap: 20px; padding: 15px;">
     <div class="portfolio-file">
       <img src="https://win98icons.alexmeub.com/icons/png/brain-0.png" alt="File">
       <div>Neural Network.py</div>
     </div>
     <div class="portfolio-file">
       <img src="https://win98icons.alexmeub.com/icons/png/camera-3.png" alt="File">
       <div>ComputerVision.ipynb</div>
     </div>
     <div class="portfolio-file">
       <img src="https://win98icons.alexmeub.com/icons/png/text_rich_colored-3.png" alt="File">
       <div>NLP Model.h5</div>
     </div>
   </div>`
];

// Portfolio navigation functions
function updatePortfolioContent() {
  const portfolioContent = document.getElementById('portfolioContent');
  if (portfolioContent) {
    portfolioContent.innerHTML = portfolioViews[currentPortfolioView];
  }
}

function setPortfolioView(viewIndex) {
  if (viewIndex >= 0 && viewIndex < portfolioViews.length) {
    currentPortfolioView = viewIndex;
    updatePortfolioContent();
    
    // Update folder tree highlight
    const treeItems = document.querySelectorAll('.tree-item');
    treeItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to current tree item
    if (viewIndex === 0) {
      document.querySelector('.tree-item.tree-open-folder').classList.add('active');
    } else if (viewIndex === 1) {
      document.querySelectorAll('.tree-item.tree-folder')[2].classList.add('active');
    } else if (viewIndex === 2) {
      document.querySelectorAll('.tree-item.tree-folder')[3].classList.add('active');
    }
  }
}

function goBack() {
  if (currentPortfolioView > 0) {
    currentPortfolioView--;
    updatePortfolioContent();
  }
}

function goForward() {
  if (currentPortfolioView < portfolioViews.length - 1) {
    currentPortfolioView++;
    updatePortfolioContent();
  }
}

// Terminal functionality
function handleTerminalInput(event) {
  if (event.key === 'Enter') {
    const input = event.target.value.trim();
    if (input) {
      executeCommand(input);
      event.target.value = '';
    }
  }
}

function executeCommand(command) {
  const terminal = document.getElementById('terminal-output');
  const lowerCommand = command.toLowerCase();
  
  // Add the command to the terminal
  terminal.innerHTML = terminal.innerHTML.replace(/<span class="blinking-cursor">_<\/span>/, '');
  terminal.innerHTML += `${command}\n`;
  
  // Process command - Easter Eggs!
  if (lowerCommand === 'help' || lowerCommand === '/?') {
    terminal.innerHTML += `
Available commands:
  dir           - List secret files
  secret        - Find hidden easter eggs
  joke          - Tell a nerdy joke
  hack          - Pretend to hack something
  matrix        - Enter the Matrix
  coffee        - Make coffee
  dance         - Do a little dance
  whatif        - Ask a silly question
  cls           - Clear screen
  help          - Show this help
`;
  } else if (lowerCommand === 'cls') {
    terminal.innerHTML = `Microsoft(R) Windows 98
(C)Copyright Microsoft Corp 1981-1998.

C:\\FUNSTUFF>`;
  } else if (lowerCommand === 'secret') {
    terminal.innerHTML += `
Congratulations! You found the secret command.
Here's a secret: The cake is a lie, but the cookies are real.
`;
  } else if (lowerCommand === 'joke') {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs.",
      "Why do programmers always mix up Christmas and Halloween? Because Oct 31 = Dec 25.",
      "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
      "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'",
      "Why was the JavaScript developer sad? Because he didn't know how to 'null' his feelings.",
      "Why did the developer go broke? Because he used up all his cache."
    ];
    terminal.innerHTML += `\n${jokes[Math.floor(Math.random() * jokes.length)]}\n`;
  } else if (lowerCommand === 'hack') {
    terminal.innerHTML += `
INITIATING HACK SEQUENCE...
Accessing mainframe...
Bypassing firewall...
Downloading files...
Planting backdoor...
Erasing tracks...
HACK COMPLETE!
Just kidding, this is just a harmless animation. No actual hacking occurred.
`;
  } else if (lowerCommand === 'matrix') {
    terminal.innerHTML += `
Wake up, Neo...
The Matrix has you...
Follow the white rabbit.
Knock, knock, Neo.

System Failure: Unable to disconnect from reality. Matrix mode unavailable.
`;
  } else if (lowerCommand === 'coffee') {
    terminal.innerHTML += `
     (
      )
   c[]
   
Error: Coffee machine not found.
Please insert coffee module in Drive A:
`;
  } else if (lowerCommand === 'dance') {
    terminal.innerHTML += `
   (•_•)
   <)   )╯
    /    \\
   
   \\(•_•)
    (   (>
    /    \\
   
   (•_•)
   <)   )>
    /    \\
`;
  } else if (lowerCommand === 'whatif') {
    const responses = [
      "What if computers had feelings? Would deleting files be considered murder?",
      "What if your reflection is actually your evil twin plotting against you?",
      "What if your keyboard is secretly judging your typing skills?",
      "What if all error messages are just computers screaming for help?",
      "What if ctrl+z worked in real life?"
    ];
    terminal.innerHTML += `\n${responses[Math.floor(Math.random() * responses.length)]}\n`;
  } else if (lowerCommand === 'dir') {
    terminal.innerHTML += `
Directory of C:\\FUNSTUFF

.              <DIR>        10-05-25  4:20p .
..             <DIR>        10-05-25  4:20p ..
SECRETS   EXE      6,969    10-05-25  4:20p secrets.exe
JOKE      TXT      4,042    10-05-25  4:20p joke.txt
DANCE     COM      1,337    10-05-25  4:20p dance.com
HACK      BAT        404    10-05-25  4:20p hack.bat
MATRIX    SYS     90,210    10-05-25  4:20p matrix.sys
COFFEE    JAR        418    10-05-25  4:20p coffee.jar
WHATIF    ???      8,086    10-05-25  4:20p whatif.???
`;
  } else {
    terminal.innerHTML += `Bad command or file name.
Type HELP for list of fun commands.`;
  }
  
  // Add blinking cursor at the end
  terminal.innerHTML += `\nC:\\FUNSTUFF><span class="blinking-cursor">_</span>`;
  
  // Scroll to bottom with a small delay to ensure content is rendered
  setTimeout(() => {
    terminal.scrollTop = terminal.scrollHeight;
  }, 10);
  
  // Force focus back to the input
  document.getElementById('terminal-input').focus();
}

// Initialize draggable windows on load
document.addEventListener('DOMContentLoaded', function() {
  // Make all windows draggable
  const allWindows = document.querySelectorAll('.window');
  allWindows.forEach(w => makeDraggable(w.id));
  
  // Special windows
  makeDraggable('stickyNoteWindow');
  makeDraggable('stickyErrorWindow');
  
  // Initialize portfolio content
  updatePortfolioContent();
  
  // Play boot sound
  const bootSound = document.getElementById('bootSound');
  if (bootSound) {
    bootSound.volume = 0.5; // Lower volume
  }
  
  // Add click handler to terminal output to focus input
  const terminalOutput = document.getElementById('terminal-output');
  if (terminalOutput) {
    terminalOutput.addEventListener('click', () => {
      const input = document.getElementById('terminal-input');
      if (input) input.focus();
    });
  }
});

// Internet Explorer functionality
function switchIETab(tab) {
  // Get tab elements
  const githubTab = document.getElementById('github-tab');
  const linkedinTab = document.getElementById('linkedin-tab');
  const blogsTab = document.getElementById('blogs-tab');
  
  // Get content elements
  const githubContent = document.getElementById('github-content');
  const linkedinContent = document.getElementById('linkedin-content');
  const blogsContent = document.getElementById('blogs-content');
  
  // Get address bar and status
  const addressBar = document.getElementById('ie-address-bar');
  const statusBar = document.getElementById('ie-status');
  
  // Reset all tabs
  githubTab.classList.remove('active-tab');
  linkedinTab.classList.remove('active-tab');
  blogsTab.classList.remove('active-tab');
  githubTab.style.background = '#ddd';
  linkedinTab.style.background = '#ddd';
  blogsTab.style.background = '#ddd';
  
  // Hide all content
  githubContent.style.display = 'none';
  linkedinContent.style.display = 'none';
  blogsContent.style.display = 'none';
  
  // Set active tab and show content
  if (tab === 'github') {
    githubTab.classList.add('active-tab');
    githubTab.style.background = 'white';
    githubContent.style.display = 'block';
    addressBar.value = 'https://github.com/ZiaBytesCookies';
    statusBar.textContent = 'https://github.com/ZiaBytesCookies';
  } else if (tab === 'linkedin') {
    linkedinTab.classList.add('active-tab');
    linkedinTab.style.background = 'white';
    linkedinContent.style.display = 'block';
    addressBar.value = 'https://www.linkedin.com/in/tasnim-zia-proma/';
    statusBar.textContent = 'https://www.linkedin.com/in/tasnim-zia-proma/';
  } else if (tab === 'blogs') {
    blogsTab.classList.add('active-tab');
    blogsTab.style.background = 'white';
    blogsContent.style.display = 'block';
    addressBar.value = 'https://blogs.ziacookies.com/';
    statusBar.textContent = 'https://blogs.ziacookies.com/';
  }
}

function navigateIE(action) {
  // Handle navigation actions
  if (action === 'refresh') {
    // Simulate refresh with a small animation
    const activeContent = document.querySelector('.ie-content[style*="display: block"]');
    if (activeContent) {
      activeContent.style.opacity = '0.5';
      setTimeout(() => {
        activeContent.style.opacity = '1';
      }, 300);
    }
  }
  // For back/forward, we could implement a history stack if needed
}

// Initialize paint canvas on window open
function initPaint() {
  paintCanvas = document.getElementById('paint-canvas');
  if (!paintCanvas) return;
  
  paintCtx = paintCanvas.getContext('2d');
  
  // Set canvas size
  resizePaintCanvas();
  
  // Add event listeners
  paintCanvas.addEventListener('mousedown', startPainting);
  paintCanvas.addEventListener('mousemove', paint);
  paintCanvas.addEventListener('mouseup', stopPainting);
  paintCanvas.addEventListener('mouseleave', stopPainting);
  paintCanvas.addEventListener('mousemove', updateCoordinates);
  
  // Select default tool
  selectPaintTool('pencil');
  setPaintLineWidth(1);
  
  // Add window resize event to handle canvas resizing
  window.addEventListener('resize', function() {
    if (document.getElementById('paintWindow').style.display === 'block') {
      resizePaintCanvas();
    }
  });
}

function resizePaintCanvas() {
  const container = paintCanvas.parentElement;
  const canvasWidth = Math.min(640, container.clientWidth - 10);
  const canvasHeight = Math.min(480, container.clientHeight - 10);
  
  paintCanvas.width = canvasWidth;
  paintCanvas.height = canvasHeight;
  
  // Update status bar
  document.getElementById('paint-canvas-size').textContent = `${canvasWidth} x ${canvasHeight} px`;
  
  // Clear to white
  paintCtx.fillStyle = '#FFFFFF';
  paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
}

function selectPaintTool(tool) {
  // Remove highlight from all tools
  document.querySelectorAll('.paint-tool').forEach(el => {
    el.style.background = '';
  });
  
  // Highlight selected tool
  const toolElement = document.querySelector(`.paint-tool[data-tool="${tool}"]`);
  if (toolElement) {
    toolElement.style.background = '#ddd';
  }
  
  paintTool = tool;
  
  // Change cursor based on tool
  switch(tool) {
    case 'eyedropper':
      paintCanvas.style.cursor = 'crosshair';
      break;
    case 'fill':
      paintCanvas.style.cursor = 'url(https://win98icons.alexmeub.com/icons/png/paint_bucket-0.png), auto';
      break;
    case 'eraser':
      paintCanvas.style.cursor = 'url(https://win98icons.alexmeub.com/icons/png/brush-4.png), auto';
      break;
    default:
      paintCanvas.style.cursor = 'crosshair';
  }
}

function setPaintColor(color) {
  paintColor = color;
  
  // Highlight selected color
  document.querySelectorAll('.color-swatch').forEach(el => {
    el.style.border = '1px solid #333';
  });
  
  const swatches = document.querySelectorAll('.color-swatch');
  for (let swatch of swatches) {
    if (swatch.style.background.includes(color.toLowerCase()) || 
        swatch.style.background.includes(color.toUpperCase())) {
      swatch.style.border = '2px solid white';
      break;
    }
  }
}

function setPaintLineWidth(width) {
  paintLineWidth = width;
  
  // Remove highlight from all widths
  document.querySelectorAll('.line-width').forEach(el => {
    el.style.background = '';
  });
  
  // Highlight selected width
  const widthElement = document.querySelector(`.line-width[data-width="${width}"]`);
  if (widthElement) {
    widthElement.style.background = '#ddd';
  }
}

function startPainting(e) {
  isPainting = true;
  
  // Get coordinates relative to canvas
  const rect = paintCanvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
  startX = lastX;
  startY = lastY;
  
  // For some tools like eyedropper, we execute immediately
  if (paintTool === 'eyedropper') {
    const pixel = paintCtx.getImageData(lastX, lastY, 1, 1).data;
    const hexColor = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
    setPaintColor(hexColor);
    isPainting = false;
  } else if (paintTool === 'fill') {
    floodFill(Math.floor(lastX), Math.floor(lastY), paintColor);
    isPainting = false;
  }
}

function floodFill(x, y, fillColor) {
  // Simple flood fill algorithm
  const imageData = paintCtx.getImageData(0, 0, paintCanvas.width, paintCanvas.height);
  const data = imageData.data;
  const width = paintCanvas.width;
  const height = paintCanvas.height;
  
  // Get the color at target pixel
  const targetPos = (y * width + x) * 4;
  const targetR = data[targetPos];
  const targetG = data[targetPos + 1];
  const targetB = data[targetPos + 2];
  
  // Convert fill color from hex to RGB
  const fillR = parseInt(fillColor.slice(1, 3), 16);
  const fillG = parseInt(fillColor.slice(3, 5), 16);
  const fillB = parseInt(fillColor.slice(5, 7), 16);
  
  // Don't fill if it's already the fill color
  if (targetR === fillR && targetG === fillG && targetB === fillB) {
    return;
  }
  
  // Use a simple implementation for performance
  const stack = [{x, y}];
  while (stack.length) {
    const {x, y} = stack.pop();
    const pos = (y * width + x) * 4;
    
    // Check if this pixel matches the target color
    if (x < 0 || x >= width || y < 0 || y >= height || 
        data[pos] !== targetR || data[pos + 1] !== targetG || data[pos + 2] !== targetB) {
      continue;
    }
    
    // Fill the pixel
    data[pos] = fillR;
    data[pos + 1] = fillG;
    data[pos + 2] = fillB;
    
    // Add neighbors to stack
    stack.push({x: x + 1, y});
    stack.push({x: x - 1, y});
    stack.push({x, y: y + 1});
    stack.push({x, y: y - 1});
  }
  
  paintCtx.putImageData(imageData, 0, 0);
}

function paint(e) {
  if (!isPainting) return;
  
  // Get coordinates relative to canvas
  const rect = paintCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  paintCtx.lineJoin = 'round';
  paintCtx.lineCap = 'round';
  paintCtx.strokeStyle = paintColor;
  
  switch(paintTool) {
    case 'pencil':
      paintCtx.lineWidth = 1;
      paintCtx.beginPath();
      paintCtx.moveTo(lastX, lastY);
      paintCtx.lineTo(x, y);
      paintCtx.stroke();
      break;
      
    case 'brush':
      paintCtx.lineWidth = paintLineWidth;
      paintCtx.beginPath();
      paintCtx.moveTo(lastX, lastY);
      paintCtx.lineTo(x, y);
      paintCtx.stroke();
      break;
      
    case 'eraser':
      paintCtx.lineWidth = paintLineWidth * 2;
      paintCtx.strokeStyle = '#FFFFFF';
      paintCtx.beginPath();
      paintCtx.moveTo(lastX, lastY);
      paintCtx.lineTo(x, y);
      paintCtx.stroke();
      break;
      
    case 'line':
    case 'rectangle':
    case 'circle':
      // These are drawn on mouseup, but we'll show a preview
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = paintCanvas.width;
      tempCanvas.height = paintCanvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      // Copy the current canvas
      tempCtx.drawImage(paintCanvas, 0, 0);
      
      // Draw the shape preview
      tempCtx.lineWidth = paintLineWidth;
      tempCtx.strokeStyle = paintColor;
      
      if (paintTool === 'line') {
        tempCtx.beginPath();
        tempCtx.moveTo(startX, startY);
        tempCtx.lineTo(x, y);
        tempCtx.stroke();
      } else if (paintTool === 'rectangle') {
        tempCtx.beginPath();
        tempCtx.rect(startX, startY, x - startX, y - startY);
        tempCtx.stroke();
      } else if (paintTool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        tempCtx.beginPath();
        tempCtx.arc(startX, startY, radius, 0, 2 * Math.PI);
        tempCtx.stroke();
      }
      
      // Update the actual canvas with our preview
      paintCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
      paintCtx.drawImage(tempCanvas, 0, 0);
      break;
  }
  
  lastX = x;
  lastY = y;
}

function stopPainting() {
  if (isPainting) {
    // For shapes, we'll draw the final shape on mouse up
    if (paintTool === 'line' || paintTool === 'rectangle' || paintTool === 'circle') {
      // The final shape is already drawn by the paint function
    }
    
    isPainting = false;
  }
}

function updateCoordinates(e) {
  const rect = paintCanvas.getBoundingClientRect();
  const x = Math.floor(e.clientX - rect.left);
  const y = Math.floor(e.clientY - rect.top);
  
  document.getElementById('paint-coordinates').textContent = `${x},${y} px`;
}

// Email functionality
function showEmailFolder(folder) {
  // Hide all email lists
  document.getElementById('inbox-emails').style.display = 'none';
  document.getElementById('spam-emails').style.display = 'none';
  
  // Show selected folder's emails
  document.getElementById(folder + '-emails').style.display = 'table-row-group';
  
  // Update folder highlights
  const folders = document.querySelectorAll('.email-folder');
  folders.forEach(f => f.classList.remove('active-folder'));
  
  // Highlight the clicked folder
  event.currentTarget.classList.add('active-folder');
  event.currentTarget.style.background = '#cbe8fb';
  
  // Unhighlight other folders
  folders.forEach(f => {
    if (!f.classList.contains('active-folder')) {
      f.style.background = '';
    }
  });
  
  // Show first email in the folder
  const emailsInFolder = document.querySelectorAll(`#${folder}-emails .email-item`);
  if (emailsInFolder.length > 0) {
    const firstEmailId = emailsInFolder[0].getAttribute('onclick').match(/'([^']+)'/)[1];
    showEmail(firstEmailId);
  }
}

function showEmail(emailId) {
  // Hide all email bodies
  const emailBodies = document.querySelectorAll('.email-body');
  emailBodies.forEach(email => {
    email.style.display = 'none';
  });
  
  // Show selected email
  document.getElementById(emailId).style.display = 'block';
  
  // Update email item highlights
  const emailItems = document.querySelectorAll('.email-item');
  emailItems.forEach(item => {
    item.classList.remove('active-email');
    item.style.background = '';
  });
  
  // Find and highlight the clicked email in the list
  emailItems.forEach(item => {
    if (item.getAttribute('onclick').includes(emailId)) {
      item.classList.add('active-email');
      item.style.background = '#cbe8fb';
    }
  });
}

// Function to change desktop wallpaper
function changeWallpaper(wallpaperFile) {
  document.body.style.backgroundImage = `url('${wallpaperFile}')`;
  
  // Store the user's wallpaper preference in localStorage
  localStorage.setItem('win98Wallpaper', wallpaperFile);
  
  // Hide context menu
  document.getElementById("contextMenu").style.display = "none";
}

// Load saved wallpaper on page load
document.addEventListener('DOMContentLoaded', function() {
  const savedWallpaper = localStorage.getItem('win98Wallpaper');
  if (savedWallpaper) {
    document.body.style.backgroundImage = `url('${savedWallpaper}')`;
  }
}); 