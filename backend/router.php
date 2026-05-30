<?php

$allowedOrigins = [
    'https://veggie-chef-ai.vercel.app',
    'http://localhost:5173'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Permetti tutti i deploy preview di Vercel
if (in_array($origin, $allowedOrigins) || preg_match('/^https:\/\/veggie-chef-ai-.*\.vercel\.app$/', $origin)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/services/GeminiService.php';
require_once __DIR__ . '/services/SpoonacularService.php';
require_once __DIR__ . '/services/RAGService.php';
require_once __DIR__ . '/services/ChatService.php';

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

$geminiService = new GeminiService();
$spoonacularService = new SpoonacularService();
$ragService = new RAGService($geminiService);
$chatService = new ChatService($geminiService, $ragService);

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

try {
    if ($requestUri === '/api/chat' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $message = $input['message'] ?? '';
        $conversationId = $input['conversationId'] ?? null;

        if (empty($message)) {
            jsonResponse(['error' => 'Message is required'], 400);
        }

        $response = $chatService->handleMessage($message, $conversationId);
        jsonResponse($response);
    } 
    elseif ($requestUri === '/api/recipes/sync' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $query = $input['query'] ?? 'vegetarian';
        $number = $input['number'] ?? 10;
        
        $stats = $spoonacularService->syncRecipes($query, 'vegetarian', $number, $geminiService);
        jsonResponse(['success' => true, 'stats' => $stats]);
    }
    elseif ($requestUri === '/api/rag/search' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $query = $input['query'] ?? '';
        
        if (empty($query)) {
            jsonResponse(['error' => 'Query is required'], 400);
        }

        $results = $ragService->search($query);
        jsonResponse(['results' => $results]);
    }
    elseif ($requestUri === '/api/conversations' && $method === 'GET') {
        $conversations = $chatService->listConversations();
        jsonResponse(['conversations' => $conversations]);
    }
    elseif (preg_match('/^\/api\/conversations\/([a-zA-Z0-9\-]+)$/', $requestUri, $matches) && $method === 'GET') {
        $id = $matches[1];
        $conversation = $chatService->getConversation($id);
        if ($conversation) {
            jsonResponse($conversation);
        } else {
            jsonResponse(['error' => 'Conversation not found'], 404);
        }
    }
    else {
        jsonResponse(['error' => 'Not Found'], 404);
    }
} catch (Exception $e) {
    jsonResponse(['error' => $e->getMessage()], 500);
}
