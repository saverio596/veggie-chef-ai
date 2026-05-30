<?php
class RAGService {
    private $geminiService;
    private $recipesFile;

    public function __construct(GeminiService $geminiService) {
        $this->geminiService = $geminiService;
        $this->recipesFile = STORAGE_PATH . '/recipes.json';
    }

    public function search($query, $topK = 5) {
        if (!file_exists($this->recipesFile)) {
            return [];
        }

        $recipes = json_decode(file_get_contents($this->recipesFile), true) ?: [];
        if (empty($recipes)) {
            return [];
        }

        // Generate embedding for the search query
        $queryEmbedding = $this->geminiService->generateEmbedding($query);
        if (!$queryEmbedding) {
            return [];
        }

        // Calculate cosine similarity for all recipes
        $results = [];
        foreach ($recipes as $recipe) {
            if (!isset($recipe['embedding'])) continue;
            
            $similarity = $this->cosineSimilarity($queryEmbedding, $recipe['embedding']);
            
            // Exclude the embedding from the returned result to save bandwidth
            unset($recipe['embedding']);
            $recipe['similarity'] = $similarity;
            
            $results[] = $recipe;
        }

        // Sort by similarity descending
        usort($results, function($a, $b) {
            return $b['similarity'] <=> $a['similarity'];
        });

        // Return top K
        return array_slice($results, 0, $topK);
    }

    private function cosineSimilarity(array $a, array $b): float {
        $dot = $normA = $normB = 0;
        $count = min(count($a), count($b));
        
        for ($i = 0; $i < $count; $i++) {
            $dot += $a[$i] * $b[$i];
            $normA += $a[$i] ** 2;
            $normB += $b[$i] ** 2;
        }
        
        if ($normA == 0 || $normB == 0) return 0;
        
        return $dot / (sqrt($normA) * sqrt($normB));
    }
}
