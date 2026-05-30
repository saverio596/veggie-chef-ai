<?php
require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$requiredVars = ['GEMINI_API_KEY', 'SPOONACULAR_API_KEY'];
foreach ($requiredVars as $var) {
    if (!isset($_ENV[$var])) {
        die("Missing required environment variable: $var\n");
    }
}

define('GEMINI_KEY', $_ENV['GEMINI_API_KEY']);
define('SPOONACULAR_KEY', $_ENV['SPOONACULAR_API_KEY']);
define('STORAGE_PATH', __DIR__ . '/storage');

if (!is_dir(STORAGE_PATH)) {
    mkdir(STORAGE_PATH, 0777, true);
}
if (!is_dir(STORAGE_PATH . '/conversations')) {
    mkdir(STORAGE_PATH . '/conversations', 0777, true);
}
if (!file_exists(STORAGE_PATH . '/recipes.json')) {
    file_put_contents(STORAGE_PATH . '/recipes.json', json_encode([]));
}
