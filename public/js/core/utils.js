import workerInstance from '../workers/worker-instance.js';

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

    // Get worker instance
    getWorkerInstance: () => {
        return workerInstance;
    },

    // Get the current year month with dates
    getCurrentYearMonthWithDates: () => {
        const currentDate = new Date();

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        const formattedMonth = month < 10 ? "0" + month : month;

        // Get the starting date of the month
        const startDate = new Date(year, month - 1, 1).toISOString().slice(0, 10);

        // Get the ending date of the month
        const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

        return {
            currentYearMonth: year + "-" + formattedMonth,
            startDate,
            endDate,
        };
    },

    // Get the previous year month with dates
    getPreviousYearMonthWithDates: () => {
        const currentDate = new Date();

        // Calculate the previous month, considering the transition to a previous year
        const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        const year = previousMonth.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
        const month = previousMonth.getMonth() + 1;

        const formattedMonth = month < 10 ? "0" + month : month;

        // Get the starting date of the previous month
        const startDate = new Date(year, month - 1, 1).toISOString().slice(0, 10);

        // Get the ending date of the previous month
        const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

        return {
            previousYearMonth: year + "-" + formattedMonth,
            startDate,
            endDate,
        };
    },

    // Calculate percentage difference
    calculatePercentageDifference: (previousValue, currentValue) => {
        if (previousValue === 0) {
            return currentValue === 0 ? 0 : 100; // Avoid division by zero
        }

        // Calculate the percentage difference and limit it to two decimal places
        const percentageDifference = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
        return parseFloat(percentageDifference.toFixed(2));
    },

    // Format amount with commas
    formatAmountWithCommas: (amount) => {
        const amountString = amount.toString();

        // Split the string into integer and decimal parts (if any)
        const [integerPart, decimalPart] = amountString.split('.');

        // Add commas to the integer part
        const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        // Combine the formatted integer part with the decimal part (if any)
        const formattedAmount = decimalPart ? `${formattedIntegerPart}.${decimalPart}` : formattedIntegerPart;

        return `UGX ${formattedAmount}`;
    },

    // Create summary chart
    createSummaryChart: (title='', type='bar', labels=[], mdata=[], canvasId) => {
        if(labels.length == 0 && mdata.length == 0) return;
        
        const data = {
        labels: labels,
        datasets: [{
            label: title,
            backgroundColor: '#b297f1',
            borderColor: '#b297f1',
            data: mdata,
        }]
        };

        const config = {
        type: type,
        data: data,
        options: {
            scales: {
                y: {
                    startAtZero: true
                }
            }
        }
        };

        // Render chart
        const chart = new Chart(
            document.getElementById(canvasId),
            config
        );
        return chart;
    },

    // Handle filter change events for income summary chat
    handleFilterChangeForIncomeSummaryChart: (filterType, chart, chartId) => {
        const chartTitle = document.querySelector(`#${chartId}-title`);

        switch (filterType) {
            case 'day':
                chartTitle.textContent = "Day's Income";
                chart.destroy();
                chart = UTILS.createSummaryChart('Durations', 'bar', ['Morning', 'Afternoon', 'Evening'], [80, 100, 46], chartId);
                break;
            case 'week':
                chartTitle.textContent = "Week's Income";
                chart.destroy();
                chart = UTILS.createSummaryChart('Days', 'bar', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [80, 100, 46, 39, 57, 25, 66], chartId);
                break;
            case 'month':
                chartTitle.textContent = "Month's Income";
                chart.destroy();
                chart = UTILS.createSummaryChart('Weeks', 'bar', ['Week1', 'Week2', 'Week3', 'Week4'], [80, 100, 46, 39], chartId);
                break;
            case 'year':
                chartTitle.textContent = "Year's Income";
                chart.destroy();
                chart = UTILS.createSummaryChart('Months', 'bar', ['Quarter1', 'Quarter2', 'Quarter3', 'Quarter4'], [80, 46, 39, 60], chartId);
                break;
            default:
                break;
        }
    },

    // Handle filter change events for expenses summary chat
    handleFilterChangeForExpensesSummaryChart: (filterType, chart, chartId) => {
        const chartTitle = document.querySelector(`#${chartId}-title`);

        switch (filterType) {
            case 'day':
                chartTitle.textContent = "Day's Expenses";
                chart.destroy();
                chart = UTILS.createSummaryChart('Durations', 'line', ['Morning', 'Afternoon', 'Evening'], [80000, 1000000, 460000], chartId);
                break;
            case 'week':
                chartTitle.textContent = "Week's Expenses";
                chart.destroy();
                chart = UTILS.createSummaryChart('Days', 'line', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [80000, 1000000, 460000, 0, 5700000, 0, 0], chartId);
                break;
            case 'month':
                chartTitle.textContent = "Month's Expenses";
                chart.destroy();
                chart = UTILS.createSummaryChart('Weeks', 'line', ['Week1', 'Week2', 'Week3', 'Week4'], [80000, 1000000, 460000, 5700000], chartId);
                break;
            case 'year':
                chartTitle.textContent = "Year's Expenses";
                chart.destroy();
                chart = UTILS.createSummaryChart('Months', 'line', ['Quarter1', 'Quarter2', 'Quarter3', 'Quarter4'], [80000, 1000000, 5700000, 7000000], chartId);
                break;
            default:
                break;
        }
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