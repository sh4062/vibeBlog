package repository

import (
	"vibeblog/server/internal/modules/auth/model"
	"vibeblog/server/internal/shared/database"
)

type UserRepository struct{}

func NewUserRepository() *UserRepository {
	return &UserRepository{}
}

func (r *UserRepository) FindByUsername(username string) (*model.User, error) {
	var user model.User
	err := database.DB.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByID(id uint) (*model.User, error) {
	var user model.User
	err := database.DB.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) Create(user *model.User) error {
	return database.DB.Create(user).Error
}

func (r *UserRepository) Update(user *model.User) error {
	return database.DB.Save(user).Error
}