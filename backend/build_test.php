<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<pre>=== BUILD CHECK START ===\n";

$assetsDir = __DIR__ . "/assets";

// 1. Check if /assets directory exists
echo "ASSETS DIR: $assetsDir\n";
if (!is_dir($assetsDir)) {
    echo "❌ ERROR: /assets directory NOT FOUND\n";
    echo "Likely wrong upload path.\n";
    exit;
}

// 1.5 List ALL files + folders inside /assets
echo "\nCONTENTS OF /assets:\n";
$allFiles = scandir($assetsDir);

if ($allFiles === false) {
    echo "❌ Could not read directory contents\n";
} else {
    foreach ($allFiles as $f) {
        echo " - $f\n";
    }
}

// 2. Find ALL .js files recursively in /assets (handles /assets/js/, /assets/build/, etc)
echo "\nSCANNING FOR JS FILES (recursive)...\n";

$files = glob($assetsDir . '/**/*.js', GLOB_BRACE);

echo "\nJS FILES FOUND:\n";
if (!$files || count($files) === 0) {
    echo "❌ No JS bundle found anywhere in /assets\n";
    exit;
}

foreach ($files as $f) {
    echo " - " . str_replace($assetsDir . '/', '', $f) . "\n";
}

// Use first JS file found
$firstJs = $files[0];

echo "\nUSING JS FILE: " . basename($firstJs) . "\n";

// 3. Load JS file and test for `localhost`
echo "\nCHECKING BUNDLE FOR 'localhost'...\n";

try {
    $bundle = file_get_contents($firstJs);

    if ($bundle === false) {
        echo "❌ Could not read JS bundle file\n";
        exit;
    }

    if (strpos($bundle, 'localhost') !== false) {
        echo "❌ localhost FOUND — OLD/DEV BUILD STILL DEPLOYED\n";
    } else {
        echo "✅ localhost NOT found — PRODUCTION BUILD OK\n";
    }

} catch (Exception $e) {
    echo "❌ ERROR reading bundle: " . $e->getMessage() . "\n";
    exit;
}

echo "\n=== BUILD CHECK END ===</pre>";
