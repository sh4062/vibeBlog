// internal/shared/utils/response.go
package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Data    any        `json:"data,omitempty"`
	Message string     `json:"message,omitempty"`
	Error   *ErrorInfo `json:"error,omitempty"`
}

type ErrorInfo struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type Pagination struct {
	Page  int   `json:"page"`
	Limit int   `json:"limit"`
	Total int64 `json:"total"`
	Pages int   `json:"pages"`
}

type PagedResponse struct {
	Data       any        `json:"data"`
	Pagination Pagination `json:"pagination"`
}

func Success(c *gin.Context, data any) {
	c.JSON(http.StatusOK, Response{Data: data})
}

func SuccessWithMessage(c *gin.Context, data any, message string) {
	c.JSON(http.StatusOK, Response{Data: data, Message: message})
}

func Created(c *gin.Context, data any) {
	c.JSON(http.StatusCreated, Response{Data: data})
}

func PagedSuccess(c *gin.Context, data any, pagination Pagination) {
	c.JSON(http.StatusOK, PagedResponse{Data: data, Pagination: pagination})
}

func BadRequest(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, Response{
		Error: &ErrorInfo{Code: "BAD_REQUEST", Message: message},
	})
}

func Unauthorized(c *gin.Context, message string) {
	c.JSON(http.StatusUnauthorized, Response{
		Error: &ErrorInfo{Code: "UNAUTHORIZED", Message: message},
	})
}

func Forbidden(c *gin.Context, message string) {
	c.JSON(http.StatusForbidden, Response{
		Error: &ErrorInfo{Code: "FORBIDDEN", Message: message},
	})
}

func NotFound(c *gin.Context, message string) {
	c.JSON(http.StatusNotFound, Response{
		Error: &ErrorInfo{Code: "NOT_FOUND", Message: message},
	})
}

func InternalError(c *gin.Context, message string) {
	c.JSON(http.StatusInternalServerError, Response{
		Error: &ErrorInfo{Code: "INTERNAL_ERROR", Message: message},
	})
}

func ValidationError(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, Response{
		Error: &ErrorInfo{Code: "VALIDATION_ERROR", Message: message},
	})
}

// SuccessResponse sends a success response with data
func SuccessResponse(c *gin.Context, data any) {
	c.JSON(http.StatusOK, Response{Data: data})
}

// ErrorResponse sends an error response with custom code and message
func ErrorResponse(c *gin.Context, statusCode int, code string, message string) {
	c.JSON(statusCode, Response{
		Error: &ErrorInfo{Code: code, Message: message},
	})
}