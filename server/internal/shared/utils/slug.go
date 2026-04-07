// internal/shared/utils/slug.go
package utils

import (
	"regexp"
	"strconv"
	"strings"
	"unicode"
)

// 简单的拼音映射（常见字）
var pinyinMap = map[rune]string{
	'一': "yi", '二': "er", '三': "san", '四': "si", '五': "wu",
	'六': "liu", '七': "qi", '八': "ba", '九': "jiu", '十': "shi",
	'中': "zhong", '国': "guo", '人': "ren", '大': "da", '小': "xiao",
	'学': "xue", '习': "xi", '开': "kai", '发': "fa", '程': "cheng",
	'编': "bian", '码': "ma", '技': "ji", '术': "shu", '好': "hao",
	'新': "xin", '手': "shou", '入': "ru", '门': "men", '博': "bo",
	'客': "ke", '文': "wen", '章': "zhang", '日': "ri", '记': "ji",
}

func GenerateSlug(title string) string {
	var result strings.Builder

	for _, char := range title {
		if unicode.Is(unicode.Latin, char) {
			// 英文字母
			if unicode.IsLower(char) || unicode.IsDigit(char) {
				result.WriteRune(char)
			} else if unicode.IsUpper(char) {
				result.WriteRune(unicode.ToLower(char))
			}
		} else if unicode.IsDigit(char) {
			result.WriteRune(char)
		} else if char == ' ' || char == '-' || char == '_' {
			result.WriteRune('-')
		} else if pinyin, ok := pinyinMap[char]; ok {
			result.WriteString(pinyin)
		}
		// 其他中文字符暂时跳过
	}

	slug := result.String()

	// 清理连续的横线
	re := regexp.MustCompile(`-+`)
	slug = re.ReplaceAllString(slug, "-")

	// 去除首尾横线
	slug = strings.Trim(slug, "-")

	// 限制长度
	if len(slug) > 50 {
		slug = slug[:50]
		// 确保不在横线处截断
		slug = strings.TrimRight(slug, "-")
	}

	// 如果生成空slug，使用时间戳
	if slug == "" {
		slug = "article"
	}

	return slug
}

func MakeUniqueSlug(baseSlug string, exists bool, count int) string {
	if !exists {
		return baseSlug
	}
	return baseSlug + "-" + strconv.Itoa(count)
}