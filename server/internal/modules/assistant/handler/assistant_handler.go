package handler

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"vibeblog/server/internal/modules/assistant/model"
	"vibeblog/server/internal/modules/assistant/service"
	"vibeblog/server/internal/shared/utils"

	"github.com/gin-gonic/gin"
)

type AssistantHandler struct {
	svc      *service.AssistantService
	chatSvc  *service.ChatService
}

func NewAssistantHandler(svc *service.AssistantService, chatSvc *service.ChatService) *AssistantHandler {
	return &AssistantHandler{svc: svc, chatSvc: chatSvc}
}

// GetConfig 管理端获取完整助手配置
func (h *AssistantHandler) GetConfig(c *gin.Context) {
	cfg, err := h.svc.GetConfig()
	if err != nil {
		utils.InternalError(c, "获取助手配置失败")
		return
	}
	utils.Success(c, cfg)
}

// UpdateConfig 管理端更新助手配置
func (h *AssistantHandler) UpdateConfig(c *gin.Context) {
	var input model.AssistantConfig
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	cfg, err := h.svc.UpdateConfig(&input)
	if err != nil {
		utils.InternalError(c, "更新助手配置失败")
		return
	}
	utils.Success(c, cfg)
}

// GetPublicConfig 公开获取助手展示配置
func (h *AssistantHandler) GetPublicConfig(c *gin.Context) {
	cfg, err := h.svc.GetPublicConfig()
	if err != nil {
		utils.InternalError(c, "获取助手配置失败")
		return
	}
	utils.Success(c, cfg)
}

// ChatRequest 聊天请求结构
type ChatRequest struct {
	Messages []struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	} `json:"messages"`
}

// Chat 处理聊天请求（SSE 流式返回）
func (h *AssistantHandler) Chat(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	if len(req.Messages) == 0 {
		utils.BadRequest(c, "消息不能为空")
		return
	}

	// 转换消息格式
	messages := make([]service.ChatMessage, len(req.Messages))
	for i, msg := range req.Messages {
		messages[i] = service.ChatMessage{
			Role:    msg.Role,
			Content: msg.Content,
		}
	}

	h.chatSvc.StreamChat(c, messages)
}

// TestConnection 测试 AI 模型连接
func (h *AssistantHandler) TestConnection(c *gin.Context) {
	// 先保存当前表单数据
	var input model.AssistantConfig
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	// 临时更新配置
	if _, err := h.svc.UpdateConfig(&input); err != nil {
		utils.InternalError(c, "保存配置失败")
		return
	}

	// 测试连接
	reply, err := h.chatSvc.TestConnection()
	if err != nil {
		utils.Success(c, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	utils.Success(c, gin.H{
		"success": true,
		"message": "连接成功",
		"reply":   reply,
	})
}

// UploadModel 上传 Live2D 模型文件
func (h *AssistantHandler) UploadModel(c *gin.Context) {
	form, err := c.MultipartForm()
	if err != nil {
		utils.BadRequest(c, "请上传文件")
		return
	}

	files := form.File["files"]
	if len(files) == 0 {
		utils.BadRequest(c, "未选择文件")
		return
	}

	// 创建上传目录
	timestamp := time.Now().Format("20060102150405")
	uploadDir := filepath.Join("uploads", "live2d", timestamp)
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		utils.InternalError(c, "创建上传目录失败")
		return
	}

	// 保存所有文件，保留相对路径结构
	model3File := ""
	for _, file := range files {
		// 使用 webkitRelativePath 保留目录结构，否则用文件名
		relPath := file.Filename

		// 确保子目录存在
		dst := filepath.Join(uploadDir, relPath)
		if dir := filepath.Dir(dst); dir != uploadDir {
			if err := os.MkdirAll(dir, 0755); err != nil {
				utils.InternalError(c, fmt.Sprintf("创建目录失败: %s", dir))
				return
			}
		}

		if err := c.SaveUploadedFile(file, dst); err != nil {
			utils.InternalError(c, fmt.Sprintf("保存文件 %s 失败", file.Filename))
			return
		}

		// 检测 .model3.json 入口文件
		if strings.HasSuffix(relPath, ".model3.json") {
			model3File = relPath
		}
	}

	// 构建模型路径：如果找到 model3.json 则存完整路径
	modelPath := filepath.Join("live2d", timestamp)
	if model3File != "" {
		modelPath = filepath.Join("live2d", timestamp, model3File)
	}

	cfg, err := h.svc.GetConfig()
	if err != nil {
		utils.InternalError(c, "获取配置失败")
		return
	}
	cfg.Live2DModelPath = modelPath
	if _, err := h.svc.UpdateConfig(cfg); err != nil {
		utils.InternalError(c, "更新模型路径失败")
		return
	}

	utils.Success(c, gin.H{
		"path":  modelPath,
		"files": len(files),
	})
}

// UploadSingleFile 处理单文件上传的辅助函数
func saveUploadedFile(src io.Reader, dst string) error {
	if err := os.MkdirAll(filepath.Dir(dst), 0755); err != nil {
		return err
	}
	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()
	_, err = io.Copy(out, src)
	return err
}
