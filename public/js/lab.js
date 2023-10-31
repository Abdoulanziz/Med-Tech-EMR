import { UI } from "./ui.js";
import { UTILS } from "./utils.js";
import { API } from "./requests.js";

document.addEventListener("DOMContentLoaded", () => {
    // Init UI
    UI.init();

    // Load all patients on queue
    loadAllPatientsOnQueue();

    // Handle create triage
    handleCreateTriageForm();

    // Handle create allergy
    handleCreateAllergyForm();

    // Handle create lab report
    handleCreatePatientLabReportForm();
    
});


async function loadAllPatientsOnQueue() {
    let allPatientsOnQueueTable;
    const apiEndpoint = `${UI.apiBaseURL}/queues`;

    allPatientsOnQueueTable = $('#all-patients-on-queue-table').DataTable({
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
            { data : null },
            { data : null }
        ],
        rowCallback: function(row, data, index) {
            const rowData = JSON.stringify(data);

            const viewMoreCta = row.cells[6].querySelectorAll("button")[0];
            viewMoreCta.style.cursor = "pointer";
            viewMoreCta.classList.add("section-toggler");
            viewMoreCta.dataset.section = "section_01";

            UTILS.sectionToggler(viewMoreCta, "section", () => {
                displaySelectedPatientDetails("patient-info-section_01", rowData, () => loadSinglePatientVisits(data.patientId));
            });
        },
        columnDefs: [
            {
                targets: 0,
                render: function(data, type, row, meta) {
                    return '<span>' + data.patientId + '</span>';
                }
            },
            {
                targets: 1,
                render: function(data, type, row, meta) {
                    return data.patientFullName;
                }
            },
            {
                targets: 2,
                render: function(data, type, row, meta) {
                    const age = new Date().getFullYear() - new Date(data.patientDateOfBirth).getFullYear();
                    return '<span>' + age + '</span>';
                }
            },
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    return "Normal";
                },
            },
            {
                targets: 4,
                render: function(data, type, row, meta) {
                    return data.queueStatus;
                }
            },
            {
                targets: 5,
                render: function(data, type, row, meta) {
                    return data.doctorFullName;
                }
            },
            
            {
                targets: 6,
                render: function (data, type, row, meta) {
                    return `
                    <td>
                        <button class="btn" style="background-color: #8e8d8d;padding-inline: .6rem;border-radius: 0;font-size: 12px;">View More </button>
                    </td>
                    `;
                }
            },
            {
                targets: 7,
                render: function(data, type, row, meta) {
                    return data.queueCreatedAt;
                }
            },
        ] 
    });


    // Date range picker
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
        allPatientsOnQueueTable.draw();
    });

};

