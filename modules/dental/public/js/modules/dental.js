import { UI } from "../core/ui.js";
import { UTILS } from "../core/utils.js";
import { API } from "../core/api.js";

document.addEventListener("DOMContentLoaded", () => {
    // Init UI
    UI.init();

    // Load all patients on queue
    loadAllPatientsOnQueue();

    // Set up tinymce
    setupOtherLabReportTinymce();
    
});


// Load all patients to queue
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
                    return '<span style="color: #525f7f;">' + data.patientFullName + '</span>';
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
                    const status = data.queueStatus.toLowerCase();
                    let color;

                    if (status === 'completed') {
                        color = 'yellowgreen';
                    } else if(status === 'canceled') {
                        color = 'orange';
                    } else {
                        color = 'grey';
                    }
                    return '<span class="td-status"><span class="td-status-dot" style="background-color: ' + color + ';"></span>'+ data.queueStatus.charAt(0).toUpperCase() + data.queueStatus.slice(1) +'</span>';

                }
            },
            {
                targets: 5,
                render: function(data, type, row, meta) {
                    return '<span style="color: #525f7f;">' + data.doctorFullName + '</span>';
                }
            },
            
            {
                targets: 6,
                render: function (data, type, row, meta) {
                    return `
                    <td>
                        <button class="btn table-btn">View More </button>
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
                    loadSinglePatientVisitLabRequests(data.visitId);
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
                    return '<span style="color: #525f7f;">' + formattedDate + '</span>';
                }
            },
            {
                targets: 3,
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
                targets: 4,
                render: function (data, type, row, meta) {
                    return `
                    <td>
                        <button class="btn table-btn">Work on Patient  <i class="ti-arrow-right"></i> </button>
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
    const apiEndpoint = `${UI.apiBaseURL}/services/dental/requests/${selectedVisitId}`;
    

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
            // Service
            if(data.requestType.toLowerCase() === "service"){

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
                                "serviceFee",
                                "requestStatus"
                            ]
                        );

                        // Callback to handle edit dental form
                        handleEditPatientDentalServiceRequestForm(data.visitId, data.requestId);
                    });
                }

            }
        
            // General for everything - no if check
            const workOnReportCta = row.cells[4].querySelectorAll("button")[1];
            workOnReportCta.style.cursor = "pointer";
            workOnReportCta.classList.add("modal-trigger");
            workOnReportCta.dataset.modal = "other-lab-report-modal";

            UTILS.triggerModal(workOnReportCta, "modal", async () => {
                document.querySelector("#other-lab-report-form").dataset.requestId = data.requestId;

                // Populate the form with the server data
                generateLabReportForOtherTest("other-lab-report-form", data.requestId);

                // Get patient id from visit id
                const patient = await API.patients.fetchByVisitId(selectedVisitId);
                const patientData = patient.data;

                // // Trigger print lab report
                // printLabReportForOtherTest(patientData);
                
            });
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
                    return '<span style="color: #525f7f;">' + formattedDate + '</span>';
                }
            },
            {
                targets: 3,
                render: function(data, type, row, meta) {
                    const status = data.requestStatus.toLowerCase();
                    let color;

                    if (status === 'complete') {
                        color = 'yellowgreen';
                    } else if(status === 'canceled') {
                        color = 'orange';
                    } else {
                        color = 'grey';
                    }
                    return '<span class="td-status"><span class="td-status-dot" style="background-color: ' + color + ';"></span>'+ data.requestStatus.charAt(0).toUpperCase() + data.requestStatus.slice(1) +'</span>';

                }
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    return `
                    <td>
                        <button class="btn table-btn">View Request </button>
                        <button class="btn table-btn">Work on Report  <i class="ti-arrow-right"></i> </button>
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
        const age = div.querySelector("#age");
        const email = div.querySelector("#email");

        patientName.textContent = `${selectedPatient.firstName} ${selectedPatient.lastName}`;
        contactNumber.textContent = selectedPatient.contactNumber;
        dateOfBirth.textContent = selectedPatient.dateOfBirth;
        email.textContent = selectedPatient.emailAddress || "Not provided";
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
        const billContainer = document.querySelector(`#${divId}`).querySelector("ul");

        // Clear the existing items in the container
        while (billContainer.firstChild) {
            billContainer.removeChild(billContainer.firstChild);
        }

        
        // Calculate bill
        let billToDisplay = 0;

        const itemsToCalculateBill = billItems;
        itemsToCalculateBill.forEach((billItem, index) => {
            if(billItem.requestName === "Dental Service") {
                if(billItem.paymentStatus === "unpaid") {
                    billToDisplay += parseInt(billItem.requestFees);
                }else{
                    billToDisplay = billToDisplay;
                }
            }
        });

        // Display only the first three items
        const itemsToDisplay = billItems.slice(0, 3);

        itemsToDisplay.forEach((billItem, index) => {
            if(billItem.requestName === "Dental Service") {
            
                // Create a template for each bill item
                const template = `
                <li class="service ${billItem.paymentStatus === "paid" ? 'paid' : 'unpaid'}">
                    <div class="li-left">
                        <p>${billItem.requestName} (${UTILS.formatAmountWithCommas(billItem.requestFees)})</p>
                    </div>
                    <div class="li-right">
                        ${billItem.paymentStatus === "paid" ? '<img src="/assets/svg/check.png" alt="remove service icon">' : ''}
                    </div>
                </li>
                `;

                // Temporary container element to hold the template
                const tempContainer = document.createElement("div");
                tempContainer.innerHTML = template;

                // Trigger receive services payment modal
                const serviceElement = tempContainer.firstElementChild;
                serviceElement.addEventListener("click", (event) => displaySelectedPatientBillsPaymentModal(event));

                // Append the template to the billContainer
                billContainer.appendChild(serviceElement);
            }
        });

        const h2Element = document.querySelector(".bill-content h2");

        h2Element.classList.toggle("settled", billToDisplay === 0);
        h2Element.classList.toggle("un-settled", billToDisplay !== 0);

        h2Element.textContent = `${UTILS.formatAmountWithCommas(billToDisplay)}`;

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

            // Only dental
            const filteredData = data.filter(item => item.requestName === "Dental Service");

            // Process the data and create HTML for each row
            const rows = filteredData.map(item => {
                return `
                    <tr>
                        <td><input type="checkbox" class="service-checkbox" data-item='${JSON.stringify(item)}'></td>
                        <td>${item.requestName}</td>
                        <td>${item.requestFees}</td>
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
                    // Update Dental Service
                    if(JSON.parse(checkbox.dataset.item).requestName === "Dental Service") {
                        const requestId = JSON.parse(checkbox.dataset.item).requestId;
                        updatePaymentStatusPromises.push(API.services.forDental.requests.updatePaymentStatus(requestId, "paid"));
                    }

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

            // Pay and print receipt
            const updateServicesPaymentStatusAndPrintReceiptBtn = document.querySelector("#update-services-payment-status-and-print-receipt-btn");
            updateServicesPaymentStatusAndPrintReceiptBtn.addEventListener("click", async (event) => {
                event.preventDefault();
                const checkedCheckboxes = document.querySelectorAll('.service-checkbox:checked');

                const updatePaymentStatusPromises = [];

                for (const checkbox of checkedCheckboxes) {
                    // Update Dental Service
                    if(JSON.parse(checkbox.dataset.item).requestName === "Dental Service") {
                        const requestId = JSON.parse(checkbox.dataset.item).requestId;
                        updatePaymentStatusPromises.push(API.services.forDental.requests.updatePaymentStatus(requestId, "paid"));
                    }

                }

                try {
                    const responses = await Promise.all(updatePaymentStatusPromises);

                    // Extract the data from each response
                    const data = responses.map(response => response.data);

                    // Remove modal
                    document.querySelector("#services-payment-modal").classList.remove("inview");

                    // Fetch the bills
                    displaySelectedPatientBills("ongoing-services-02");

                    // Print the receipt
                    printReceipt();

                } catch (error) {
                    console.error('Error updating payment status:', error);
                }

            });

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

            async function printReceipt() {
                // Get the selected services and other necessary data
                const checkedCheckboxes = document.querySelectorAll('.service-checkbox:checked');
                const selectedServices = Array.from(checkedCheckboxes).map(checkbox => JSON.parse(checkbox.dataset.item));
                const totalAmount = calculateTotalAmount(selectedServices);

                // Get patient id from visit id
                const fetchPatientRequest = await API.patients.fetchByVisitId(selectedVisitId);
                const patientData = fetchPatientRequest.data;

                if (fetchPatientRequest.status === 'success') {
                    // Hospital Details
                    const hospitalName = "Med Tech Hospital";
                    const hospitalAddress = "Rwenzori Street, Kampala";
                    const hospitalContact = "Phone: +256 782 615 136";

                    // Patient Details
                    const patientName = `${patientData.firstName} ${patientData.lastName}`;
                    const patientDOB = patientData.dateOfBirth;
                    const patientAge = new Date().getFullYear() - new Date(patientData.dateOfBirth).getFullYear();
                    const patientGender = patientData.gender.charAt(0).toUpperCase() + patientData.gender.slice(1);


                    const receiptHTML = `
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

                        <div>
                            <h2>Receipt</h2>
                            <ul>
                                ${selectedServices.map(service => `<li>${service.requestName}: ${service.requestFees}</li>`).join('')}
                            </ul>
                            <p>Total Amount: ${totalAmount}</p>
                        </div>
                                    
                    `;

                    // Open a new window for printing
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(receiptHTML);

                    // Print the receipt
                    printWindow.print();

                } else {
                    console.error(error);
                    alert('An error occurred while fetching the patient info.');
                }


                
            }

            function calculateTotalAmount(services) {
                // Calculate and return the total amount from the selected services
                return services.reduce((total, service) => total + parseFloat(service.requestFees), 0);
            }
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


// Handle edit patient dental service request form
async function handleEditPatientDentalServiceRequestForm(visitId, requestId) {
    const editPatientDentalServiceRequestForm = document.querySelector('#edit-patient-dental-service-request-form');
    editPatientDentalServiceRequestForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Collect form data
        const formData = new FormData(editPatientDentalServiceRequestForm);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();

        // Display a confirmation dialog
        UTILS.showConfirmationModal(editPatientDentalServiceRequestForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to update a dental service request record
                const response = await API.services.forDental.requests.update(requestId, URLEncodedData, true);

                // Check if the request was successful
                if (response.status === 'success') {
    
                    // Reset the form
                    editPatientDentalServiceRequestForm.reset();
    
                    // Remove form
                    editPatientDentalServiceRequestForm.parentElement.parentElement.classList.remove("inview");

                    // Reload the bills
                    displaySelectedPatientBills("ongoing-services-02");
    
                    // Reload the requests table
                    loadSinglePatientVisitLabRequests(visitId);
    
                } else {
                    alert('Failed to edit dental service request record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while editing the dental service request record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            editPatientDentalServiceRequestForm.reset();
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


// Setup editor
function setupOtherLabReportTinymce() {
    tinymce.init({
        selector: "#other-lab-report",
        width: "100%",
        height: "100%",
        setup: function (editor) {
            // TODO: something();
        }
    });
}


// Generate Other lab report
async function generateLabReportForOtherTest(formId, labRequestId) {
    try {
        // Get id of selected visit
        const selectedVisitId = UTILS.getSelectedVisitId();

        // Get patient id from visit id
        const fetchPatientRequest = await API.patients.fetchByVisitId(selectedVisitId);
        const patientData = fetchPatientRequest.data;

        if (fetchPatientRequest.status === 'success') {
            // Make an API POST request to create a triage record
            // const fetchUrinalysisResultsRequest = await API.results.urinalysis.fetchByRequestId(labRequestId);

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

            // const {
            //     appearance,
            //     glucose,
            //     ketone,
            //     blood,
            //     ph,
            //     protein,
            //     nitrites,
            //     leucocytes,
            //     urobilinogen,
            //     bilirubin,
            //     specificGravity,
            //     rbc,
            //     pusCells,
            //     epithelialCells,
            //     cast,
            //     wbc,
            //     parasite,
            //     crystals,
            //     tVaginalis,
            //     yeastCells,
            //     requestId,
            //     comment,
            // } = fetchUrinalysisResultsRequest.data;

            // Report editor
            const editor = tinymce.get("other-lab-report");


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

                <div>
                    <br/>
                    <p>Interpretation of the CBC results should be conducted in consultation with a healthcare professional. The reference ranges provided in the report are essential for assessing whether the patient's blood parameters fall within the expected values.</p>
                    <br/>
                    <p>Further clinical evaluation and follow-up may be required based on these findings. Please do not hesitate to contact our medical team at ${hospitalContact} for any additional information or to schedule a consultation.</p>
                </div>
                            
            `;

            // Check if the request was successful
            // if (fetchUrinalysisResultsRequest.status === 'success') {
            if (true) {
                editor.setContent(reportHTML);
            } else {
                editor.setContent("");
            }
        } else {
            console.error(error);
            alert('An error occurred while fetching the patient info.');
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred while generating the other lab report.');
    }
}