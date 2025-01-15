import { UI } from "../core/ui.js";
import { UTILS } from "../core/utils.js";
import { API } from "../core/api.js";

document.addEventListener("DOMContentLoaded", () => {
    // Init UI
    UI.init();

    // Handle facility creation form
    handleCreateFacilityForm();

    // Add event listeners to checkboxes for instant updates
    const financialRemindersCheckbox = document.querySelector('#financial-reminders-checkbox');
    const expenseTrackingCheckbox = document.querySelector('#expense-tracking-checkbox');
    const salesReportsCheckbox = document.querySelector('#sales-reports-checkbox');

    financialRemindersCheckbox.addEventListener('change', () => {
        updateFinancialSummariesSetting(financialRemindersCheckbox.checked);
    });

    expenseTrackingCheckbox.addEventListener('change', () => {
        updateExpenseTrackingSetting(expenseTrackingCheckbox.checked);
    });

    salesReportsCheckbox.addEventListener('change', () => {
        updateSalesReportsSetting(salesReportsCheckbox.checked);
    });

    fetchFinancialSummariesSetting();

    fetchExpenseTrackingSetting();

    fetchSalesReportsSetting();
});

// Function to fetch existing facility data
async function fetchExistingFacilityData() {
    try {
        // Make an API GET request to fetch existing facility data
        const response = await API.facilities.fetchById(1);

        // Check if the request was successful
        if (response.status === 'success') {
            return response.data; // Return the existing data
        } else {
            console.error('Failed to fetch existing facility data.');
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Handle create facility form submission
async function handleCreateFacilityForm() {
    const createFacilityForm = document.querySelector('#create-facility-form');
    const button = createFacilityForm.querySelector("button[type='submit']");

    // Fetch existing facility data
    const existingFacilityData = await fetchExistingFacilityData();

    // Populate form fields with existing data if available
    if (existingFacilityData) {
        for (const [key, value] of Object.entries(existingFacilityData)) {
            const inputField = createFacilityForm.querySelector(`[name='${key}']`);
            if (inputField) {
                inputField.value = value;
            }
        }

        // Change button text to "Update" since the form is populated
        button.innerText = "Update";
    }

    createFacilityForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        button.innerText = "Please wait..";
        button.style.opacity = ".5";

        // Collect form data
        const formData = new FormData(createFacilityForm);
        const URLEncodedData = new URLSearchParams(formData).toString();

        try {
            // Determine whether to create or update based on the context
            const action = existingFacilityData ? 'update' : 'create';

            // Make an API request to create or update a facility record
            let response;

            if(action === "update"){
                response = await API.facilities.update(1, URLEncodedData, true);
            }else {
                response = await API.facilities.create(URLEncodedData, true);
            }

            // Check if the request was successful
            if (response.status === 'success') {
                button.innerText = existingFacilityData ? "Update" : "Save";
                button.style.opacity = "unset";
            } else {
                console.log(`Failed to ${action} facility record. Please check the form data.`);
            }
        } catch (error) {
            console.error(error);
            console.log(`An error occurred while ${existingFacilityData ? 'updating' : 'creating'} the facility record.`);
        }
    });
}


// Update financial summaries setting
async function updateFinancialSummariesSetting(checked) {
    try {
        const formData = new FormData();
        formData.append('settingValue', checked);

        // Convert to URL-encoded string
        const URLEncodedData = new URLSearchParams(formData).toString();

        const response = await API.facilities.updateFacilitySettingByFacilityIdAndFacilitySettingId(1, 1, URLEncodedData, true);

        if (response.status !== 'success') {
            console.error('Failed to update financial summaries setting.');
        }
    } catch (error) {
        console.error(error);
    }
}

// Update expense tracking setting
async function updateExpenseTrackingSetting(checked) {
    try {
        const formData = new FormData();
        formData.append('settingValue', checked);

        // Convert to URL-encoded string
        const URLEncodedData = new URLSearchParams(formData).toString();

        const response = await API.facilities.updateFacilitySettingByFacilityIdAndFacilitySettingId(1, 2, URLEncodedData, true);

        if (response.status !== 'success') {
            console.error('Failed to update expense tracking setting.');
        }
    } catch (error) {
        console.error(error);
    }
}

// Update sales reports setting
async function updateSalesReportsSetting(checked) {
    try {
        const formData = new FormData();
        formData.append('settingValue', checked);

        // Convert to URL-encoded string
        const URLEncodedData = new URLSearchParams(formData).toString();

        const response = await API.facilities.updateFacilitySettingByFacilityIdAndFacilitySettingId(1, 3, URLEncodedData, true);

        if (response.status !== 'success') {
            console.error('Failed to update sales reports setting.');
        }
    } catch (error) {
        console.error(error);
    }
}


// Fetch financial summaries setting
async function fetchFinancialSummariesSetting() {
    try {
        const response = await API.facilities.fetchFacilitySettingByFacilityIdAndFacilitySettingId(1, 1);

        if (response.status === 'success') {
            const financialRemindersCheckbox = document.querySelector('#financial-reminders-checkbox');
            updateCheckbox(financialRemindersCheckbox, response.data.facilitySettingValue);
        } else {
            console.error('Failed to fetch financial summaries setting.');
        }
    } catch (error) {
        console.error(error);
    }
}

// Fetch expense tracking setting
async function fetchExpenseTrackingSetting() {
    try {
        const response = await API.facilities.fetchFacilitySettingByFacilityIdAndFacilitySettingId(1, 2);

        if (response.status === 'success') {
            const expenseTrackingCheckbox = document.querySelector('#expense-tracking-checkbox');
            updateCheckbox(expenseTrackingCheckbox, response.data.facilitySettingValue);
        } else {
            console.error('Failed to fetch expense tracking setting.');
        }
    } catch (error) {
        console.error(error);
    }
}

// Fetch sales reports setting
async function fetchSalesReportsSetting() {
    try {
        const response = await API.facilities.fetchFacilitySettingByFacilityIdAndFacilitySettingId(1, 3);

        if (response.status === 'success') {
            const salesReportsCheckbox = document.querySelector('#sales-reports-checkbox');
            updateCheckbox(salesReportsCheckbox, response.data.facilitySettingValue);
        } else {
            console.error('Failed to fetch sales reports setting.');
        }
    } catch (error) {
        console.error(error);
    }
}


function updateCheckbox(checkbox, value) {
    checkbox.checked = value;
}