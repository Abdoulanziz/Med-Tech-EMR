import { UI } from "../core/ui.js";
import { UTILS } from "../core/utils.js";
import { API } from "../core/api.js";

document.addEventListener("DOMContentLoaded", () => {
    // Init UI
    UI.init();

    // Handle facility creation form
    handleCreateFacilityForm();
});

// Handle create facility form submission
async function handleCreateFacilityForm() {
    const createFacilityForm = document.querySelector('#create-facility-form');
    createFacilityForm.addEventListener('submit', (event) => {
        event.preventDefault();
    
        // Collect form data
        const formData = new FormData(createFacilityForm);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();
    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(createFacilityForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create a facility record
                const response = await API.facilities.create(URLEncodedData, true);
    
                // Check if the request was successful
                if (response.status === 'success') {
    
                    // Reset the form
                    createFacilityForm.reset();
    
                } else {
                    alert('Failed to create facility record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the facility record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            createFacilityForm.reset();
        });
    });
}
