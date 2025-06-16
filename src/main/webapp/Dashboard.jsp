<%@ page import="dev.tylerpac.model.Users" %>
<%@ page import="dev.tylerpac.model.Workout" %>
<%@ page import="java.util.List" %>
<%@ page import="java.sql.Date" %>
<%@ page import="java.lang.Float" %>

<%
  String username = (String) session.getAttribute("username");
  Workout latestWorkout = (Workout) request.getAttribute("latestWorkout");
  List<Workout> workoutDetails = (List<Workout>) request.getAttribute("workoutDetails");
  List<Float> graph1Values = (List<Float>) request.getAttribute("graph1Values");
  List<Float> graph2Values = (List<Float>) request.getAttribute("graph2Values");
  List<java.sql.Date> sortedDates = (List<java.sql.Date>) request.getAttribute("sortedDates");
  String jsonGraph1Values = (String) request.getAttribute("jsonGraph1Values");
  String jsonGraph2Values = (String) request.getAttribute("jsonGraph2Values");
  String jsonSortedDates = (String) request.getAttribute("jsonSortedDates");
  int totalWorkouts = (workoutDetails != null) ? workoutDetails.size() : 0;
%>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Momentum - Dashboard</title>
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

  <div class="dashboard-widgets">
    <div class="widget">Latest Workout<br>
      <strong><%= latestWorkout != null ? latestWorkout.getWorkoutType() + " — " + latestWorkout.getWorkoutName() : "None" %></strong>
    </div>
    <div class="widget">Current Streak<br>
      <strong>5</strong> <!-- Optional: make dynamic later -->
    </div>
    <div class="widget">Total Workouts<br>
      <strong><%= totalWorkouts %></strong>
    </div>
  </div>

  <div class="dashboard-chart">
    <h2><%= latestWorkout != null ? latestWorkout.getWorkoutType() : "Workout" %> Progress</h2>

    <% if (workoutDetails != null && !workoutDetails.isEmpty()) { %>
    <canvas id="workoutChart1"></canvas>
    <canvas id="workoutChart2"></canvas>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
      <%
        String workoutType = (latestWorkout != null) ? latestWorkout.getWorkoutType() : "";
        String graph1Label = "Graph 1";
        String graph2Label = "Graph 2";

        if ("Cardio".equals(workoutType)) {
            graph1Label = "Average Pace (min/mile)";
            graph2Label = "Distance (miles)";
        } else if ("Weightlifting".equals(workoutType)) {
            graph1Label = "Weight (lbs)";
            graph2Label = "Reps";
        }
      %>

      const labels = <%= jsonSortedDates %>;
      const graph1Data = <%= jsonGraph1Values %>;
      const graph2Data = <%= jsonGraph2Values %>;
      const graph1Label = "<%= graph1Label %>";
      const graph2Label = "<%= graph2Label %>";

      const ctx1 = document.getElementById('workoutChart1').getContext('2d');
      new Chart(ctx1, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: graph1Label,
            data: graph1Data,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                autoSkip: true,
                maxTicksLimit: 10
              }
            }
          }
        }
      });

      const ctx2 = document.getElementById('workoutChart2').getContext('2d');
      new Chart(ctx2, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: graph2Label,
            data: graph2Data,
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 2,
            fill: false
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                autoSkip: true,
                maxTicksLimit: 10
              }
            }
          }
        }
      });
    </script>
    <% } else { %>
    <p>No workout data to display yet.</p>
    <% } %>
  </div>
</div>

</body>
</html>
