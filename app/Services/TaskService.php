<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TaskService
{
    protected string $webhookUrl = 'https://felipe077.app.n8n.cloud/webhook/tareas';

    /**
     * Fetch tasks from n8n webhook
     *
     * @param string $prompt The prompt to send to the AI
     * @return array|null Array of tasks or null on failure
     */
    public function fetchTasksFromAI(string $prompt): ?array
    {
        try {
            $response = Http::post($this->webhookUrl, [
                'chatInput' => $prompt
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $this->processTasks($data['output'] ?? []);
            }

            Log::error('Failed to fetch tasks from n8n', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return null;
        } catch (\Exception $e) {
            Log::error('Error fetching tasks from n8n: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Process the raw task data from n8n
     *
     * @param array $rawTasks
     * @return array
     */
    protected function processTasks(array $rawTasks): array
    {

        $user = auth()->user();

        $data = array_map(function ($task) use ($user) {
            return [
                'title'       => $task['titulo'] ?? 'Sin título',
                'description' => $task['descripcion'] ?? '',
                'completed'   => $task['completada'] ?? false,
                'due_date'    => $task['fecha_limite'] ?? null,
                'priority'    => 'high',
                'user_id'     => $user->id,
                'created_at'  => now(),
                'updated_at'  => now(),
            ];
        }, $rawTasks);

        Task::insert($data);

        return $data;
    }
}
