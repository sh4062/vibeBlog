package service

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"vibeblog/server/internal/modules/assistant/model"
	"vibeblog/server/internal/modules/assistant/repository"
	"vibeblog/server/internal/shared/config"
)

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type openAIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type openAIRequest struct {
	Model       string          `json:"model"`
	Messages    []openAIMessage `json:"messages"`
	Temperature float64         `json:"temperature"`
	MaxTokens   int             `json:"max_tokens"`
	Stream      bool            `json:"stream"`
}

type openAIStreamChoice struct {
	Delta struct {
		Content string `json:"content"`
	} `json:"delta"`
	FinishReason *string `json:"finish_reason"`
}

type openAIStreamResponse struct {
	Choices []openAIStreamChoice `json:"choices"`
}

type ChatService struct {
	repo   *repository.AssistantRepository
	config *config.Config
}

func NewChatService(repo *repository.AssistantRepository, cfg *config.Config) *ChatService {
	return &ChatService{repo: repo, config: cfg}
}

// StreamChat 处理聊天请求并以 SSE 流式返回
func (s *ChatService) StreamChat(c *gin.Context, userMessages []ChatMessage) {
	cfg, err := s.repo.Get()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取配置失败"})
		return
	}

	if !cfg.Enabled || cfg.OpenAIKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "AI 助手未启用或未配置 API Key"})
		return
	}

	// 构建消息列表
	messages := []openAIMessage{
		{Role: "system", Content: cfg.SystemPrompt},
	}
	for _, msg := range userMessages {
		messages = append(messages, openAIMessage{Role: msg.Role, Content: msg.Content})
	}

	reqBody := openAIRequest{
		Model:       cfg.OpenAIModel,
		Messages:    messages,
		Temperature: cfg.Temperature,
		MaxTokens:   cfg.MaxTokens,
		Stream:      true,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "请求构建失败"})
		return
	}

	baseURL := s.resolveBaseURL(cfg)
	req, err := http.NewRequest("POST", baseURL+"/chat/completions", bytes.NewReader(jsonBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "请求创建失败"})
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+cfg.OpenAIKey)

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI 服务请求失败"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		c.JSON(resp.StatusCode, gin.H{"error": "AI 服务返回错误", "detail": string(body)})
		return
	}

	// 设置 SSE 响应头
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("X-Accel-Buffering", "no")

	scanner := bufio.NewScanner(resp.Body)
	scanner.Buffer(make([]byte, 0, 64*1024), 1024*1024)

	for scanner.Scan() {
		line := scanner.Text()

		if !strings.HasPrefix(line, "data: ") {
			continue
		}

		data := strings.TrimPrefix(line, "data: ")

		if data == "[DONE]" {
			fmt.Fprintf(c.Writer, "data: [DONE]\n\n")
			c.Writer.Flush()
			break
		}

		var streamResp openAIStreamResponse
		if err := json.Unmarshal([]byte(data), &streamResp); err != nil {
			continue
		}

		if len(streamResp.Choices) > 0 {
			content := streamResp.Choices[0].Delta.Content
			if content != "" {
				eventData, _ := json.Marshal(map[string]string{"content": content})
				fmt.Fprintf(c.Writer, "data: %s\n\n", eventData)
				c.Writer.Flush()
			}
		}
	}
}

// IsConfigured 检查是否已配置可用
func (s *ChatService) IsConfigured() (bool, error) {
	cfg, err := s.repo.Get()
	if err != nil {
		return false, err
	}
	return cfg.Enabled && cfg.OpenAIKey != "", nil
}

// GetConfig 获取配置（复用）
func (s *ChatService) GetConfig() (*model.AssistantConfig, error) {
	return s.repo.Get()
}

// resolveBaseURL 优先使用数据库中的 BaseURL，否则使用环境变量
func (s *ChatService) resolveBaseURL(cfg *model.AssistantConfig) string {
	if cfg.OpenAIBaseURL != "" {
		return strings.TrimRight(cfg.OpenAIBaseURL, "/")
	}
	return strings.TrimRight(s.config.OpenAI.BaseURL, "/")
}

// TestConnection 测试 AI 模型连接
func (s *ChatService) TestConnection() (string, error) {
	cfg, err := s.repo.Get()
	if err != nil {
		return "", fmt.Errorf("获取配置失败: %w", err)
	}

	if cfg.OpenAIKey == "" {
		return "", fmt.Errorf("API Key 未配置")
	}

	baseURL := s.resolveBaseURL(cfg)

	reqBody := openAIRequest{
		Model: cfg.OpenAIModel,
		Messages: []openAIMessage{
			{Role: "user", Content: "Hi"},
		},
		MaxTokens: 10,
		Stream:    false,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("请求构建失败: %w", err)
	}

	req, err := http.NewRequest("POST", baseURL+"/chat/completions", bytes.NewReader(jsonBody))
	if err != nil {
		return "", fmt.Errorf("请求创建失败: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+cfg.OpenAIKey)

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("连接失败: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		var errResp map[string]any
		if json.Unmarshal(body, &errResp) == nil {
			if e, ok := errResp["error"].(map[string]any); ok {
				return "", fmt.Errorf("API 返回错误 (%d): %v", resp.StatusCode, e["message"])
			}
		}
		return "", fmt.Errorf("API 返回状态码 %d: %s", resp.StatusCode, string(body))
	}

	var result struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("解析响应失败: %w", err)
	}

	reply := ""
	if len(result.Choices) > 0 {
		reply = result.Choices[0].Message.Content
	}

	return reply, nil
}
