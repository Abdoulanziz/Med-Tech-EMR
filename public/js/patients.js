import { UI } from "./ui.js";
import { UTILS } from "./utils.js";
import { API } from "./requests.js";

document.addEventListener("DOMContentLoaded", () => {
    // Init UI
    UI.init();

    // Load all patients
    loadAllPatients();
        
    // Handle patient creation form
    handleCreatePatientForm();

    // Handle visit creation from
    handleCreateVisitForm();

    // Handle add to queue form
    handleAddPatientToQueueForm();
    
});


// Load all patients to all-patients-table
async function loadAllPatients() {
    // Variable to store all patients
    let allPatients;

    // API endpoint to fetch all patients
    const apiEndpoint = `${UI.apiBaseURL}/patients`;

    // Set up Data Tables
    allPatients = $('#all-patients-table').DataTable({
        processing: true, // Data processing
        serverSide: true, // Server-side data rendering 
        paging: true, // Pagination
        searching: true, // Searching
        filter:true, // Filtering
        destroy: true, // Redraw the table each time it is instantiated

        // Make the API request
        ajax: {
            url: apiEndpoint,
            dataSrc: "data",
            data: function (d) {
                d.minDate = $('#min-date').val();
                d.maxDate = $('#max-date').val();
            },
        }, 
        
        // Map the columns and the data
        columns: [ 
            { data : "patientId" },
            { data : null },
            { data : null },
            { data : "contactNumber" },        
            { data : "gender" },
            { data : null },
            { data : null }
        ],

        // Execute function on each row
        rowCallback: function(row, data, index) {
            const rowDataString = JSON.stringify(data);
            const viewMoreCta = row.cells[5].querySelectorAll("button")[0];

            viewMoreCta.dataset.patient = rowDataString;
            viewMoreCta.style.cursor = "pointer";
            viewMoreCta.classList.add("section-toggler");
            viewMoreCta.dataset.section = "section_01";

            UTILS.sectionToggler(viewMoreCta, "section", () => {
                displaySelectedPatientDetails("patient-info-section_01", rowDataString, () => {
                    loadSinglePatientVists(data.patientId);
                    displaySelectedPatientDiagnosesBills("ongoing-services");
                });
            });
        },

        // Load the data to the columns
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
                    return data.firstName + " " + data.lastName;
                },
            },
            {
                targets: 2,
                render: function(data, type, row, meta) {
                    const age = new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear();
                    return '<span>' + age + '</span>';
                }
            },
            {
                targets: 3,
                render: function(data, type, row, meta) {
                    return '<span>' + data + '</span>';
                }
            },
            {
                targets: 4,
                render: function(data, type, row, meta) {
                    return '<span>' + data.charAt(0).toUpperCase() + data.slice(1) + '</span>';
                }
            },
            {
                targets: 5,
                render: function (data, type, row, meta) {
                    return `
                    <td>
                        <button class="btn" style="background-color: #8e8d8d;padding-inline: .6rem;border-radius: 0;font-size: 12px;">View Details <i class="ti-arrow-right"></i> </button>
                    </td>
                    `;
                }
            },
            {
                targets: 6,
                render: function(data, type, row, meta) {
                    const originalDate = data.createdAt;
                    const dateObj = new Date(originalDate);
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    return '<span>' + formattedDate + '</span>';
                }
            }
        ] 
    });


    // Date range filter
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
        allPatients.draw();
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

// Function to display diagnoses bills
async function displaySelectedPatientDiagnosesBills(divClass) {
    // Get Id of selected visit
    // const selectedVisitId = UTILS.getSelectedVisitId();
    const selectedVisitId = 1;

    // Fetch and display the bills of the selected visit
    const response = await API.diagnoses.fetchAllBills(selectedVisitId);
    const selectedBills = await response.data;

    // You can populate the patient details section with the fetched data
    const billItems = selectedBills.rows;
    if (billItems) {
        const billContainer = document.querySelector(`.${divClass}`);
        billItems.forEach((billItem) => {
            // Create a template for each bill item
            const template = `
            <div class="service paid">
                <div class="service-content flex">
                <h3>${billItem.testName} (UGX ${billItem.fees})</h3>
                <img src="/assets/svg/cancel.png" alt="remove service icon">
                </div>
            </div>
            `;

            // Temporary container element to hold the template
            const tempContainer = document.createElement("div");
            tempContainer.innerHTML = template;

            // Append the template to the billContainer
            billContainer.appendChild(tempContainer.firstElementChild);
        });
    }
}


// Load patient to DOM
async function loadSinglePatientVists(patientId) {
    let allPatients;
    const apiEndpoint = `${UI.apiBaseURL}/visits/${patientId}`;

    allPatients = $('#single-patient-visits').DataTable({
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
            { data : null }
        ],
        rowCallback: function(row, data, index) {
            const rowDataString = JSON.stringify(data);
            const editVisitCta = row.cells[3].querySelectorAll("button")[0];
            const viewVisitCta = row.cells[3].querySelectorAll("button")[1];
            const deleteVisitCta = row.cells[3].querySelectorAll("button")[2];

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
                    return data.doctorFullName;
                },
            },
            {
                targets: 2,
                render: function(data, type, row, meta) {
                    const originalDate = data.visitDate;
                    const dateObj = new Date(originalDate);
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    return '<span>' + formattedDate + '</span>';
                }
            },
            {
                targets: 3,
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
                targets: 4,
                render: function(data, type, row, meta) {
                    const originalDate = data.visitCreatedAt;
                    const dateObj = new Date(originalDate);
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    return '<span>' + formattedDate + '</span>';
                }
            }
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

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();
    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(createPatientForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create a patient record
                const response = await API.patients.create(URLEncodedData, true);
    
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
                    loadAllPatients();
    
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
async function handleCreateVisitForm() {
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

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();

        // Display a confirmation dialog
        UTILS.showConfirmationModal(createVisitForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create a visit record
                const response = await API.visits.create(URLEncodedData, true);

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
                    loadSinglePatientVists(selectedPatientId);

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

// Handle add to queue form submission
async function handleAddPatientToQueueForm() {
    // Handle form submission
    const addPatientToQueueForm = document.querySelector('#add-patient-to-queue-form');
    addPatientToQueueForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get Id of selected patient
        const selectedPatientId = UTILS.getSelectedPatientId();
        if (! selectedPatientId) return;

        // Collect form data
        const formData = new FormData(addPatientToQueueForm);
        formData.append('patientId', selectedPatientId);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();

        // Display a confirmation dialog
        UTILS.showConfirmationModal(addPatientToQueueForm, "Are you sure you want to add this patient to the queue?", async () => {
            try {
                // Make an API POST request to create a visit record
                const response = await API.queues.addPatient(URLEncodedData, true);

                // Check if the request was successful
                if (response.status === 'success') {
                    // Alert user
                    // alert('Visit record created successfully!');
                    // TODO: Create a banner to show visit saved

                    // Reset the form
                    addPatientToQueueForm.reset();

                    // Remove form
                    addPatientToQueueForm.parentElement.parentElement.classList.remove("inview");

                    // Reload the visits table
                    loadSinglePatientVists(selectedPatientId);

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
            addPatientToQueueForm.reset();
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