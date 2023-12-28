import { UI } from "../core/ui.js";
import { UTILS } from "../core/utils.js";
import { API } from "../core/api.js";

document.addEventListener("DOMContentLoaded", () => {
    // Init UI
    UI.init();

    // Load audit trail
    loadAuditLogs();
    
});


async function loadAuditLogs() {
    let auditLogsTable;
    const apiEndpoint = `${UI.apiBaseURL}/admin/audit-logs`;

    auditLogsTable = $('#audit-logs-table').DataTable({
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
                    const auditLogDate = data.auditLogCreatedAt;
                    const dateObj = new Date(auditLogDate);
                    const formattedDate = dateObj.toISOString().split('T')[0];
                    return '<span>' + formattedDate + '</span>';
                }
            },
            {
                targets: 1,
                render: function(data, type, row, meta) {
                    return '<span style="color: #525f7f;">' + data.username + '</span>';
                }
            },
            {
                targets: 2,
                render: function(data, type, row, meta) {
                    const action = data.auditLogAction.toLowerCase();
                    let color;
                    let backgroundColor;

                    if (action === 'create') {
                        color = 'yellowgreen';
                        backgroundColor = '#f3fed2';
                    } else if (action === 'update') {
                        color = 'orange';
                        backgroundColor = '#fcf1dd';
                    } else {
                        color = 'grey';
                        backgroundColor = '#f4f4ea';
                    }

                    return '<span style="font-weight: bold;font-size: 10px;display: block;inline-size: fit-content;border-radius:6px;padding: .4rem .6rem;color: ' + color + ';background-color: ' + backgroundColor + ';">' + action.toUpperCase() + '</span>';
                }
            },
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    return '<span style="color: #525f7f;">' + data.auditLogEntity + '</span>';
                },
            },
            {
                targets: 4,
                render: function(data, type, row, meta) {
                    return "Details";
                }
            }
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
        auditLogsTable.draw();
    });

};
