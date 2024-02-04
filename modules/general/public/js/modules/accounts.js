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
            const userId = data.userId;
            const rowDataString = JSON.stringify(data);

            // Doctor
            if(data.userRole === "doctor"){

                // Trigger create modal
                if(data.userProfileCompletionStatus === "incomplete"){
                    const createDoctorProfileCta = row.cells[5].querySelectorAll("button")[0];
                    createDoctorProfileCta.style.cursor = "pointer";
                    createDoctorProfileCta.classList.add("modal-trigger");
                    createDoctorProfileCta.dataset.modal = "create-doctor-profile-modal";

                    UTILS.triggerModal(createDoctorProfileCta, "modal", async () => {
                        // Callback to handle doctor create form
                        handleCreateDoctorProfileForm(userId);
                    });
                }

                // Trigger update modal
                if(data.userProfileCompletionStatus === "complete"){
                    const updateDoctorProfileCta = row.cells[5].querySelectorAll("button")[0];
                    updateDoctorProfileCta.style.cursor = "pointer";
                    updateDoctorProfileCta.classList.add("modal-trigger");
                    updateDoctorProfileCta.dataset.modal = "update-doctor-profile-modal";

                    UTILS.triggerModal(updateDoctorProfileCta, "modal", async () => {

                        
                        // TODO: Pre Fetch Using WORKER THREAD
                        // Fetch doctor data
                        const response = await API.doctors.fetchById(userId);
                        const selectedDoctor = await response.data;


                        // Populate the form with the data
                        populateFormWithData(
                            "update-doctor-profile-modal",
                            JSON.stringify(selectedDoctor),
                            [
                                "firstName",
                                "lastName",
                                "dateOfBirth",
                                "gender",
                                "contactNumber",
                                "email"
                            ]
                        );

                        // Callback to handle doctor update form
                        handleUpdateDoctorProfileForm(userId);

                    });
                }
            }

            // Nurse
            if(data.userRole === "nurse"){
                const createNurseProfileCta = row.cells[5].querySelectorAll("button")[0];
                createNurseProfileCta.style.cursor = "pointer";
                createNurseProfileCta.classList.add("modal-trigger");
                createNurseProfileCta.dataset.modal = "create-nurse-profile-modal";
                
                UTILS.triggerModal(createNurseProfileCta, "modal", async () => {
                    // TODO: handleCreateNurseProfile()
                });
            }
            
            // Update user roles
            const updateUserRolesCta = row.cells[5].querySelectorAll("button")[1];
            updateUserRolesCta.style.cursor = "pointer";
            updateUserRolesCta.classList.add("modal-trigger");
            updateUserRolesCta.dataset.modal = "update-user-roles-modal";

            UTILS.triggerModal(updateUserRolesCta, "modal", async () => {

                // Populate the form with the data
                populateFormWithData(
                    "update-user-roles-modal",
                    // Local
                    rowDataString,

                    [
                        "username",
                        "password",
                        "roleId",
                        "userAccountStatus"
                    ]
                );


                handleUpdateUserRolesForm(userId);
            });

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
                    return '<span style="color: #525f7f;">' + data.username + '</span>';
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
                    let color;

                    if (status === 'active') {
                        color = 'yellowgreen';
                    } else if(status === 'suspended') {
                        color = 'orange';
                    } else {
                        color = 'grey';
                    }
                    return '<span class="td-status"><span class="td-status-dot" style="background-color: ' + color + ';"></span>'+ data.userAccountStatus.charAt(0).toUpperCase() + data.userAccountStatus.slice(1) +'</span>';

                }
            },
            {
                targets: 4,
                render: function(data, type, row, meta) {
                    return '<span>' + data.userProfileCompletionStatus.charAt(0).toUpperCase() + data.userProfileCompletionStatus.slice(1) + '</span>';
                }
            },
            {
                targets: 5,
                render: function (data, type, row, meta) {
                    let ctas = "";
                    if(data.userProfileCompletionStatus === "incomplete"){
                        ctas += `
                        <button class="btn table-btn">Create Profile </button>
                        `;
                    }else {
                        ctas += `
                        <button class="btn table-btn">Update Profile </button>
                        `;
                    }

                    ctas += `
                        <button class="btn table-btn">Update Roles </button>
                        `;

                    return `
                        <td style="border: 1px solid #ddd;">
                            ${ctas}
                        </td>
                    `;
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

// Handle user roles update form
async function handleUpdateUserRolesForm(userId) {
    const updateUserRolesForm = document.querySelector('#update-user-roles-form');
    updateUserRolesForm.addEventListener('submit', (event) => {
        event.preventDefault();
    
        // Collect form data
        const formData = new FormData(updateUserRolesForm);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();

    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(updateUserRolesForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API PUT request to update a user record
                const response = await API.users.update(userId, URLEncodedData, true);
    
                // Check if the request was successful
                if (response.status === 'success') {
    
                    // Reset the form
                    updateUserRolesForm.reset();
    
                    // Remove form
                    updateUserRolesForm.parentElement.parentElement.classList.remove("inview");
    
                    // Reload the users table
                    loadAllUsers();
    
                } else {
                    alert('Failed to update user record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while updating the user record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            updateUserRolesForm.reset();
        });
    });
}

// Handle doctor create form
async function handleCreateDoctorProfileForm(userId) {
    const createDoctorProfileForm = document.querySelector('#create-doctor-profile-form');
    createDoctorProfileForm.addEventListener('submit', (event) => {
        event.preventDefault();
    
        // Collect form data
        const formData = new FormData(createDoctorProfileForm);
        formData.append("userId", userId);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();
    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(createDoctorProfileForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create a doctor record
                const response = await API.doctors.create(URLEncodedData, true);
    
                // Check if the request was successful
                if (response.status === 'success') {
    
                    // Reset the form
                    createDoctorProfileForm.reset();
    
                    // Remove form
                    createDoctorProfileForm.parentElement.parentElement.classList.remove("inview");
    
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
            createDoctorProfileForm.reset();
        });
    });
}

// Handle doctor update form
async function handleUpdateDoctorProfileForm(userId) {
    const updateDoctorProfileForm = document.querySelector('#update-doctor-profile-form');
    updateDoctorProfileForm.addEventListener('submit', (event) => {
        event.preventDefault();
    
        // Collect form data
        const formData = new FormData(updateDoctorProfileForm);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();

        console.log(URLEncodedData);
    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(updateDoctorProfileForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API PUT request to update a doctor record
                const response = await API.doctors.update(userId, URLEncodedData, true);
    
                // Check if the request was successful
                if (response.status === 'success') {
    
                    // Reset the form
                    updateDoctorProfileForm.reset();
    
                    // Remove form
                    updateDoctorProfileForm.parentElement.parentElement.classList.remove("inview");
    
                    // Reload the users table
                    loadAllUsers();
    
                } else {
                    alert('Failed to update user record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while updating the user record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            updateDoctorProfileForm.reset();
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