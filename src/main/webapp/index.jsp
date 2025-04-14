<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Momentum - Login</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body class="login-body">
    <h1 class="logo-name">Momentum</h1>
    <img src="${pageContext.request.contextPath}/images/momentum_logo.png" alt="Momentum Logo" class="logo">

    <form action="${pageContext.request.contextPath}/signin" method="post" class="login-form">

        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>

        <div class="button-group">
            <button type="submit" name="action" value="signin" class="btn-login">Sign In</button>
            <button type="submit" name="action" value="create" class="btn-create">Create Account</button>
        </div>
        <%
            String errorMessage = (String) request.getAttribute("errorMessage");
            if (errorMessage != null) {
        %>
        <div class="error-message"><%= errorMessage %></div>
        <%
            }
        %>
    </form>

</body>
</html>
