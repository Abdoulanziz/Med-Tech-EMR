import { UI } from "../core/ui.js";
import { UTILS } from "../core/utils.js";
import { API } from "../core/api.js";
import { SSE } from '../core/sse.js';

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

            const editVisitCta = row.cells[6].querySelectorAll("button")[0];
            const viewVisitCta = row.cells[6].querySelectorAll("button")[1];

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
                            <span style="color: #525f7f;">${data.patientFullName}</span>
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
                targets: 6,
                render: function (data, type, row, meta) {
                    return `
                    <td>
                        <button class="btn table-btn"> <i class="ti-pencil"></i> Update </button>
                        <button class="btn table-btn"> <i class="ti-arrow-right"></i> View Details </button>
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



// // Load patient visit requests to DOM
// async function loadSinglePatientVisitHistory(visitId) {
//     // Get Id of selected visit
//     const selectedVisitId = parseInt(visitId);

//     // Persist Id of selected visit
//     UTILS.setSelectedVisitId(selectedVisitId);

//     let allPatients;
//     const apiEndpoint = `${UI.apiBaseURL}/history/${selectedVisitId}`;

//     allPatients = $('#single-patient-visit-records').DataTable({
//         processing: true,
//         serverSide: true,
//         paging: true,
//         searching: true,
//         filter:true,
//         destroy: true,

//         ajax: {
//             url: apiEndpoint,
//             dataSrc: "data",
//             data: function (d) {
//                 d.minDate = $('#min-date').val();
//                 d.maxDate = $('#max-date').val();
//             },
//         },  
//         columns: [ 
//             { data : null },
//             { data : null },
//             { data : null },
//             { data : null },
//             { data : null }
//         ],
//         rowCallback: function(row, data, index) {
            
//         },
//         columnDefs: [
//             {
//                 targets: 0,
//                 render: function(data, type, row, meta) {
//                     return '<span>' + (meta.row + 1) + '</span>';
//                 }
//             },
//             {
//                 targets: 1,
//                 render: function (data, type, row, meta) {
//                     return '<span>' + data.testName + '</span>';
//                 },
//             },
//             {
//                 targets: 2,
//                 render: function(data, type, row, meta) {
//                     const originalDate = data.requestCreatedAt;
//                     const dateObj = new Date(originalDate);
//                     const formattedDate = dateObj.toISOString().split('T')[0];
//                     return '<span>' + formattedDate + '</span>';
//                 }
//             },
//             {
//                 targets: 3,
//                 render: function(data, type, row, meta) {
//                     const status = data.requestStatus.toLowerCase();
//                     let backgroundColor;

//                     if (status === 'pending') {
//                         backgroundColor = 'grey';
//                     } else if (status === 'complete') {
//                         backgroundColor = 'yellowgreen';
//                     } else {
//                         backgroundColor = 'orange';
//                     }

//                     return '<span style="font-size: 10px;display: block;inline-size: 50%;border-radius:6px;padding: .4rem .6rem;color: #fff;background-color: ' + backgroundColor + ';">' + status.toUpperCase() + '</span>';
//                 }
//             },
//             {
//                 targets: 4,
//                 render: function(data, type, row, meta) {
//                     const originalDate = data.requestCreatedAt;
//                     const dateObj = new Date(originalDate);
//                     const formattedDate = dateObj.toISOString().split('T')[0];
//                     return '<span>' + formattedDate + '</span>';
//                 }
//             }
//         ]  
//     });

// }

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