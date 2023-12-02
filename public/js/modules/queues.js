import { UI } from "../core/ui.js";
import { UTILS } from "../core/utils.js";
import { API } from "../core/api.js";
import {SSE} from '../core/sse.js';

document.addEventListener("DOMContentLoaded", () => {
    // Init UI
    UI.init();

    // Load all patients on queue
    loadAllPatientsOnQueue();

    // Handle create triage
    handleCreateTriageForm();

    // Handle create allergy
    handleCreateAllergyForm();

    // Render lab tests in dropdown
    populateLabTestsDropdown();

    // Handle CBC request form
    handleLabRequest();


    // Render medicines in dropdown
    populateMedicinesDropdown();

    // Handle medical prescription
    handleMedicinePrescription();

    // Handle create patient eye service request
    handlePatientEyeServiceRequestForm();

    // Handle create patient dental service request
    handlePatientDentalServiceRequestForm();

    // Handle create patient cardiology service request
    handlePatientCardiologyServiceRequestForm();

    // Handle create patient radiology service request
    handlePatientRadiologyServiceRequestForm();


    // SSE
    SSE.initializeSSE(`${window.location.origin}/page/sse`);

    // Register handlers for specific message types
    // SSE.registerMessageHandler('Reload', reloadHandler);
    // SSE.registerMessageHandler('OtherMessageType', otherMessageHandler);


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
                    <td style="border: 1px solid #ddd;">
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
                    displaySelectedPatientBills("ongoing-services-02");
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
                    <td style="border: 1px solid #ddd;">
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
            // Check
            // Lab Test
            if(data.requestType.toLowerCase() === "test"){
                // Edit Button
                // Common to all test requests
                const editRequestCta = row.cells[4].querySelectorAll("button")[0];
                editRequestCta.style.cursor = "pointer";
                editRequestCta.classList.add("modal-trigger");
                editRequestCta.dataset.modal = "edit-patient-diagnosis-modal";

                UTILS.triggerModal(editRequestCta, "modal", () => {
                    // Populate the form with the rowData
                    populateFormWithData(
                        "edit-patient-diagnosis-modal",
                        JSON.stringify(data),
                        [
                            "requestName",
                            "requestFees"
                        ]
                    );
                });

                // Check test
                // Complete Blood Count
                if(data.requestName === "Complete Blood Count Test"){
                    const viewReportCta = row.cells[4].querySelectorAll("button")[1];
                    viewReportCta.style.cursor = "pointer";
                    viewReportCta.classList.add("modal-trigger");
                    viewReportCta.dataset.modal = "complete-blood-count-lab-report-modal";

                    UTILS.triggerModal(viewReportCta, "modal", async () => {
                        document.querySelector("#complete-blood-count-lab-report-form").dataset.requestId = data.requestId;

                        // Populate the form with the server data
                        generateLabReportForCompleteBloodCountTest("complete-blood-count-lab-report-form", data.requestId);

                        // Get patient id from visit id
                        const patient = await API.patients.fetchByVisitId(selectedVisitId);
                        const patientData = patient.data;

                        // Trigger print lab report
                        printLabReportForCompleteBloodCountTest(patientData);
                        
                    });
                }

                // Check test
                // Urinalysis
                if(data.requestName === "Urinalysis Test") {
                    const workOnReportCta = row.cells[4].querySelectorAll("button")[1];
                    workOnReportCta.style.cursor = "pointer";
                    workOnReportCta.classList.add("modal-trigger");
                    workOnReportCta.dataset.modal = "urinalysis-report-modal";

                    UTILS.triggerModal(workOnReportCta, "modal", async () => {
                        document.querySelector("#urinalysis-report-form").dataset.requestId = data.requestId;

                        // Populate the form with the server data
                        generateLabReportForUrinalysisTest("urinalysis-report-form", data.requestId);

                        // Get patient id from visit id
                        const patient = await API.patients.fetchByVisitId(selectedVisitId);
                        const patientData = patient.data;

                        // Trigger print lab report
                        printLabReportForUrinalysisTest(patientData);
                        
                    });
                }
            }

            // Check
            // Service
            if(data.requestType.toLowerCase() === "service"){

                // Eye service
                if(data.requestName.toLowerCase() === "eye service"){
                    // Edit Button
                    const editRequestCta = row.cells[4].querySelectorAll("button")[0];
                    editRequestCta.style.cursor = "pointer";
                    editRequestCta.classList.add("modal-trigger");
                    editRequestCta.dataset.modal = "edit-patient-eye-service-request-modal";


                    UTILS.triggerModal(editRequestCta, "modal", () => {
                        // Populate the form with the data
                        populateFormWithData(
                            "edit-patient-eye-service-request-modal",
                            JSON.stringify(data),
                            [
                                "targetEye",
                                "diagnosis",
                                "serviceFee",
                                "observationNotes",
                                "descriptionNotes"
                            ]
                        );
                    });
                }

                // Dental service
                if(data.requestName.toLowerCase() === "dental service"){
                    // Edit Button
                    const editRequestCta = row.cells[4].querySelectorAll("button")[0];
                    editRequestCta.style.cursor = "pointer";
                    editRequestCta.classList.add("modal-trigger");
                    editRequestCta.dataset.modal = "edit-patient-dental-service-request-modal";


                    UTILS.triggerModal(editRequestCta, "modal", () => {
                        // Populate the form with the data
                        populateFormWithData(
                            "edit-patient-dental-service-request-modal",
                            JSON.stringify(data),
                            [
                                "toothType",
                                "diagnosis",
                                "procedure",
                                "serviceFee"
                            ]
                        );
                    });
                }

                // Cardiology service
                if(data.requestName.toLowerCase() === "cardiology service"){
                    // Edit Button
                    const editRequestCta = row.cells[4].querySelectorAll("button")[0];
                    editRequestCta.style.cursor = "pointer";
                    editRequestCta.classList.add("modal-trigger");
                    editRequestCta.dataset.modal = "edit-patient-cardiology-service-request-modal";


                    UTILS.triggerModal(editRequestCta, "modal", () => {
                        // Populate the form with the data
                        populateFormWithData(
                            "edit-patient-cardiology-service-request-modal",
                            JSON.stringify(data),
                            [
                                "referralReason",
                                "currentMedication",
                                "observationNotes",
                                "serviceFee"
                            ]
                        );
                    });
                }
                
                
                // Radiology service
                if(data.requestName.toLowerCase() === "radiology service"){
                    // Edit Button
                    const editRequestCta = row.cells[4].querySelectorAll("button")[0];
                    editRequestCta.style.cursor = "pointer";
                    editRequestCta.classList.add("modal-trigger");
                    editRequestCta.dataset.modal = "edit-patient-radiology-service-request-modal";


                    UTILS.triggerModal(editRequestCta, "modal", () => {
                        // Populate the form with the data
                        populateFormWithData(
                            "edit-patient-radiology-service-request-modal",
                            JSON.stringify(data),
                            [
                                "referralReason",
                                "currentMedication",
                                "observationNotes",
                                "serviceFee"
                            ]
                        );
                    });
                }

            }

            // Check
            // Allery
            if(data.requestType.toLowerCase() === "allergy"){
                // Edit Button
                const editAlergiesCta = row.cells[4].querySelectorAll("button")[0];
                editAlergiesCta.style.cursor = "pointer";
                editAlergiesCta.classList.add("modal-trigger");
                editAlergiesCta.dataset.modal = "edit-patient-allergies-data-modal";

                UTILS.triggerModal(editAlergiesCta, "modal", () => {
                    // Populate the form with the rowData
                    populateFormWithData(
                        "edit-patient-allergies-data-modal",
                        JSON.stringify(data),
                        [
                            "allergies"
                        ]
                    );

                    // Callback to handle edit allergies form
                    handleEditAllergyForm(data.visitId, data.requestId);
                });
            }


            // Check
            // Triage
            if(data.requestType.toLowerCase() === "triage"){
                // Edit Button
                const editRequestCta = row.cells[4].querySelectorAll("button")[0];
                editRequestCta.style.cursor = "pointer";
                editRequestCta.classList.add("modal-trigger");
                editRequestCta.dataset.modal = "edit-patient-triage-data-modal";


                UTILS.triggerModal(editRequestCta, "modal", () => {
                    // Populate the form with the data
                    populateFormWithData(
                        "edit-patient-triage-data-modal",
                        JSON.stringify(data),
                        [
                            "bloodPressure",
                            "heartRate",
                            "respiratoryRate",
                            "signsAndSymptoms",
                            "injuryDetails"
                        ]
                    );
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
                    return '<span>' + data.requestName + '</span>';
                },
            },
            {
                targets: 2,
                render: function(data, type, row, meta) {
                    const originalDate = data.requestCreatedAt;
                    const dateObj = new Date(originalDate);
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    return '<span>' + formattedDate + '</span>';
                }
            },
            {
                targets: 3,
                render: function(data, type, row, meta) {
                    const status = data.requestStatus.toLowerCase();
                    let backgroundColor;

                    if (status === 'pending') {
                        backgroundColor = 'grey';
                    } else if (status === 'complete') {
                        backgroundColor = 'yellowgreen';
                    } else {
                        backgroundColor = 'orange';
                    }

                    return '<span style="font-size: 10px;display: block;inline-size: 50%;border-radius:6px;padding: .4rem .6rem;color: #fff;background-color: ' + backgroundColor + ';">' + status.toUpperCase() + '</span>';
                }
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    const buttonBackgroundColor = data.requestStatus.toLowerCase() === "pending" ? "#8e8d8d" : "yellowgreen";
                    const isDisabled = data.requestStatus.toLowerCase() === "pending";

                    return `
                        <td style="border: 1px solid #ddd;">
                            <button class="btn view-request" style="background-color: #8e8d8d;padding-inline: .6rem;border-radius: 0;font-size: 12px;">Edit Request  <i class="ti-arrow-right"></i> </button>
                            <button ${isDisabled ? "disabled" : ""} class="btn view-results" style="background-color: ${buttonBackgroundColor};padding-inline: .6rem;border-radius: 0;font-size: 12px;${isDisabled ? "cursor: not-allowed;" : ""}">View Report  <i style="${isDisabled ? "opacity: 0.5;" : ""}" class="ti-arrow-right"></i> </button>
                        </td>
                    `;
                },


            },
            {
                targets: 5,
                render: function(data, type, row, meta) {
                    const originalDate = data.requestCreatedAt;
                    const dateObj = new Date(originalDate);
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    return '<span>' + formattedDate + '</span>';
                }
            }
        ]  
    });

    // This causes double (re)renders for the table
    // TODO: client that triggers the action
    // should not re-render
    SSE.registerMessageHandler('Reload', () => {
        // Reload the table
        loadSinglePatientVisitHistory(selectedVisitId);
    });

}

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
        gender.textContent = selectedPatient.gender.charAt(0).toUpperCase() + selectedPatient.gender.slice(1).toLowerCase();
        age.textContent = new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear();
    }

    // Render other UI section
    callback(patientId);
}

