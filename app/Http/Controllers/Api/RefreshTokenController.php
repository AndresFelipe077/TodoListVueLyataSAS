<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class RefreshTokenController extends Controller
{
    /**
     * Refresca el token de autenticación del usuario actual.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function __invoke(Request $request): JsonResponse
    {
        Log::info('Solicitud de renovación de token', [
            'user_id' => Auth::id(),
            'ip' => $request->ip(),
        ]);

        // Verificar si el usuario está autenticado
        if (!Auth::check()) {
            Log::warning('Intento de renovación de token sin autenticación');
            return response()->json([
                'success' => false,
                'message' => 'No autenticado',
            ], 401);
        }

        $user = $request->user();
        
        try {
            // Revocar el token actual
            $user->tokens()->where('id', $user->currentAccessToken()->id)->delete();
            
            // Crear un nuevo token
            $token = $user->createToken('api-token', ['*'])->plainTextToken;
            
            Log::info('Token renovado exitosamente', [
                'user_id' => $user->id,
                'token' => '***' . substr($token, -8),
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Token renovado exitosamente',
                'data' => [
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error al renovar el token', [
                'user_id' => $user->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error al renovar el token',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor',
            ], 500);
        }
    }
}
