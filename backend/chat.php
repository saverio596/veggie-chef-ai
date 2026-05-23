<?php
// ── CORS ───────────────────────────────────────────────────────────────────
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => true, 'message' => 'Metodo non consentito.']);
    exit();
}

// ── AUTOLOADER & ENV ───────────────────────────────────────────────────────
require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$spoonacularApiKey = $_ENV['SPOONACULAR_API_KEY'] ?? null;

if (!$spoonacularApiKey || $spoonacularApiKey === 'your_api_key_here') {
    echo json_encode(['error' => true, 'message' => 'SPOONACULAR_API_KEY mancante nel file .env']);
    exit();
}

// ── INPUT ──────────────────────────────────────────────────────────────────
$body = json_decode(file_get_contents('php://input'), true);
$userQuery = trim($body['query'] ?? '');

if (empty($userQuery)) {
    echo json_encode(['error' => true, 'message' => 'Nessuna query ricevuta.']);
    exit();
}

// ── TRADUZIONE QUERY → INGLESE (semplice keyword map) ─────────────────────
// Spoonacular lavora meglio in inglese
$translations = [
    'insalata' => 'salad',
    'pasta' => 'pasta',
    'colazione' => 'breakfast',
    'zuppa' => 'soup',
    'messicano' => 'mexican',
    'dolce' => 'dessert',
    'vegano' => 'vegan',
    'veloce' => 'quick',
    'proteico' => 'protein',
    'comfort' => 'comfort',
    'energetico' => 'energy',
    'zucchero' => 'sugar free',
    'fresco' => 'fresh',
];

$englishQuery = mb_strtolower($userQuery, 'UTF-8');
foreach ($translations as $it => $en) {
    $englishQuery = str_ireplace($it, $en, $englishQuery);
}
// Rimuovi caratteri non ASCII rimasti (per sicurezza)
$englishQuery = preg_replace('/[^\x00-\x7F]/', ' ', $englishQuery);
$englishQuery = trim(preg_replace('/\s+/', ' ', $englishQuery));

// ── CHIAMATA SPOONACULAR ───────────────────────────────────────────────────
/**
 * Cerca ricette su Spoonacular.
 * Docs: https://spoonacular.com/food-api/docs#Search-Recipes-Complex
 */
function searchRecipes(string $query, string $apiKey, int $number = 6): array
{
    $params = http_build_query([
        'query' => $query,
        'diet' => 'vegetarian',   // solo plant-based / vegetariane
        'number' => $number,
        'addRecipeInformation' => 'true',  // include readyInMinutes, servings, summary
        'fillIngredients' => 'false',
        'apiKey' => $apiKey,
    ]);

    $url = "https://api.spoonacular.com/recipes/complexSearch?{$params}";

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => ['Accept: application/json'],
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        return ['error' => true, 'message' => "Errore di rete: {$curlError}"];
    }

    if ($httpCode !== 200) {
        $decoded = json_decode($response, true);
        $msg = $decoded['message'] ?? "HTTP {$httpCode}";
        return ['error' => true, 'message' => "Spoonacular: {$msg}"];
    }

    $data = json_decode($response, true);
    return $data['results'] ?? [];
}

/**
 * Mappa un risultato Spoonacular nel formato atteso dal frontend.
 */
function mapRecipe(array $r): array
{
    return [
        'id' => $r['id'] ?? null,
        'title' => $r['title'] ?? 'Ricetta senza nome',
        'image' => $r['image'] ?? null,
        'readyInMinutes' => $r['readyInMinutes'] ?? null,
        'servings' => $r['servings'] ?? null,
        'healthScore' => isset($r['healthScore']) ? (int) $r['healthScore'] : null,
        'summary' => $r['summary'] ?? null,
        'sourceUrl' => $r['sourceUrl'] ?? null,
    ];
}

// ── ESEGUI RICERCA ─────────────────────────────────────────────────────────
$results = searchRecipes($englishQuery, $spoonacularApiKey);

if (isset($results['error'])) {
    echo json_encode($results);
    exit();
}

if (empty($results)) {
    // Fallback: ricerca generica vegetariana
    $results = searchRecipes('vegetarian healthy', $spoonacularApiKey, 4);
}

$recipes = array_map('mapRecipe', $results);

// ── MESSAGGIO RISPOSTA ─────────────────────────────────────────────────────
$count = count($recipes);
if ($count > 0) {
    $messages = [
        "Ho trovato {$count} ricette plant-based per te! 🌿",
        "Eccole! Spero ti ispirino 🥦",
        "Perfetto, ho trovato qualcosa di delizioso! 🍃",
        "Ecco le mie proposte plant-based 🌱",
    ];
    $message = $messages[array_rand($messages)];
} else {
    $message = "Non ho trovato ricette specifiche per questa richiesta. Prova con parole più generali!";
}

// ── RISPOSTA FINALE ────────────────────────────────────────────────────────
echo json_encode([
    'success' => true,
    'message' => $message,
    'recipes' => $recipes,
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);