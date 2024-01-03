import { UI } from "../core/ui.js";
import { UTILS } from "../core/utils.js";
import { API } from "../core/api.js";

document.addEventListener("DOMContentLoaded", () => {
    // Init UI
    UI.init();

    // Load all patients on queue
    loadAllPatientsOnQueue();

    // Handle CBC test
    handleCompleteBloodCountResultsForm();

    // Set up tinymce
    setupCompleteBloodCountLabReportTinymce();

    // Handle Urinalysis test
    handleUrinalysisResultsForm();

    // Set up tinymce
    setupUrinalysisLabReportTinymce();
    
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
                    loadSinglePatientVisitPrescriptions(data.visitId);
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

// Load patient visit prescriptions to DOM
async function loadSinglePatientVisitPrescriptions(visitId) {
    // Get Id of selected visit
    const selectedVisitId = parseInt(visitId);

    // Persist Id of selected visit
    UTILS.setSelectedVisitId(selectedVisitId);

    let allPatients;
    const apiEndpoint = `${UI.apiBaseURL}/prescriptions/${selectedVisitId}`;

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
            const rowDataObject = data;
            // console.log(rowDataObject);
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
                    return '<span style="color: #525f7f;">' + `${data.medicineName} (${data.medicineDosage})` + '</span>';
                },
            },
            {
                targets: 2,
                render: function(data, type, row, meta) {
                    return '<span>' + data.medicineType.charAt(0).toUpperCase() + data.medicineType.slice(1) + '</span>';
                }
            },
            {
                targets: 3,
                render: function(data, type, row, meta) {
                    return '<span>' + data.manufacturer + '</span>';
                }
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    return '<span>' + `${data.dosage} x ${data.frequency} for ${data.duration} days` + '</span>';
                },
            },
            {
                targets: 5,
                render: function(data, type, row, meta) {
                    const originalDate = data.prescriptionCreatedAt;
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
            if(billItem.paymentStatus === "unpaid") {
                billToDisplay += parseInt(billItem.requestFees);
            }else{
                billToDisplay = billToDisplay;
            }
        });

        // Display only the first three items
        const itemsToDisplay = billItems.slice(0, 3);

        itemsToDisplay.forEach((billItem, index) => {
            
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

            // Process the data and create HTML for each row
            const rows = data.map(item => {
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
                const servicesPaymentForm = document.querySelector('#services-payment-form');

                // Display a confirmation dialog
                UTILS.showConfirmationModal(servicesPaymentForm, "Are you sure you want to save this record?", async () => {
                    try {
                        const checkedCheckboxes = document.querySelectorAll('.service-checkbox:checked');

                        const updatePaymentStatusPromises = [];

                        for (const checkbox of checkedCheckboxes) {
                            // Update Eye Service
                            if(JSON.parse(checkbox.dataset.item).requestName === "Eye Service") {
                                const requestId = JSON.parse(checkbox.dataset.item).requestId;
                                updatePaymentStatusPromises.push(API.services.forEye.requests.updatePaymentStatus(requestId, "paid"));
                            }

                            // Update Dental Service
                            else if(JSON.parse(checkbox.dataset.item).requestName === "Dental Service") {
                                const requestId = JSON.parse(checkbox.dataset.item).requestId;
                                updatePaymentStatusPromises.push(API.services.forDental.requests.updatePaymentStatus(requestId, "paid"));
                            }

                            // Update Cardiolody Service
                            else if(JSON.parse(checkbox.dataset.item).requestName === "Cardiology Service") {
                                const requestId = JSON.parse(checkbox.dataset.item).requestId;
                                updatePaymentStatusPromises.push(API.services.forCardiology.requests.updatePaymentStatus(requestId, "paid"));
                            }

                            // Update Radiology Service
                            else if(JSON.parse(checkbox.dataset.item).requestName === "Radiology Service") {
                                const requestId = JSON.parse(checkbox.dataset.item).requestId;
                                updatePaymentStatusPromises.push(API.services.forRadiology.requests.updatePaymentStatus(requestId, "paid"));
                            }

                            // Update Lab Tests
                            else {
                                const requestId = JSON.parse(checkbox.dataset.item).requestId;
                                updatePaymentStatusPromises.push(API.requests.updatePaymentStatus(requestId, "paid"));
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
                    }  catch (error) {
                        console.error(error);
                        alert('An error occurred while performing action.');
                    }
                }, () => {
                    // TODO: Run when cancelled

                    // Reset the form
                    servicesPaymentForm.reset();
                });


                // Touch


                

            });

            // Pay and print receipt
            const updateServicesPaymentStatusAndPrintReceiptBtn = document.querySelector("#update-services-payment-status-and-print-receipt-btn");
            updateServicesPaymentStatusAndPrintReceiptBtn.addEventListener("click", async (event) => {
                event.preventDefault();
                const servicesPaymentForm = document.querySelector('#services-payment-form');

                // Display a confirmation dialog
                UTILS.showConfirmationModal(servicesPaymentForm, "Are you sure you want to save this record?", async () => {
                    try {
                        const checkedCheckboxes = document.querySelectorAll('.service-checkbox:checked');

                        const updatePaymentStatusPromises = [];

                        for (const checkbox of checkedCheckboxes) {
                            // Update Eye Service
                            if(JSON.parse(checkbox.dataset.item).requestName === "Eye Service") {
                                const requestId = JSON.parse(checkbox.dataset.item).requestId;
                                updatePaymentStatusPromises.push(API.services.forEye.requests.updatePaymentStatus(requestId, "paid"));
                            }

                            // Update Dental Service
                            else if(JSON.parse(checkbox.dataset.item).requestName === "Dental Service") {
                                const requestId = JSON.parse(checkbox.dataset.item).requestId;
                                updatePaymentStatusPromises.push(API.services.forDental.requests.updatePaymentStatus(requestId, "paid"));
                            }

                            // Update Cardiolody Service
                            else if(JSON.parse(checkbox.dataset.item).requestName === "Cardiology Service") {
                                const requestId = JSON.parse(checkbox.dataset.item).requestId;
                                updatePaymentStatusPromises.push(API.services.forCardiology.requests.updatePaymentStatus(requestId, "paid"));
                            }

                            // Update Radiology Service
                            else if(JSON.parse(checkbox.dataset.item).requestName === "Radiology Service") {
                                const requestId = JSON.parse(checkbox.dataset.item).requestId;
                                updatePaymentStatusPromises.push(API.services.forRadiology.requests.updatePaymentStatus(requestId, "paid"));
                            }

                            // Update Lab Tests
                            else {
                                const requestId = JSON.parse(checkbox.dataset.item).requestId;
                                updatePaymentStatusPromises.push(API.requests.updatePaymentStatus(requestId, "paid"));
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
                    }  catch (error) {
                        console.error(error);
                        alert('An error occurred while performing action.');
                    }
                }, () => {
                    // TODO: Run when cancelled

                    // Reset the form
                    servicesPaymentForm.reset();
                });
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
                        <h2 style="text-align: center; color: #333;">Receipt</h2>
                        <div style="inline-size: 100%;margin-inline-end: 1.2rem;">
                            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                                <thead>
                                    <tr>
                                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Service</th>
                                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Quantity</th>
                                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Fees</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${selectedServices.map(service => `
                                        <tr>
                                            <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${service.requestName}</td>
                                            <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">1</td>
                                            <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${UTILS.formatAmountWithCommas(service.requestFees)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            <p style="text-align: right; font-weight: bold; margin-top: 20px;">Total Amount: ${UTILS.formatAmountWithCommas(totalAmount)}</p>
                        </div>
                                    
                    `;

                    // Open a new window for printing
                    const printWindow = window.open('', 'PrintWindow');
                    printWindow.document.write(receiptHTML);

                    // Print the receipt
                    printWindow.print();

                    // Close print window
                    window.addEventListener('afterprint', () => {
                        printWindow.close();
                    });

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

// Handle complete blood count results form
async function handleCompleteBloodCountResultsForm() {
    const completeBloodCountResultsForm = document.querySelector('#complete-blood-count-results-form');
    completeBloodCountResultsForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const comment = tinymce.get('complete-blood-count-results-comment-editor').getContent();

        // Get Id of selected request
        const selectedRequestId = completeBloodCountResultsForm.dataset.requestId;
        if (! selectedRequestId) return;

        // Get Id of selected visit
        const selectedVisitId = UTILS.getSelectedVisitId();
    
        // Collect form data
        const formData = new FormData(completeBloodCountResultsForm);
        formData.append('requestId', selectedRequestId);
        formData.append('comment', comment);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();
    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(completeBloodCountResultsForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create a triage record
                const response = await API.results.completeBloodCount.create(URLEncodedData, true);
    
                // Check if the request was successful
                if (response.status === 'success') {
    
                    // Reset the form
                    completeBloodCountResultsForm.reset();
    
                    // Remove form
                    completeBloodCountResultsForm.parentElement.parentElement.classList.remove("inview");
    
                    // Reload the requests table
                    loadSinglePatientVisitPrescriptions(selectedVisitId);
    
                } else {
                    alert('Failed to create CBC record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the CBC record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            patientLabReportForm.reset();
        });
    });
}

// Generate CBC lab report
async function generateLabReportForCompleteBloodTest(formId, labRequestId) {
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
            const editor = tinymce.get("complete-blood-count-lab-report");

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
        alert('An error occurred while generating the cbc lab report.');
    }
}

function setupCompleteBloodCountLabReportTinymce() {
    tinymce.init({
        selector: "#complete-blood-count-lab-report",
        width: "100%",
        height: "100%",
        setup: function (editor) {
            // TODO: something();
        }
    });
}

async function printLabReportForCompleteBloodCountTest(patient) {
    // Print lab report
    const printLabReportBtn = document.querySelector("#print-lab-report-btn");
    printLabReportBtn?.addEventListener("click", event => {
        event.preventDefault();
        buildLabReportForCompleteBloodCountTest("complete-blood-count-lab-report", "CBC Lab Report", patient);
    });
}

function buildLabReportForCompleteBloodCountTest(editorId, title, patient){
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



// Handle urinalysis results form
async function handleUrinalysisResultsForm() {
    const urinalysisResultsForm = document.querySelector('#urinalysis-results-form');
    urinalysisResultsForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const comment = tinymce.get('urinalysis-results-comment-editor').getContent();

        // Get Id of selected request
        const selectedRequestId = urinalysisResultsForm.dataset.requestId;
        if (! selectedRequestId) return;

        // Get Id of selected visit
        const selectedVisitId = UTILS.getSelectedVisitId();
    
        // Collect form data
        const formData = new FormData(urinalysisResultsForm);
        formData.append('requestId', selectedRequestId);
        formData.append('comment', comment);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();
    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(urinalysisResultsForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create a triage record
                const response = await API.results.urinalysis.create(URLEncodedData, true);
    
                // Check if the request was successful
                if (response.status === 'success') {
    
                    // Reset the form
                    urinalysisResultsForm.reset();
    
                    // Remove form
                    urinalysisResultsForm.parentElement.parentElement.classList.remove("inview");
    
                    // Reload the requests table
                    loadSinglePatientVisitPrescriptions(selectedVisitId);
    
                } else {
                    alert('Failed to create Urinalysis record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the Urinalysis record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            patientLabReportForm.reset();
        });
    });
}

// Generate CBC lab report
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
            const editor = tinymce.get("urinalysis-lab-report");


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
        alert('An error occurred while generating the cbc lab report.');
    }
}

function setupUrinalysisLabReportTinymce() {
    tinymce.init({
        selector: "#urinalysis-lab-report",
        width: "100%",
        height: "100%",
        setup: function (editor) {
            // TODO: something();
        }
    });
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