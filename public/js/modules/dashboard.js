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

    // Update total income percentage
    updateTotalIncomePercentageSinceLastMonth();

    // Load expense data
    loadExpensesData();

    // Update total expenses
    updateTotalExpenses();

    // Update total expenses percentage
    updateTotalExpensesPercentageSinceLastMonth();

    // Handle create expense record
    handleCreateExpenseRecordForm();

    // Load income summary chart
    loadIncomeSummaryChart();

    // Load expenses summary chart
    loadExpensesSummaryChart();
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

                    // Update total expenses
                    updateTotalExpenses();

                    // Update total expenses percentage
                    updateTotalExpensesPercentageSinceLastMonth();
    
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
            document.querySelector("#total-income").textContent = UTILS.formatAmountWithCommas(income);

        } else {
            alert('Failed to fetch total income.');
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred while fetching total income.');
    }
}

// Update total income percentage since last month
async function updateTotalIncomePercentageSinceLastMonth() {
    try {
        // Get current year month dates
        const { currentYearMonth, startDate: currentStartDate, endDate: currentEndDate } = UTILS.getCurrentYearMonthWithDates();

        // Get previous year month dates
        const { previousYearMonth, startDate: previousStartDate, endDate: previousEndDate } = UTILS.getPreviousYearMonthWithDates();


        // Make GET request to fetch total income
        const currentResponse = await API.analytics.income.fetchIncomeByDateRange(currentStartDate, currentEndDate);
        const currentCount = await currentResponse.sum;

        // Make GET request to fetch total income
        const previousResponse = await API.analytics.income.fetchIncomeByDateRange(previousStartDate, previousEndDate);
        const previousCount = await previousResponse.sum;

        // Check if both requests were successful
        if (currentResponse.status === 'success' && previousResponse.status === 'success') {
            
            // Calculate the percentage difference
            const percentageDifference = UTILS.calculatePercentageDifference(previousCount, currentCount);

            // Update the UI
            document.querySelector("#total-income-percentage").textContent = `${percentageDifference}%`;

        } else {
            alert('Failed to fetch total income percentage.');
        }


    } catch (error) {
        console.error(error);
        alert('An error occurred while fetching new patients count.');
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
            document.querySelector("#total-expenses").textContent = UTILS.formatAmountWithCommas(expenses);

        } else {
            alert('Failed to fetch total expenses.');
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred while fetching total income.');
    }
}

// Update total expenses percentage since last month
async function updateTotalExpensesPercentageSinceLastMonth() {
    try {
        // Get current year month dates
        const { currentYearMonth, startDate: currentStartDate, endDate: currentEndDate } = UTILS.getCurrentYearMonthWithDates();

        // Get previous year month dates
        const { previousYearMonth, startDate: previousStartDate, endDate: previousEndDate } = UTILS.getPreviousYearMonthWithDates();


        // Make GET request to fetch total expenses
        const currentResponse = await API.analytics.expenses.fetchExpensesByDateRange(currentStartDate, currentEndDate);
        const currentCount = await currentResponse.sum;

        // Make GET request to fetch total expenses
        const previousResponse = await API.analytics.expenses.fetchExpensesByDateRange(previousStartDate, previousEndDate);
        const previousCount = await previousResponse.sum;

        // Check if both requests were successful
        if (currentResponse.status === 'success' && previousResponse.status === 'success') {
            
            // Calculate the percentage difference
            const percentageDifference = UTILS.calculatePercentageDifference(previousCount, currentCount);

            // Update the UI
            document.querySelector("#total-expenses-percentage").textContent = `${percentageDifference}%`;

        } else {
            alert('Failed to fetch total expenses percentage.');
        }


    } catch (error) {
        console.error(error);
        alert('An error occurred while fetching new patients count.');
    }
}

