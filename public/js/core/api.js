export const API = {
    // Backend URI
    // BACKEND_BASE_API_URI: (window.location.hostname === 'localhost') ? "http://localhost:5000/api/v1" : "https://med-tech-demo.onrender.com/api/v1",


    BACKEND_BASE_API_URI: (typeof self !== 'undefined' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope')
        ? (((typeof self !== 'undefined' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope') ? false : window.location.hostname === 'localhost') ? "http://localhost:5000/api/v1" : "https://med-tech-demo.onrender.com/api/v1")
        : (((typeof self !== 'undefined' && self.constructor && self.constructor.name === 'DedicatedWorkerGlobalScope') ? false : window.location.hostname === 'localhost') ? "http://localhost:5000/api/v1" : "https://med-tech-demo.onrender.com/api/v1"),





    // Get requests
    makeGetRequest: async (endpoint) => {
        try {
            const response = await fetch(endpoint);
            return await response.json(); 
        } catch (error) {
            console.log(error);
            throw new Error("Failed to make the GET request.");
        }
    },

    // Post requests
    makePostRequest: async (endpoint, data, fromFormData=false) => {
        try {
            let response;
            if(fromFormData){
                response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: data
                });
            }else{
                response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            }
            return await response.json();
        } catch (error) {
            console.log(error);
            throw new Error("Failed to make the POST request.");
        }
    },

    // Patch requests
    makePatchRequest: async (endpoint, data, fromFormData=false) => {
        try {
            let response;
            if(fromFormData){
                response = await fetch(endpoint, {
                    method: "PATCH",
                    body: data
                });
            }else{
                response = await fetch(endpoint, {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            }
            return await response.json();
        } catch (error) {
            console.log(error);
            throw new Error("Failed to make the PATCH request.");
        }
    },

    // Put requests
    makePutRequest: async (endpoint, data, fromFormData=false) => {
        try {
            let response;
            if(fromFormData){
                response = await fetch(endpoint, {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: data
                });
            }else{
                response = await fetch(endpoint, {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            }
            return await response.json();
        } catch (error) {
            console.log(error);
            throw new Error("Failed to make the PUT request.");
        }
    },


    // Patients 
    patients: {
        // Create patient POST api/v1/patients
        create: async (patient, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients`;
            return await API.makePostRequest(endpoint, patient, fromFormData);
        },

        // Fetch all patients GET api/v1/patients
        fetch: async () => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients`;
            return await API.makeGetRequest(endpoint);
        },

        // Fetch single patient GET api/v1/patients/:id
        fetchById: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/${id}`;
            return await API.makeGetRequest(endpoint);
        },

        // Fetch patient GET api/v1/patients/visit/:id
        fetchByVisitId: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/visit/${id}`;
            return await API.makeGetRequest(endpoint);
        },

        // Update patient PUT api/v1/patients/:id
        update: async (id, data, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/${id}`;
            return await API.makePutRequest(endpoint, data, fromFormData);
        },

        // Delete patient POST api/v1/patients/:id
        delete: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/${id}`;
            return await API.makePostRequest(endpoint, id);
        },
    },


    // Visits 
    visits: {
        // Create visit POST api/v1/visits
        create: async (visit, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/visits`;
            return await API.makePostRequest(endpoint, visit, fromFormData);
        },

        // Fetch single visit GET api/v1/visit/:id
        fetchById: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/visit/${id}`;
            return await API.makeGetRequest(endpoint);
        },

        // Fetch single patient's visits GET api/v1/visits/:id
        fetchByPatientId: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/visits/${id}`;
            return await API.makeGetRequest(endpoint);
        },

        // Update visit PUT api/v1/visits/:id
        update: async (id, data, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/visits/${id}`;
            return await API.makePutRequest(endpoint, data, fromFormData);
        },
    },


    // Queues 
    queues: {
        // Add to queue POST api/v1/queues
        addPatient: async (data, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/queues`;
            return await API.makePostRequest(endpoint, data, fromFormData);
        },
    },


    // Triage 
    triages: {
        // Add to triage POST api/v1/triage
        create: async (triage, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/triages`;
            return await API.makePostRequest(endpoint, triage, fromFormData);
        },

        // Update triage PUT api/v1/triages/:id
        update: async (id, data, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/triages/${id}`;
            return await API.makePutRequest(endpoint, data, fromFormData);
        },
    },

     
    // Allergy 
    allergies: {
        // Add to allergy POST api/v1/allergies
        create: async (allergy, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/allergies`;
            return await API.makePostRequest(endpoint, allergy, fromFormData);
        },

        // Update allergy PUT api/v1/allergies/:id
        update: async (id, data, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/allergies/${id}`;
            return await API.makePutRequest(endpoint, data, fromFormData);
        },
    },


    // Tests 
    tests: {
        // Add to tests POST api/v1/tests
        create: async (test, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/tests`;
            return await API.makePostRequest(endpoint, test, fromFormData);
        },

        // Fetch all tests GET api/v1/tests
        fetch: async () => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/tests`;
            return await API.makeGetRequest(endpoint);
        }
    },


    // Lab requests 
    requests: {
        // Add to requests POST api/v1/requests
        create: async (request, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/requests`;
            return await API.makePostRequest(endpoint, request, fromFormData);
        },

        // Update request PUT api/v1/requests/:id
        update: async (id, data, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/requests/${id}`;
            return await API.makePutRequest(endpoint, data, fromFormData);
        },
        
        // Update request PUT api/v1/requests/:requestId
        updatePaymentStatus: async (requestId, status) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/requests/${requestId}/payment-status/${status}`;
            return await API.makePatchRequest(endpoint, {requestId});
        },
    },


    // Bills
    bills: {
        // Fetch all bills GET api/v1/bills/:visitId
        fetch: async (visitId) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/bills/${visitId}`;
            return await API.makeGetRequest(endpoint);
        },

        // Fetch unpaid bills GET api/v1/bills/:visitId
        fetchByStatusUnpaid: async (visitId) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/bills/${visitId}/unpaid`;
            return await API.makeGetRequest(endpoint);
        },
    },


    // Lab results
    results: {
        // CBC
        completeBloodCount: {
            // Add to results POST api/v1/results/complete-blood-count
            create: async (report, fromFormData) => {
                const endpoint = `${API.BACKEND_BASE_API_URI}/results/complete-blood-count`;
                return await API.makePostRequest(endpoint, report, fromFormData);
            },

            // Get CBC results GET api/v1/results/complete-blood-count/:id
            fetchByRequestId: async (id) => {
                const endpoint = `${API.BACKEND_BASE_API_URI}/results/complete-blood-count/${id}`;
                return await API.makeGetRequest(endpoint);
            },
        },

        // Urinalysis
        urinalysis: {
            // Add to results POST api/v1/results/urinalysis
            create: async (report, fromFormData) => {
                const endpoint = `${API.BACKEND_BASE_API_URI}/results/urinalysis`;
                return await API.makePostRequest(endpoint, report, fromFormData);
            },

            // Get CBC results GET api/v1/results/urinalysis/:id
            fetchByRequestId: async (id) => {
                const endpoint = `${API.BACKEND_BASE_API_URI}/results/urinalysis/${id}`;
                return await API.makeGetRequest(endpoint);
            },
        },
    },


    // Medicines 
    medicines: {
        // Add to medicines POST api/v1/medicines
        create: async (medicine, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/medicines`;
            return await API.makePostRequest(endpoint, medicine, fromFormData);
        },

        // Fetch all medicines GET api/v1/medicines
        fetch: async () => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/medicines`;
            return await API.makeGetRequest(endpoint);
        }
    },


    // Prescriptions
    prescriptions: {
        // Add to prescriptions POST api/v1/prescriptions
        create: async (prescription, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/prescriptions`;
            return await API.makePostRequest(endpoint, prescription, fromFormData);
        },

        // Get prescriptions GET api/v1/prescriptions/:visitId
        fetchByVisitId: async (visitId) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/prescriptions/${visitId}`;
            return await API.makeGetRequest(endpoint);
        },
    },


    // Users
    users: {
        // Create user POST api/v1/users
        create: async (user, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/users`;
            return await API.makePostRequest(endpoint, user, fromFormData);
        },

        // Fetch all users GET api/v1/users
        fetch: async () => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/users`;
            return await API.makeGetRequest(endpoint);
        },

        // Fetch single user GET api/v1/users/:id
        fetchById: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/users/${id}`;
            return await API.makeGetRequest(endpoint);
        },

        // Update user POST api/v1/users/:id
        update: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/users/${id}`;
            return await API.makePatchRequest(endpoint, id);
        },

        // Delete user POST api/v1/users/:id
        delete: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/users/${id}`;
            return await API.makePostRequest(endpoint, id);
        },
    },


    // Doctors
    doctors: {
        // Create doctor POST api/v1/doctors
        create: async (doctor, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/doctors`;
            return await API.makePostRequest(endpoint, doctor, fromFormData);
        },

        // Fetch all doctors GET api/v1/doctors
        fetch: async () => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/doctors`;
            return await API.makeGetRequest(endpoint);
        },

        // Fetch single doctor GET api/v1/doctors/:id
        fetchById: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/doctors/${id}`;
            return await API.makeGetRequest(endpoint);
        },

        // Update doctor PUT api/v1/doctors/:id
        update: async (id, data, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/doctors/${id}`;
            return await API.makePutRequest(endpoint, data, fromFormData);
        },

        // Delete doctor POST api/v1/doctors/:id
        delete: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/doctors/${id}`;
            return await API.makePostRequest(endpoint, id);
        },
    },


    // Services
    services: {
        // For Eye
        forEye: {
            // Requests
            requests: {
                // Add to requests POST api/v1/services/eye/requests
                create: async (report, fromFormData) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/eye/requests`;
                    return await API.makePostRequest(endpoint, report, fromFormData);
                },

                // Update request PUT api/v1/services/eye/requests/:id
                update: async (id, data, fromFormData) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/eye/requests/${id}`;
                    return await API.makePutRequest(endpoint, data, fromFormData);
                },

                // Get from requests GET api/v1/services/eye/requests/:id
                fetchByRequestId: async (id) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/eye/requests/${id}`;
                    return await API.makeGetRequest(endpoint);
                },

                // Update request PUT api/v1/services/eye/requests/:id
                updatePaymentStatus: async (id, status) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/eye/requests/${id}/payment-status/${status}`;
                    return await API.makePatchRequest(endpoint, {id});
                },
            },
            // Results
            results: {
                // Add to results POST api/v1/services/eye/results
                create: async (report, fromFormData) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/eye/results`;
                    return await API.makePostRequest(endpoint, report, fromFormData);
                },

                // Get from results GET api/v1/services/eye/results/:id
                fetchByRequestId: async (id) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/eye/results/${id}`;
                    return await API.makeGetRequest(endpoint);
                },
            },
        },

        // For Dental
        forDental: {
            // Requests
            requests: {
                // Add to requests POST api/v1/services/dental/requests
                create: async (report, fromFormData) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/dental/requests`;
                    return await API.makePostRequest(endpoint, report, fromFormData);
                },

                // Update request PUT api/v1/services/dental/requests/:id
                update: async (id, data, fromFormData) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/dental/requests/${id}`;
                    return await API.makePutRequest(endpoint, data, fromFormData);
                },

                // Get from requests GET api/v1/services/dental/requests/:id
                fetchByRequestId: async (id) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/dental/requests/${id}`;
                    return await API.makeGetRequest(endpoint);
                },

                // Update request PUT api/v1/services/dental/requests/:id
                updatePaymentStatus: async (id, status) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/dental/requests/${id}/payment-status/${status}`;
                    return await API.makePatchRequest(endpoint, {id});
                },
            },
            // Results
            results: {
                // Add to results POST api/v1/services/dental/results
                create: async (report, fromFormData) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/dental/results`;
                    return await API.makePostRequest(endpoint, report, fromFormData);
                },

                // Get from results GET api/v1/services/dental/results/:id
                fetchByRequestId: async (id) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/dental/results/${id}`;
                    return await API.makeGetRequest(endpoint);
                },
            },
        },

        // For Cardiology
        forCardiology: {
            // Requests
            requests: {
                // Add to requests POST api/v1/services/cardiology/requests
                create: async (report, fromFormData) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/cardiology/requests`;
                    return await API.makePostRequest(endpoint, report, fromFormData);
                },

                // Update request PUT api/v1/services/cardiology/requests/:id
                update: async (id, data, fromFormData) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/cardiology/requests/${id}`;
                    return await API.makePutRequest(endpoint, data, fromFormData);
                },

                // Get from requests GET api/v1/services/cardiology/requests/:id
                fetchByRequestId: async (id) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/cardiology/requests/${id}`;
                    return await API.makeGetRequest(endpoint);
                },

                // Update request PUT api/v1/services/cardiology/requests/:id
                updatePaymentStatus: async (id, status) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/cardiology/requests/${id}/payment-status/${status}`;
                    return await API.makePatchRequest(endpoint, {id});
                },
            },
            // Results
            results: {
                // Add to results POST api/v1/services/cardiology/results
                create: async (report, fromFormData) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/cardiology/results`;
                    return await API.makePostRequest(endpoint, report, fromFormData);
                },

                // Get from results GET api/v1/services/cardiology/results/:id
                fetchByRequestId: async (id) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/cardiology/results/${id}`;
                    return await API.makeGetRequest(endpoint);
                },
            },
        },

        // For Radiology
        forRadiology: {
            // Requests
            requests: {
                // Add to requests POST api/v1/services/radiology/requests
                create: async (report, fromFormData) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/radiology/requests`;
                    return await API.makePostRequest(endpoint, report, fromFormData);
                },

                // Update request PUT api/v1/services/radiology/requests/:id
                update: async (id, data, fromFormData) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/radiology/requests/${id}`;
                    return await API.makePutRequest(endpoint, data, fromFormData);
                },

                // Get from requests GET api/v1/services/radiology/requests/:id
                fetchByRequestId: async (id) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/radiology/requests/${id}`;
                    return await API.makeGetRequest(endpoint);
                },

                // Update request PUT api/v1/services/radiology/requests/:id
                updatePaymentStatus: async (id, status) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/radiology/requests/${id}/payment-status/${status}`;
                    return await API.makePatchRequest(endpoint, {id});
                },
            },
            // Results
            results: {
                // Add to results POST api/v1/services/radiology/results
                create: async (report, fromFormData) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/radiology/results`;
                    return await API.makePostRequest(endpoint, report, fromFormData);
                },

                // Get from results GET api/v1/services/radiology/results/:id
                fetchByRequestId: async (id) => {
                    const endpoint = `${API.BACKEND_BASE_API_URI}/services/radiology/results/${id}`;
                    return await API.makeGetRequest(endpoint);
                },
            },
        },
    },


    // Finance operations
    finance: {
        // Income
        income: {

        },

        // Expenses
        expenses: {
            // Create expense record POST api/v1/finance/expenses
            create: async (expense, fromFormData) => {
                const endpoint = `${API.BACKEND_BASE_API_URI}/finance/expenses`;
                return await API.makePostRequest(endpoint, expense, fromFormData);
            },
        }

    },


    // Data analytics
    analytics: {
        // Patients
        patients: {
            // Fetch new patients number for month
            // GET api/v1/analytics/patients/new/:startDate/:endDate
            fetchNewPatientsCountForMonth: async (startDate, endDate) => {
                const endpoint = `${API.BACKEND_BASE_API_URI}/analytics/patients/new/${startDate}/${endDate}`;
                return await API.makeGetRequest(endpoint);
            },

            // Fetch repeat patients number for month
            // GET api/v1/analytics/patients/repeat/:startDate/:endDate
            fetchRepeatPatientsCountForMonth: async (startDate, endDate) => {
                const endpoint = `${API.BACKEND_BASE_API_URI}/analytics/patients/repeat/${startDate}/${endDate}`;
                return await API.makeGetRequest(endpoint);
            },

        },

    },
}