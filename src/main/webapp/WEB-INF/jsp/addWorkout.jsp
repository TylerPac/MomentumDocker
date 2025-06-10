<%@ page import="dev.tylerpac.momentum.model.Users" %>
<%@ page import="java.util.List" %>
<%
    String username = (String) session.getAttribute("username");
    Users user = (Users) request.getAttribute("user");
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Momentum - Add Workout</title>
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

        <a href="#">Progress</a>
        <a href="#">Profile</a>
        <a href="#">Settings</a>
        <div class="logout-form-container">
            <form action="logout" method="post">
                <button type="submit" class="logout-btn">Logout</button>
            </form>
        </div>
    </nav>
</div>

<div class="main-content">
    <div class="topbar">
        <input type="text" placeholder="Search..." class="search-box">
        <div class="profile">
            <span class="username"><%= username %></span>
            <img src="${pageContext.request.contextPath}/images/momentum_logo.png" class="profile-pic" alt="Profile">
        </div>
    </div>

    <div class="form-container">
        <h2>Add a New Workout</h2>
        <form action="${pageContext.request.contextPath}/addWorkout" method="post" class="workout-form">

            <label>Workout Type:</label>
            <select id="workoutType" name="workoutType" onchange="updateForm()" required>
                <option value="">Select Type</option>
                <option value="Cardio">Cardio</option>
                <option value="Weightlifting">Weightlifting</option>
            </select>
            <label>Workout Date:</label>
            <input type="date" name="workoutDate" required>
            <label>Workout Name:</label>
            <input list="workoutNames" name="workoutName" placeholder="Enter or pick a name" required>
            <datalist id="workoutNames">
                <%
                    List<String> workoutNames = (List<String>) request.getAttribute("workoutNames");
                    if (workoutNames != null) {
                        for (String name : workoutNames) {
                %>
                <option value="<%= name %>">
                        <%
      }
    }
  %>
            </datalist>

            <div id="metricsSection">
                <!-- Dynamic fields will go here -->
            </div>

            <button type="submit" class="btn-create">Add Workout</button>

        </form>
    </div>

    <script>
        function updateForm() {
            const type = document.getElementById("workoutType").value;
            const metricsSection = document.getElementById("metricsSection");
            metricsSection.innerHTML = "";  // Clear previous fields

            if (type === "Cardio") {
                metricsSection.innerHTML = `
      <label>Distance (Miles):</label>
      <input type="number" name="distance" step="any" placeholder="Enter distance" required>

      <label>Time (Minutes):</label>
      <input type="number" name="time" step="any" placeholder="Enter time" required>
    `;
            } else if (type === "Weightlifting") {
                metricsSection.innerHTML = `
      <label>Weight (Pounds):</label>
      <input type="number" name="weight" step="any" placeholder="Enter weight" required>

      <label>Reps:</label>
      <input type="number" name="reps" placeholder="Enter reps" required>
    `;
            }
        }
    </script>



</div>

</body>
</html>
