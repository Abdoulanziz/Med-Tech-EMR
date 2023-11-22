const renderDashboard = (req, res) => {
    res.render("admin/dashboard" , {data: {user:req.session.user}});
};

const renderAccounts = (req, res) => {
    res.render("admin/accounts" , {data: {user:req.session.user}});
};


module.exports = { renderDashboard, renderAccounts };