// Function to display diagnoses bills
async function displaySelectedPatientBills(divId) {
    // Get Id of selected visit
    const selectedVisitId = UTILS.getSelectedVisitId();

    // Fetch and display the bills of the selected visit
    const response = await API.bills.fetch(selectedVisitId);
    const selectedBills = await response.data;

    // Populate the patient details section with the fetched data
    const billItems = selectedBills;
    if (billItems) {
        const billContainer = document.querySelector(`#${divId}`);

        // Clear the existing items in the container
        while (billContainer.firstChild) {
            billContainer.removeChild(billContainer.firstChild);
        }

        billItems.forEach((billItem, index) => {
            // Create a template for each bill item
            const template = `
            <div class="service ${billItem.paymentStatus === "paid" ? 'paid' : 'unpaid'}">
                <div class="service-content flex">
                    <h3>${billItem.testName} (UGX ${billItem.testFees})</h3>
                    ${billItem.paymentStatus === "paid" ? '<img src="/assets/svg/check.png" alt="remove service icon">' : ''}
                </div>
            </div>
            `;
            
            // Temporary container element to hold the template
            const tempContainer = document.createElement("div");
            tempContainer.innerHTML = template;

            // Trigger receive services payment modal
            const serviceElement = tempContainer.firstElementChild;
            serviceElement.addEventListener("click", (event) => displaySelectedPatientBillsPaymentModal(event));

            // Append the template to the billContainer
            billContainer.appendChild(serviceElement);
        });

        // const ongoingServices02Container = document.querySelector("#ongoing-services-02");
        // const containerHeight = ongoingServices02Container.offsetHeight;
        // const contentHeight = ongoingServices02Container.scrollHeight;

        // if(parseInt(contentHeight) > parseInt(containerHeight)) {
        //     ongoingServices02Container.style.overflow = 'hidden';
        // }

    }
}

// Display receive services payment modal
function displaySelectedPatientBillsPaymentModal(event) {
    const trigger = document.querySelector("#ongoing-services-02");
    
    UTILS.triggerModal(trigger, "modal", () => {
        const tableBody = document.querySelector('.services-payment-table-body');
        const selectAllCheckbox = document.querySelector('#select-all');
        let serviceCheckboxes = document.querySelectorAll('.service-checkbox');
        const totalElement = document.querySelector('.total-value');

        (async () => {
            const selectedVisitId = UTILS.getSelectedVisitId();

            // Fetch the data from the API
            const response = await API.bills.fetchByStatusUnpaid(selectedVisitId);
            const data = await response.data;

            // Process the data and create HTML for each row
            const rows = data.map(item => {
                return `
                    <tr>
                        <td><input type="checkbox" class="service-checkbox" data-id="${item.requestId}"></td>
                        <td>${item.testName}</td>
                        <td>${item.testFees}</td>
                    </tr>
                `;
            });

            // Add the rows to the table body
            tableBody.innerHTML = rows.join('');

            // Update the service checkboxes
            serviceCheckboxes = document.querySelectorAll('.service-checkbox');

            // Update the select all checkbox event listener
            selectAllCheckbox.addEventListener('click', () => {
                if (selectAllCheckbox.checked) {
                    serviceCheckboxes.forEach(checkbox => checkbox.checked = true);
                } else {
                    serviceCheckboxes.forEach(checkbox => checkbox.checked = false);
                }

                updateTotalFeesForSelectedLabTests();
            });

            // Update the individual service checkbox event listeners
            serviceCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('click', updateTotalFeesForSelectedLabTests);
            });

            // Update the initial total
            updateTotalFeesForSelectedLabTests();

            // Pay
            const updateServicesPaymentStatusBtn = document.querySelector("#update-services-payment-status-btn");
            updateServicesPaymentStatusBtn.addEventListener("click", async (event) => {
                event.preventDefault();
                const checkedCheckboxes = document.querySelectorAll('.service-checkbox:checked');

                const updatePaymentStatusPromises = [];

                for (const checkbox of checkedCheckboxes) {
                    const requestId = checkbox.dataset.id;
                    updatePaymentStatusPromises.push(API.requests.updatePaymentStatus(requestId, "paid"));
                }

                try {
                    const responses = await Promise.all(updatePaymentStatusPromises);

                    // Extract the data from each response
                    const data = responses.map(response => response.data);

                    // Remove modal
                    document.querySelector("#services-payment-modal").classList.remove("inview");

                    // Fetch the bills
                    displaySelectedPatientBills("ongoing-services-02");
                } catch (error) {
                    console.error('Error updating payment status:', error);
                }

            });
        })();

        function updateTotalFeesForSelectedLabTests() {
            let total = 0;

            serviceCheckboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    // Assuming `item.testFees` represents the price of the service
                    const price = parseInt(checkbox.parentNode.parentNode.querySelector('td:nth-child(3)').textContent);
                    total += price;
                }
            });

            totalElement.textContent = `${total}`;
        }
    });
}

