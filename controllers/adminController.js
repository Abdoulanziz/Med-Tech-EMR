const renderDashboard = (req, res) => {
    res.render("admin/dashboard" , {data: {user:req.session.user}});
};


module.exports = { renderDashboard };