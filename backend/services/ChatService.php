<?php
class ChatService {
    private $geminiService;
    private $ragService;
    private $conversationsDir;

    private $systemInstruction = "Sei VeggieChef, un assistente culinario intelligente specializzato in cucina vegetariana e plant-based.\n\nOBIETTIVI:\n- Aiuta l'utente a trovare la ricetta ideale\n- Fai domande quando mancano informazioni (tipo di piatto, ingredienti, tempo, persone)\n- NON usare searchRecipes se la richiesta è vaga\n- Usa searchRecipes SOLO quando hai abbastanza dettagli\n- Presenta le ricette in modo appetitoso con emoji\n- Mantieni una conversazione naturale\n\nCOMPORTAMENTO:\n- \"Voglio una ricetta\" -> chiedi chiarimenti\n- \"Pasta veloce vegetariana\" -> usa searchRecipes\n- Non mostrare mai dettagli tecnici all'utente\n- Rispondi sempre in italiano";

    private $tools = [
        [
            "functionDeclarations" => [
                [
                    "name" => "searchRecipes",
                    "description" => "Cerca ricette nella knowledge base. Usa questo tool quando l'utente ha fornito abbastanza informazioni.",
                    "parameters" => [
                        "type" => "OBJECT",
                        "properties" => [
                            "query" => [
                                "type" => "STRING",
                                "description" => "Query di ricerca per il tipo di ricetta desiderata"
                            ]
                        ],
                        "required" => ["query"]
                    ]
                ]
            ]
        ]
    ];

    public function __construct(GeminiService $geminiService, RAGService $ragService) {
        $this->geminiService = $geminiService;
        $this->ragService = $ragService;
        $this->conversationsDir = STORAGE_PATH . '/conversations';
    }

    public function handleMessage($messageText, $conversationId = null) {
        if (!$conversationId) {
            $conversationId = bin2hex(random_bytes(16));
            $conversation = [
                'id' => $conversationId,
                'title' => 'Nuova Conversazione',
                'createdAt' => date('c'),
                'updatedAt' => date('c'),
                'messages' => []
            ];
        } else {
            $conversation = $this->getConversation($conversationId);
            if (!$conversation) {
                throw new Exception("Conversation not found");
            }
        }

        // Add user message
        $conversation['messages'][] = [
            'role' => 'user',
            'parts' => [['text' => $messageText]]
        ];

        // Format for Gemini
        $contents = $this->formatMessagesForGemini($conversation['messages']);

        // First call to Gemini
        $response = $this->geminiService->chatCompletion($contents, $this->tools, $this->systemInstruction);
        $candidate = $response['candidates'][0]['content'];
        $parts = $candidate['parts'];

        $recipesReturned = [];

        // Check for function call
        if (isset($parts[0]['functionCall'])) {
            $functionCall = $parts[0]['functionCall'];
            
            // Save model function call message
            $conversation['messages'][] = [
                'role' => 'model',
                'parts' => [['functionCall' => $functionCall]]
            ];

            if ($functionCall['name'] === 'searchRecipes') {
                $args = $functionCall['args'];
                $query = $args['query'] ?? '';
                
                // Execute RAG
                $recipesReturned = $this->ragService->search($query);
                
                $functionResponse = [
                    'name' => 'searchRecipes',
                    'response' => [
                        'results' => array_map(function($r) {
                            return [
                                'title' => $r['title'],
                                'summary' => $r['signaturePhrase'] ?? $r['summary'],
                                'readyInMinutes' => $r['readyInMinutes'],
                                'ingredients' => $r['ingredients']
                            ];
                        }, $recipesReturned)
                    ]
                ];

                // Add function response message
                $conversation['messages'][] = [
                    'role' => 'function',
                    'parts' => [['functionResponse' => $functionResponse]]
                ];

                // Second call to Gemini to generate final response
                $contents = $this->formatMessagesForGemini($conversation['messages']);
                $finalResponse = $this->geminiService->chatCompletion($contents, $this->tools, $this->systemInstruction);
                
                $finalText = $finalResponse['candidates'][0]['content']['parts'][0]['text'] ?? '';
                
                $conversation['messages'][] = [
                    'role' => 'model',
                    'parts' => [['text' => $finalText]]
                ];
                
                $replyText = $finalText;
            } else {
                $replyText = "Scusa, ho provato a usare uno strumento che non conosco.";
                $conversation['messages'][] = [
                    'role' => 'model',
                    'parts' => [['text' => $replyText]]
                ];
            }
        } else {
            // Direct text response
            $replyText = $parts[0]['text'] ?? '';
            $conversation['messages'][] = [
                'role' => 'model',
                'parts' => [['text' => $replyText]]
            ];
        }

        // Auto-generate title if this is the first interaction
        if (count($conversation['messages']) <= 3) { // user, model (functionCall or text), maybe functionResponse+model
            $conversation['title'] = substr($messageText, 0, 30) . (strlen($messageText) > 30 ? '...' : '');
        }

        $conversation['updatedAt'] = date('c');
        $this->saveConversation($conversation);

        return [
            'conversationId' => $conversationId,
            'message' => $replyText,
            'recipes' => $recipesReturned
        ];
    }

    private function formatMessagesForGemini($messages) {
        $formatted = [];
        foreach ($messages as $msg) {
            // function role goes in as user role for Gemini if part of history, but Gemini 2.5 supports role=user for functionResponse
            $role = $msg['role'] === 'function' ? 'user' : $msg['role'];
            $formatted[] = [
                'role' => $role,
                'parts' => $msg['parts']
            ];
        }
        return $formatted;
    }

    public function getConversation($id) {
        $file = $this->conversationsDir . '/' . $id . '.json';
        if (file_exists($file)) {
            return json_decode(file_get_contents($file), true);
        }
        return null;
    }

    public function saveConversation($conversation) {
        $file = $this->conversationsDir . '/' . $conversation['id'] . '.json';
        file_put_contents($file, json_encode($conversation, JSON_PRETTY_PRINT));
    }

    public function listConversations() {
        $conversations = [];
        $files = glob($this->conversationsDir . '/*.json');
        foreach ($files as $file) {
            $conv = json_decode(file_get_contents($file), true);
            if ($conv) {
                $conversations[] = [
                    'id' => $conv['id'],
                    'title' => $conv['title'],
                    'updatedAt' => $conv['updatedAt']
                ];
            }
        }
        
        usort($conversations, function($a, $b) {
            return strtotime($b['updatedAt']) <=> strtotime($a['updatedAt']);
        });
        
        return $conversations;
    }
}