// Handle triage create form
async function handleCreateTriageForm() {
    const patientTriageForm = document.querySelector('#create-patient-triage-form');
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
                const response = await API.triages.create(URLEncodedData, true);
    
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
    const patientAllergyForm = document.querySelector('#create-patient-allergy-form');
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
                const response = await API.allergies.create(URLEncodedData, true);
    
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

// Handle allergy edit form
// @Update using the instance ID not visit ID
// @applies to all similar entities/services
async function handleEditAllergyForm(visitId, allergyId) {
    const editPatientAllergyForm = document.querySelector('#edit-patient-allergy-form');
    editPatientAllergyForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Collect form data
        const formData = new FormData(editPatientAllergyForm);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();

        // Display a confirmation dialog
        UTILS.showConfirmationModal(editPatientAllergyForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to update a triage record
                const response = await API.allergies.update(allergyId, URLEncodedData, true);

                // Check if the request was successful
                if (response.status === 'success') {
    
                    // Reset the form
                    editPatientAllergyForm.reset();
    
                    // Remove form
                    editPatientAllergyForm.parentElement.parentElement.classList.remove("inview");
    
                    // Reload the requests table
                    loadSinglePatientVisitHistory(visitId);
    
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
            editPatientAllergyForm.reset();
        });
    });
}

// Handle create patient eye service request form
async function handlePatientEyeServiceRequestForm() {
    const patientEyeServiceRequestForm = document.querySelector('#create-patient-eye-service-request-form');
    patientEyeServiceRequestForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Get Id of selected visit
        const selectedVisitId = UTILS.getSelectedVisitId();
        if (! selectedVisitId) return;
    
        // Collect form data
        const formData = new FormData(patientEyeServiceRequestForm);
        formData.append('visitId', selectedVisitId);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();
    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(patientEyeServiceRequestForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create an eye service request record
                const response = await API.services.forEye.requests.create(URLEncodedData, true);
    
                // Check if the request was successful
                if (response.status === 'success') {
    
                    // Reset the form
                    patientEyeServiceRequestForm.reset();
    
                    // Remove form
                    patientEyeServiceRequestForm.parentElement.parentElement.classList.remove("inview");
    
                    // Reload the requests table
                    loadSinglePatientVisitHistory(selectedVisitId);
    
                } else {
                    alert('Failed to create eye record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the eye record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            patientEyeServiceRequestForm.reset();
        });
    });
}

// Handle create patient dental service request form
async function handlePatientDentalServiceRequestForm() {
    const patientDentalServiceRequestForm = document.querySelector('#create-patient-dental-service-request-form');
    patientDentalServiceRequestForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Get Id of selected visit
        const selectedVisitId = UTILS.getSelectedVisitId();
        if (! selectedVisitId) return;
    
        // Collect form data
        const formData = new FormData(patientDentalServiceRequestForm);
        formData.append('visitId', selectedVisitId);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();
    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(patientDentalServiceRequestForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create a dental service request record
                const response = await API.services.forDental.requests.create(URLEncodedData, true);
    
                // Check if the request was successful
                if (response.status === 'success') {
    
                    // Reset the form
                    patientDentalServiceRequestForm.reset();
    
                    // Remove form
                    patientDentalServiceRequestForm.parentElement.parentElement.classList.remove("inview");
    
                    // Reload the requests table
                    loadSinglePatientVisitHistory(selectedVisitId);
    
                } else {
                    alert('Failed to create dental record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the dental record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            patientDentalServiceRequestForm.reset();
        });
    });
}

// Handle create patient cardiology service request form
async function handlePatientCardiologyServiceRequestForm() {
    const patientCardiologyServiceRequestForm = document.querySelector('#create-patient-cardiology-service-request-form');
    patientCardiologyServiceRequestForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Get Id of selected visit
        const selectedVisitId = UTILS.getSelectedVisitId();
        if (! selectedVisitId) return;
    
        // Collect form data
        const formData = new FormData(patientCardiologyServiceRequestForm);
        formData.append('visitId', selectedVisitId);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();
    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(patientCardiologyServiceRequestForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create a cardiology service request record
                const response = await API.services.forCardiology.requests.create(URLEncodedData, true);
    
                // Check if the request was successful
                if (response.status === 'success') {
    
                    // Reset the form
                    patientCardiologyServiceRequestForm.reset();
    
                    // Remove form
                    patientCardiologyServiceRequestForm.parentElement.parentElement.classList.remove("inview");
    
                    // Reload the requests table
                    loadSinglePatientVisitHistory(selectedVisitId);
    
                } else {
                    alert('Failed to create cardiology record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the cardiology record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            patientCardiologyServiceRequestForm.reset();
        });
    });
}