// Load patient to DOM
async function loadSinglePatientVisits(patientId) {
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
            { data : null }
        ],
        rowCallback: function(row, data, index) {
            data.patientId = patientId;
            const rowDataString = JSON.stringify(data);

            const workOnPatientCta = row.cells[4].querySelectorAll("button")[0];
            workOnPatientCta.style.cursor = "pointer";
            workOnPatientCta.dataset.patient = rowDataString;

            workOnPatientCta.classList.add("section-toggler");
            workOnPatientCta.dataset.section = "section_02";

            UTILS.sectionToggler(workOnPatientCta, "section", () => {
                displaySelectedPatientDetails("patient-info-section_02", rowDataString, () => loadSinglePatientVisitLabRequests(data.visitId));
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
                    const originalDate = data.visitCreatedAt;
                    const dateObj = new Date(originalDate);
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    return '<span>' + formattedDate + '</span>';
                }
            },
            {
                targets: 3,
                render: function(data, type, row, meta) {
                    return '<span>' + "Completed" + '</span>';
                }
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    return `
                    <td>
                        <button class="btn" style="background-color: #8e8d8d;padding-inline: .6rem;border-radius: 0;font-size: 12px;">Work on Patient  <i class="ti-arrow-right"></i> </button>
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
            }
        ]  
    });

}

// Load patient visit requests to DOM
async function loadSinglePatientVisitLabRequests(visitId) {
    // Get Id of selected visit
    const selectedVisitId = parseInt(visitId);

    // Persist Id of selected visit
    UTILS.setSelectedVisitId(selectedVisitId);

    let allPatients;
    const apiEndpoint = `${UI.apiBaseURL}/requests/${selectedVisitId}`;

    allPatients = $('#single-patient-visit-records').DataTable({
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
            const rowData = JSON.stringify(data.dataValues);

            if("diagnosisUuid" in JSON.parse(rowData)){

                const createReportCta = row.cells[4].querySelectorAll("button")[0];
                createReportCta.style.cursor = "pointer";
                createReportCta.classList.add("modal-trigger");
                createReportCta.dataset.modal = "create-patient-lab-report-modal";

                UTILS.triggerModal(createReportCta, "modal", () => {
                    // createReportCta.dataset.diagnosisId = JSON.parse(rowData).diagnosisId;
                    // console.log(JSON.parse(rowData).diagnosisId);

                    document.querySelector("#create-patient-lab-report-form").dataset.diagnosisId = JSON.parse(rowData).diagnosisId;

                    // Populate the form with the rowData
                    populateFormWithData(
                        "create-patient-lab-report-modal",
                        rowData,
                        [
                            "testName",
                            "fees"
                        ]
                    );
                });

            }
        },
        columnDefs: [
            {
                targets: 0,
                render: function(data, type, row, meta) {
                    return '<span>' + data.count + '</span>';
                }
            },
            {
                targets: 1,
                render: function (data, type, row, meta) {
                    return '<span>' + data.type + '</span>';
                },
            },
            {
                targets: 2,
                render: function(data, type, row, meta) {
                    const originalDate = data.dataValues.createdAt;
                    const dateObj = new Date(originalDate);
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    return '<span>' + formattedDate + '</span>';
                }
            },
            {
                targets: 3,
                render: function(data, type, row, meta) {
                    return '<span>' + "Completed" + '</span>';
                }
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    return `
                    <td>
                        <button class="btn view-results" style="background-color: #8e8d8d;padding-inline: .6rem;border-radius: 0;font-size: 12px;">Create Report  <i class="ti-arrow-right"></i> </button>
                    </td>
                    `;
                },
            },
            {
                targets: 5,
                render: function(data, type, row, meta) {
                    const originalDate = data.dataValues.createdAt;
                    const dateObj = new Date(originalDate);
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    return '<span>' + formattedDate + '</span>';
                }
            }
        ]  
    });

}

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

// Handle triage create form
async function handleCreateTriageForm() {
    const patientTriageForm = document.querySelector('#patient-triage-form');
    patientTriageForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Get Id of selected visit
        const selectedVisitId = UTILS.getSelectedVisitId();
        if (! selectedVisitId) return;
    
        // Collect form data
        const formData = new FormData(patientTriageForm);
        formData.append('visitId', selectedVisitId);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();
    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(patientTriageForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create a triage record
                const response = await API.triage.create(URLEncodedData, true);
    
                // Check if the request was successful
                if (response.status === 'success') {
                    // Alert user
                    // alert('Patient record created successfully!');
                    // TODO: Create a banner to show triage saved
    
                    // Reset the form
                    patientTriageForm.reset();
    
                    // Remove form
                    patientTriageForm.parentElement.parentElement.classList.remove("inview");
    
                    // Reload the requests table
                    loadSinglePatientVisitLabRequests(selectedVisitId);
    
                } else {
                    alert('Failed to create triage record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the triage record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            patientTriageForm.reset();
        });
    });
}

// Handle allergy create form
async function handleCreateAllergyForm() {
    const patientAllergyForm = document.querySelector('#patient-allergy-form');
    patientAllergyForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Get Id of selected visit
        const selectedVisitId = UTILS.getSelectedVisitId();
        if (! selectedVisitId) return;
    
        // Collect form data
        const formData = new FormData(patientAllergyForm);
        formData.append('visitId', selectedVisitId);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();
    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(patientAllergyForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create a triage record
                const response = await API.allergy.create(URLEncodedData, true);
    
                // Check if the request was successful
                if (response.status === 'success') {
                    // Alert user
                    // alert('Patient record created successfully!');
                    // TODO: Create a banner to show triage saved
    
                    // Reset the form
                    patientAllergyForm.reset();
    
                    // Remove form
                    patientAllergyForm.parentElement.parentElement.classList.remove("inview");
    
                    // Reload the requests table
                    loadSinglePatientVisitLabRequests(selectedVisitId);
    
                } else {
                    alert('Failed to create allergy record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the allergy record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            patientAllergyForm.reset();
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


// Handle create diangosis report form
async function handleCreatePatientLabReportForm() {
    const patientLabReportForm = document.querySelector('#create-patient-lab-report-form');
    patientLabReportForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Get Id of selected visit
        const selectedVisitId = UTILS.getSelectedVisitId();
        if (! selectedVisitId) return;

        // Get Id of selected request
        const selectedRequestId = patientLabReportForm.dataset.diagnosisId;
        if (! selectedRequestId) return;

        // Initialize the editor
        const editor = tinymce.get("lab-report");
        let formattedContent;

        // Check if the editor is initialized and exists
        if (editor) {
            formattedContent = editor.getContent();
        } else {
            console.error("Editor not found or initialized.");
        }
    
        // Collect form data
        const formData = new FormData(patientLabReportForm);
        formData.append('diagnosisId', selectedRequestId);
        formData.append('diagnosisReport', formattedContent);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();
    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(patientLabReportForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create a triage record
                const response = await API.reports.create(URLEncodedData, true);
    
                // Check if the request was successful
                if (response.status === 'success') {
                    // Alert user
                    // alert('Patient record created successfully!');
                    // TODO: Create a banner to show triage saved
    
                    // Reset the form
                    patientLabReportForm.reset();
    
                    // Remove form
                    patientLabReportForm.parentElement.parentElement.classList.remove("inview");
    
                    // Reload the requests table
                    loadSinglePatientVisitLabRequests(selectedVisitId);
    
                } else {
                    alert('Failed to create allergy record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the allergy record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            patientLabReportForm.reset();
        });
    });
}




