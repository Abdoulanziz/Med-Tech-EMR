const renderDashboard = (req, res) => {
    res.render("admin/dashboard" , {data: {user:req.session.user}});
};

const renderServices = (req, res) => {
    res.render("admin/services" , {data: {user:req.session.user}});
};

const renderAccounts = (req, res) => {
    res.render("admin/accounts" , {data: {user:req.session.user}});
};

const renderActivities = (req, res) => {
    res.render("admin/activities" , {data: {user:req.session.user}});
};

const renderInventory = (req, res) => {
    res.render("admin/inventory" , {data: {user:req.session.user}});
};

const renderReports = (req, res) => {
    res.render("admin/reports" , {data: {user:req.session.user}});
};

const renderSettings = (req, res) => {
    res.render("admin/settings" , {data: {user:req.session.user}});
};


module.exports = { renderDashboard, renderServices, renderAccounts, renderActivities, renderInventory, renderReports, renderSettings };