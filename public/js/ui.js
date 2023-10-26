import { UTILS } from "./utils.js";

export const UI = {
  apiBaseURL: (window.location.hostname === 'localhost') ? "http://localhost:5000/api/v1" : "https://med-tech-demo.onrender.com/api/v1",

  init: () => {
    // Set up sidebar
    UI.renderSideBar();

    // Set up nav dropdown
    UI.renderNavDropDown();

    // Set up sections
    UI.renderSections();

    // Set up menus
    UI.renderMenus();

    // Set up modals
    UI.renderModals();

    // Check API health status
    // UI.checkAPIStatus();

  },

  // Render sidebar
  renderSideBar: () => {
    const sidebarToggler = document.querySelector("#sidebar-toggler");
    const menuItems = document.querySelectorAll(".menu-item .text");
    const sidebarLogo = document.querySelector(".sidebar-logo span");
  
    // Check the initial state from localStorage
    let isSidebarToggled = JSON.parse(localStorage.getItem("isSidebarOpen")) || true; // Set it to true by default
  
    // Initialize the sidebar state
    if (isSidebarToggled) {
      openSidebar();
    } else {
      closeSidebar();
    }
  
    sidebarToggler.addEventListener("click", () => {
      isSidebarToggled = !isSidebarToggled; // Toggle the state
  
      if (isSidebarToggled) {
        openSidebar();
      } else {
        closeSidebar();
      }
  
      // Store the updated state in localStorage
      localStorage.setItem("isSidebarOpen", JSON.stringify(isSidebarToggled));
    });
  
    function openSidebar() {
      menuItems.forEach(menuItem => menuItem.style.display = "block");
      sidebarLogo.style.display = "block";
    }
  
    function closeSidebar() {
      menuItems.forEach(menuItem => menuItem.style.display = "none");
      sidebarLogo.style.display = "none";
    }
  },

  // Render nav dropdown
  renderNavDropDown: () => {
    // Dropdown
    const dropdownMenu = document.querySelector('#dropdown-menu');
    const toggleDropdown = document.querySelector('#toggle-dropdown');
    const userFullNameLabel = document.querySelector("#user-fullname-label");
    const userEmailLabel = document.querySelector("#user-email-label");
    let isDropdownToggled = false;

    toggleDropdown?.addEventListener('click', () => {
        if (!isDropdownToggled) {
            isDropdownToggled = true;
            dropdownMenu.style.display = "block";
        } else {
            isDropdownToggled = false;
            dropdownMenu.style.display = "none";
        }
    });

    if (!dropdownMenu.classList.contains('left') || !dropdownMenu.classList.contains('right')) {
        dropdownMenu.classList.add('dropdown-menu-default');
    }

    // Hide the dropdown function
    const hideDropdown = () => {
      if (isDropdownToggled) {
          isDropdownToggled = false;
          dropdownMenu.style.display = "none";
      }
    };

    // Hide dropdown when user clicks outside
    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!dropdownMenu.contains(target) && target !== toggleDropdown) {
            hideDropdown();
        }
    });


    // Signout user
    const signoutBtn = document.querySelector("#signout-cta");
    signoutBtn?.addEventListener("click", async() => {
      const endpoint = "/auth/signout";
      try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if(data.success){
            window.location.href = "/auth/signin";
        }
      } catch (error) {
          console.log(error);
      }
  });



  },

  // Render sections
  renderSections: () => {
    const sectionTogglers = document.querySelectorAll(".section-toggler");
    sectionTogglers.forEach(toggler => UTILS.sectionToggler(toggler, "section"));
  },

  // Render menus
  renderMenus: () => {
    // Menu togglers
    const menuTogglers = document.querySelectorAll(".section-dropdown");
    menuTogglers.forEach(menuItem => UTILS.menuToggler(menuItem, "menu", true));
  },

  // Render modals
  renderModals: () => {
    const modalTriggers = document.querySelectorAll(".modal-trigger");
    modalTriggers?.forEach(modalTrigger => {
        modalTrigger.addEventListener("click", UTILS.triggerModal(modalTrigger, "modal"));
    });
  },

  // Check API health
  checkAPIStatus: () => {
    UTILS.APIStatus.checkApiStatus();
    setInterval(UTILS.APIStatus.checkApiStatus, 1000);
  }


}