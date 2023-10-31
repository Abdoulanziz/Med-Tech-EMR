import { UI } from "./ui.js";
import { UTILS } from "./utils.js";
import { API } from "./requests.js";

document.addEventListener("DOMContentLoaded", () => {
    // Init UI
    UI.init();

    // Load all patients
    loadAllVisits();
    
});


async function loadAllVisits() {
    let allVisits;
    const apiEndpoint = `${UI.apiBaseURL}/visits`;

    allVisits = $('#all-visits-table').DataTable({
        processing: true,
        serverSide: true,
        paging: true,
        searching: true,
        filter:true,
        destroy: true,
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
            { data : null },
            { data : null }
        ],
        rowCallback: function(row, data, index) {
            const rowDataString = JSON.stringify(data);
            const editVisitCta = row.cells[4].querySelectorAll("button")[0];
            const viewVisitCta = row.cells[4].querySelectorAll("button")[1];
            const deleteVisitCta = row.cells[4].querySelectorAll("button")[2];

            editVisitCta.dataset.patient = rowDataString;
            editVisitCta.style.cursor = "pointer";
            editVisitCta.classList.add("modal-trigger");
            editVisitCta.dataset.modal = "edit-visit-modal";

            UTILS.triggerModal(editVisitCta, "modal", () => {
                // Populate the form with the rowData
                populateFormWithData(
                    "edit-visit-modal",
                    rowDataString,
                    [
                        "visitCategoryId",
                        "doctorFullName",
                        "visitDate"
                    ]
                );
            });
        },
        columnDefs: [
            {
                targets: 0,
                render: function(data, type, row, meta) {
                    return data.visitId;
                }
            },
            {
                targets: 1,
                render: function (data, type, row, meta) {
                    return `
                    <td>
                        <div style="display:flex; justify-content:flex-start; align-items:center; gap: .2rem;">
                            <img src="/assets/svg/folder.png" alt="" class="icon" style="inline-size: 28px; block-size: 28px;" />
                            <span>${data.patientFullName}</span>
                        </div>
                    </td>
                    `;
                },
            },
            {
                targets: 2,
                render: function (data, type, row, meta) {
                    return data.doctorFullName;
                },
            },
            {
                targets: 3,
                render: function(data, type, row, meta) {
                    const originalDate = data.visitDate;
                    const dateObj = new Date(originalDate);
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    return '<span>' + formattedDate + '</span>';
                }
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    return `
                    <td>
                        <button class="btn" style="background-color: #1da1f2;padding-inline: .6rem;border-radius: 0;font-size: 12px;"> <i class="ti-pencil"></i> Edit </button>
                        <button class="btn" style="background-color: yellowgreen;padding-inline: .6rem;border-radius: 0;font-size: 12px;"> <i class="ti-file"></i> Update </button>
                        <button class="btn" style="background-color: orange;padding-inline: .6rem;border-radius: 0;font-size: 12px;"> <i class="ti-trash"></i> Delete </button>
                    </td>
                    `;
                },
            },
            {
                targets: 5,
                render: function(data, type, row, meta) {
                    const originalDate = data.visitCreatedAt;
                    const dateObj = new Date(originalDate);
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    return '<span>' + formattedDate + '</span>';
                }
            },
        ] 
    });


    // Date range picker
    // Extend dataTables search
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        var min = $('#min-date').val();
        var max = $('#max-date').val();
        var createdAt = moment(data[4], 'MM/DD/YYYY');

        if ((min === "" && max === "") || (!min && !max)) {
            return true;
        } else if ((!min || min === "") && max) {
            return createdAt.isSameOrBefore(max);
        } else if ((!max || max === "") && min) {
            return createdAt.isSameOrAfter(min);
        } else {
            return createdAt.isSameOrAfter(min) && createdAt.isSameOrBefore(max);
        }
    });

    // Re-draw the table when the a date range filter changes
    $('.date-range-filter').change(function() {
        allVisits.draw();
    });

};


