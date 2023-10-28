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

    // Render diagnosis form
    renderDiagnosisForm();

    // Handle diagnosis form
    handleCreateDiagnosisForm();
    
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
                displaySelectedPatientDetails("patient-info-section_02", rowDataString, () => loadSinglePatientVisitHistory(data.visitId));
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
async function loadSinglePatientVisitHistory(visitId) {
    // Get Id of selected visit
    const selectedVisitId = parseInt(visitId);

    // Persist Id of selected visit
    UTILS.setSelectedVisitId(selectedVisitId);

    let allPatients;
    const apiEndpoint = `${UI.apiBaseURL}/history/${selectedVisitId}`;

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

            if("triageUuid" in JSON.parse(rowData)){
                const viewRequestCta = row.cells[4].querySelectorAll("button")[0];
                viewRequestCta.style.cursor = "pointer";
                viewRequestCta.classList.add("modal-trigger");
                viewRequestCta.dataset.modal = "edit-patient-triage-data-modal";

                UTILS.triggerModal(viewRequestCta, "modal", () => {
                    // Populate the form with the rowData
                    populateFormWithData(
                        "edit-patient-triage-data-modal",
                        rowData,
                        [
                            "bloodPressure",
                            "heartRate",
                            "respiratoryRate",
                            "signsAndSymptoms",
                            "injuryDetails"
                        ]
                    );
                });
            }else if("allergyUuid" in JSON.parse(rowData)){
                const viewAlergiesCta = row.cells[4].querySelectorAll("button")[0];
                viewAlergiesCta.style.cursor = "pointer";
                viewAlergiesCta.classList.add("modal-trigger");
                viewAlergiesCta.dataset.modal = "edit-patient-allergies-data-modal";

                UTILS.triggerModal(viewAlergiesCta, "modal", () => {
                    // Populate the form with the rowData
                    populateFormWithData(
                        "edit-patient-allergies-data-modal",
                        rowData,
                        [
                            "allergies"
                        ]
                    );
                });
            }else if("diagnosisUuid" in JSON.parse(rowData)){
                const viewDiagnosisCta = row.cells[4].querySelectorAll("button")[0];
                viewDiagnosisCta.style.cursor = "pointer";
                viewDiagnosisCta.classList.add("modal-trigger");
                viewDiagnosisCta.dataset.modal = "edit-patient-diagnosis-modal";

                UTILS.triggerModal(viewDiagnosisCta, "modal", () => {
                    // Populate the form with the rowData
                    populateFormWithData(
                        "edit-patient-diagnosis-modal",
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
                        <button class="btn view-request" style="background-color: #8e8d8d;padding-inline: .6rem;border-radius: 0;font-size: 12px;">Edit Request  <i class="ti-arrow-right"></i> </button>
                        <button class="btn view-results" style="background-color: #8e8d8d;padding-inline: .6rem;border-radius: 0;font-size: 12px;">View Results  <i class="ti-arrow-right"></i> </button>
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
                    loadSinglePatientVisitHistory(selectedVisitId);
    
                } else {
                    alert('Failed to create triage record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the triage record.');
            }
        }, () => {
            // TODO: Run when cancelled
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
                    loadSinglePatientVisitHistory(selectedVisitId);
    
                } else {
                    alert('Failed to create allergy record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the allergy record.');
            }
        }, () => {
            // TODO: Run when cancelled
        });
    });
}

// Populate form with data (pre-fill the form)
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


// Set up diagnosis with dynamic test items and total fees calculation
function renderDiagnosisForm() {
    const form = document.getElementById("create-patient-diagnosis-form");
    const formBody = form.querySelector("#create-patient-diagnosis-form-body");
    const totalFeesDisplay = formBody.querySelector(".total-fees");

    function addTestItem() {
        const testItem = document.createElement("div");
        testItem.classList.add("form-section");
        testItem.innerHTML = `
            <label for="testName">Diagnosis Test</label>
            <input type="text" name="testName[]">
            <label for="fees">Fees ($)</label>
            <input type="number" name="fees[]">
            <button type="button" class="btn remove-test"> <i class="ti-trash"></i> Remove</button>
        `;

        formBody.insertBefore(testItem, formBody.lastElementChild);

        const removeTestButton = testItem.querySelector(".remove-test");
        removeTestButton.addEventListener("click", () => {
            formBody.removeChild(testItem);
            recalculateTotalFees();
        });
    }

    function recalculateTotalFees() {
        const feeInputs = Array.from(formBody.querySelectorAll("input[name='fees[]']"));
        const totalFees = feeInputs.reduce((total, input) => {
            const fee = parseFloat(input.value) || 0;
            return total + fee;
        }, 0).toFixed(2);
        totalFeesDisplay.textContent = `Total Fees: $${totalFees}`;
    }

    const addTestButton = form.querySelector("#addTest");
    addTestButton.addEventListener("click", addTestItem);
    formBody.addEventListener("input", recalculateTotalFees);
}


function getDiagnosisFormValues() {
    const form = document.getElementById("create-patient-diagnosis-form");
    const testNames = form.querySelectorAll("input[name='testName[]']");
    const testFees = form.querySelectorAll("input[name='fees[]']");

    const values = [];

    for (let i = 0; i < testNames.length; i++) {
        const testName = testNames[i].value;
        const fees = parseFloat(testFees[i].value) || 0;
        values.push({ testName, fees });
    }

    return values;
}


// Handle diagnosis create form
async function handleCreateDiagnosisForm() {
    const patientDiagnosisForm = document.querySelector('#create-patient-diagnosis-form');
    patientDiagnosisForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Get Id of selected visit
        const selectedVisitId = UTILS.getSelectedVisitId();
        if (! selectedVisitId) return;
    
        // // Collect form data
        let formValuesArrayOfObjects = getDiagnosisFormValues();
        formValuesArrayOfObjects = formValuesArrayOfObjects.map(obj => {
            obj.visitId = selectedVisitId;
            return obj;
        });

        // Display a confirmation dialog
        UTILS.showConfirmationModal(patientDiagnosisForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create a triage record
                const response = await API.diagnoses.create(formValuesArrayOfObjects, false);
    
                // Check if the request was successful
                if (response.status === 'success') {
                    // Alert user
                    // alert('Patient record created successfully!');
                    // TODO: Create a banner to show triage saved
    
                    // Reset the form
                    patientDiagnosisForm.reset();
    
                    // Remove form
                    patientDiagnosisForm.parentElement.parentElement.classList.remove("inview");
    
                    // Reload the requests table
                    loadSinglePatientVisitHistory(selectedVisitId);
    
                } else {
                    alert('Failed to create diagnoses records. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the diagnoses records.');
            }
        }, () => {
            // TODO: Run when cancelled
        });

    });
}





