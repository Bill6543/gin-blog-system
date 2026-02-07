package service

import (
	"errors"
	"gin-blog-system/config"
	"gin-blog-system/model"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// 定义JWT自定义声明
type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// HashPassword 对密码进行哈希加密
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash 验证密码是否匹配
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// CreateUser 创建用户
func CreateUser(user *model.User) error {
	// 检查用户名或邮箱是否已存在
	var existingUser model.User
	result := config.DB.Where("username = ? OR email = ?", user.Username, user.Email).First(&existingUser)
	if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return errors.New("用户名或邮箱已存在")
	}

	// 如果没有提供头像，则设置默认头像
	if user.Avatar == "" {
		user.Avatar = "/static/default_avatar.png"
	}

	// 密码加密
	hashedPassword, err := HashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = hashedPassword

	result = config.DB.Create(user)
	return result.Error
}

// AuthenticateUser 用户认证
func AuthenticateUser(username, password string) (*model.User, error) {
	var user model.User
	result := config.DB.Where("username = ? OR email = ?", username, username).First(&user)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, errors.New("用户不存在")
	}

	if !CheckPasswordHash(password, user.Password) {
		return nil, errors.New("密码错误")
	}

	// 不返回密码字段
	user.Password = ""
	return &user, nil
}

// GenerateToken 生成JWT令牌
func GenerateToken(user *model.User) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour) // 令牌有效期24小时
	claims := &Claims{
		UserID:   user.ID,
		Username: user.Username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "gin-blog-system",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(config.AppConfig.App.JWTSecret))
	return tokenString, err
}

// GetUserByID 根据ID获取用户
func GetUserByID(id uint) (*model.User, error) {
	var user model.User
	result := config.DB.First(&user, id)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, errors.New("用户不存在")
	}
	return &user, result.Error
}

// UpdateUser 更新用户信息
func UpdateUser(id uint, userData *model.User) error {
	var existingUser model.User
	result := config.DB.First(&existingUser, id)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return errors.New("用户不存在")
	}

	// 检查用户名或邮箱是否已被其他用户使用
	var checkUser model.User
	result = config.DB.Where("(username = ? OR email = ?) AND id != ?", userData.Username, userData.Email, id).First(&checkUser)
	if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return errors.New("用户名或邮箱已被其他用户使用")
	}

	result = config.DB.Model(&existingUser).Updates(userData)
	return result.Error
}

// DeleteUser 删除用户
func DeleteUser(id uint) error {
	var user model.User
	result := config.DB.First(&user, id)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return errors.New("用户不存在")
	}

	result = config.DB.Delete(&user)
	return result.Error
}
