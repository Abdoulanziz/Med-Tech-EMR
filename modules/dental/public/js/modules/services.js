import { UI } from "../core/ui.js";
import { UTILS } from "../core/utils.js";
import { API } from "../core/api.js";

document.addEventListener("DOMContentLoaded", () => {
    // Init UI
    UI.init();

    // Load dental procedures
    loadDentalProcedures();

    // Handle procedure for dental
    handleCreateProcedureForDentalForm();
});

// Handle create dental procedure form submission
async function handleCreateProcedureForDentalForm() {
    // Handle form submission
    const createDentalProcedureForm = document.querySelector('#create-procedure-record-form');
    createDentalProcedureForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Collect form data
        const formData = new FormData(createDentalProcedureForm);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();

        // Display a confirmation dialog
        UTILS.showConfirmationModal(createDentalProcedureForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create a visit record
                const response = await API.services.forDental.procedures.create(URLEncodedData, true);

                // Check if the request was successful
                if (response.status === 'success') {
                    // Reset the form
                    createDentalProcedureForm.reset();

                    // Remove form
                    createDentalProcedureForm.parentElement.parentElement.classList.remove("inview");

                    // Reload the dental procedures table
                    loadDentalProcedures();
                } else {
                    alert('Failed to create visit record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the visit record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            createDentalProcedureForm.reset();
        });
    });
}

// Load dental procedures to DOM
async function loadDentalProcedures() {

    let allDentalProcedures;
    const apiEndpoint = `${UI.apiBaseURL}/services/dental/procedures`;

    allDentalProcedures = $('#dental-procedures-table').DataTable({
        processing: true,
        serverSide: true,
        paging: true,
        searching: true,
        filter:true,
        destroy: true,
        order: [[0, 'desc']],

        ajax: {
            url: apiEndpoint,
            dataSrc: "data",
            data: function (d) {
                d.minDate = $('#min-date').val();
                d.maxDate = $('#max-date').val();
            },
        },  
        columns: [ 
            { data : null },
            { data : null },
            { data : null },
            { data : null },
            { data : null }
        ],
        rowCallback: function(row, data, index) {
        },
        columnDefs: [
            {
                targets: 0,
                render: function(data, type, row, meta) {
                    return '<span>' + (meta.row + 1) + '</span>';
                }
            },
            {
                targets: 1,
                render: function (data, type, row, meta) {
                    return '<span style="color: #525f7f;">' + data.procedureName + '</span>';
                },
            },
            {
                targets: 2,
                render: function (data, type, row, meta) {
                    return '<span style="color: #525f7f;">' + UTILS.formatAmountWithCommas(data.procedureFees) + '</span>';
                },
            },
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    return `
                    <td>
                        <button class="btn table-btn">Update <i class="ti-pencil"></i> </button>
                    </td>
                    `;
                }
            },
            {
                targets: 4,
                render: function(data, type, row, meta) {
                    const originalDate = data.createdAt;
                    const dateObj = new Date(originalDate);
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    return '<span>' + formattedDate + '</span>';
                }
            }
        ]  
    });

}