# 列表页面配置文档

本配置文档旨在指导如何配置一个列表页面，包括页面基本信息、工具栏配置、表格列配置以及数据请求配置。

## 页面基本信息

### 标题

- **字段名称:** `title`
- **类型:** 字符串
- **说明:** 页面标题，暂无用处。

### 分页支持

- **字段名称:** `isPageable`
- **类型:** 布尔值
- **说明:** 是否支持分页。`true` 表示支持分页，`false` 表示不支持分页。

## 工具栏配置

工具栏用于放置操作按钮，如新增、删除等。

### 按钮配置

- **字段名称:** `tools`
- **类型:** 数组
- **说明:** 工具栏按钮配置，每个按钮包含以下属性：

  #### 按钮属性

    - **类型:** `type`
        - **值:** `button`
        - **说明:** 按钮类型。

    - **标签:** `label`
        - **类型:** 字符串
        - **说明:** 按钮上显示的文字。

    - **处理函数:** `handler`
        - **类型:** 字符串
        - **说明:** 按钮点击时触发的函数名称。

示例：
```json
"tools": [
    {
        "type": "button",
        "label": "新增",
        "handler": "create"
    },
    {
        "type": "button",
        "label": "删除",
        "handler": "function2"
    }
]
```

## 表格列配置

表格列的配置项定义了每一列的显示和功能。

### 列配置

- **字段名称:** `columns`
- **类型:** 对象
- **说明:** 表格列配置，每个列包含以下属性：

  #### 列属性

    - **标签:** `label`
        - **类型:** 字符串
        - **说明:** 列的标题，显示在表头。

    - **提示:** `isHint`
        - **类型:** 布尔值
        - **说明:** 是否显示提示信息。

    - **过滤字段:** `filter_field`
        - **类型:** 对象
        - **说明:** 列的过滤条件配置，包括以下属性：

          ##### 过滤字段属性

            - **类型:** `type`
                - **类型:** 字符串
                - **说明:** 过滤字段的类型，如 `text`（文本框）、`select`（下拉框）、`date_range`（日期范围选择）。

            - **占位符:** `placeholder`
                - **类型:** 字符串
                - **说明:** 过滤字段的占位符文本。

            - **数据加载请求:** `load_data_req`（仅适用于 `select` 类型）
                - **类型:** 对象
                - **说明:** 下拉框的数据加载请求配置，包括以下属性：

                    - **URL:** `url`
                        - **类型:** 字符串
                        - **说明:** 数据请求的地址。

                    - **认证:** `auth`
                        - **类型:** 字符串
                        - **说明:** 认证类型。

                    - **方法:** `method`
                        - **类型:** 字符串
                        - **说明:** 请求方法，如 `GET`、`POST`。

                    - **参数:** `params`
                        - **类型:** 对象
                        - **说明:** 请求参数。

    - **支持排序:** `isSupportSort`
        - **类型:** 布尔值
        - **说明:** 是否支持排序。

    - **排序顺序:** `order`
        - **类型:** 数字
        - **说明:** 排序顺序，数字越小优先级越高。

示例：
```json
"columns": {
    "id": {
        "label": "ID",
        "isHint": false,
        "filter_field": {
            "type": "text",
            "placeholder": "请输入ID"
        },
        "isSupportSort": true,
        "order": 1
    },
    "city": {
        "label": "城市",
        "isHint": false,
        "filter_field": {
            "type": "select",
            "load_data_req": {
                "url": "http://localhost:8088/city",
                "auth": "defaultAuth",
                "method": "GET",
                "params": {
                    "conditions": "city"
                }
            }
        },
        "isSupportSort": true,
        "order": 1
    },
    "name": {
        "label": "姓名",
        "isHint": false,
        "handler": "handler1",
        "filter_field": {
            "type": "text",
            "placeholder": "姓名"
        },
        "isSupportSort": true,
        "order": 2
    },
    "date": {
        "label": "日期",
        "isHint": false,
        "filter_field": {
            "type": "date_range",
            "placeholder": "请选择日期"
        },
        "isSupportSort": true,
        "order": 3
    }
}
```

## 数据请求配置

表格数据的请求配置。

### 请求配置

- **字段名称:** `request`
- **类型:** 对象
- **说明:** 数据请求配置，包括以下属性：

  #### 请求属性

    - **URL:** `url`
        - **类型:** 字符串
        - **说明:** 数据请求的地址。

    - **方法:** `method`
        - **类型:** 字符串
        - **说明:** 请求方法，如 `GET`、`POST`。

    - **参数:** `params`
        - **类型:** 对象
        - **说明:** 请求参数，如分页信息等。

示例：
```json
"request": {
    "url": "http://localhost:8088/post",
    "method": "POST",
    "params": {
        "page": 1,
        "size": 10
    }
}
```

以上是配置一个列表页面的详细说明文档，包含了页面基本信息、工具栏配置、表格列配置以及数据请求配置。根据具体需求，可以对配置项进行调整和扩展。