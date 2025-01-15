import { API } from "../core/api.js";

self.addEventListener("message", async event => {

  if(event.data.code === 1){
    // Variable to store the result
    let resultData;

    // Process the data
    try {
      const response = await API.tests.fetch();
      const data = await response.data;
      resultData = data;
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    // Send the results to the main thread
    self.postMessage({code: 1, data: resultData});
  }


    

});