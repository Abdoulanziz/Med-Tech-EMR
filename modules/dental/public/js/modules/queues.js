import { UI } from "../core/ui.js";
import { UTILS } from "../core/utils.js";
import { API } from "../core/api.js";
import { SSE } from '../core/sse.js';

document.addEventListener("DOMContentLoaded", () => {
    // Init UI
    UI.init();

    // Load all patients on queue
    loadAllPatientsOnQueue();

    // Handle create patient dental service request
    handlePatientDentalServiceRequestForm();


    // SSE
    SSE.initializeSSE(`${window.location.origin}/page/sse`);

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
                    return data.doctorFullName;
                }
            },
            
            {
                targets: 6,
                render: function (data, type, row, meta) {
                    return `
                    <td style="border: 1px solid #ddd;">
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
                    return '<span style="color: #525f7f;">' + data.doctorFullName + '</span>';
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
                    <td style="border: 1px solid #ddd;">
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
async function loadSinglePatientVisitHistory(visitId) {
    // Get Id of selected visit
    const selectedVisitId = parseInt(visitId);

    // Persist Id of selected visit
    UTILS.setSelectedVisitId(selectedVisitId);

    let allPatients;
    const apiEndpoint = `${UI.apiBaseURL}/history-dental/${selectedVisitId}`;

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
                                "serviceFee"
                            ]
                        );

                        // Callback to handle edit dental form
                        handleEditPatientDentalServiceRequestForm(data.visitId, data.requestId);
                    });
                }

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
                    return '<span style="color: #525f7f;">' + data.requestName + '</span>';
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
                    const buttonBackgroundColor = data.requestStatus.toLowerCase() === "pending" ? "#8e8d8d" : "yellowgreen";
                    const isDisabled = data.requestStatus.toLowerCase() === "pending";

                    return `
                        <td style="border: 1px solid #ddd;">
                            <button class="btn table-btn">Edit Request  <i class="ti-arrow-right"></i> </button>
                            <button ${isDisabled ? "disabled" : ""} class="btn table-btn" style="${isDisabled ? "cursor: not-allowed;" : ""}">View Report  <i style="${isDisabled ? "opacity: 0.5;" : ""}" class="ti-arrow-right"></i> </button>
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

        // Play sound
        UI.playSound();
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

                    // Fetch the bills
                    displaySelectedPatientBills("ongoing-services-02");
    
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
                    loadSinglePatientVisitHistory(visitId);
    
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


