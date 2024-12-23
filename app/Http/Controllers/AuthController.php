<?php

namespace App\Http\Controllers; 

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller {
    public function register(Request $request) {
        \Log::info('Register attempt:', $request->all());
    
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:6',
        ]);
    
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);
    
        return response()->json(['message' => 'User registered successfully'], 201);
    }
    

    public function login(Request $request) {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);
    
        \Log::info('Login attempt:', $request->only('email', 'password'));
    
        if (!$token = auth()->attempt($request->only('email', 'password'))) {
            \Log::warning('Unauthorized attempt for email: ' . $request->email);
            return response()->json(['error' => 'Unauthorized'], 401);
        }
    
        return response()->json(['token' => $token]);
    }
    
}
