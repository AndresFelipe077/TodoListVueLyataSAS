<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Response;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TaskController extends Controller
{
    use AuthorizesRequests;
    
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $tasks = Auth::user()->tasks()
            ->orderBy('completed')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $tasks,
            'status' => 'success',
            'message' => 'Tasks retrieved successfully'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->merge([
            'priority' => $request->input('priority', 'medium'),
        ]);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'nullable|date',
            'priority'    => 'in:low,medium,high',
        ]);

        $task = $request->user()->tasks()->create($validated);

        return response()->json([
            'data' => $task,
            'status' => 'success',
            'message' => 'Task created successfully'
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task): JsonResponse
    {
        $this->authorize('view', $task);
        
        return response()->json([
            'data' => $task,
            'status' => 'success',
            'message' => 'Task retrieved successfully'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'nullable|date',
            'priority'    => 'sometimes|in:low,medium,high',
            'completed'   => 'sometimes|boolean',
        ]);

        $task->update($validated);

        return response()->json([
            'data' => $task,
            'status' => 'success',
            'message' => 'Task updated successfully'
        ]);
    }

    /**
     * Toggle the completion status of the specified resource.
     */
    public function toggle(Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $task->update([
            'completed' => !$task->completed
        ]);

        return response()->json([
            'data' => $task,
            'status' => 'success',
            'message' => 'Task status toggled successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('delete', $task);

        $task->delete();

        return response()->json([
            'data' => null,
            'status' => 'success',
            'message' => 'Task deleted successfully'
        ], Response::HTTP_NO_CONTENT);
    }
}
