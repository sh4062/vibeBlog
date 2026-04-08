// server/internal/modules/blog/service/article_service.go
package service

import (
	"vibeblog/server/internal/modules/blog/model"
	"vibeblog/server/internal/modules/blog/repository"
)

type ArticleService struct {
	repo *repository.ArticleRepository
}

func NewArticleService(repo *repository.ArticleRepository) *ArticleService {
	return &ArticleService{repo: repo}
}

type ArticleListResult struct {
	Articles   []model.Article `json:"articles"`
	Pagination struct {
		Page  int   `json:"page"`
		Limit int   `json:"limit"`
		Total int64 `json:"total"`
		Pages int   `json:"pages"`
	} `json:"pagination"`
}

// GetPublishedList 获取已发布文章列表
func (s *ArticleService) GetPublishedList(page, limit int, tagSlug string) (*ArticleListResult, error) {
	query := repository.ArticleListQuery{
		Page:   page,
		Limit:  limit,
		Status: model.StatusPublished,
	}

	if tagSlug != "" {
		query.TagSlug = tagSlug
	}

	articles, total, err := s.repo.FindList(query)
	if err != nil {
		return nil, err
	}

	pages := int(total) / limit
	if int(total)%limit > 0 {
		pages++
	}

	result := &ArticleListResult{
		Articles: articles,
	}
	result.Pagination.Page = page
	result.Pagination.Limit = limit
	result.Pagination.Total = total
	result.Pagination.Pages = pages

	return result, nil
}

// GetDetail 获取文章详情
func (s *ArticleService) GetDetail(id uint) (*model.Article, error) {
	article, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// 增加阅读量
	_ = s.repo.IncrementViewCount(id)

	return article, nil
}

// Search 搜索文章
func (s *ArticleService) Search(keyword string, limit int) ([]model.Article, error) {
	query := repository.ArticleListQuery{
		Page:    1,
		Limit:   limit,
		Status:  model.StatusPublished,
		Keyword: keyword,
	}

	articles, _, err := s.repo.FindList(query)
	return articles, err
}

// GetArchive 获取归档数据
func (s *ArticleService) GetArchive() (map[int]map[int]int64, error) {
	return s.repo.FindArchive()
}

// GetArticlesByMonth 获取指定年月的文章
func (s *ArticleService) GetArticlesByMonth(year, month int) ([]model.Article, error) {
	return s.repo.FindByYearMonth(year, month)
}