// Function to display selected patient details
async function displaySelectedPatientDetails(divID, data, callback) {
    // Get Id of selected patient
    const patientId = JSON.parse(data).patientId;

    // Persist Id of selected patient
    UTILS.setSelectedPatientId(patientId);

    // Fetch and display the details of the selected patient
    const response = await API.patients.fetchSingle(patientId);
    const selectedPatient = await response.data;

    // You can populate the patient details section with the fetched data
    const div = document.querySelector(`#${divID}`);
    if(div){
        const patientName = div.querySelector("#patient-name");
        const contactNumber = div.querySelector("#contact-number");
        const dateOfBirth = div.querySelector("#date-of-birth");
        const gender = div.querySelector("#gender");
        const age = div.querySelector("#age");

        patientName.textContent = `${selectedPatient.firstName} ${selectedPatient.lastName}`;
        contactNumber.textContent = selectedPatient.contactNumber;
        dateOfBirth.textContent = selectedPatient.dateOfBirth;
        gender.textContent = selectedPatient.gender.charAt(0).toUpperCase() + selectedPatient.gender.slice(1).toLowerCase();
        age.textContent = new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear();
    }

    // Render other UI section
    callback(patientId);
}


// Load patient to DOM
async function loadSinglePatient(patientId) {
    let allVisits;
    const apiEndpoint = `${UI.apiBaseURL}/visits/${patientId}`;

    allVisits = $('#single-patient-visits').DataTable({
        processing: true,
        serverSide: true,
        paging: true,
        searching: true,
        filter:true,
        destroy: true,
        ajax: {
            url: apiEndpoint,
            dataSrc: "data",
            data: function (d) {
                d.minDate = $('#min-date').val();
                d.maxDate = $('#max-date').val();
            },
        },    
        columns: [ 
            { data : "visitId" },
            { data : "doctorId" },
            { data : "visitStatus" },
            { data : null },        
            { data : "createdAt" }
        ],
        rowCallback: function(row, data, index) {
            row.style.cursor = "pointer";
            row.dataset.patient = JSON.stringify(data);
            
        },
        columnDefs: [
            {
                targets: 0,
                render: function(data, type, row, meta) {
                    return '<span>' + data + '</span>';
                }
            },
            {
                targets: 1,
                render: function (data, type, row, meta) {
                    return '<span>' + data + '</span>';
                },
            },
            {
                targets: 2,
                render: function(data, type, row, meta) {
                    return '<span>' + data + '</span>';
                }
            },
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    return `
                    <td>
                        <button class="btn" style="background-color: #8e8d8d;padding-inline: .6rem;border-radius: 0;font-size: 12px;"> <i class="ti-file"></i> View Reports </button>
                    </td>
                    `;
                }
            },
        ] 
    });

}


// Handle create patient form submission
async function handleCreatePatientForm() {
    const createPatientForm = document.querySelector('#create-patient-form');
    createPatientForm.addEventListener('submit', (event) => {
        event.preventDefault();
    
        // Collect form data
        const formData = new FormData(createPatientForm);
    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(createPatientForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create a patient record
                const response = await API.patients.create(formData, true);
    
                // Check if the request was successful
                if (response.status === 'success') {
                    // Alert user
                    // alert('Patient record created successfully!');
                    // TODO: Create a banner to show patient saved
    
                    // Reset the form
                    createPatientForm.reset();
    
                    // Remove form
                    createPatientForm.parentElement.parentElement.classList.remove("inview");
    
                    // Reload the patients table
                    loadAllVisits();
    
                } else {
                    alert('Failed to create patient record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the patient record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            createPatientForm.reset();
        });
    });
}


// Handle create visit form submission
async function handleVisitForm() {
    // Handle form submission
    const createVisitForm = document.querySelector('#create-visit-form');
    createVisitForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get Id of selected patient
        const selectedPatientId = UTILS.getSelectedPatientId();
        if (! selectedPatientId) return;

        // Collect form data
        const formData = new FormData(createVisitForm);
        formData.append('patientId', selectedPatientId);

        // Display a confirmation dialog
        UTILS.showConfirmationModal(createVisitForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create a visit record
                const response = await API.visits.create(formData, true);

                // Check if the request was successful
                if (response.status === 'success') {
                    // Alert user
                    // alert('Visit record created successfully!');
                    // TODO: Create a banner to show visit saved

                    // Reset the form
                    createVisitForm.reset();

                    // Remove form
                    createVisitForm.parentElement.parentElement.classList.remove("inview");

                    // Reload the visits table
                    loadSinglePatient(selectedPatientId);

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
            createVisitForm.reset();
        });
    });
}


// Populate form with data
function populateFormWithData(formId, data, formFieldsNamesArray) {
    // Parse the form id
    const form = document.querySelector(`#${formId}`);
    const parsedData = JSON.parse(data);

    // Use the names of the fields not their ids
    formFieldsNamesArray.forEach(fieldName => {
        const field = form.querySelector(`[name=${fieldName}]`);
        if (field) {
            field.value = parsedData[fieldName] || null;
        }
    });
}