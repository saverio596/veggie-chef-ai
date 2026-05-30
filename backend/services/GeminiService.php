<?php
class GeminiService {
    private $apiKey;

    public function __construct() {
        $this->apiKey = GEMINI_KEY;
    }

    public function chatCompletion($contents, $tools = null, $systemInstruction = null) {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $this->apiKey;
        
        $data = ['contents' => $contents];
        
        if ($tools) {
            $data['tools'] = $tools;
        }

        if ($systemInstruction) {
            $data['systemInstruction'] = [
                'parts' => [['text' => $systemInstruction]]
            ];
        }

        return $this->makeRequest($url, $data);
    }

    public function generateEmbedding($text) {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=" . $this->apiKey;
        
        $data = [
            'model' => 'models/text-embedding-004',
            'content' => [
                'parts' => [['text' => $text]]
            ]
        ];

        $response = $this->makeRequest($url, $data);
        return $response['embedding']['values'] ?? null;
    }

    public function generateSignaturePhrase($recipeData) {
        $prompt = "Sei un copywriter esperto di cibo. Crea una frase breve, appetitosa e caratteristica in italiano per questa ricetta, evidenziandone i punti forti. Solo la frase, senza virgolette o introduzioni.\n\nTitolo: " . $recipeData['title'] . "\nIngredienti principali: " . implode(", ", array_slice(array_map(function($i){ return $i['name'] ?? ''; }, $recipeData['extendedIngredients'] ?? []), 0, 5)) . "\nTempo: " . ($recipeData['readyInMinutes'] ?? 'N/A') . " min.";
        
        $contents = [
            [
                'role' => 'user',
                'parts' => [['text' => $prompt]]
            ]
        ];

        $response = $this->chatCompletion($contents);
        
        return $response['candidates'][0]['content']['parts'][0]['text'] ?? $recipeData['title'];
    }

    private function makeRequest($url, $data) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json"
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        
        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new Exception("CURL Error: $error");
        }

        $decoded = json_decode($response, true);
        if (isset($decoded['error'])) {
            throw new Exception("Gemini API Error: " . json_encode($decoded['error']));
        }

        return $decoded;
    }
}
