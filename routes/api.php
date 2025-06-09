<?php

use App\Http\Controllers\Api\TaskController as ApiTaskController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rutas públicas de autenticación
Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth:sanctum');

// Ruta para renovar el token
Route::get('/refresh-token', [\App\Http\Controllers\Api\RefreshTokenController::class, '__invoke'])
    ->middleware('auth:sanctum')
    ->name('api.token.refresh');

// Rutas protegidas
Route::middleware(['auth:sanctum'])->group(function () {
    // Rutas de la API para tareas
    Route::apiResource('tasks', ApiTaskController::class);
    
    // Ruta para alternar el estado de una tarea
    Route::patch('/tasks/{task}/toggle', [ApiTaskController::class, 'toggle'])
        ->name('api.tasks.toggle');
});
