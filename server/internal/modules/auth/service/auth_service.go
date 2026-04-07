package service

import (
	"errors"
	"vibeblog/server/internal/modules/auth/model"
	"vibeblog/server/internal/modules/auth/repository"
	"vibeblog/server/internal/shared/config"
	"vibeblog/server/internal/shared/utils"
)

type AuthService struct {
	repo   *repository.UserRepository
	config *config.JWTConfig
}

func NewAuthService(cfg *config.JWTConfig) *AuthService {
	return &AuthService{
		repo:   repository.NewUserRepository(),
		config: cfg,
	}
}

type LoginInput struct {
	Username string
	Password string
}

type LoginOutput struct {
	AccessToken  string
	RefreshToken string
	User         *model.User
}

func (s *AuthService) Login(input LoginInput) (*LoginOutput, error) {
	user, err := s.repo.FindByUsername(input.Username)
	if err != nil {
		return nil, errors.New("用户不存在")
	}

	if !utils.CheckPassword(input.Password, user.Password) {
		return nil, errors.New("密码错误")
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Username, user.Role, s.config)
	if err != nil {
		return nil, err
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.Username, user.Role, s.config)
	if err != nil {
		return nil, err
	}

	return &LoginOutput{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
	}, nil
}

type RefreshInput struct {
	RefreshToken string
}

type RefreshOutput struct {
	AccessToken  string
	RefreshToken string
}

func (s *AuthService) Refresh(input RefreshInput) (*RefreshOutput, error) {
	claims, err := utils.ParseToken(input.RefreshToken)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	user, err := s.repo.FindByID(claims.UserID)
	if err != nil {
		return nil, errors.New("用户不存在")
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Username, user.Role, s.config)
	if err != nil {
		return nil, err
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.Username, user.Role, s.config)
	if err != nil {
		return nil, err
	}

	return &RefreshOutput{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *AuthService) InitDefaultUser() error {
	// 检查是否已存在用户
	_, err := s.repo.FindByUsername("admin")
	if err == nil {
		return nil // 已存在
	}

	// 创建默认管理员
	hashedPassword, err := utils.HashPassword("admin123")
	if err != nil {
		return err
	}

	user := &model.User{
		Username: "admin",
		Password: hashedPassword,
		Nickname: "博主",
		Role:     "author",
	}

	return s.repo.Create(user)
}