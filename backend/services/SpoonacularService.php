<?php
class SpoonacularService {
    private $apiKey;
    private $recipesFile;

    public function __construct() {
        $this->apiKey = SPOONACULAR_KEY;
        $this->recipesFile = STORAGE_PATH . '/recipes.json';
    }

    public function fetchRecipes($query, $diet = 'vegetarian', $number = 10) {
        $url = "https://api.spoonacular.com/recipes/complexSearch?" . http_build_query([
            'apiKey' => $this->apiKey,
            'query' => $query,
            'diet' => $diet,
            'number' => $number,
            'addRecipeInformation' => 'true',
            'fillIngredients' => 'true'
        ]);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);
        return $data['results'] ?? [];
    }

    public function syncRecipes($query, $diet, $number, GeminiService $gemini) {
        $results = $this->fetchRecipes($query, $diet, $number);
        
        $stats = [
            'fetched' => count($results),
            'added' => 0,
            'updated' => 0
        ];

        if (empty($results)) return $stats;

        $existingRecipes = [];
        if (file_exists($this->recipesFile)) {
            $existingRecipes = json_decode(file_get_contents($this->recipesFile), true) ?: [];
        }

        $existingById = [];
        foreach ($existingRecipes as $r) {
            $existingById[$r['id']] = $r;
        }

        foreach ($results as $recipe) {
            $id = $recipe['id'];
            $isNew = !isset($existingById[$id]);

            // Format recipe
            $formatted = [
                'id' => $id,
                'title' => $recipe['title'],
                'sourceUrl' => $recipe['sourceUrl'] ?? '',
                'summary' => strip_tags($recipe['summary'] ?? ''),
                'ingredients' => array_map(function($i) { return $i['original'] ?? $i['name']; }, $recipe['extendedIngredients'] ?? []),
                'instructions' => array_map(function($i) { return $i['step'] ?? ''; }, $recipe['analyzedInstructions'][0]['steps'] ?? []),
                'image' => $recipe['image'] ?? '',
                'cuisine' => implode(', ', $recipe['cuisines'] ?? []),
                'dishTypes' => $recipe['dishTypes'] ?? [],
                'diets' => $recipe['diets'] ?? [],
                'servings' => $recipe['servings'] ?? null,
                'readyInMinutes' => $recipe['readyInMinutes'] ?? null,
            ];

            // Generate signature phrase if new or missing
            if ($isNew || !isset($existingById[$id]['signaturePhrase'])) {
                $formatted['signaturePhrase'] = $gemini->generateSignaturePhrase($recipe);
            } else {
                $formatted['signaturePhrase'] = $existingById[$id]['signaturePhrase'];
            }

            // Text for embedding
            $textToEmbed = "Title: {$formatted['title']}\n" .
                           "Summary: {$formatted['summary']}\n" .
                           "Signature: {$formatted['signaturePhrase']}\n" .
                           "Ingredients: " . implode(', ', $formatted['ingredients']);

            // Generate embedding if new or missing
            if ($isNew || !isset($existingById[$id]['embedding'])) {
                $formatted['embedding'] = $gemini->generateEmbedding($textToEmbed);
                // Sleep slightly to avoid rate limit
                usleep(500000); 
            } else {
                $formatted['embedding'] = $existingById[$id]['embedding'];
            }

            if ($isNew) {
                $stats['added']++;
            } else {
                $stats['updated']++;
            }

            $existingById[$id] = $formatted;
        }

        file_put_contents($this->recipesFile, json_encode(array_values($existingById), JSON_PRETTY_PRINT));
        return $stats;
    }
}
