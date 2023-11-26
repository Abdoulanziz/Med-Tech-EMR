import { UI } from "../core/ui.js";
import { UTILS } from "../core/utils.js";
import { API } from "../core/api.js";

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
            { data : null },
            { data : null },
            { data : null }
        ],
        rowCallback: function(row, data, index) {
            const rowDataString = JSON.stringify(data);

            const viewVisitCta = row.cells[6].querySelectorAll("button")[0];
            const editVisitCta = row.cells[6].querySelectorAll("button")[1];
            const deleteVisitCta = row.cells[6].querySelectorAll("button")[2];

            // Edit
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


            // View
            viewVisitCta.dataset.patient = rowDataString;
            viewVisitCta.style.cursor = "pointer";

            viewVisitCta.dataset.patient = rowDataString;

            viewVisitCta.classList.add("section-toggler");
            viewVisitCta.dataset.section = "section_01";

            UTILS.sectionToggler(viewVisitCta, "section", () => {
                displaySelectedPatientDetails("patient-info-section_01", rowDataString, () => {
                    loadSinglePatientVisitHistory(data.visitId);
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
                render: function (data, type, row, meta) {
                    return "Visit";
                },
            },
            {
                targets: 4,
                render: function(data, type, row, meta) {
                    const originalDate = data.visitDate;
                    const dateObj = new Date(originalDate);
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    return '<span>' + formattedDate + '</span>';
                }
            },
            {
                targets: 5,
                render: function(data, type, row, meta) {
                    const status = data.visitStatus.toLowerCase();
                    let backgroundColor;

                    if (status === 'scheduled') {
                        backgroundColor = 'grey';
                    } else if (status === 'completed') {
                        backgroundColor = 'yellowgreen';
                    } else {
                        backgroundColor = 'orange';
                    }

                    return '<span style="font-size: 10px;display: block;inline-size: 80%;border-radius:6px;padding: .4rem .6rem;color: #fff;background-color: ' + backgroundColor + ';">' + status.toUpperCase() + '</span>';
                }
            },
            {
                targets: 6,
                render: function (data, type, row, meta) {
                    return `
                    <td>
                    <button class="btn" style="background-color: orange;padding-inline: .6rem;border-radius: 0;font-size: 12px;"> <i class="ti-trash"></i> View </button>
                        <button class="btn" style="background-color: #1da1f2;padding-inline: .6rem;border-radius: 0;font-size: 12px;"> <i class="ti-pencil"></i> Update </button>
                        <button class="btn" style="background-color: orange;padding-inline: .6rem;border-radius: 0;font-size: 12px;"> <i class="ti-trash"></i> Delete </button>
                    </td>
                    `;
                },
            },
            {
                targets: 7,
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


// Handle visit update form
// @Unique handleUpdateVisitForm() to this module
async function handleUpdateVisitForm(visitId) {
    const updateVisitForm = document.querySelector('#edit-visit-form');
    updateVisitForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get patient id from visit (API)
        // @Unique get patient id
        const response = await API.patients.fetchByVisitId(visitId);
        const selectedPatientId = await response.data.patientId;

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
                    loadAllVisits();
    
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



// DON'T TOUCH UPPER CODE















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
                    return '<span>' + data.testName + '</span>';
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

