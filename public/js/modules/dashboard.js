import { UI } from "../core/ui.js";
import { UTILS } from "../core/utils.js";
import { API } from "../core/api.js";

document.addEventListener("DOMContentLoaded", () => {
    // Init UI
    UI.init();

    // Update new patients count
    updateNewPatientsCount();

    // Update new patients percentage count
    updateNewPatientsPercentageSinceLastMonth();

    // Update repeat patients count
    updateRepeatPatientsCount();

    // Update repeat patients percentage count
    updateRepeatPatientsPercentageSinceLastMonth();

    // Load income data
    loadIncomeData();

    // Update total income
    updateTotalIncome();

    // Load expense data
    loadExpensesData();

    // Update total expenses
    updateTotalExpenses();

    // Handle create expense record
    handleCreateExpenseRecordForm();
});

async function loadIncomeData() {
    let incomeData;
    const apiEndpoint = `${UI.apiBaseURL}/finance/income`;

    incomeData = $('#income-table').DataTable({
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
                    return data.incomeId;
                }
            },
            {
                targets: 1,
                render: function (data, type, row, meta) {
                    return data.paymentMethod.charAt(0).toUpperCase() + data.paymentMethod.slice(1);
                },
            },
            {
                targets: 2,
                render: function (data, type, row, meta) {
                    return data.amount;
                },
            },
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    return data.narration;
                },
            },
            {
                targets: 4,
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
        incomeData.draw();
    });

};

async function loadExpensesData() {
    let expensesData;
    const apiEndpoint = `${UI.apiBaseURL}/finance/expenses`;

    expensesData = $('#expenses-table').DataTable({
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
        },
        columnDefs: [
            {
                targets: 0,
                render: function(data, type, row, meta) {
                    return data.expenseId;
                }
            },
            {
                targets: 1,
                render: function(data, type, row, meta) {
                    return data.expenseCategory.charAt(0).toUpperCase() + data.expenseCategory.slice(1);
                }
            },
            {
                targets: 2,
                render: function (data, type, row, meta) {
                    return data.amount;
                },
            },
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    return data.narration;
                },
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    return data.paymentMethod.charAt(0).toUpperCase() + data.paymentMethod.slice(1);
                },
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
        expensesData.draw();
    });

};

// Handle expense create form
async function handleCreateExpenseRecordForm() {
    const expenseRecordForm = document.querySelector('#create-expense-record-form');
    expenseRecordForm.addEventListener('submit', (event) => {
        event.preventDefault();
    
        // Collect form data
        const formData = new FormData(expenseRecordForm);

        // URL encoded data
        const URLEncodedData = new URLSearchParams(formData).toString();
    
        // Display a confirmation dialog
        UTILS.showConfirmationModal(expenseRecordForm, "Are you sure you want to save this record?", async () => {
            try {
                // Make an API POST request to create a triage record
                const response = await API.finance.expenses.create(URLEncodedData, true);

                // Check if the request was successful
                if (response.status === 'success') {
    
                    // Reset the form
                    expenseRecordForm.reset();
    
                    // Remove form
                    expenseRecordForm.parentElement.parentElement.classList.remove("inview");
    
                    // Reload the expenses table
                    loadExpensesData();
    
                } else {
                    alert('Failed to create expense record. Please check the form data.');
                }
            } catch (error) {
                console.error(error);
                alert('An error occurred while creating the expense record.');
            }
        }, () => {
            // TODO: Run when cancelled

            // Reset the form
            expenseRecordForm.reset();
        });
    });
}

