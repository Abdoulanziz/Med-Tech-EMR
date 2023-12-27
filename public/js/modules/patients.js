import { UI } from "../core/ui.js";
import { UTILS } from "../core/utils.js";
import { API } from "../core/api.js";


document.addEventListener("DOMContentLoaded", () => {
    // Init UI
    UI.init();

    // Load all patients
    loadAllPatients();
        
    // Handle patient creation form
    handleCreatePatientForm();

    // Handle visit creation from
    handleCreateVisitForm();

    // Fetch tests through worker thread
    // fetchTestsThroughWorkerThread();



    
    
});


// Load all patients to all-patients-table
async function loadAllPatients() {
    // Variable to store all patients
    let allPatients;

    // API endpoint to fetch all patients
    const apiEndpoint = `${UI.apiBaseURL}/patients`;

    // Set up Data Tables
    allPatients = $('#all-patients-table').DataTable({
        processing: true,
        serverSide: true,
        paging: true,
        searching: true,
        filter:true,
        destroy: true,

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


            // Update Patient
            const updatePatientCta = row.cells[5].querySelectorAll("button")[0];

            updatePatientCta.dataset.patient = rowDataString;
            updatePatientCta.style.cursor = "pointer";
            updatePatientCta.classList.add("modal-trigger");
            updatePatientCta.dataset.modal = "update-patient-modal";

            UTILS.triggerModal(updatePatientCta, "modal", async () => {

                // Fetch patient data (from API)
                // const response = await API.patients.fetchById(data.patientId);
                // const fetchedPatient = await response.data;


                // Populate the form with the data
                populateFormWithData(
                    "update-patient-modal",
                    // Local
                    rowDataString,

                    // API
                    // JSON.stringify(fetchedPatient),
                    [
                        "firstName",
                        "lastName",
                        "nationalIDNumber",
                        "dateOfBirth",
                        "age",
                        "gender",
                        "contactNumber",
                        "alternativeContactNumber",
                        "homeAddress",
                        "emailAddress",
                        "nokFirstName",
                        "nokLastName",
                        "nokRelationship",
                        "nokContactNumber",
                        "nokHomeAddress",
                        "billingMethodId"
                    ]
                );

                // Callback to handle patient update form
                handleUpdatePatientForm(data.patientId);

            });








            // View Details
            const viewMoreCta = row.cells[5].querySelectorAll("button")[1];

            viewMoreCta.dataset.patient = rowDataString;
            viewMoreCta.style.cursor = "pointer";
            viewMoreCta.classList.add("section-toggler");
            viewMoreCta.dataset.section = "section_01";

            UTILS.sectionToggler(viewMoreCta, "section", () => {
                displaySelectedPatientDetails("patient-info-section_01", rowDataString, () => {
                    loadSinglePatientVists(data.patientId);
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
                    return '<span style="color: #525f7f;">' + data.firstName + " " + data.lastName + '</span>';
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
                        <button class="btn table-btn">Update <i class="ti-pencil"></i> </button>
                        <button class="btn table-btn">View Details <i class="ti-arrow-right"></i> </button>
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
    const response = await API.patients.fetchById(patientId);
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
        // gender.textContent = selectedPatient.gender.charAt(0).toUpperCase() + selectedPatient.gender.slice(1).toLowerCase();
        age.textContent = new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear();
    }

    // Render other UI section
    callback(patientId);
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
            { data : null },
            { data : null },
            { data : null }
        ],
        rowCallback: function(row, data, index) {
            const rowDataString = JSON.stringify(data);

            const editVisitCta = row.cells[5].querySelectorAll("button")[0];

            editVisitCta.dataset.patient = rowDataString;
            editVisitCta.style.cursor = "pointer";
            editVisitCta.classList.add("modal-trigger");
            editVisitCta.dataset.modal = "edit-visit-modal";

            UTILS.triggerModal(editVisitCta, "modal", async() => {

                // Fetch patient data (from API)
                // const response = await API.visits.fetchById(data.visitId);
                // const fetchedVisit = await response.data;


                // Populate the form with the rowData
                populateFormWithData(
                    "edit-visit-modal",
                    // Local
                    rowDataString,

                    // API
                    // JSON.stringify(fetchedVisit),
                    [
                        "visitCategoryId",
                        "doctorFullName",
                        "visitDate",
                        "visitStatus"
                    ]
                );

                // Callback to handle visit update form
                handleUpdateVisitForm(data.visitId);
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
                    return '<span style="color: #525f7f;">' + data.doctorFullName + '</span>';
                },
            },
            {
                targets: 2,
                render: function (data, type, row, meta) {
                    return "Visit";
                },
            },
            {
                targets: 3,
                render: function(data, type, row, meta) {
                    const originalDate = data.visitDate;
                    const dateObj = new Date(originalDate);
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    return '<span style="color: #525f7f;">' + formattedDate + '</span>';
                }
            },
            {
                targets: 4,
                render: function(data, type, row, meta) {
                    const status = data.visitStatus.toLowerCase();
                    let color;

                    if (status === 'completed') {
                        color = 'yellowgreen';
                    } else if(status === 'canceled') {
                        color = 'orange';
                    } else {
                        color = 'grey';
                    }
                    return '<span class="td-status"><span class="td-status-dot" style="background-color: ' + color + ';"></span>'+ data.visitStatus.charAt(0).toUpperCase() + data.visitStatus.slice(1) +'</span>';

                }
            },
            {
                targets: 5,
                render: function (data, type, row, meta) {
                    return `
                    <td>
                        <button class="btn table-btn"> <i class="ti-pencil"></i> Update </button>
                    </td>
                    `;
                },
            },
            {
                targets: 6,
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

                    // Collect form data
                    const formDataQueue = new FormData();
                    formDataQueue.append('patientId', selectedPatientId);
                    formDataQueue.append('doctorId', response.data.doctorId);
                    formDataQueue.append('visitId', response.data.visitId);

                    // URL encoded data
                    const URLEncodedDataQueue = new URLSearchParams(formDataQueue).toString();

                    // Make an API POST request to add patient to the queue
                    const responseQueue = await API.queues.addPatient(URLEncodedDataQueue, true);

                    // Check if the request was successful
                    if (responseQueue.status === 'success') {

                        // Reset the form
                        createVisitForm.reset();

                        // Remove form
                        createVisitForm.parentElement.parentElement.classList.remove("inview");

                        // Reload the visits table
                        loadSinglePatientVists(selectedPatientId);

                    } else {
                        alert('Failed to add patient to the queue.');
                    }
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

// Handle patient update form
async function handleUpdatePatientForm(patientId) {
    const updatePatientForm = document.querySelector('#update-patient-form');
    updatePatientForm.addEventListener('submit', (event) => {
        event.preventDefault();
    
        // Collect form data
        const formData = new FormData(updatePatientForm);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();
    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(updatePatientForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API PUT request to update a patient record
                const response = await API.patients.update(patientId, URLEncodedData, true);
    
                // Check if the request was successful
                if (response.status === 'success') {
    
                    // Reset the form
                    updatePatientForm.reset();
    
                    // Remove form
                    updatePatientForm.parentElement.parentElement.classList.remove("inview");
    
                    // Reload the patients table
                    loadAllPatients();
    
                } else {
                    alert('Failed to update patient record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while updating the patient record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            updatePatientForm.reset();
        });
    });
}

// Handle visit update form
async function handleUpdateVisitForm(visitId) {
    const updateVisitForm = document.querySelector('#edit-visit-form');
    updateVisitForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Get Id of selected patient
        const selectedPatientId = UTILS.getSelectedPatientId();
        if (! selectedPatientId) return;

        // Collect form data
        const formData = new FormData(updateVisitForm);
        formData.append('patientId', selectedPatientId);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();
    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(updateVisitForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to update a visit record
                const response = await API.visits.update(visitId, URLEncodedData, true);
    
                // Check if the request was successful
                if (response.status === 'success') {
    
                    // Reset the form
                    updateVisitForm.reset();
    
                    // Remove form
                    updateVisitForm.parentElement.parentElement.classList.remove("inview");
    
                    // Reload the visits table
                    loadSinglePatientVists(selectedPatientId);
    
                } else {
                    alert('Failed to update visit record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while updating the visit record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            updateVisitForm.reset();
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

function fetchTestsThroughWorkerThread(){
    // Define worker instance
    const worker = UTILS.getWorkerInstance();

    // Send data to worker thread for processing
    worker.postMessage({code: 1, data: "Fetch tests"});

    // Listen for feedback
    worker.addEventListener("message", event => {
        // Return the feedback
        if(event.data.code === 1){
            // Consume the data
            console.log(event.data);
        }
    });
}