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

        // Fetch all patients GET api/v1/patients/fetch
        fetchAll: async () => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/fetch/all`;
            return await API.makeGetRequest(endpoint);
        },

        // Update patient POST api/v1/patients/update/
        update: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/update`;
            return await API.makePatchRequest(endpoint, id);
        },

        // Delete patient POST api/v1/patients/delete
        delete: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/delete`;
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

        // Fetch single patient GET api/v1/patients/:id
        fetchByPatientId: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/visits/${id}`;
            return await API.makeGetRequest(endpoint);
        },

        // Fetch all patients GET api/v1/patients/fetch
        fetchAll: async () => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/fetch/all`;
            return await API.makeGetRequest(endpoint);
        },

        // Update patient POST api/v1/patients/update/
        update: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/update`;
            return await API.makePatchRequest(endpoint, id);
        },

        // Delete patient POST api/v1/patients/delete
        delete: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/delete`;
            return await API.makePostRequest(endpoint, id);
        },
    },


    // Queues 
    queues: {
        // Add to queue POST api/v1/queues
        addPatient: async (data, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/queues`;
            return await API.makePostRequest(endpoint, data, fromFormData);
        },

        // Fetch single patient GET api/v1/patients/:id
        fetchByPatientId: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/visits/${id}`;
            return await API.makeGetRequest(endpoint);
        },

        // Fetch all patients GET api/v1/patients/fetch
        fetchAll: async () => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/fetch/all`;
            return await API.makeGetRequest(endpoint);
        },

        // Update patient POST api/v1/patients/update/
        update: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/update`;
            return await API.makePatchRequest(endpoint, id);
        },

        // Delete patient POST api/v1/patients/delete
        delete: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/delete`;
            return await API.makePostRequest(endpoint, id);
        },
    },


    // Triage 
    triage: {
        // Add to triage POST api/v1/triage
        create: async (triage, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/triage`;
            return await API.makePostRequest(endpoint, triage, fromFormData);
        },

        // Fetch single patient GET api/v1/patients/:id
        fetchByPatientId: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/visits/${id}`;
            return await API.makeGetRequest(endpoint);
        },

        // Fetch all patients GET api/v1/patients/fetch
        fetchAll: async () => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/fetch/all`;
            return await API.makeGetRequest(endpoint);
        },

        // Update patient POST api/v1/patients/update/
        update: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/update`;
            return await API.makePatchRequest(endpoint, id);
        },

        // Delete patient POST api/v1/patients/delete
        delete: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/delete`;
            return await API.makePostRequest(endpoint, id);
        },
    },

     
    // Allergy 
    allergy: {
        // Add to allergy POST api/v1/allergy
        create: async (allergy, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/allergy`;
            return await API.makePostRequest(endpoint, allergy, fromFormData);
        },

        // Fetch single patient GET api/v1/patients/:id
        fetchByPatientId: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/visits/${id}`;
            return await API.makeGetRequest(endpoint);
        },

        // Fetch all patients GET api/v1/patients/fetch
        fetchAll: async () => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/fetch/all`;
            return await API.makeGetRequest(endpoint);
        },

        // Update patient POST api/v1/patients/update/
        update: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/update`;
            return await API.makePatchRequest(endpoint, id);
        },

        // Delete patient POST api/v1/patients/delete
        delete: async (id) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/patients/delete`;
            return await API.makePostRequest(endpoint, id);
        },
    },


    // Diagnoses 
    diagnoses: {
        // Add to diagnoses POST api/v1/diagnoses
        create: async (diagnosis, fromFormData) => {
            const endpoint = `${API.BACKEND_BASE_API_URI}/diagnoses`;
            return await API.makePostRequest(endpoint, diagnosis, fromFormData);
        },
    },
}