// Update new patients count
async function updateNewPatientsCount() {
    try {
        // Get current year month dates
        const { currentYearMonth, startDate, endDate } = UTILS.getCurrentYearMonthWithDates();


        // Make GET request to fetch new patients count
        const response = await API.analytics.patients.fetchNewPatientsCountByCountTypeAndDateRange(startDate, endDate);
        const count = await response.count;

        // Check if the request was successful
        if (response.status === 'success') {

            // Update the UI
            document.querySelector("#new-patients-count").textContent = count;

        } else {
            alert('Failed to fetch new patients count.');
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred while fetching new patients count.');
    }
}

// Update new patients percentage since last month
async function updateNewPatientsPercentageSinceLastMonth() {
    try {
        // Get current year month dates
        const { currentYearMonth, startDate: currentStartDate, endDate: currentEndDate } = UTILS.getCurrentYearMonthWithDates();

        // Get previous year month dates
        const { previousYearMonth, startDate: previousStartDate, endDate: previousEndDate } = UTILS.getPreviousYearMonthWithDates();


        // Make GET request to fetch new patients count
        const currentResponse = await API.analytics.patients.fetchNewPatientsCountByCountTypeAndDateRange(currentStartDate, currentEndDate);
        const currentCount = await currentResponse.count;

        // Make GET request to fetch new patients count
        const previousResponse = await API.analytics.patients.fetchNewPatientsCountByCountTypeAndDateRange(previousStartDate, previousEndDate);
        const previousCount = await previousResponse.count;

        // Check if both requests were successful
        if (currentResponse.status === 'success' && previousResponse.status === 'success') {
            
            // Calculate the percentage difference
            const percentageDifference = UTILS.calculatePercentageDifference(previousCount, currentCount);
            console.log("Percentage Difference:", percentageDifference);

            // Update the UI
            document.querySelector("#new-patients-percentage-count").textContent = `${percentageDifference}%`;

        } else {
            alert('Failed to fetch patients count data.');
        }


    } catch (error) {
        console.error(error);
        alert('An error occurred while fetching new patients count.');
    }
}

// Update repeat patients count
async function updateRepeatPatientsCount() {
    try {
        // Get current year month dates
        const { currentYearMonth, startDate, endDate } = UTILS.getCurrentYearMonthWithDates();

        // Make GET request to fetch repeat patients count
        const response = await API.analytics.patients.fetchRepeatPatientsCountByCountTypeAndDateRange(startDate, endDate);
        const count = await response.count;

        // Check if the request was successful
        if (response.status === 'success') {

            // Update the UI
            document.querySelector("#repeat-patients-count").textContent = count;

        } else {
            alert('Failed to fetch repeat patients count.');
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred while fetching repeat patients count.');
    }
}

// Update repeat patients percentage since last month
async function updateRepeatPatientsPercentageSinceLastMonth() {
    try {
        // Get current year month dates
        const { currentYearMonth, startDate: currentStartDate, endDate: currentEndDate } = UTILS.getCurrentYearMonthWithDates();

        // Get previous year month dates
        const { previousYearMonth, startDate: previousStartDate, endDate: previousEndDate } = UTILS.getPreviousYearMonthWithDates();


        // Make GET request to fetch new patients count
        const currentResponse = await API.analytics.patients.fetchRepeatPatientsCountByCountTypeAndDateRange(currentStartDate, currentEndDate);
        const currentCount = await currentResponse.count;

        // Make GET request to fetch new patients count
        const previousResponse = await API.analytics.patients.fetchRepeatPatientsCountByCountTypeAndDateRange(previousStartDate, previousEndDate);
        const previousCount = await previousResponse.count;

        // Check if both requests were successful
        if (currentResponse.status === 'success' && previousResponse.status === 'success') {
            
            // Calculate the percentage difference
            const percentageDifference = UTILS.calculatePercentageDifference(previousCount, currentCount);
            console.log("Percentage Difference:", percentageDifference);

            // Update the UI
            document.querySelector("#repeat-patients-percentage-count").textContent = `${percentageDifference}%`;

        } else {
            alert('Failed to fetch patients count data.');
        }


    } catch (error) {
        console.error(error);
        alert('An error occurred while fetching new patients count.');
    }
}

// Update total income
async function updateTotalIncome() {
    try {
        // Get current year month dates
        const { currentYearMonth, startDate, endDate } = UTILS.getCurrentYearMonthWithDates();

        // Make GET request to fetch total income
        const response = await API.analytics.income.fetchIncomeByDateRange(startDate, endDate);
        const income = await response.sum;

        // Check if the request was successful
        if (response.status === 'success') {

            // Update the UI
            document.querySelector("#total-income").textContent = `UGX ${income}`;

        } else {
            alert('Failed to fetch total income.');
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred while fetching total income.');
    }
}

// Update total expenses
async function updateTotalExpenses() {
    try {
        // Get current year month dates
        const { currentYearMonth, startDate, endDate } = UTILS.getCurrentYearMonthWithDates();

        // Make GET request to fetch total expenses
        const response = await API.analytics.expenses.fetchExpensesByDateRange(startDate, endDate);
        const expenses = await response.sum;

        // Check if the request was successful
        if (response.status === 'success') {

            // Update the UI
            document.querySelector("#total-expenses").textContent = `UGX ${expenses}`;

        } else {
            alert('Failed to fetch total expenses.');
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred while fetching total income.');
    }
}