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

        // Update patient POST api/v1/patients/:id
        update: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/${id}`;
            return await API.makePatchRequest(endpoint, id);
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

        // Fetch single patient GET api/v1/visits/:id
        fetchByPatientId: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/visits/${id}`;
            return await API.makeGetRequest(endpoint);
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
    triage: {
        // Add to triage POST api/v1/triage
        create: async (triage, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/triage`;
            return await API.makePostRequest(endpoint, triage, fromFormData);
        },
    },

     
    // Allergy 
    allergy: {
        // Add to allergy POST api/v1/allergy
        create: async (allergy, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/allergy`;
            return await API.makePostRequest(endpoint, allergy, fromFormData);
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
        
        // Update request POST api/v1/requests/:requestId
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


    // Admin API
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

        // Update doctor POST api/v1/doctors/:id
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
}