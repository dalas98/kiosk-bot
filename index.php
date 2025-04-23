<?php
$serverUri = $_SERVER["REQUEST_URI"];

// 1. Parse the URI to get *only* the path part
$path = parse_url($serverUri, PHP_URL_PATH);

// 2. Trim leading/trailing slashes for cleaner handling
$path = trim($path, '/');

// 3. Set default if the path is empty (root request '/')
if (empty($path)) {
    $path = 'index';
}

// 4. SECURITY: Prevent path traversal. Use basename() to ensure only the
//    last component of the path is used, stripping directory separators.
$safePath = basename($path);

// 5. Construct the filename CORRECTLY (without query string)
$filename = __DIR__ . '/' . $safePath . '.html';

// --- The rest of your code ---
if (file_exists($filename)) {
    // Optional: Set content type for HTML
    header('Content-Type: text/html; charset=utf-8');
    readfile($filename);
} else {
    // Send a proper 404 status code
    http_response_code(404);
    echo "Error 404: File not found!";
    // Optional: Log the error for debugging
    // error_log("Attempted to access non-existent file: " . $filename . " from URI: " . $serverUri);
}
// It's good practice to exit after handling the request
exit;
?>
