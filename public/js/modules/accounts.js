import { UI } from "../core/ui.js";
import { UTILS } from "../core/utils.js";
import { API } from "../core/api.js";

document.addEventListener("DOMContentLoaded", () => {
    // Init UI
    UI.init();

    // Handle user account creation
    handleCreateUserForm();

    // Load all users
    loadAllUsers();
    
});


async function loadAllUsers() {
    let allUsersTable;
    const apiEndpoint = `${UI.apiBaseURL}/users`;

    allUsersTable = $('#all-users-table').DataTable({
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
            { data : null }
        ],
        rowCallback: function(row, data, index) {
            const rowData = JSON.stringify(data);

            // Doctor
            if(data.userRole === "doctor"){
                const createDoctorProfileCta = row.cells[4].querySelectorAll("button")[0];
                createDoctorProfileCta.style.cursor = "pointer";
                createDoctorProfileCta.classList.add("modal-trigger");
                createDoctorProfileCta.dataset.modal = "create-doctor-profile-modal";

                UTILS.triggerModal(createDoctorProfileCta, "modal", async () => {
                    // TODO: handleCreateDoctorProfile()
                });
            }

            // Nurse
            if(data.userRole === "nurse"){
                const createNurseProfileCta = row.cells[4].querySelectorAll("button")[0];
                createNurseProfileCta.style.cursor = "pointer";
                createNurseProfileCta.classList.add("modal-trigger");
                createNurseProfileCta.dataset.modal = "create-nurse-profile-modal";
                
                UTILS.triggerModal(createNurseProfileCta, "modal", async () => {
                    // TODO: handleCreateNurseProfile()
                });
            }        
        },
        columnDefs: [
            {
                targets: 0,
                render: function(data, type, row, meta) {
                    return '<span>' + data.userId + '</span>';
                }
            },
            {
                targets: 1,
                render: function (data, type, row, meta) {
                    return '<span>' + data.username + '</span>';
                },
            },
            {
                targets: 2,
                render: function(data, type, row, meta) {
                    return '<span>' + data.userRole.charAt(0).toUpperCase() + data.userRole.slice(1) + '</span>';
                }
            },
            {
                targets: 3,
                render: function(data, type, row, meta) {
                    const status = data.userAccountStatus.toLowerCase();
                    let backgroundColor;

                    if (status === 'active') {
                        backgroundColor = 'yellowgreen';
                    } else if(status === 'suspended') {
                        backgroundColor = 'orange';
                    }
                    return '<span style="font-size: 10px;display: block;inline-size: 50%;border-radius:6px;padding: .4rem .6rem;color: #fff;background-color: ' + backgroundColor + ';">' + data.userAccountStatus.toUpperCase() + '</span>';

                }
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    return `
                    <td style="border: 1px solid #ddd;">
                        <button class="btn" style="background-color: #8e8d8d;padding-inline: .6rem;border-radius: 0;font-size: 12px;">Create Profile </button>
                        <button class="btn" style="background-color: #8e8d8d;padding-inline: .6rem;border-radius: 0;font-size: 12px;">View More </button>
                        <button class="btn" style="background-color: #8e8d8d;padding-inline: .6rem;border-radius: 0;font-size: 12px;">View More </button>
                    </td>
                    `;
                }
            },
            {
                targets: 5,
                render: function(data, type, row, meta) {
                    const originalDate = data.createdAt;
                    const dateObj = new Date(originalDate);
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    return '<span>' + formattedDate + '</span>';
                }
            },
            {
                targets: 6,
                render: function(data, type, row, meta) {
                    const originalDate = data.createdAt;
                    const dateObj = new Date(originalDate);
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    return '<span>' + formattedDate + '</span>';
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
        allUsersTable.draw();
    });

};

// Handle user create form
async function handleCreateUserForm() {
    const createUserForm = document.querySelector('#create-user-form');
    createUserForm.addEventListener('submit', (event) => {
        event.preventDefault();
    
        // Collect form data
        const formData = new FormData(createUserForm);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();
    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(createUserForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create a user record
                const response = await API.users.create(URLEncodedData, true);
    
                // Check if the request was successful
                if (response.status === 'success') {
    
                    // Reset the form
                    createUserForm.reset();
    
                    // Remove form
                    createUserForm.parentElement.parentElement.classList.remove("inview");
    
                    // Reload the users table
                    loadAllUsers();
    
                } else {
                    alert('Failed to create user record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the user record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            createUserForm.reset();
        });
    });
}