// Create summary chart
async function createSummaryChart(title='', type='bar', labels=[], mdata=[], canvasId) {
    if(labels.length == 0 && mdata.length == 0) return;
    
    const data = {
    labels: labels,
    datasets: [{
        label: title,
        backgroundColor: '#b297f1',
        borderColor: '#b297f1',
        data: mdata,
    }]
    };

    const config = {
    type: type,
    data: data,
    options: {
        scales: {
            y: {
                startAtZero: true
            }
        }
    }
    };

    // Render chart
    const chart = new Chart(
        document.getElementById(canvasId),
        config
    );
    return chart;
}

// Handle filter change events for income summary chat
async function handleFilterChangeForIncomeSummaryChart(filterType, chartId) {
    const chartTitle = document.querySelector(`#${chartId}-title`);

    // Check if chart with specific ID exists and destroy it
    const existingChart = Chart.getChart(chartId);
    if (existingChart) {
        existingChart.destroy();
    }

    switch (filterType) {
        case 'day':
            chartTitle.textContent = "Day's Income";
            createSummaryChart('Durations', 'bar', ['Morning', 'Afternoon', 'Evening'], [80, 100, 46], chartId);
            break;
        case 'week':
            chartTitle.textContent = "Week's Income";
            createSummaryChart('Days', 'bar', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [80, 100, 46, 39, 57, 25, 66], chartId);
            break;
        case 'month':
            chartTitle.textContent = "Month's Income";
            createSummaryChart('Weeks', 'bar', ['Week1', 'Week2', 'Week3', 'Week4'], [80, 100, 46, 39], chartId);
            break;
        case 'year':
            chartTitle.textContent = "Year's Income";
            createSummaryChart('Months', 'bar', ['Quarter1', 'Quarter2', 'Quarter3', 'Quarter4'], [80, 46, 39, 60], chartId);
            break;
        default:
            break;
    }
}

// Handle filter change events for expenses summary chat
async function handleFilterChangeForExpensesSummaryChart(filterType, chartId) {
    const chartTitle = document.querySelector(`#${chartId}-title`);
    
    // Check if chart with specific ID exists and destroy it
    const existingChart = Chart.getChart(chartId);
    if (existingChart) {
        existingChart.destroy();
    }

    switch (filterType) {
        case 'day':
            chartTitle.textContent = "Day's Expenses";
            createSummaryChart('Durations', 'line', ['Morning', 'Afternoon', 'Evening'], [80000, 1000000, 460000], chartId);
            break;
        case 'week':
            chartTitle.textContent = "Week's Expenses";
            createSummaryChart('Days', 'line', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [80000, 1000000, 460000, 0, 5700000, 0, 0], chartId);
            break;
        case 'month':
            chartTitle.textContent = "Month's Expenses";
            createSummaryChart('Weeks', 'line', ['Week1', 'Week2', 'Week3', 'Week4'], [80000, 1000000, 460000, 5700000], chartId);
            break;
        case 'year':
            chartTitle.textContent = "Year's Expenses";
            createSummaryChart('Months', 'line', ['Quarter1', 'Quarter2', 'Quarter3', 'Quarter4'], [80000, 1000000, 5700000, 7000000], chartId);
            break;
        default:
            break;
    }
}

// Load charts
async function loadIncomeSummaryChart() {
    // Initial chart setup
    createSummaryChart("Week's Income", 'bar', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [80, 100, 46, 39, 57, 25, 66], 'income-summary-chart');

    // Filter change event handling
    const filterSelectLeft = document.querySelector("#income-summary-chart-filter-select");
    filterSelectLeft.addEventListener("change", (event) => {
        const selectedFilter = event.target.value;
        handleFilterChangeForIncomeSummaryChart(selectedFilter, 'income-summary-chart');
    });
}

// Load charts
async function loadExpensesSummaryChart() {
    // Initial chart setup
    createSummaryChart("Week's Expenses", 'line', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], [80000, 1000000, 460000, 0, 5700000, 0, 0], 'expenses-summary-chart');

    // Filter change event handling
    const filterSelectLeft = document.querySelector("#expenses-summary-chart-filter-select");
    filterSelectLeft.addEventListener("change", (event) => {
        const selectedFilter = event.target.value;
        handleFilterChangeForExpensesSummaryChart(selectedFilter, 'expenses-summary-chart');
    });
}