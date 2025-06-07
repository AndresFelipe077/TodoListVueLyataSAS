<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TaskController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $tasks = Auth::user()->tasks()
            ->orderBy('completed')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Dashboard', [
            'tasks' => $tasks
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
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

        $request->user()->tasks()->create($validated);

        return redirect()->back()->with('success', 'Tarea creada correctamente');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'nullable|date',
            'priority'    => 'in:low,medium,high',
        ]);

        $task->update($validated);

        return redirect()->back()->with('success', 'Tarea actualizada correctamente');
    }

    /**
     * Toggle the completion status of the specified resource.
     */
    public function toggle(Task $task): RedirectResponse
    {
        $this->authorize('update', $task);

        $task->update([
            'completed' => !$task->completed
        ]);

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task): RedirectResponse
    {
        $this->authorize('delete', $task);

        $task->delete();

        return redirect()->back()->with('success', 'Tarea eliminada correctamente');
    }
}
