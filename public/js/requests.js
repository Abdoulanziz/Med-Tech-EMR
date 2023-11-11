export const API = {
    // Backend URI
    BACKEND_BASE_API_URI: (window.location.hostname === 'localhost') ? "http://localhost:5000/api/v1" : "https://med-tech-demo.onrender.com/api/v1",


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


    // Patients 
    patients: {
        // Create patient POST api/v1/patients
        create: async (patient, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients`;
            return await API.makePostRequest(endpoint, patient, fromFormData);
        },

        // Fetch single patient GET api/v1/patients/:id
        fetchSingle: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/${id}`;
            return await API.makeGetRequest(endpoint);
        },

        // Fetch all patients GET api/v1/patients
        fetchAll: async () => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients`;
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

        // Fetch patient GET api/v1/visit/:id/patient
        fetchPatientByVisitId: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/visit/${id}/patient`;
            return await API.makeGetRequest(endpoint);
        }
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
        fetchAll: async () => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/tests`;
            return await API.makeGetRequest(endpoint);
        }
    },


    // Diagnoses 
    diagnoses: {
        // Add to diagnoses POST api/v1/diagnoses
        create: async (diagnosis, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/diagnoses`;
            return await API.makePostRequest(endpoint, diagnosis, fromFormData);
        },

        // Fetch all bills GET api/v1/diagnoses-bills/:visitId
        fetchAllBills: async (visitId) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/diagnoses/bill/${visitId}`;
            return await API.makeGetRequest(endpoint);
        }
    },


    // Lab requests 
    requests: {
        // Add to requests POST api/v1/requests
        create: async (request, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/requests`;
            return await API.makePostRequest(endpoint, request, fromFormData);
        }
    },


    // Diagnosis reports 
    reports: {
        // Add to diagnosis-reports POST api/v1/reports
        create: async (report, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/reports`;
            return await API.makePostRequest(endpoint, report, fromFormData);
        },

        // Fetch single report GET api/v1/reports/:id
        fetchByDiagnosisId: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/reports/${id}`;
            return await API.makeGetRequest(endpoint);
        },
    },
}