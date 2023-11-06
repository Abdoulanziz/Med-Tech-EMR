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
    // renderDiagnosisForm();

    // Render diagnostic tests in dropdown
    populateDropdownList();

    // Handle diagnosis form
    handleCreateDiagnosisForm();

    // Set up tinymce
    setupLabReportTinymce();
    
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
                displaySelectedPatientDetails("patient-info-section_01", rowData, () => {
                    loadSinglePatientVisits(data.patientId);
                    // displaySelectedPatientDiagnosesBills("ongoing-services-01");
                });
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
                displaySelectedPatientDetails("patient-info-section_02", rowDataString, () => {
                    loadSinglePatientVisitHistory(data.visitId);
                    displaySelectedPatientDiagnosesBills("ongoing-services-02");
                });
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
            { data : null }
        ],
        rowCallback: function(row, data, index) {
            const rowData = JSON.stringify(data.dataValues);

            if("triageUuid" in JSON.parse(rowData)){
                const viewRequestCta = row.cells[3].querySelectorAll("button")[0];
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
                const viewAlergiesCta = row.cells[3].querySelectorAll("button")[0];
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
                const viewDiagnosisCta = row.cells[3].querySelectorAll("button")[0];
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


                const viewReportCta = row.cells[3].querySelectorAll("button")[1];
                viewReportCta.style.cursor = "pointer";
                viewReportCta.classList.add("modal-trigger");
                viewReportCta.dataset.modal = "view-patient-lab-report-modal";

                UTILS.triggerModal(viewReportCta, "modal", async () => {
                    // viewReportCta.dataset.diagnosisId = JSON.parse(rowData).diagnosisId;
                    // console.log(JSON.parse(rowData).diagnosisId);

                    document.querySelector("#view-patient-lab-report-form").dataset.diagnosisId = JSON.parse(rowData).diagnosisId;

                    // Populate the form with the server data
                    populateFormWithDataFromServer("view-patient-lab-report-form", JSON.parse(rowData).diagnosisId);

                    // Get patient id from visit id
                    const patient = await API.visits.fetchPatientByVisitId(selectedVisitId);
                    const patientData = patient.data;

                    // Trigger print lab report
                    triggerPrintLabReport(patientData);
                    
                });
            }
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
                    if(data.type === "Diagnosis") {
                        return '<span>' + data.dataValues.testName + '</span>';
                    }else{
                        return '<span>' + data.type + '</span>';
                    }
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
                targets: 4,
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

// Function to display diagnoses bills
async function displaySelectedPatientDiagnosesBills(divId) {
    // Get Id of selected visit
    const selectedVisitId = UTILS.getSelectedVisitId();

    // Fetch and display the bills of the selected visit
    const response = await API.diagnoses.fetchAllBills(selectedVisitId);
    const selectedBills = await response.data;

    // Populate the patient details section with the fetched data
    const billItems = selectedBills.rows;
    if (billItems) {
        const billContainer = document.querySelector(`#${divId}`);

        // Clear the existing items in the container
        while (billContainer.firstChild) {
            billContainer.removeChild(billContainer.firstChild);
        }

        billItems.forEach((billItem, index) => {
            // Create a template for each bill item
            const template = `
            <div class="service ${index === 0 || index === 1 ? 'paid' : 'unpaid'}">
                <div class="service-content flex">
                    <h3>${billItem.testName} (UGX ${billItem.fees})</h3>
                    ${index === 0 || index === 1 ? '<img src="/assets/svg/check.png" alt="remove service icon">' : ''}
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

            // Reset the form
            patientAllergyForm.reset();
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


// Populate form with data from server (pre-fill the form)
async function populateFormWithDataFromServer(formId, diagnosisId) {
    try {
        // Parse the form id
        const form = document.querySelector(`#${formId}`);

        // Make an API POST request to create a triage record
        const response = await API.reports.fetchByDiagnosisId(diagnosisId);

        // Check if the request was successful
        const editor = tinymce.get("lab-report");
        if (response.status === 'success') {
            // Alert user
            // alert('Patient record fetched successfully!');
            // TODO: Create a banner to show data fetched

            editor.setContent(response.data.diagnosisReport);

        } else {
            // alert('Failed to fetch diagnosis report.');
            editor.setContent("");
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred while fetching the diagnosis report.');
    }
}


// // Set up diagnosis with dynamic test items and total fees calculation
// function renderDiagnosisForm() {
//     const form = document.getElementById("create-patient-diagnosis-form");
//     const formBody = form.querySelector("#create-patient-diagnosis-form-body");
//     const totalFeesDisplay = formBody.querySelector(".total-fees");

//     function addTestItem() {
//         const testItem = document.createElement("div");
//         testItem.classList.add("form-section");
//         testItem.innerHTML = `
//             <label for="testName">Diagnosis Test</label>
//             <input type="text" name="testName[]">
//             <label for="fees">Fees ($)</label>
//             <input type="number" name="fees[]">
//             <button type="button" class="btn remove-test"> <i class="ti-trash"></i> Remove</button>
//         `;

//         formBody.insertBefore(testItem, formBody.lastElementChild);

//         const removeTestButton = testItem.querySelector(".remove-test");
//         removeTestButton.addEventListener("click", () => {
//             formBody.removeChild(testItem);
//             recalculateTotalFees();
//         });
//     }

//     function recalculateTotalFees() {
//         const feeInputs = Array.from(formBody.querySelectorAll("input[name='fees[]']"));
//         const totalFees = feeInputs.reduce((total, input) => {
//             const fee = parseFloat(input.value) || 0;
//             return total + fee;
//         }, 0).toFixed(2);
//         totalFeesDisplay.textContent = `Total Fees: $${totalFees}`;
//     }

//     const addTestButton = form.querySelector("#addTest");
//     addTestButton.addEventListener("click", addTestItem);
//     formBody.addEventListener("input", recalculateTotalFees);
// }


// function getDiagnosisFormValues() {
//     const form = document.getElementById("create-patient-diagnosis-form");
//     const testNames = form.querySelectorAll("input[name='testName[]']");
//     const testFees = form.querySelectorAll("input[name='fees[]']");

//     const values = [];

//     for (let i = 0; i < testNames.length; i++) {
//         const testName = testNames[i].value;
//         const fees = parseFloat(testFees[i].value) || 0;
//         values.push({ testName, fees });
//     }

//     return values;
// }


// // Handle diagnosis create form
// async function handleCreateDiagnosisForm() {
//     const patientDiagnosisForm = document.querySelector('#create-patient-diagnosis-form');
//     patientDiagnosisForm.addEventListener('submit', (event) => {
//         event.preventDefault();

//         // Get Id of selected visit
//         const selectedVisitId = UTILS.getSelectedVisitId();
//         if (! selectedVisitId) return;
    
//         // // Collect form data
//         let formValuesArrayOfObjects = getDiagnosisFormValues();
//         formValuesArrayOfObjects = formValuesArrayOfObjects.map(obj => {
//             obj.visitId = selectedVisitId;
//             return obj;
//         });

//         // Display a confirmation dialog
//         UTILS.showConfirmationModal(patientDiagnosisForm, "Are you sure you want to save this record?", async () => {
//             try {
//                 // Make an API POST request to create a triage record
//                 const response = await API.diagnoses.create(formValuesArrayOfObjects, false);
    
//                 // Check if the request was successful
//                 if (response.status === 'success') {
//                     // Alert user
//                     // alert('Patient record created successfully!');
//                     // TODO: Create a banner to show triage saved
    
//                     // Reset the form
//                     patientDiagnosisForm.reset();
    
//                     // Remove form
//                     patientDiagnosisForm.parentElement.parentElement.classList.remove("inview");
    
//                     // Fetch the bills
//                     displaySelectedPatientDiagnosesBills("ongoing-services-02");

//                     // Reload the requests table
//                     loadSinglePatientVisitHistory(selectedVisitId);

    
//                 } else {
//                     alert('Failed to create diagnoses records. Please check the form data.');
//                 }
//             } catch (error) {
//                 console.error(error);
//                 alert('An error occurred while creating the diagnoses records.');
//             }
//         }, () => {
//             // TODO: Run when cancelled

//             // Reset the form
//             patientDiagnosisForm.reset();
//         });

//     });
// }


// Handle diagnosis create form
async function handleCreateDiagnosisForm() {
    const patientDiagnosisForm = document.querySelector('#create-patient-diagnosis-form');
    patientDiagnosisForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get Id of selected visit
        const selectedVisitId = UTILS.getSelectedVisitId();
        if (! selectedVisitId) return;

        // Check if there are selected diagnostic tests
        const selectedTestsTable = document.getElementById('selected-tests-table').getElementsByTagName('tbody')[0];
        if (selectedTestsTable.rows.length === 0) {
            alert('Please select at least one diagnostic test.');
            return;
        }

        // Collect selected test data from the table
        const selectedTestRows = selectedTestsTable.rows;
        const formValuesArrayOfObjects = [];

        for (let i = 0; i < selectedTestRows.length; i++) {
            const testName = selectedTestRows[i].cells[0].textContent;
            const fee = parseFloat(selectedTestRows[i].cells[1].textContent.substring(3));
            const clinicalNotes = selectedTestRows[i].dataset.notes;

            console.log(selectedTestRows[i])
            formValuesArrayOfObjects.push({ testName, clinicalNotes, fees: fee, visitId: selectedVisitId });
        }

        // Display a confirmation dialog
        UTILS.showConfirmationModal(patientDiagnosisForm, 'Are you sure you want to save these diagnostic tests?', async () => {
            try {
                // Make an API POST request to create diagnostic records
                const response = await API.diagnoses.create(formValuesArrayOfObjects, false);

                // Check if the request was successful
                if (response.status === 'success') {
                    // Alert user
                    // alert('Test record created successfully!');
                    // TODO: Create a banner to show record saved
    
                    // Reset the form
                    clearSelectedTests();
    
                    // Remove form
                    patientDiagnosisForm.parentElement.parentElement.classList.remove("inview");
    
                    // Fetch the bills
                    displaySelectedPatientDiagnosesBills("ongoing-services-02");

                    // Reload the requests table
                    loadSinglePatientVisitHistory(selectedVisitId);

                } else {
                    alert('Failed to create diagnostic tests. Please check the data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the diagnostic tests.');
            }
        }, () => {
            // Run when canceled
            // Reset the form (clear selected tests)
            clearSelectedTests();
        });
    });
}

// Clear selected diagnostic tests from the table
function clearSelectedTests() {
    const selectedTestsTable = document.getElementById('selected-tests-table').getElementsByTagName('tbody')[0];
    selectedTestsTable.innerHTML = '';
    updateTotal(); // Update the total fee
}

async function filterDropdown() {
    const input = document.querySelector(".dropdown-input");
    const filter = input.value.toUpperCase();
  
    const dropdownList = document.getElementById('dropdownList');
    const results = await fetchTestData();
  
    if (results) {
      dropdownList.innerHTML = '';
  
      results.forEach((test) => {
        const testName = test.testName.toUpperCase();
        if (testName.includes(filter)) {
          const dropdownItem = document.createElement('span');
          dropdownItem.className = 'dropdown-item';
          dropdownItem.setAttribute('data-test', test.testName);
          dropdownItem.setAttribute('data-fee', test.testFees);
          dropdownItem.textContent = test.testName;
          dropdownItem.onclick = function () {
            addItemToTable(this);
            input.value = "";
          };
  
          dropdownList.appendChild(dropdownItem);
        }
      });
    }
}
  
function toggleDropdown() {
    const dropdown = document.getElementById("dropdownList");
    if (dropdown.style.display === "none" || dropdown.style.display === "") {
        dropdown.style.display = "block";
    } else {
        dropdown.style.display = "none";
    }
}

function addItemToTable(item) {
    const selectedTestsTable = document.getElementById("selected-tests-table").getElementsByTagName('tbody')[0];
    const row = selectedTestsTable.insertRow();
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);

    row.setAttribute("data-notes", item.getAttribute("data-notes"));
    
    const testName = item.getAttribute("data-test");
    const testNameCell = document.createElement("div");
    testNameCell.className = "test-name";
    testNameCell.textContent = testName;

    cell1.appendChild(testNameCell);
    cell2.innerHTML = "UGX " + item.getAttribute("data-fee");
    
    const removeButton = document.createElement("span");
    removeButton.innerHTML = "Remove";
    removeButton.className = "remove-button";
    removeButton.onclick = function() {
        row.remove();
        updateTotal();
    };
    cell3.appendChild(removeButton);
    
    updateTotal();
    document.getElementById("dropdownList").style.display = "none";
}

function addItemToForm(selectedTest) {
    toggleDropdown();

    const testName = selectedTest.getAttribute('data-test');
  
    const formRow = document.createElement('div');
    formRow.className = 'form-section';
  
    const testNameInput = document.createElement('input');
    testNameInput.type = 'text';
    testNameInput.style.marginBlock = '.2rem';
    testNameInput.style.backgroundColor = 'yellowgreen';
    testNameInput.style.color = '#fff';
    testNameInput.value = testName;
    testNameInput.readOnly = true;
  
    const testClinicalNotesInput = document.createElement('textarea');
    testClinicalNotesInput.placeholder = 'Enter clinical notes';
    testClinicalNotesInput.style.marginBlock = '.2rem';
    testClinicalNotesInput.style.fontFamily = 'sans-serif';
  
    const addButton = document.createElement('button');
    addButton.textContent = 'Create';
    addButton.classList.add(...["btn", "yes"]);
    addButton.onclick = function () {
      selectedTest.setAttribute('data-notes', testClinicalNotesInput.value);
      addItemToTable(selectedTest);
      formRow.remove();
    };

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Delete';
    removeButton.style.marginInlineEnd = '.6rem';
    removeButton.classList.add(...["btn", "no"]);
    removeButton.onclick = function () {
      formRow.remove();
    };
  
    formRow.appendChild(testNameInput);
    formRow.appendChild(testClinicalNotesInput);
    formRow.appendChild(removeButton);
    formRow.appendChild(addButton);

    const input = document.querySelector(".dropdown-input");
    const inputContainer = input.parentElement;
    inputContainer.appendChild(formRow);
}

function updateTotal() {
    const totalFeeCell = document.querySelector(".total-fee");
    const rows = document.querySelectorAll("#selected-tests-table tbody tr");
    let totalFee = 0;

    rows.forEach(function(row) {
        const fee = parseFloat(row.cells[1].textContent.substring(3));
        totalFee += fee;
    });

    totalFeeCell.textContent = "UGX " + totalFee;
    if (totalFee === 0) {
        document.querySelector(".total-row").style.display = "none";
    } else {
        document.querySelector(".total-row").style.display = "table-row";
    }
}

// Fetch test data from the API
async function fetchTestData() {
    try {
        const response = await API.tests.fetchAll();
        const data = await response.data.rows;
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Populate the dropdown list
async function populateDropdownList() {
    const dropdownInput = document.querySelector('.dropdown-input');
    const dropdownList = document.getElementById('dropdownList');
    dropdownInput.addEventListener("click", toggleDropdown);
    dropdownInput.addEventListener("input", filterDropdown);

    const testData = await fetchTestData();

    if (testData) {
        testData.forEach((test) => {
            const dropdownItem = document.createElement('span');
            dropdownItem.className = 'dropdown-item';
            dropdownItem.setAttribute('data-test', test.testName);
            dropdownItem.setAttribute('data-fee', test.testFees);
            dropdownItem.textContent = test.testName;
            dropdownItem.onclick = function () {
                addItemToForm(dropdownItem);
            };

            dropdownList.appendChild(dropdownItem);
        });
    }
}

function setupLabReportTinymce() {
    tinymce.init({
        selector: "#lab-report",
        width: "100%",
        height: 400,
        setup: function (editor) {
            // TODO: something();
        }
    });
}

async function triggerPrintLabReport(patient) {
    // Print lab report
    const printLabReportBtn = document.querySelector("#print-lab-report-btn");
    printLabReportBtn.addEventListener("click", event => {
        event.preventDefault();
        printReport("lab-report", "Lab Report", patient);
    });
}

function printReport(editorId, title, patient){
    const patientAge = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
    var editorContent = tinymce.get(editorId).getContent();
    // Create a new window for printing
    var printWindow = window.open('', '', 'width=800,height=600');

    // Write the HTML content to the print window
    printWindow.document.open();
    printWindow.document.write('<html><head><title>'+ title +'</title>');
    printWindow.document.write('</head><body>');

    // Include the patient's details
    printWindow.document.write('<h2>Patient Details</h2>');
    printWindow.document.write('<p><strong>Name:</strong> ' + patient.firstName + " " + patient.lastName + '</p>');
    printWindow.document.write('<p><strong>Age:</strong> ' + patientAge + '</p>');
    printWindow.document.write('<p><strong>Gender:</strong> ' + patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) + '</p>');

    printWindow.document.write('<div id="editor-container">' + editorContent + '</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // Focus and print the window
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}





