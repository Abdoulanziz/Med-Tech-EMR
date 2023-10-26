const renderPatients = (req, res) => {
    res.render("pages/patients" , {data: {user:req.session.user}});
};

const renderVisits = (req, res) => {
    res.render("pages/visits" , {data: {user:req.session.user}});
};

const renderQueues = (req, res) => {
    res.render("pages/queues" , {data: {user:req.session.user}});
};


module.exports = { renderPatients, renderVisits, renderQueues };