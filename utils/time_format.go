package utils

import (
	"fmt"
	"time"
)

const CustomTimeFormat = "2006-01-02 15:04:05"

// CustomTime 自定义时间格式
type CustomTime struct {
	time.Time
}

// MarshalJSON 实现 JSON 序列化接口
func (ct CustomTime) MarshalJSON() ([]byte, error) {
	return []byte(fmt.Sprintf(`"%s"`, ct.Format(CustomTimeFormat))), nil
}

// UnmarshalJSON 实现 JSON 反序列化接口
func (ct *CustomTime) UnmarshalJSON(data []byte) error {
	str := string(data[1 : len(data)-1]) // 移除引号
	t, err := time.Parse(CustomTimeFormat, str)
	if err != nil {
		// 尝试解析 RFC3339 格式
		t, err = time.Parse(time.RFC3339, str)
		if err != nil {
			return err
		}
	}
	ct.Time = t
	return nil
}

// String 实现 Stringer 接口
func (ct CustomTime) String() string {
	return ct.Format(CustomTimeFormat)
}
