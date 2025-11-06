import { NextResponse } from 'next/server'

/**
 * Standardized API response helpers
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: any
}

/**
 * Success response with optional data
 */
export function successResponse<T = any>(data?: T, message?: string, status: number = 200) {
  const response: ApiResponse<T> = {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message })
  }
  
  return NextResponse.json(response, { status })
}

/**
 * Error response with message and optional details
 */
export function errorResponse(
  message: string, 
  status: number = 400, 
  details?: any
) {
  const response: ApiResponse = {
    success: false,
    error: message,
    ...(details && { details })
  }
  
  return NextResponse.json(response, { status })
}

/**
 * Internal server error response
 */
export function internalErrorResponse(message: string = 'Internal server error', details?: any) {
  return errorResponse(message, 500, details)
}

/**
 * Validation error response
 */
export function validationErrorResponse(message: string = 'Validation failed', details?: any) {
  return errorResponse(message, 400, details)
}

/**
 * Authentication error response
 */
export function authErrorResponse(message: string = 'Authentication failed') {
  return errorResponse(message, 401)
}

/**
 * Authorization error response
 */
export function forbiddenResponse(message: string = 'Access forbidden') {
  return errorResponse(message, 403)
}

/**
 * Not found error response
 */
export function notFoundResponse(message: string = 'Resource not found') {
  return errorResponse(message, 404)
}

/**
 * Conflict error response
 */
export function conflictResponse(message: string, details?: any) {
  return errorResponse(message, 409, details)
}

/**
 * Bad request error response
 */
export function badRequestResponse(message: string = 'Bad request', details?: any) {
  return errorResponse(message, 400, details)
}

/**
 * Created response for successful resource creation
 */
export function createdResponse<T = any>(data?: T, message?: string) {
  return successResponse(data, message, 201)
}

/**
 * No content response for successful operations with no return data
 */
export function noContentResponse() {
  return new NextResponse(null, { status: 204 })
}

/**
 * Helper to add CORS headers to any response
 */
export function setCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, X-User-Email')
  return response
}

/**
 * Success response with CORS headers
 */
export function successResponseWithCors<T = any>(data?: T, message?: string, status: number = 200) {
  return setCorsHeaders(successResponse(data, message, status))
}

/**
 * Error response with CORS headers
 */
export function errorResponseWithCors(
  message: string, 
  status: number = 400, 
  details?: any
) {
  return setCorsHeaders(errorResponse(message, status, details))
}

/**
 * Internal error response with CORS headers
 */
export function internalErrorResponseWithCors(message: string = 'Internal server error', details?: any) {
  return setCorsHeaders(internalErrorResponse(message, details))
}

/**
 * Auth error response with CORS headers
 */
export function authErrorResponseWithCors(message: string = 'Authentication failed') {
  return setCorsHeaders(authErrorResponse(message))
}

/**
 * Validation error response with CORS headers
 */
export function validationErrorResponseWithCors(message: string = 'Validation failed', details?: any) {
  return setCorsHeaders(validationErrorResponse(message, details))
}

/**
 * Conflict response with CORS headers
 */
export function conflictResponseWithCors(message: string, details?: any) {
  return setCorsHeaders(conflictResponse(message, details))
}
