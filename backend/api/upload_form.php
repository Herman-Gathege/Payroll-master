<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>File Upload Test</title>
</head>
<body>
  <h2>Upload a File</h2>
  <form action="upload.php" method="POST" enctype="multipart/form-data">
    <label>Select file:</label><br>
    <input type="file" name="file" required><br><br>

    <label>Uploaded By:</label><br>
    <input type="text" name="uploaded_by" value="Lee" required><br><br>

    <button type="submit">Upload File</button>
  </form>
</body>
</html>
