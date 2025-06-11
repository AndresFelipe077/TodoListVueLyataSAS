<?php

namespace App\Http\Controllers;

use App\Services\TaskService;
use Illuminate\Http\Request;

class AITaskController extends Controller
{
    protected $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    public function createFromPrompt(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string|max:1000'
        ]);

        $tasks = $this->taskService->fetchTasksFromAI($request->input('prompt'));

        if ($tasks === null) {
            return response()->json([
                'message' => 'Failed to generate tasks from AI',
                'success' => false
            ], 500);
        }

        // Here you would typically save the tasks to your database
        // For example: Task::insert($tasks);
        
        return response()->json([
            'message' => 'Tasks generated successfully',
            'success' => true,
            'tasks' => $tasks
        ]);
    }
}
