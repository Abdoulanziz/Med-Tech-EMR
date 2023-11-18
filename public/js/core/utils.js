export const UTILS = {
    // Section togglers
    sectionToggler: (trigger, dataAttrName, callback=null) => {

        const dataSection = trigger.dataset[dataAttrName];
        const sectionToShow = document.querySelector(`#${dataSection}`);
        
        const addSection = () => {
            if (sectionToShow) {
                sectionToShow.classList.add("inview");
            }
        };
        
        const removeVisibleSections = () => {
            const visibleSections = document.querySelectorAll(".sections.inview");
            visibleSections.forEach(section => section.classList.remove("inview"));
        };

    
        trigger.addEventListener("click", () => {
            removeVisibleSections();
            addSection();
            if (typeof callback === 'function') callback();
        });
    },

    // Row click
    rowClick: (row, callback) => {
        row.addEventListener("click", () => {
            if (typeof callback === 'function') callback();
        });
    },

    // Menu Togglers
    menuToggler: (trigger, dataAttrName, enableClick = true) => {
        let isMenuOpen = false;
        let menuToShow;
        
        const openMenu = () => {
            if (menuToShow) {
            menuToShow.style.display = "block";
            isMenuOpen = true;
            }
        };
        
        const closeMenu = () => {
            if (menuToShow) {
            menuToShow.style.display = "none";
            isMenuOpen = false;
            }
        };
        
        const toggleMenu = () => {
            if (isMenuOpen) {
            closeMenu();
            } else {
            closeOpenMenus();
            openMenu();
            }
        };
        
        const closeOpenMenus = () => {
            const openMenus = document.querySelectorAll(".section-dropdown-menu");
            openMenus.forEach(menu => (menu.style.display = "none"));
        };
        
        trigger.addEventListener("click", () => {
            if (enableClick) {
            toggleMenu();
            }
        });
        
        trigger.addEventListener("mouseenter", () => {
            if (!isMenuOpen) {
            closeOpenMenus();
            openMenu();
            }
        });
        
        trigger.addEventListener("mouseleave", () => {
            closeMenu();
        });
        
        const dataMenu = trigger.dataset[dataAttrName];
        menuToShow = document.querySelector(`#${dataMenu}`);
    },

    // Modal triggers
    triggerModal: (trigger, dataAttrName, callback=null) => {
        let modalToShow;
        
        const addModal = () => {
            if (modalToShow) {
                modalToShow.classList.add("inview");
            }
        };
        
        const removeVisibleModals = () => {
            const visibleModals = document.querySelectorAll(".modals.inview");
            visibleModals.forEach(modal => modal.classList.remove("inview"));
        };

        const removeThisModal = () => {
            modalToShow.classList.remove("inview");
        };

        trigger.addEventListener("click", () => {
            removeVisibleModals();
            addModal();
            if(typeof callback === 'function') callback();
        });

        const dataModal = trigger.dataset[dataAttrName];
        modalToShow = document.querySelector(`#${dataModal}`);

        // Hide this modal using Close button
        modalToShow.querySelector(".close-modal-btn")?.addEventListener("click", () => {
            // Display a confirmation dialog
            UTILS.showConfirmationModal(modalToShow, "Are you sure you want to close this modal?", () => {
                removeThisModal();
            }, () => {
                // TODO: Run when cancelled
            });
        });

        // Hide this modal using Cancel button
        modalToShow.querySelector("button[type='button']")?.addEventListener("click", () => {
            // Display a confirmation dialog
            UTILS.showConfirmationModal(modalToShow, "Are you sure you want to close this modal?", () => {
                removeThisModal();
            }, () => {
                // TODO: Run when cancelled
            });
        });

        document.addEventListener('keydown', function(event) {
            if (event.ctrlKey && event.key === 'q') {
                event.preventDefault();
                removeThisModal();
            }
        });
    },

    // Create and display a custom confirmation modal
    showConfirmationModal: (parent, message, onConfirm, onCancel) => {
        // Check if a modal already exists in the parent and remove it
        const existingModal = parent.querySelector(".confirmation-modal");
        if (existingModal) {
            parent.removeChild(existingModal);
        }

        const confirmationModalHTML = `
            <div class="confirmation-modal">
                <div class="modal-content">
                    <img src="/assets/svg/confirmation-modal-icon.png" class="icon"/>
                    <p>${message}</p>
                    <div class="modal-buttons">
                        <button class="confirm-no no">No</button>
                        <button class="confirm-yes yes">Yes</button>
                    </div>
                </div>
            </div>
        `;

        parent.insertAdjacentHTML("beforeend", confirmationModalHTML);

        const confirmationModal = parent.querySelector(".confirmation-modal");
        const confirmYesButton = parent.querySelector(".confirm-yes");
        const confirmNoButton = parent.querySelector(".confirm-no");

        confirmationModal.style.display = "block";

        confirmYesButton.addEventListener("click", () => {
            confirmationModal.remove();
            if (typeof onConfirm === "function") {
                onConfirm();
            }
        });

        confirmNoButton.addEventListener("click", () => {
            confirmationModal.remove();
            if (typeof onCancel === "function") {
                onCancel();
            }
        });
    },

    // Set ID of selected patient
    setSelectedPatientId: (id) => {
        window.medtech = {};
        medtech.selectedPatientId = id;
    },

    // Get ID of selected patient
    getSelectedPatientId: () => {
        const selectedPatientId = window.medtech.selectedPatientId;
        return selectedPatientId;
    },

    // Set ID of selected visit
    setSelectedVisitId: (id) => {
        window.medtech = {};
        medtech.selectedVisitId = id;
    },

    // Get ID of selected visit
    getSelectedVisitId: () => {
        const selectedVisitId = window.medtech.selectedVisitId;
        return selectedVisitId;
    },

    APIStatus: {
        bannerTimeout: null,
        isApiRunning: false,

        createBanner: (message, color, autoHide) => {
            // Check if the banner already exists
            const existingBanner = document.getElementById("api-status-check-banner");
            if (existingBanner) {
                existingBanner.remove();
            }

            const banner = document.createElement("div");
            banner.id = "api-status-check-banner";
            banner.className = "hidden";

            const paragraph = document.createElement("p");
            paragraph.textContent = message;

            banner.style.backgroundColor = color;

            banner.appendChild(paragraph);
            document.body.appendChild(banner);
            banner.classList.add("visible");

            if (autoHide) {
                clearTimeout(UTILS.APIStatus.bannerTimeout); // Clear any existing timeout

                UTILS.APIStatus.bannerTimeout = setTimeout(() => {
                    banner.classList.remove("visible");
                    setTimeout(() => {
                        banner.remove();
                    }, 1500); // Remove the banner after it's hidden
                }, 5000); // Hide the banner after 5 seconds (adjust as needed)
            }
        },

        checkApiStatus: () => {
            fetch("http://localhost:5000/api/v1/status", {
                credentials: 'omit'
            })
            .then((response) => {
                // If the API was previously not running, show the green banner
                if (!UTILS.APIStatus.isApiRunning) {
                    UTILS.APIStatus.createBanner("The backend API is now running.", "#006837", false); // Do not auto-hide the green banner
                    UTILS.APIStatus.isApiRunning = true;

                    // Hide the green banner after a short time
                    setTimeout(() => {
                        const greenBanner = document.getElementById("api-status-check-banner");
                        if (greenBanner) {
                            greenBanner.classList.remove("visible");
                            setTimeout(() => {
                                greenBanner.remove();
                            }, 1500); // Remove the green banner after it's hidden
                        }
                    }, 2000); // Hide the green banner after 2 seconds (adjust as needed)
                }
            })
            .catch(() => {
                // If there's an error, the API is not running
                UTILS.APIStatus.isApiRunning = false;
                UTILS.APIStatus.createBanner("The backend API is not running. Please contact the System Admin.", "#7f181b", false);
            });
        }
    }

}