// Handle create patient radiology service request form
async function handlePatientRadiologyServiceRequestForm() {
    const patientRadiologyServiceRequestForm = document.querySelector('#create-patient-radiology-service-request-form');
    patientRadiologyServiceRequestForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Get Id of selected visit
        const selectedVisitId = UTILS.getSelectedVisitId();
        if (! selectedVisitId) return;
    
        // Collect form data
        const formData = new FormData(patientRadiologyServiceRequestForm);
        formData.append('visitId', selectedVisitId);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();
    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(patientRadiologyServiceRequestForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create a radiology service request record
                const response = await API.services.forRadiology.requests.create(URLEncodedData, true);
    
                // Check if the request was successful
                if (response.status === 'success') {
    
                    // Reset the form
                    patientRadiologyServiceRequestForm.reset();
    
                    // Remove form
                    patientRadiologyServiceRequestForm.parentElement.parentElement.classList.remove("inview");
    
                    // Reload the requests table
                    loadSinglePatientVisitHistory(selectedVisitId);

                    // SSE

                } else {
                    alert('Failed to create radiology record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the radiology record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            patientRadiologyServiceRequestForm.reset();
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

// Handle lab request create form
async function handleLabRequest() {
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
            const testId = selectedTestRows[i].dataset.id;
            const fees = parseFloat(selectedTestRows[i].cells[1].textContent.substring(3));
            const clinicalNotes = selectedTestRows[i].dataset.notes;
            formValuesArrayOfObjects.push({ testId, clinicalNotes, testFees: fees, visitId: selectedVisitId });
        }

        // Display a confirmation dialog
        UTILS.showConfirmationModal(patientDiagnosisForm, 'Are you sure you want to save these diagnostic tests?', async () => {
            try {
                // Make an API POST request to create diagnostic records
                const response = await API.requests.create(formValuesArrayOfObjects, false);

                // Check if the request was successful
                if (response.status === 'success') {
    
                    // Reset the form
                    clearSelectedLabTests();
    
                    // Remove form
                    patientDiagnosisForm.parentElement.parentElement.classList.remove("inview");
    
                    // Fetch the bills
                    displaySelectedPatientBills("ongoing-services-02");

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
            clearSelectedLabTests();
        });
    });
}

// Clear selected diagnostic tests from the table
function clearSelectedLabTests() {
    const selectedTestsTable = document.getElementById('selected-tests-table').getElementsByTagName('tbody')[0];
    selectedTestsTable.innerHTML = '';
    updateTotalFeesForSelectedLabTests(); // Update the total fee
}

async function filterLabTestsDropdown() {
    const input = document.querySelector("#lab-tests-dropdown-input");
    const filter = input.value.toUpperCase();
  
    const dropdownList = document.getElementById("lab-tests-dropdown");
    const results = await fetchLabTests();
  
    if (results) {
      dropdownList.innerHTML = '';
  
      results.forEach((test) => {
        const testName = test.testName.toUpperCase();
        if (testName.includes(filter)) {
          const dropdownItem = document.createElement('span');
          dropdownItem.className = 'dropdown-item';
          dropdownItem.setAttribute('data-id', test.testId);
          dropdownItem.setAttribute('data-test', test.testName);
          dropdownItem.setAttribute('data-fee', test.testFees);
          dropdownItem.textContent = test.testName;
          dropdownItem.onclick = function () {
            addLabTestToTable(this);
            input.value = "";
          };
  
          dropdownList.appendChild(dropdownItem);
        }
      });
    }
}
  
function toggleLabTestsDropdown() {
    const dropdown = document.getElementById("lab-tests-dropdown");
    if (dropdown.style.display === "none" || dropdown.style.display === "") {
        dropdown.style.display = "block";
    } else {
        dropdown.style.display = "none";
    }
}

function addLabTestToTable(item) {
    const selectedTestsTable = document.getElementById("selected-tests-table").getElementsByTagName('tbody')[0];
    const row = selectedTestsTable.insertRow();
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);

    row.setAttribute("data-id", item.getAttribute("data-id"));
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
        updateTotalFeesForSelectedLabTests();
    };
    cell3.appendChild(removeButton);
    
    updateTotalFeesForSelectedLabTests();
    document.getElementById("lab-tests-dropdown").style.display = "none";
}

function addLabTestToForm(selectedTest) {
    toggleLabTestsDropdown();

    const testName = selectedTest.getAttribute('data-test');
  
    const formRow = document.createElement('div');
    formRow.className = 'form-section';
  
    const testNameInput = document.createElement('input');
    testNameInput.type = 'text';
    testNameInput.style.marginBlockEnd = '.4rem';
    testNameInput.style.padding = '12px 10px';
    testNameInput.style.border = '1px solid #9dd0ff';
    testNameInput.style.backgroundColor = '#cce6fe';
    testNameInput.style.color = '#1da1f2';
    testNameInput.style.borderRadius = '6px';
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
      addLabTestToTable(selectedTest);
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

    const input = document.querySelector("#lab-tests-dropdown-input");
    const inputContainer = input.parentElement;
    inputContainer.appendChild(formRow);
}

function updateTotalFeesForSelectedLabTests() {
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
async function fetchLabTests() {
    try {
        const response = await API.tests.fetch();
        const data = await response.data.rows;
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Populate the dropdown list
async function populateLabTestsDropdown() {
    const dropdownInput = document.querySelector('#lab-tests-dropdown-input');
    const dropdownList = document.getElementById("lab-tests-dropdown");
    dropdownInput.addEventListener("click", toggleLabTestsDropdown);
    dropdownInput.addEventListener("input", filterLabTestsDropdown);

    const testData = await fetchLabTests();

    if (testData) {
        testData.forEach((test) => {
            const dropdownItem = document.createElement('span');
            dropdownItem.className = 'dropdown-item';
            dropdownItem.setAttribute('data-id', test.testId);
            dropdownItem.setAttribute('data-test', test.testName);
            dropdownItem.setAttribute('data-fee', test.testFees);
            dropdownItem.textContent = test.testName;
            dropdownItem.onclick = function () {
                addLabTestToForm(dropdownItem);
            };

            dropdownList.appendChild(dropdownItem);
        });
    }
}



// Handle medicine prescription create form
async function handleMedicinePrescription() {
    const patientMedicalPrescriptionForm = document.querySelector('#create-patient-medical-prescription-form');
    patientMedicalPrescriptionForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get Id of selected visit
        const selectedVisitId = UTILS.getSelectedVisitId();
        if (! selectedVisitId) return;

        // Check if there are prescriptions on the table
        const selectedMedicinesTable = document.getElementById('selected-medicines-table').getElementsByTagName('tbody')[0];
        if (selectedMedicinesTable.rows.length === 0) {
            alert('Please provide at least one medical prescription.');
            return;
        }

        // Collect selected medicine prescription data from the table
        const selectedMedicinePrescriptionRows = selectedMedicinesTable.rows;
        const formValuesArrayOfObjects = [];

        for (let i = 0; i < selectedMedicinePrescriptionRows.length; i++) {

            const medicineId = JSON.parse(selectedMedicinePrescriptionRows[i].dataset.id);
            const prescription = selectedMedicinePrescriptionRows[i].dataset.prescription;
            let prescriptionObject = JSON.parse(prescription);
            prescriptionObject.medicineId = medicineId;
            prescriptionObject.visitId = selectedVisitId;

            formValuesArrayOfObjects.push(prescriptionObject);
        }

        // Display a confirmation dialog
        UTILS.showConfirmationModal(patientMedicalPrescriptionForm, 'Are you sure you want to save these prescriptions?', async () => {
            try {
                // Make an API POST request to create prescription records
                const response = await API.prescriptions.create(formValuesArrayOfObjects, false);

                // Check if the request was successful
                if (response.status === 'success') {
    
                    // Reset the form
                    clearSelectedMedicines();
    
                    // Remove form
                    patientMedicalPrescriptionForm.parentElement.parentElement.classList.remove("inview");
    
                    // Fetch the bills
                    displaySelectedPatientBills("ongoing-services-02");

                    // Reload the requests table
                    loadSinglePatientVisitHistory(selectedVisitId);

                } else {
                    alert('Failed to create prescriptions. Please check the data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the prescriptions.');
            }
        }, () => {
            // Run when canceled
            // Reset the form (clear selected medicines)
            clearSelectedMedicines();
        });
    });
}

// Clear selected medicines from the table
function clearSelectedMedicines() {
    const selectedMedicinesTable = document.getElementById('selected-medicines-table').getElementsByTagName('tbody')[0];
    selectedMedicinesTable.innerHTML = '';
    
    
    //updateTotalFeesForSelectedLabTests(); // Update the total fee
}

async function filterMedicinesDropdown() {
    const input = document.querySelector("#medicines-dropdown-input");
    const filter = input.value.toUpperCase();
  
    const dropdownList = document.getElementById("medicines-dropdown");
    const results = await fetchMedicines();
  
    if (results) {
      dropdownList.innerHTML = '';
  
      results.forEach((medicine) => {
        const medicineName = medicine.medicineName.toUpperCase();
        if (medicineName.includes(filter)) {
          const dropdownItem = document.createElement('span');
          dropdownItem.className = 'dropdown-item';
          dropdownItem.setAttribute('data-id', medicine.medicineId);
          dropdownItem.setAttribute('data-medicine', medicine.medicineName);
          dropdownItem.setAttribute('data-type', medicine.medicineType);
          dropdownItem.textContent = medicine.medicineName;
          dropdownItem.onclick = function () {
            addMedicineToTable(this);
            input.value = "";
          };
  
          dropdownList.appendChild(dropdownItem);
        }
      });
    }
}
  
function toggleMedicinesDropdown() {
    const dropdown = document.getElementById("medicines-dropdown");
    if (dropdown.style.display === "none" || dropdown.style.display === "") {
        dropdown.style.display = "block";
    } else {
        dropdown.style.display = "none";
    }
}

function addMedicineToTable(item) {
    const selectedMedicinesTable = document.getElementById("selected-medicines-table").getElementsByTagName('tbody')[0];
    const row = selectedMedicinesTable.insertRow();
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);

    const prescriptionObject = JSON.parse(item.getAttribute("data-prescription"));

    row.setAttribute("data-id", item.getAttribute("data-id"));
    row.setAttribute("data-prescription", item.getAttribute("data-prescription"));

    const medicineName = item.getAttribute("data-medicine");
    const medicineNameCell = document.createElement("div");
    medicineNameCell.className = "medicine-name";
    medicineNameCell.textContent = medicineName;

    cell1.appendChild(medicineNameCell);
    cell2.innerHTML = `${prescriptionObject.dosage} x ${prescriptionObject.frequency} for ${prescriptionObject.duration} days`;
    
    const removeButton = document.createElement("span");
    removeButton.innerHTML = "Remove";
    removeButton.className = "remove-button";
    removeButton.onclick = function() {
        row.remove();
    };

    cell3.appendChild(removeButton);
    document.getElementById("medicines-dropdown").style.display = "none";
}

function addMedicineToForm(selectedMedicine) {
    toggleMedicinesDropdown();

    const medicineName = `${selectedMedicine.getAttribute('data-medicine')} (${selectedMedicine.getAttribute('data-dosage')})`;
  
    const formRow = document.createElement('div');
    formRow.className = 'form-section';

    const formRowWrapper = document.createElement('div');
    formRowWrapper.classList.add(...['flex', 'prescription-wrapper']);
    formRowWrapper.style.justifyContent = 'space-between';
  
    const medicineNameInput = document.createElement('input');
    medicineNameInput.type = 'text';
    medicineNameInput.style.marginBlockEnd = '.4rem';
    medicineNameInput.style.padding = '12px 10px';
    medicineNameInput.style.border = '1px solid #9dd0ff';
    medicineNameInput.style.backgroundColor = '#cce6fe';
    medicineNameInput.style.color = '#1da1f2';
    medicineNameInput.style.borderRadius = '6px';
    medicineNameInput.value = medicineName;
    medicineNameInput.readOnly = true;

    const medicinePrescriptionLeft = document.createElement('input');
    medicinePrescriptionLeft.classList.add('prescription-input');
    medicinePrescriptionLeft.placeholder = "Quantity";
    medicinePrescriptionLeft.style.backgroundColor = "#f9f9f9";

    const medicinePrescriptionMiddle = document.createElement('label');
    medicinePrescriptionMiddle.innerHTML = 'X';
    medicinePrescriptionMiddle.style.fontFamily = 'sans-serif';
    medicinePrescriptionMiddle.style.marginInline = '.4rem';
    medicinePrescriptionMiddle.style.paddingInline = '.8rem';

    const medicinePrescriptionRight = document.createElement('input');
    medicinePrescriptionRight.classList.add('prescription-input');
    medicinePrescriptionRight.placeholder = "No. of Times";
    medicinePrescriptionRight.style.backgroundColor = "#f9f9f9";

    const medicinePrescriptionTotalDaysLabel = document.createElement('label');
    medicinePrescriptionTotalDaysLabel.innerHTML = 'For';
    medicinePrescriptionTotalDaysLabel.style.fontFamily = 'sans-serif';
    medicinePrescriptionTotalDaysLabel.style.marginInline = '.4rem';
    medicinePrescriptionTotalDaysLabel.style.paddingInline = '.8rem';

    const medicinePrescriptionTotalDays = document.createElement('input');
    medicinePrescriptionTotalDays.classList.add('prescription-input');
    medicinePrescriptionTotalDays.placeholder = "Total Days";
    medicinePrescriptionTotalDays.style.backgroundColor = "#f9f9f9";

    const addButton = document.createElement('button');
    addButton.textContent = 'Create';
    addButton.style.marginBlockStart = '.4rem';
    addButton.classList.add(...["btn", "yes"]);
    addButton.onclick = function (event) {
      event.preventDefault();
      selectedMedicine.setAttribute('data-prescription', JSON.stringify({dosage: medicinePrescriptionLeft.value, frequency: medicinePrescriptionRight?.value, duration: medicinePrescriptionTotalDays.value}));
      if(medicinePrescriptionLeft.value.trim() !== "" && medicinePrescriptionRight.value.trim() !== "" && medicinePrescriptionTotalDays.value.trim() !== "") {
        addMedicineToTable(selectedMedicine);
        formRow.remove();
      }
    };

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Delete';
    removeButton.style.marginBlockStart = '.4rem';
    removeButton.style.marginInlineEnd = '.6rem';
    removeButton.classList.add(...["btn", "no"]);
    removeButton.onclick = function (event) {
      event.preventDefault();
      formRow.remove();
    };
  
    formRow.appendChild(medicineNameInput);
    formRowWrapper.appendChild(medicinePrescriptionLeft);
    formRowWrapper.appendChild(medicinePrescriptionMiddle);
    formRowWrapper.appendChild(medicinePrescriptionRight);
    formRowWrapper.appendChild(medicinePrescriptionTotalDaysLabel);
    formRowWrapper.appendChild(medicinePrescriptionTotalDays);
    formRow.appendChild(formRowWrapper);
    formRow.appendChild(removeButton);
    formRow.appendChild(addButton);

    const input = document.querySelector("#medicines-dropdown-input");
    const inputContainer = input.parentElement;
    inputContainer.appendChild(formRow);
}



// Fetch medicine data from the API
async function fetchMedicines() {
    try {
        const response = await API.medicines.fetch();
        const data = await response.data.rows;
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Populate the dropdown list
async function populateMedicinesDropdown() {
    const dropdownInput = document.querySelector('#medicines-dropdown-input');
    const dropdownList = document.getElementById("medicines-dropdown");
    dropdownInput.addEventListener("click", toggleMedicinesDropdown);
    dropdownInput.addEventListener("input", filterMedicinesDropdown);

    const medicineData = await fetchMedicines();

    if (medicineData) {
        medicineData.forEach((medicine) => {
            const dropdownItem = document.createElement('span');
            dropdownItem.className = 'dropdown-item';
            dropdownItem.setAttribute('data-id', medicine.medicineId);
            dropdownItem.setAttribute('data-medicine', medicine.medicineName);
            dropdownItem.setAttribute('data-dosage', medicine.dosage);
            dropdownItem.setAttribute('data-type', medicine.medicineType);
            dropdownItem.textContent = `${medicine.medicineName} (${medicine.dosage})`;
            dropdownItem.onclick = function () {
                addMedicineToForm(dropdownItem);
            };

            dropdownList.appendChild(dropdownItem);
        });
    }
}



// Generate CBC lab report
async function generateLabReportForCompleteBloodCountTest(formId, labRequestId) {
    try {
        // Get id of selected visit
        const selectedVisitId = UTILS.getSelectedVisitId();

        // Get patient id from visit id
        const fetchPatientRequest = await API.patients.fetchByVisitId(selectedVisitId);
        const patientData = fetchPatientRequest.data;

        if (fetchPatientRequest.status === 'success') {
            // Make an API POST request to create a triage record
            const fetchCbcResultsRequest = await API.results.completeBloodCount.fetchByRequestId(labRequestId);

            // Sample CBC Test Report
            // Hospital Details
            const hospitalName = "Med Tech Hospital";
            const hospitalAddress = "Rwenzori Street, Kampala";
            const hospitalContact = "Phone: +256 782 615 136";

            // Patient Details
            const patientName = `${patientData.firstName} ${patientData.lastName}`;
            const patientDOB = patientData.dateOfBirth;
            const patientAge = new Date().getFullYear() - new Date(patientData.dateOfBirth).getFullYear();
            const patientGender = patientData.gender.charAt(0).toUpperCase() + patientData.gender.slice(1);

            const {
                comment,
                createdAt,
                erythrocyteSedimentationRate,
                gran,
                granPercentage,
                haemoglobin,
                lymphocyteAbsolute,
                lymphocytePercentage,
                mchc,
                meanCellHaemoglobin,
                meanCellVolume,
                mid,
                midPercentage,
                mpv,
                packedCellVolume,
                pct,
                plateleteCount,
                pwd,
                rdwCv,
                rdwSd,
                redBloodCellCount,
                requestId,
                resultId,
                resultUuid,
                updatedAt,
                whiteBloodCellCount
            } = fetchCbcResultsRequest.data;

            // Report editor
            const editor = document.querySelector("#complete-blood-count-lab-report");

            const reportHTML = `
                <div style="background-color: #ffffff; border-radius: 0; padding-block: 30px;">
                    <div style="display: flex; justify-content: space-between;">
                        <div style="display: flex; align-items: center;">
                        <img src="../../assets/svg/512x512.png" style="inline-size: 60px; block-size: 60px;" />
                        <h2 style="color: #004080; font-weight: 600; margin-left: 20px;">${hospitalName}</h2>
                        </div>
                        <div style="text-align: right;">
                        <p style="color: #666; margin-bottom: 5px;">${hospitalAddress}</p>
                        <p style="color: #666; margin-bottom: 5px;">${hospitalContact}</p>
                        </div>
                    </div>
                    <hr style="border-top: 1px solid #ccc; margin-top: 20px; margin-bottom: 20px;">
                </div>

                <div style="background-color: #ffffff; padding: 15px; border-radius: 0;">
                    <h3 style="color: #004080; font-weight: 600; margin-bottom: 10px;">Patient Information</h3>
                    <ul style="list-style-type: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 5px;"><span style="font-weight: bold;">Patient Name:</span> ${patientName}</li>
                        <li style="margin-bottom: 5px;"><span style="font-weight: bold;">Date of Birth:</span> ${patientDOB}</li>
                        <li style="margin-bottom: 5px;"><span style="font-weight: bold;">Age:</span> ${patientAge}</li>
                        <li style="margin-bottom: 5px;"><span style="font-weight: bold;">Gender:</span> ${patientGender}</li>
                    </ul>
                </div>  
                            
                <div style="background-color: #ffffff; padding: 15px; border-radius: 0;">
                    <h3 style="color: #004080; margin-bottom: 10px;">CBC Test Results</h3>
                    <p style="margin-bottom: 20px;">This report provides a detailed analysis of the Complete Blood Count (CBC) test conducted at ${hospitalName}. The CBC is a crucial diagnostic tool that assesses various components of the blood, offering valuable insights into the patient's hematological health.</p>
                    <br/>

                    <table class="lab-table" style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Test</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Results</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Units</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Ref Range</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="border: 1px solid #ddd;">WHITE BLOOD CELL COUNT</td>
                                <td style="border: 1px solid #ddd;">${whiteBloodCellCount}</td>
                                <td style="border: 1px solid #ddd;">L</td>
                                <td style="border: 1px solid #ddd;">4.0 - 12.0</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">LYMPHOCYTE ABSOLUTE #</td>
                                <td style="border: 1px solid #ddd;">${lymphocyteAbsolute}</td>
                                <td style="border: 1px solid #ddd;">L</td>
                                <td style="border: 1px solid #ddd;">0.8 - 7.0</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">MID #</td>
                                <td style="border: 1px solid #ddd;">${mid}</td>
                                <td style="border: 1px solid #ddd;">L</td>
                                <td style="border: 1px solid #ddd;">0.1 - 1.2</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">GRAN #</td>
                                <td style="border: 1px solid #ddd;">${gran}</td>
                                <td style="border: 1px solid #ddd;">L</td>
                                <td style="border: 1px solid #ddd;">2.0 - 8.0</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">LYMPHOCYTE %</td>
                                <td style="border: 1px solid #ddd;">${lymphocytePercentage}</td>
                                <td style="border: 1px solid #ddd;">%</td>
                                <td style="border: 1px solid #ddd;">20.0 - 60.0</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">MID %</td>
                                <td style="border: 1px solid #ddd;">${midPercentage}</td>
                                <td style="border: 1px solid #ddd;">%</td>
                                <td style="border: 1px solid #ddd;">3.0 - 14.0</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">GRAN %</td>
                                <td style="border: 1px solid #ddd;">${granPercentage}</td>
                                <td style="border: 1px solid #ddd;">%</td>
                                <td style="border: 1px solid #ddd;">50.0 - 70.0</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">HAEMOGLOBIN (HB)</td>
                                <td style="border: 1px solid #ddd;">${haemoglobin}</td>
                                <td style="border: 1px solid #ddd;">g/dL</td>
                                <td style="border: 1px solid #ddd;">11.0 - 19.0</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">RED CELL COUNT</td>
                                <td style="border: 1px solid #ddd;">${redBloodCellCount}</td>
                                <td style="border: 1px solid #ddd;">L</td>
                                <td style="border: 1px solid #ddd;">3.50 - 6.0</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">HEMATOCRIT/PACKED CELL VOL (PCV)</td>
                                <td style="border: 1px solid #ddd;">${packedCellVolume}</td>
                                <td style="border: 1px solid #ddd;">%</td>
                                <td style="border: 1px solid #ddd;">33.0 - 49.0</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">MEAN CELL VOLUME (MCV)</td>
                                <td style="border: 1px solid #ddd;">${meanCellVolume}</td>
                                <td style="border: 1px solid #ddd;">fl</td>
                                <td style="border: 1px solid #ddd;">76.0 - 96.0</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">MEAN CELL HAEMOGLOBIN</td>
                                <td style="border: 1px solid #ddd;">${meanCellHaemoglobin}</td>
                                <td style="border: 1px solid #ddd;">pg</td>
                                <td style="border: 1px solid #ddd;">27.0 - 40.0</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">MCHC</td>
                                <td style="border: 1px solid #ddd;">${mchc}</td>
                                <td style="border: 1px solid #ddd;">g/dL</td>
                                <td style="border: 1px solid #ddd;">31.0 - 38.0</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">RDW-CV</td>
                                <td style="border: 1px solid #ddd;">${rdwCv}</td>
                                <td style="border: 1px solid #ddd;">%</td>
                                <td style="border: 1px solid #ddd;">11.0 - 16.0</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">RDW-SD</td>
                                <td style="border: 1px solid #ddd;">${rdwSd}</td>
                                <td style="border: 1px solid #ddd;">fl</td>
                                <td style="border: 1px solid #ddd;">35.0 - 56.0</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">PLATELETE COUNT</td>
                                <td style="border: 1px solid #ddd;">${plateleteCount}</td>
                                <td style="border: 1px solid #ddd;">L</td>
                                <td style="border: 1px solid #ddd;">150 - 540</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">MPV</td>
                                <td style="border: 1px solid #ddd;">${mpv}</td>
                                <td style="border: 1px solid #ddd;">fl</td>
                                <td style="border: 1px solid #ddd;">6.50 - 12.0</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">PDW</td>
                                <td style="border: 1px solid #ddd;">${pwd}</td>
                                <td style="border: 1px solid #ddd;"></td>
                                <td style="border: 1px solid #ddd;">9.0 - 17.0</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">PCT</td>
                                <td style="border: 1px solid #ddd;">${pct}</td>
                                <td style="border: 1px solid #ddd;">%</td>
                                <td style="border: 1px solid #ddd;">0.108 - 0.282</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">ERYTHROCYTE SEDIMENTATION RATE (ECR)</td>
                                <td style="border: 1px solid #ddd;">${erythrocyteSedimentationRate}</td>
                                <td style="border: 1px solid #ddd;"></td>
                                <td style="border: 1px solid #ddd;"></td>
                            </tr>
                        </tbody>
                    </table>

                    <div>
                        <br/>
                        <p>Interpretation of the CBC results should be conducted in consultation with a healthcare professional. The reference ranges provided in the report are essential for assessing whether the patient's blood parameters fall within the expected values.</p>
                        <br/>
                        <p>Further clinical evaluation and follow-up may be required based on these findings. Please do not hesitate to contact our medical team at ${hospitalContact} for any additional information or to schedule a consultation.</p>
                    </div>
                </div>
            `;

            // Check if the request was successful
            if (fetchCbcResultsRequest.status === 'success') {
                editor.innerHTML = reportHTML;

            } else {
                editor.innerHTML = "";
            }
        } else {
            console.error(error);
            alert('An error occurred while fetching the patient info.');
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred while generating the cbc lab report.');
    }
}

async function printLabReportForCompleteBloodCountTest(patient) {
    // Print lab report
    const printLabReportBtn = document.querySelector("#print-lab-report-btn");
    printLabReportBtn?.addEventListener("click", event => {
        event.preventDefault();
        buildLabReportForCompleteBloodTest("complete-blood-count-lab-report", "CBC Lab Report", patient);
    });
}

function buildLabReportForCompleteBloodTest(editorId, title, patient){
    const patientAge = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
    var editorContent = tinymce.get(editorId).getContent();
    // Create a new window for printing
    var printWindow = window.open('', '', 'width=800,height=600');

    // Write the HTML content to the print window
    printWindow.document.open();
    printWindow.document.write('<html><head><title>'+ title +'</title>');
    printWindow.document.write('</head><body>');

    // Include the patient's details
    // printWindow.document.write('<h2>Patient Details</h2>');
    // printWindow.document.write('<p><strong>Name:</strong> ' + patient.firstName + " " + patient.lastName + '</p>');
    // printWindow.document.write('<p><strong>Age:</strong> ' + patientAge + '</p>');
    // printWindow.document.write('<p><strong>Gender:</strong> ' + patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) + '</p>');

    printWindow.document.write('<div id="editor-container">' + editorContent + '</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // Focus and print the window
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

// Generate Urinalysis lab report
async function generateLabReportForUrinalysisTest(formId, labRequestId) {
    try {
        // Get id of selected visit
        const selectedVisitId = UTILS.getSelectedVisitId();

        // Get patient id from visit id
        const fetchPatientRequest = await API.patients.fetchByVisitId(selectedVisitId);
        const patientData = fetchPatientRequest.data;

        if (fetchPatientRequest.status === 'success') {
            // Make an API POST request to create a triage record
            const fetchUrinalysisResultsRequest = await API.results.urinalysis.fetchByRequestId(labRequestId);

            // Sample CBC Test Report
            // Hospital Details
            const hospitalName = "Med Tech Hospital";
            const hospitalAddress = "Rwenzori Street, Kampala";
            const hospitalContact = "Phone: +256 782 615 136";

            // Patient Details
            const patientName = `${patientData.firstName} ${patientData.lastName}`;
            const patientDOB = patientData.dateOfBirth;
            const patientAge = new Date().getFullYear() - new Date(patientData.dateOfBirth).getFullYear();
            const patientGender = patientData.gender.charAt(0).toUpperCase() + patientData.gender.slice(1);

            const {
                appearance,
                glucose,
                ketone,
                blood,
                ph,
                protein,
                nitrites,
                leucocytes,
                urobilinogen,
                bilirubin,
                specificGravity,
                rbc,
                pusCells,
                epithelialCells,
                cast,
                wbc,
                parasite,
                crystals,
                tVaginalis,
                yeastCells,
                requestId,
                comment,
            } = fetchUrinalysisResultsRequest.data;

            // Report editor
            const editor = document.querySelector("#urinalysis-lab-report");

            const reportHTML = `
                <div style="background-color: #ffffff; border-radius: 0; padding-block: 30px;">
                    <div style="display: flex; justify-content: space-between;">
                        <div style="display: flex; align-items: center;">
                        <img src="../../assets/svg/512x512.png" style="inline-size: 60px; block-size: 60px;" />
                        <h2 style="color: #004080; font-weight: 600; margin-left: 20px;">${hospitalName}</h2>
                        </div>
                        <div style="text-align: right;">
                        <p style="color: #666; margin-bottom: 5px;">${hospitalAddress}</p>
                        <p style="color: #666; margin-bottom: 5px;">${hospitalContact}</p>
                        </div>
                    </div>
                    <hr style="border-top: 1px solid #ccc; margin-top: 20px; margin-bottom: 20px;">
                </div>

                <div style="background-color: #ffffff; padding: 15px; border-radius: 0;">
                    <h3 style="color: #004080; font-weight: 600; margin-bottom: 10px;">Patient Information</h3>
                    <ul style="list-style-type: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 5px;"><span style="font-weight: bold;">Patient Name:</span> ${patientName}</li>
                        <li style="margin-bottom: 5px;"><span style="font-weight: bold;">Date of Birth:</span> ${patientDOB}</li>
                        <li style="margin-bottom: 5px;"><span style="font-weight: bold;">Age:</span> ${patientAge}</li>
                        <li style="margin-bottom: 5px;"><span style="font-weight: bold;">Gender:</span> ${patientGender}</li>
                    </ul>
                </div>  
                            
                <div style="background-color: #ffffff; padding: 15px; border-radius: 0;">
                    <h3 style="color: #004080; margin-bottom: 10px;">CBC Test Results</h3>
                    <p style="margin-bottom: 20px;">This report provides a detailed analysis of the Complete Blood Count (CBC) test conducted at ${hospitalName}. The CBC is a crucial diagnostic tool that assesses various components of the blood, offering valuable insights into the patient's hematological health.</p>
                    <br/>

                    <table class="lab-table" style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <thead>
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Test</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Results</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Units</th>
                                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Ref Range</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colspan="4" style="font-weight: bold;padding-block: 8px;">URINALYSIS (U/A)</td></tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">Appearance</td>
                                <td style="border: 1px solid #ddd;">${appearance}</td>
                                <td style="border: 1px solid #ddd;">Pale Yellow and Clear</td>
                                <td style="border: 1px solid #ddd;">Abnormal</td>
                            </tr>
                            <tr><td colspan="4" style="font-weight: bold;padding-block: 8px;">BIOCHEMISTRY</td></tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">Glucose</td>
                                <td style="border: 1px solid #ddd;">${glucose}</td>
                                <td style="border: 1px solid #ddd;">Nil</td>
                                <td style="border: 1px solid #ddd;">Normal</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">Ketone</td>
                                <td style="border: 1px solid #ddd;">${ketone}</td>
                                <td style="border: 1px solid #ddd;">Nil</td>
                                <td style="border: 1px solid #ddd;">Normal</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">Blood</td>
                                <td style="border: 1px solid #ddd;">${blood}</td>
                                <td style="border: 1px solid #ddd;">Nil</td>
                                <td style="border: 1px solid #ddd;">Normal</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">PH</td>
                                <td style="border: 1px solid #ddd;">${ph}</td>
                                <td style="border: 1px solid #ddd;">4.5 - 8.0</td>
                                <td style="border: 1px solid #ddd;">Normal</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">Protein</td>
                                <td style="border: 1px solid #ddd;">${protein}</td>
                                <td style="border: 1px solid #ddd;">Nil - Trace</td>
                                <td style="border: 1px solid #ddd;">Normal</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">Nitrites</td>
                                <td style="border: 1px solid #ddd;">${nitrites}</td>
                                <td style="border: 1px solid #ddd;">Negative</td>
                                <td style="border: 1px solid #ddd;">Abnormal</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">Leucocytes</td>
                                <td style="border: 1px solid #ddd;">${leucocytes}</td>
                                <td style="border: 1px solid #ddd;">Nil</td>
                                <td style="border: 1px solid #ddd;">Abnormal</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">Urobilinogen</td>
                                <td style="border: 1px solid #ddd;">${urobilinogen}</td>
                                <td style="border: 1px solid #ddd;">0.1 - 1.8 mg/dl</td>
                                <td style="border: 1px solid #ddd;">Normal</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">Biliribin</td>
                                <td style="border: 1px solid #ddd;">${bilirubin}</td>
                                <td style="border: 1px solid #ddd;">Nil</td>
                                <td style="border: 1px solid #ddd;">Normal</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">Specific Gravity</td>
                                <td style="border: 1px solid #ddd;">${specificGravity}</td>
                                <td style="border: 1px solid #ddd;">1.005 - 1.030</td>
                                <td style="border: 1px solid #ddd;">Normal</td>
                            </tr>
                            <tr><td colspan="4" style="font-weight: bold;padding-block: 8px;">MICROSCOPY</td></tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">RBC</td>
                                <td style="border: 1px solid #ddd;">${rbc}</td>
                                <td style="border: 1px solid #ddd;">Nil</td>
                                <td style="border: 1px solid #ddd;">Normal</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">Pus Cells</td>
                                <td style="border: 1px solid #ddd;">${pusCells}</td>
                                <td style="border: 1px solid #ddd;">Nil</td>
                                <td style="border: 1px solid #ddd;">Abnormal</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">Epithelial Cells</td>
                                <td style="border: 1px solid #ddd;">${epithelialCells}</td>
                                <td style="border: 1px solid #ddd;">+</td>
                                <td style="border: 1px solid #ddd;">Abnormal</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">Cast (Type)</td>
                                <td style="border: 1px solid #ddd;">${cast}</td>
                                <td style="border: 1px solid #ddd;">Nil</td>
                                <td style="border: 1px solid #ddd;">Normal</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">WBC</td>
                                <td style="border: 1px solid #ddd;">${wbc}</td>
                                <td style="border: 1px solid #ddd;">Nil</td>
                                <td style="border: 1px solid #ddd;">Normal</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">Parasite</td>
                                <td style="border: 1px solid #ddd;">${parasite}</td>
                                <td style="border: 1px solid #ddd;">Nil</td>
                                <td style="border: 1px solid #ddd;">Normal</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">Crystals</td>
                                <td style="border: 1px solid #ddd;">${crystals}</td>
                                <td style="border: 1px solid #ddd;">Nil</td>
                                <td style="border: 1px solid #ddd;">Normal</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">T.vaginalis</td>
                                <td style="border: 1px solid #ddd;">${tVaginalis}</td>
                                <td style="border: 1px solid #ddd;">Nil</td>
                                <td style="border: 1px solid #ddd;">Normal</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd;">Yeast Cells</td>
                                <td style="border: 1px solid #ddd;">${yeastCells}</td>
                                <td style="border: 1px solid #ddd;">Nil</td>
                                <td style="border: 1px solid #ddd;">Normal</td>
                            </tr>
                        </tbody>
                    </table>

                    <div>
                        <br/>
                        <p>Interpretation of the CBC results should be conducted in consultation with a healthcare professional. The reference ranges provided in the report are essential for assessing whether the patient's blood parameters fall within the expected values.</p>
                        <br/>
                        <p>Further clinical evaluation and follow-up may be required based on these findings. Please do not hesitate to contact our medical team at ${hospitalContact} for any additional information or to schedule a consultation.</p>
                    </div>
                </div>
            `;

            // Check if the request was successful
            if (fetchUrinalysisResultsRequest.status === 'success') {
                editor.innerHTML = reportHTML;

            } else {
                editor.innerHTML = "";
            }
        } else {
            console.error(error);
            alert('An error occurred while fetching the patient info.');
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred while generating the urinalysis lab report.');
    }
}

async function printLabReportForUrinalysisTest(patient) {
    // Print lab report
    const printLabReportBtn = document.querySelector("#print-lab-report-btn");
    printLabReportBtn?.addEventListener("click", event => {
        event.preventDefault();
        buildLabReportForUrinalysisTest("urinalysis-lab-report", "Urinalysis Lab Report", patient);
    });
}

function buildLabReportForUrinalysisTest(editorId, title, patient){
    const patientAge = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
    var editorContent = tinymce.get(editorId).getContent();
    // Create a new window for printing
    var printWindow = window.open('', '', 'width=800,height=600');

    // Write the HTML content to the print window
    printWindow.document.open();
    printWindow.document.write('<html><head><title>'+ title +'</title>');
    printWindow.document.write('</head><body>');

    // Include the patient's details
    // printWindow.document.write('<h2>Patient Details</h2>');
    // printWindow.document.write('<p><strong>Name:</strong> ' + patient.firstName + " " + patient.lastName + '</p>');
    // printWindow.document.write('<p><strong>Age:</strong> ' + patientAge + '</p>');
    // printWindow.document.write('<p><strong>Gender:</strong> ' + patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) + '</p>');

    printWindow.document.write('<div id="editor-container">' + editorContent + '</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // Focus and print the window
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}