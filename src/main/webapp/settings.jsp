<%@ page import="dev.tylerpac.model.Users" %>
<%@ page import="java.util.List" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Workout History</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body class="dashboard-body">


<div class="sidebar">
    <div class="sidebar-logo">
        <img src="${pageContext.request.contextPath}/images/momentum_logo.png" alt="Logo" class="sidebar-logo-img">
    </div>
    <nav class="sidebar-nav">
        <a href="${pageContext.request.contextPath}/dashboard">Dashboard</a>
        <a href="${pageContext.request.contextPath}/addWorkout">Add Workout</a>

        <a href="${pageContext.request.contextPath}/workout_history">Workout History</a>
        <a href="${pageContext.request.contextPath}/settings">Settings</a>
        <div class="logout-form-container">
            <form action="logout" method="post">
                <button type="submit" class="logout-btn">Logout</button>
            </form>
        </div>
    </nav>
</div>

<div class="main-content">
    <%
        String username = (String) session.getAttribute("username");
        Users user = (Users) request.getAttribute("user");
        // Retrieve the workouts list passed from the servlet
    %>
    <div class="topbar">
        <input type="text" placeholder="Search..." class="search-box">
        <div class="profile">
            <span class="username"><%= username %></span>  <!-- Still displaying the session username -->
            <img src="${pageContext.request.contextPath}/images/momentum_logo.png" class="profile-pic" alt="Profile">
        </div>
    </div>

    <div class="form-container">
        <h2>Settings</h2>
        <form action="${pageContext.request.contextPath}/settings" method="post" class="workout-form">

            <label>Current Username:</label>
            <input type="text" name="username" value="<%= user.getUsername() %>" required>

            <label>Current Password:</label>
            <input type="password" name="currentPassword" placeholder="Enter current password" required>

            <label>New Password:</label>
            <input type="password" name="newPassword" placeholder="Enter new password">

            <button type="submit" class="btn-create">Update Account</button>
        </form>
    </div>

</body>
</html>
