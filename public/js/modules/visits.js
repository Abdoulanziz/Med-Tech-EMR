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
            { data : null }
        ],
        rowCallback: function(row, data, index) {
            const rowDataString = JSON.stringify(data);

            const editVisitCta = row.cells[4].querySelectorAll("button")[0];

            const viewVisitCta = row.cells[4].querySelectorAll("button")[1];
            const deleteVisitCta = row.cells[4].querySelectorAll("button")[2];

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
                        "visitDate"
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
                render: function(data, type, row, meta) {
                    const originalDate = data.visitDate;
                    const dateObj = new Date(originalDate);
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    return '<span>' + formattedDate + '</span>';
                }
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    return `
                    <td>
                        <button class="btn" style="background-color: #1da1f2;padding-inline: .6rem;border-radius: 0;font-size: 12px;"> <i class="ti-pencil"></i> Edit </button>
                        <button class="btn" style="background-color: yellowgreen;padding-inline: .6rem;border-radius: 0;font-size: 12px;"> <i class="ti-file"></i> Update </button>
                        <button class="btn" style="background-color: orange;padding-inline: .6rem;border-radius: 0;font-size: 12px;"> <i class="ti-trash"></i> Delete </button>
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